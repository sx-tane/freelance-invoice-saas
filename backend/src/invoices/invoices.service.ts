import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { ClientsService } from '../clients/clients.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';

/**
 * InvoicesService handles all invoice-related operations including CRUD,
 * status management, tax calculations, and subscription limit checking.
 */
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private readonly clientsService: ClientsService,
  ) {}

  async findAll(userId: string, filters?: InvoiceFilterDto): Promise<Invoice[]> {
    const query = this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.userId = :userId', { userId })
      .orderBy('invoice.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.clientId) {
      query.andWhere('invoice.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id, userId },
      relations: ['client', 'items', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Check subscription limits
    const subscription = await this.subscriptionsRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }

    const currentInvoiceCount = await this.invoicesRepository.count({
      where: { userId },
    });

    if (currentInvoiceCount >= subscription.invoiceLimit) {
      throw new ForbiddenException(
        `Invoice limit reached. Current plan allows ${subscription.invoiceLimit} invoices.`,
      );
    }

    // Verify client belongs to user
    await this.clientsService.findOne(createInvoiceDto.clientId, userId);

    // Calculate totals
    const { subtotal, taxAmount, total } = this.calculateInvoiceTotals(
      createInvoiceDto.items,
      createInvoiceDto.taxRate || 0,
      createInvoiceDto.discountAmount || 0,
    );

    // Create invoice
    const invoice = this.invoicesRepository.create({
      ...createInvoiceDto,
      userId,
      subtotal,
      taxAmount,
      total,
      amountDue: total,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Create invoice items
    if (createInvoiceDto.items && createInvoiceDto.items.length > 0) {
      const invoiceItems = createInvoiceDto.items.map((item, index) => 
        this.invoiceItemsRepository.create({
          ...item,
          invoiceId: savedInvoice.id,
          amount: item.quantity * item.rate,
          sortOrder: index + 1,
        })
      );
      await this.invoiceItemsRepository.save(invoiceItems);
    }

    // Update subscription counter
    await this.subscriptionsRepository.update(
      { userId },
      { invoicesSent: subscription.invoicesSent + 1 },
    );

    return this.findOne(savedInvoice.id, userId);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, userId);

    // Don't allow updates to paid invoices
    if (invoice.status === InvoiceStatus.PAID) {
      throw new ForbiddenException('Cannot update a paid invoice');
    }

    // If client is being changed, verify it belongs to user
    if (updateInvoiceDto.clientId) {
      await this.clientsService.findOne(updateInvoiceDto.clientId, userId);
    }

    // Update invoice items if provided
    if (updateInvoiceDto.items) {
      // Remove existing items
      await this.invoiceItemsRepository.delete({ invoiceId: id });

      // Add new items
      const invoiceItems = updateInvoiceDto.items.map((item, index) =>
        this.invoiceItemsRepository.create({
          ...item,
          invoiceId: id,
          amount: item.quantity * item.rate,
          sortOrder: index + 1,
        })
      );
      await this.invoiceItemsRepository.save(invoiceItems);
    }

    // Recalculate totals if items or rates changed
    const items = updateInvoiceDto.items || invoice.items;
    const taxRate = updateInvoiceDto.taxRate ?? invoice.taxRate;
    const discountAmount = updateInvoiceDto.discountAmount ?? invoice.discountAmount;

    const { subtotal, taxAmount, total } = this.calculateInvoiceTotals(
      items,
      taxRate,
      discountAmount,
    );

    // Update invoice
    Object.assign(invoice, {
      ...updateInvoiceDto,
      subtotal,
      taxAmount,
      total,
      amountDue: total - invoice.amountPaid,
    });

    return this.invoicesRepository.save(invoice);
  }

  async remove(id: string, userId: string): Promise<void> {
    const invoice = await this.findOne(id, userId);
    
    // Don't allow deletion of paid invoices
    if (invoice.status === InvoiceStatus.PAID) {
      throw new ForbiddenException('Cannot delete a paid invoice');
    }

    await this.invoicesRepository.remove(invoice);
  }

  async updateStatus(id: string, status: InvoiceStatus, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, userId);
    
    const now = new Date();
    
    // Update status-specific timestamps
    switch (status) {
      case InvoiceStatus.SENT:
        invoice.sentAt = now;
        break;
      case InvoiceStatus.VIEWED:
        if (!invoice.viewedAt) {
          invoice.viewedAt = now;
        }
        break;
      case InvoiceStatus.PAID:
        invoice.paidAt = now;
        invoice.amountDue = 0;
        break;
    }

    invoice.status = status;
    return this.invoicesRepository.save(invoice);
  }

  async markAsViewed(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (!invoice.viewedAt) {
      invoice.viewedAt = new Date();
      if (invoice.status === InvoiceStatus.SENT) {
        invoice.status = InvoiceStatus.VIEWED;
      }
      await this.invoicesRepository.save(invoice);
    }

    return invoice;
  }

  async getOverdueInvoices(userId: string): Promise<Invoice[]> {
    const today = new Date();
    return this.invoicesRepository.find({
      where: {
        userId,
        status: InvoiceStatus.SENT,
        dueDate: LessThan(today),
      },
      relations: ['client'],
    });
  }

  async getInvoiceStats(userId: string) {
    const stats = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select([
        'COUNT(*) as totalInvoices',
        'COUNT(CASE WHEN invoice.status = \'draft\' THEN 1 END) as draftInvoices',
        'COUNT(CASE WHEN invoice.status = \'sent\' THEN 1 END) as sentInvoices',
        'COUNT(CASE WHEN invoice.status = \'paid\' THEN 1 END) as paidInvoices',
        'COUNT(CASE WHEN invoice.status = \'overdue\' THEN 1 END) as overdueInvoices',
        'SUM(CASE WHEN invoice.status = \'paid\' THEN invoice.total ELSE 0 END) as totalRevenue',
        'SUM(CASE WHEN invoice.status != \'paid\' THEN invoice.amountDue ELSE 0 END) as outstandingAmount',
        'AVG(CASE WHEN invoice.status = \'paid\' THEN invoice.total END) as averageInvoiceValue',
      ])
      .where('invoice.userId = :userId', { userId })
      .getRawOne();

    return {
      totalInvoices: parseInt(stats.totalInvoices) || 0,
      draftInvoices: parseInt(stats.draftInvoices) || 0,
      sentInvoices: parseInt(stats.sentInvoices) || 0,
      paidInvoices: parseInt(stats.paidInvoices) || 0,
      overdueInvoices: parseInt(stats.overdueInvoices) || 0,
      totalRevenue: parseFloat(stats.totalRevenue) || 0,
      outstandingAmount: parseFloat(stats.outstandingAmount) || 0,
      averageInvoiceValue: parseFloat(stats.averageInvoiceValue) || 0,
    };
  }

  async getMonthlyRevenue(userId: string, year: number) {
    const monthlyData = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select([
        'EXTRACT(MONTH FROM invoice.paidAt) as month',
        'SUM(invoice.total) as revenue',
        'COUNT(*) as invoiceCount',
      ])
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('EXTRACT(YEAR FROM invoice.paidAt) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM invoice.paidAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Fill in missing months with zero values
    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      invoiceCount: 0,
    }));

    monthlyData.forEach((data) => {
      const monthIndex = parseInt(data.month) - 1;
      result[monthIndex] = {
        month: parseInt(data.month),
        revenue: parseFloat(data.revenue) || 0,
        invoiceCount: parseInt(data.invoiceCount) || 0,
      };
    });

    return result;
  }

  private calculateInvoiceTotals(
    items: Array<{ quantity: number; rate: number }>,
    taxRate: number,
    discountAmount: number,
  ) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }
}