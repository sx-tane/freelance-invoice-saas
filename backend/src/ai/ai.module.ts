import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoiceAiService } from './services/invoice-ai.service';
import { PaymentPredictionService } from './services/payment-prediction.service';
import { BusinessInsightsService } from './services/business-insights.service';
import { NlpService } from './services/nlp.service';
import { AutomationService } from './services/automation.service';
import { AiController } from './ai.controller';

/**
 * AI Module provides intelligent features for the invoice SaaS:
 * - Smart invoice categorization and pricing
 * - Payment predictions and client scoring
 * - Business insights and forecasting
 * - Natural language processing
 * - Intelligent automation
 */
@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    InvoiceAiService,
    PaymentPredictionService,
    BusinessInsightsService,
    NlpService,
    AutomationService,
  ],
  exports: [
    InvoiceAiService,
    PaymentPredictionService,
    BusinessInsightsService,
    NlpService,
    AutomationService,
  ],
})
export class AiModule {}