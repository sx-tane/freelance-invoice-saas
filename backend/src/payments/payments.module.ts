import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoicesModule } from '../invoices/invoices.module';

/**
 * PaymentsModule bundles the payment service and controller.  It can
 * be imported into the AppModule to expose payment endpoints.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice]),
    InvoicesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}