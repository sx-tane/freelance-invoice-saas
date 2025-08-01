import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { InvoiceAiService } from './services/invoice-ai.service';
import { PaymentPredictionService } from './services/payment-prediction.service';
import { BusinessInsightsService } from './services/business-insights.service';
import { NlpService } from './services/nlp.service';
import { AutomationService } from './services/automation.service';
import {
  PaymentPrediction,
  ClientScore,
  FollowupSuggestion,
  RevenueForecast,
  ChurnPrediction,
  SeasonalTrend,
  InvoiceParseResult,
  EmailTemplate,
  SearchResult,
  ReminderSuggestion,
  AutoDraftResult,
  ExpenseCategory,
  CategoryResult,
  PricingSuggestion
} from './types/ai.types';

@Controller('ai')
export class AiController {
  constructor(
    private readonly invoiceAiService: InvoiceAiService,
    private readonly paymentPredictionService: PaymentPredictionService,
    private readonly businessInsightsService: BusinessInsightsService,
    private readonly nlpService: NlpService,
    private readonly automationService: AutomationService,
  ) {}

  // Smart Invoice Features
  @Post('categorize-items')
  async categorizeItems(@Body() items: string[]): Promise<CategoryResult[]> {
    return this.invoiceAiService.categorizeItems(items);
  }

  @Post('suggest-pricing')
  async suggestPricing(@Body() data: { description: string; clientId?: number; category?: string }): Promise<PricingSuggestion> {
    return this.invoiceAiService.suggestPricing(data.description, data.clientId, data.category);
  }

  @Post('generate-description')
  async generateDescription(@Body() data: { projectDetails: string; clientId?: number }): Promise<string> {
    return this.invoiceAiService.generateInvoiceDescription(data.projectDetails, data.clientId);
  }

  // Payment Predictions
  @Get('payment-likelihood/:invoiceId')
  async getPaymentLikelihood(@Param('invoiceId') invoiceId: number): Promise<PaymentPrediction> {
    return this.paymentPredictionService.predictPaymentLikelihood(invoiceId);
  }

  @Get('client-score/:clientId')
  async getClientScore(@Param('clientId') clientId: number): Promise<ClientScore> {
    return this.paymentPredictionService.calculateClientScore(clientId);
  }

  @Get('optimal-followup/:invoiceId')
  async getOptimalFollowup(@Param('invoiceId') invoiceId: number): Promise<FollowupSuggestion> {
    return this.paymentPredictionService.getOptimalFollowupTiming(invoiceId);
  }

  // Business Insights
  @Get('revenue-forecast')
  async getRevenueForecast(@Query('months') months: string = '6'): Promise<RevenueForecast[]> {
    return this.businessInsightsService.forecastRevenue(parseInt(months));
  }

  @Get('churn-prediction')
  async getChurnPrediction(): Promise<ChurnPrediction[]> {
    return this.businessInsightsService.predictClientChurn();
  }

  @Get('seasonal-trends')
  async getSeasonalTrends(): Promise<SeasonalTrend[]> {
    return this.businessInsightsService.analyzeSeasonalTrends();
  }

  // Natural Language Processing
  @Post('chat-invoice')
  async createInvoiceFromChat(@Body() data: { message: string }): Promise<InvoiceParseResult> {
    return this.nlpService.parseInvoiceFromText(data.message);
  }

  @Post('generate-email')
  async generateFollowupEmail(@Body() data: { invoiceId: number; tone?: string }): Promise<EmailTemplate> {
    return this.nlpService.generateFollowupEmail(data.invoiceId, data.tone);
  }

  @Get('smart-search')
  async smartSearch(@Query('query') query: string): Promise<SearchResult[]> {
    return this.nlpService.semanticSearch(query);
  }

  // Automation
  @Get('reminder-suggestions')
  async getReminderSuggestions(): Promise<ReminderSuggestion[]> {
    return this.automationService.getIntelligentReminders();
  }

  @Post('auto-draft/:clientId')
  async autoDraftInvoice(@Param('clientId') clientId: number): Promise<AutoDraftResult> {
    return this.automationService.autoDraftRecurringInvoice(clientId);
  }

  @Post('categorize-expenses')
  async categorizeExpenses(@Body() expenses: { description: string; amount: number }[]): Promise<ExpenseCategory[]> {
    return this.automationService.categorizeExpenses(expenses);
  }
}