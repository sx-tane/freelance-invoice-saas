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
}