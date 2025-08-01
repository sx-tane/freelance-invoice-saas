import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getDashboardData(userId: string) {
    const [userStats, invoiceStats, paymentStats, recentPayments] = await Promise.all([
      this.usersService.getUserStats(userId),
      this.invoicesService.getInvoiceStats(userId),
      this.paymentsService.getPaymentStats(userId),
      this.paymentsService.getRecentPayments(userId, 5),
    ]);

    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await this.invoicesService.getMonthlyRevenue(userId, currentYear);

    return {
      user: userStats.user,
      subscription: userStats.subscription,
      stats: {
        ...userStats.stats,
        ...invoiceStats,
        ...paymentStats,
      },
      charts: {
        monthlyRevenue,
      },
      recentActivity: {
        recentPayments,
      },
    };
  }

  async getOverview(userId: string) {
    const [invoiceStats, paymentStats] = await Promise.all([
      this.invoicesService.getInvoiceStats(userId),
      this.paymentsService.getPaymentStats(userId),
    ]);

    return {
      totalRevenue: invoiceStats.totalRevenue,
      outstandingAmount: invoiceStats.outstandingAmount,
      totalInvoices: invoiceStats.totalInvoices,
      totalPayments: paymentStats.totalPayments,
      averageInvoiceValue: invoiceStats.averageInvoiceValue,
      averagePaymentAmount: paymentStats.averagePaymentAmount,
    };
  }

  async getStats(userId: string) {
    const invoiceStats = await this.invoicesService.getInvoiceStats(userId);
    const paymentStats = await this.paymentsService.getPaymentStats(userId);
    
    return {
      totalRevenue: invoiceStats.totalRevenue || 0,
      outstandingAmount: invoiceStats.outstandingAmount || 0,
      totalInvoices: invoiceStats.totalInvoices || 0,
      paidInvoices: invoiceStats.paidInvoices || 0,
      overdueInvoices: invoiceStats.overdueInvoices || 0,
      totalPayments: paymentStats.totalPayments || 0,
      averageInvoiceValue: invoiceStats.averageInvoiceValue || 0,
      monthlyGrowth: invoiceStats.monthlyGrowth || 0,
    };
  }

  async getRevenue(userId: string) {
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await this.invoicesService.getMonthlyRevenue(userId, currentYear);
    const lastYearRevenue = await this.invoicesService.getMonthlyRevenue(userId, currentYear - 1);
    
    return {
      currentYear: monthlyRevenue,
      lastYear: lastYearRevenue,
      total: monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0),
    };
  }

  async getInvoiceStatus(userId: string) {
    const invoiceStats = await this.invoicesService.getInvoiceStats(userId);
    
    return {
      draft: invoiceStats.draftInvoices || 0,
      sent: invoiceStats.sentInvoices || 0,
      paid: invoiceStats.paidInvoices || 0,
      overdue: invoiceStats.overdueInvoices || 0,
      cancelled: invoiceStats.cancelledInvoices || 0,
    };
  }

  async getRecentActivity(userId: string) {
    const [recentPayments, recentInvoices] = await Promise.all([
      this.paymentsService.getRecentPayments(userId, 10),
      this.invoicesService.getRecentInvoices(userId, 10),
    ]);

    // Combine and sort by date
    const activities = [
      ...recentPayments.map(payment => ({
        id: payment.id,
        type: 'payment' as const,
        description: `Payment received for ${payment.invoice?.invoiceNumber || 'invoice'}`,
        amount: payment.amount,
        date: payment.createdAt,
        client: payment.invoice?.client?.name || 'Unknown Client',
      })),
      ...recentInvoices.map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        description: `Invoice ${invoice.invoiceNumber} ${invoice.status.toLowerCase()}`,
        amount: invoice.total,
        date: invoice.updatedAt,
        client: invoice.client?.name || 'Unknown Client',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return activities;
  }
}