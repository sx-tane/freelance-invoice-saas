import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { ClientsModule } from '../clients/clients.module';

/**
 * Module bundling invoice-related controllers and providers.  Imported
 * into the AppModule to expose invoice endpoints.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Subscription]),
    ClientsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}