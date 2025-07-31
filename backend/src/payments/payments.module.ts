import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentsController } from './payments.controller';

/**
 * PaymentsModule bundles the payment service and controller.  It can
 * be imported into the AppModule to expose payment endpoints.
 */
@Module({
  providers: [PaymentService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}