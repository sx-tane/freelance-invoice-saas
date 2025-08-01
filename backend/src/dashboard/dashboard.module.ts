import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentsModule } from '../payments/payments.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [UsersModule, InvoicesModule, PaymentsModule, ClientsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}