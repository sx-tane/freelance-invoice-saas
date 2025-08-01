import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private readonly invoicesService: InvoicesService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    // Verify invoice belongs to user
    const invoice = await this.invoicesService.findOne(createPaymentDto.invoiceId, userId);
    
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    // Check if payment amount doesn't exceed amount due
    if (createPaymentDto.amount > invoice.amountDue) {
      throw new BadRequestException('Payment amount cannot exceed amount due');
    }

    // Create payment
    const payment = this.paymentsRepository.create(createPaymentDto);
    const savedPayment = await this.paymentsRepository.save(payment);

    // Update invoice amounts
    const newAmountPaid = invoice.amountPaid + createPaymentDto.amount;
    const newAmountDue = invoice.total - newAmountPaid;

    await this.invoicesRepository.update(invoice.id, {
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newAmountDue <= 0 ? InvoiceStatus.PAID : invoice.status,
      paidAt: newAmountDue <= 0 ? new Date() : invoice.paidAt,
    });

    return savedPayment;
  }

  async findAll(userId: string): Promise<Payment[]> {
    return this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.invoice', 'invoiceData')
      .leftJoinAndSelect('invoiceData.client', 'client')
      .where('invoice.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.invoice', 'invoiceData')
      .leftJoinAndSelect('invoiceData.client', 'client')
      .where('payment.id = :id', { id })
      .andWhere('invoice.userId = :userId', { userId })
      .getOne();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByInvoice(invoiceId: string, userId: string): Promise<Payment[]> {
    // Verify invoice belongs to user first
    await this.invoicesService.findOne(invoiceId, userId);

    return this.paymentsRepository.find({
      where: { invoiceId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string): Promise<Payment> {
    const payment = await this.findOne(id, userId);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed payment');
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const payment = await this.findOne(id, userId);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a completed payment');
    }

    await this.paymentsRepository.remove(payment);
  }

  async getPaymentStats(userId: string) {
    const stats = await this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.invoice', 'invoice')
      .select([
        'COUNT(*) as totalPayments',
        'SUM(payment.amount) as totalAmount',
        'COUNT(CASE WHEN payment.status = \'completed\' THEN 1 END) as completedPayments',
        'COUNT(CASE WHEN payment.status = \'pending\' THEN 1 END) as pendingPayments',
        'COUNT(CASE WHEN payment.status = \'failed\' THEN 1 END) as failedPayments',
        'AVG(payment.amount) as averagePaymentAmount',
      ])
      .where('invoice.userId = :userId', { userId })
      .getRawOne();

    return {
      totalPayments: parseInt(stats.totalPayments) || 0,
      totalAmount: parseFloat(stats.totalAmount) || 0,
      completedPayments: parseInt(stats.completedPayments) || 0,
      pendingPayments: parseInt(stats.pendingPayments) || 0,
      failedPayments: parseInt(stats.failedPayments) || 0,
      averagePaymentAmount: parseFloat(stats.averagePaymentAmount) || 0,
    };
  }

  async getRecentPayments(userId: string, limit: number = 10): Promise<Payment[]> {
    return this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.invoice', 'invoiceData')
      .leftJoinAndSelect('invoiceData.client', 'client')
      .where('invoice.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}