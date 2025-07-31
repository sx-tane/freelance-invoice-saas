import { Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

/**
 * PaymentsController exposes endpoints related to payment operations.
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a Stripe checkout session for a subscription.  Returns
   * the URL that the client should be redirected to.
   */
  @Post('create-checkout-session')
  async createCheckoutSession() {
    return this.paymentService.createCheckoutSession();
  }
}