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
        'COUNT(CASE WHEN invoice.status = \'cancelled\' THEN 1 END) as cancelledInvoices',
        'SUM(CASE WHEN invoice.status = \'paid\' THEN invoice.total ELSE 0 END) as totalRevenue',
        'SUM(CASE WHEN invoice.status != \'paid\' THEN invoice.amountDue ELSE 0 END) as outstandingAmount',
        'AVG(CASE WHEN invoice.status = \'paid\' THEN invoice.total END) as averageInvoiceValue',
      ])
      .where('invoice.userId = :userId', { userId })
      .getRawOne();

    // Calculate monthly growth (simple calculation - current vs previous month)
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(currentMonth.getMonth() - 1);
    
    const currentMonthRevenue = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total) as revenue')
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.paidAt >= :startDate', { startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) })
      .getRawOne();

    const previousMonthRevenue = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total) as revenue')
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.paidAt >= :startDate', { startDate: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1) })
      .andWhere('invoice.paidAt < :endDate', { endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) })
      .getRawOne();

    const currentRev = parseFloat(currentMonthRevenue.revenue) || 0;
    const previousRev = parseFloat(previousMonthRevenue.revenue) || 0;
    const monthlyGrowth = previousRev > 0 ? ((currentRev - previousRev) / previousRev) * 100 : 0;

    return {
      totalInvoices: parseInt(stats.totalInvoices) || 0,
      draftInvoices: parseInt(stats.draftInvoices) || 0,
      sentInvoices: parseInt(stats.sentInvoices) || 0,
      paidInvoices: parseInt(stats.paidInvoices) || 0,
      overdueInvoices: parseInt(stats.overdueInvoices) || 0,
      cancelledInvoices: parseInt(stats.cancelledInvoices) || 0,
      totalRevenue: parseFloat(stats.totalRevenue) || 0,
      outstandingAmount: parseFloat(stats.outstandingAmount) || 0,
      averageInvoiceValue: parseFloat(stats.averageInvoiceValue) || 0,
      monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
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

  async getRecentInvoices(userId: string, limit: number = 10): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { userId },
      relations: ['client'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async generatePdf(id: string, userId: string): Promise<Buffer> {
    const invoice = await this.findOne(id, userId);
    
    // Import puppeteer dynamically
    const puppeteer = await import('puppeteer');
    
    const browser = await puppeteer.default.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
            .invoice-title { font-size: 28px; color: #007bff; margin: 0; }
            .invoice-number { font-size: 16px; color: #666; margin: 5px 0; }
            .client-info, .invoice-details { margin: 20px 0; }
            .client-info h3, .invoice-details h3 { margin-bottom: 10px; color: #007bff; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .totals { float: right; width: 300px; margin-top: 20px; }
            .totals table { width: 100%; }
            .totals td { padding: 5px; border-bottom: 1px solid #eee; }
            .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid #007bff; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status.paid { background-color: #d4edda; color: #155724; }
            .status.sent { background-color: #d1ecf1; color: #0c5460; }
            .status.draft { background-color: #f8d7da; color: #721c24; }
            .status.overdue { background-color: #fff3cd; color: #856404; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="invoice-title">INVOICE</h1>
            <div class="invoice-number">#${invoice.invoiceNumber}</div>
            <div class="status ${invoice.status}">${invoice.status}</div>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <div><strong>${invoice.client?.name || 'N/A'}</strong></div>
            ${invoice.client?.company ? `<div>${invoice.client.company}</div>` : ''}
            <div>${invoice.client?.email || 'N/A'}</div>
            ${invoice.client?.phone ? `<div>${invoice.client.phone}</div>` : ''}
            ${invoice.client?.address ? `<div>${invoice.client.address}</div>` : ''}
          </div>
          
          <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <div><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</div>
            <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
            <div><strong>Currency:</strong> ${invoice.currency}</div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${Number(item.rate).toFixed(2)}</td>
                  <td>$${Number(item.amount).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>$${Number(invoice.subtotal).toFixed(2)}</td>
              </tr>
              ${Number(invoice.discountAmount) > 0 ? `
              <tr>
                <td>Discount:</td>
                <td>-$${Number(invoice.discountAmount).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${Number(invoice.taxRate) > 0 ? `
              <tr>
                <td>Tax (${Number(invoice.taxRate).toFixed(1)}%):</td>
                <td>$${Number(invoice.taxAmount).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr class="total-final">
                <td>Total:</td>
                <td>$${Number(invoice.total).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Amount Paid:</td>
                <td>$${Number(invoice.amountPaid).toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Amount Due:</strong></td>
                <td><strong>$${Number(invoice.amountDue).toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="clear: both; margin-top: 40px;">
            ${invoice.notes ? `
            <div>
              <h3>Notes:</h3>
              <p>${invoice.notes}</p>
            </div>
            ` : ''}
            
            ${invoice.terms ? `
            <div>
              <h3>Terms & Conditions:</h3>
              <p>${invoice.terms}</p>
            </div>
            ` : ''}
          </div>
        </body>
        </html>
      `;
      
      await page.setContent(htmlContent);
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
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