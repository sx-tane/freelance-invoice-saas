import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';

/**
 * Root module for the application.  It imports feature modules for clients
 * and invoices and registers the top‑level controller and service.  Add
 * additional modules here when extending the system.
 */
@Module({
  imports: [ClientsModule, InvoicesModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}