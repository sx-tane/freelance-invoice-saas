import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

/**
 * PaymentService integrates with Stripe to create subscription checkout
 * sessions.  It expects the following environment variables to be
 * configured:
 *
 * - STRIPE_SECRET_KEY: Your Stripe secret API key
 * - STRIPE_PRICE_ID:  The price ID for the subscription plan
 * - SUCCESS_URL:      URL to redirect to after successful payment
 * - CANCEL_URL:       URL to redirect to if the user cancels
 */
@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY must be set');
    }
    this.stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }

  async createCheckoutSession(): Promise<{ url: string }> {
    try {
      const priceId = process.env.STRIPE_PRICE_ID;
      const successUrl = process.env.SUCCESS_URL;
      const cancelUrl = process.env.CANCEL_URL;
      if (!priceId || !successUrl || !cancelUrl) {
        throw new Error('STRIPE_PRICE_ID, SUCCESS_URL and CANCEL_URL must be set');
      }
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      if (!session.url) {
        throw new Error('Stripe did not return a checkout URL');
      }
      return { url: session.url };
    } catch (err) {
      throw new InternalServerErrorException(
        `Unable to create checkout session: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}