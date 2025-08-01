import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as natural from 'natural';
import * as NodeCache from 'node-cache';
import {
  InvoiceParseResult,
  EmailTemplate,
  SearchResult
} from '../types/ai.types';

@Injectable()
export class NlpService {
  private openai: OpenAI;
  private cache: NodeCache;
  private tokenizer: any;
  private stemmer: any;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.cache = new NodeCache({ stdTTL: 1800 }); // 30 minute cache
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  /**
   * Parses invoice details from natural language text
   */
  async parseInvoiceFromText(message: string): Promise<InvoiceParseResult> {
    const cacheKey = `parse-invoice:${message}`;
    const cached = this.cache.get<InvoiceParseResult>(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Parse this message to extract invoice information:

"${message}"

Extract and return JSON with:
- clientName: string (if mentioned)
- amount: number (total amount, extract from currency mentions)
- description: string (work description)
- dueDate: string (ISO format if mentioned, otherwise null)
- items: array of {description, amount, quantity} (if itemized)
- confidence: number (0-1, how confident you are in the extraction)

Example: "Create invoice for John Smith for $2500 web development work due next Friday"
Should extract clientName: "John Smith", amount: 2500, etc.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      
      // Add NLP entity extraction as backup
      const entities = this.extractEntitiesNLP(message);
      parsed.extractedEntities = entities;

      // Enhance with rule-based extraction if AI confidence is low
      if (parsed.confidence < 0.7) {
        const ruleBasedResult = this.extractInvoiceDataRuleBased(message);
        parsed.amount = parsed.amount || ruleBasedResult.amount;
        parsed.dueDate = parsed.dueDate || ruleBasedResult.dueDate;
      }

      this.cache.set(cacheKey, parsed);
      return parsed;
    } catch (error) {
      console.error('Error parsing invoice from text:', error);
      return this.fallbackInvoiceParsing(message);
    }
  }

  /**
   * Generates follow-up email templates
   */
  async generateFollowupEmail(invoiceId: number, tone: string = 'professional'): Promise<EmailTemplate> {
    const cacheKey = `email:${invoiceId}:${tone}`;
    const cached = this.cache.get<EmailTemplate>(cacheKey);
    if (cached) return cached;

    try {
      const invoiceData = await this.getInvoiceData(invoiceId);
      const clientData = await this.getClientData(invoiceData.clientId);
      
      const daysPastDue = this.calculateDaysPastDue(invoiceData.dueDate);
      const urgency = this.determineUrgency(daysPastDue);

      const prompt = `Generate a ${tone} follow-up email for an overdue invoice:

Invoice Details:
- Amount: $${invoiceData.amount}
- Due Date: ${invoiceData.dueDate}
- Days Overdue: ${daysPastDue}
- Client: ${clientData.name}
- Description: ${invoiceData.description}

Tone: ${tone} (professional, friendly, or firm)
Urgency: ${urgency}

Return JSON with:
- subject: string
- body: string (include personalization and next steps)
- tone: string
- urgency: 'low'|'medium'|'high'

Keep it concise but empathetic. Include a clear call to action.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      const template = JSON.parse(response.choices[0].message.content || '{}');
      template.urgency = urgency;

      this.cache.set(cacheKey, template);
      return template;
    } catch (error) {
      console.error('Error generating email template:', error);
      return this.fallbackEmailTemplate(tone);
    }
  }

  /**
   * Performs semantic search across invoices, clients, and data
   */
  async semanticSearch(query: string): Promise<SearchResult[]> {
    const cacheKey = `search:${query}`;
    const cached = this.cache.get<SearchResult[]>(cacheKey);
    if (cached) return cached;

    try {
      // Get all searchable data
      const [invoices, clients, payments] = await Promise.all([
        this.getSearchableInvoices(),
        this.getSearchableClients(),
        this.getSearchablePayments(),
      ]);

      // Combine all searchable content
      const allContent = [
        ...invoices.map(inv => ({ ...inv, type: 'invoice' as const })),
        ...clients.map(client => ({ ...client, type: 'client' as const })),
        ...payments.map(payment => ({ ...payment, type: 'payment' as const })),
      ];

      // Calculate relevance scores
      const results = allContent
        .map(item => ({
          type: item.type,
          id: item.id,
          title: item.title,
          description: item.description,
          relevanceScore: this.calculateRelevanceScore(query, item),
          matchedTerms: this.findMatchedTerms(query, item),
        }))
        .filter(result => result.relevanceScore > 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      return this.fallbackSearch(query);
    }
  }

  private extractEntitiesNLP(text: string): any {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const entities = {
      amounts: this.extractAmounts(text),
      dates: this.extractDates(text),
      names: this.extractNames(text),
      emails: this.extractEmails(text),
    };

    return entities;
  }

  private extractAmounts(text: string): number[] {
    const amountRegex = /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*dollars?)/gi;
    const matches = text.match(amountRegex) || [];
    
    return matches.map(match => {
      const cleanMatch = match.replace(/[^\d.]/g, '');
      return parseFloat(cleanMatch);
    }).filter(amount => !isNaN(amount));
  }

  private extractDates(text: string): string[] {
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})|(\b\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi;
    return text.match(dateRegex) || [];
  }

  private extractNames(text: string): string[] {
    // Simple name extraction - in production, use NER
    const nameRegex = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    return text.match(nameRegex) || [];
  }

  private extractEmails(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(emailRegex) || [];
  }

  private extractInvoiceDataRuleBased(message: string): any {
    const amounts = this.extractAmounts(message);
    const dates = this.extractDates(message);
    
    return {
      amount: amounts.length > 0 ? Math.max(...amounts) : null,
      dueDate: dates.length > 0 ? this.parseDateString(dates[0]) : null,
    };
  }

  private parseDateString(dateStr: string): string | null {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  private calculateDaysPastDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private determineUrgency(daysPastDue: number): 'low' | 'medium' | 'high' {
    if (daysPastDue > 30) return 'high';
    if (daysPastDue > 7) return 'medium';
    return 'low';
  }

  private calculateRelevanceScore(query: string, item: any): number {
    const queryTokens = this.tokenizer.tokenize(query.toLowerCase());
    const queryStemmed = queryTokens.map(token => this.stemmer.stem(token));
    
    const itemText = `${item.title} ${item.description}`.toLowerCase();
    const itemTokens = this.tokenizer.tokenize(itemText);
    const itemStemmed = itemTokens.map(token => this.stemmer.stem(token));

    // Calculate TF-IDF like score
    let score = 0;
    const totalQueryTerms = queryStemmed.length;
    
    queryStemmed.forEach(queryTerm => {
      const termFreq = itemStemmed.filter(itemTerm => itemTerm === queryTerm).length;
      if (termFreq > 0) {
        score += (termFreq / itemStemmed.length) * (1 / totalQueryTerms);
      }
    });

    // Boost exact matches
    if (itemText.includes(query.toLowerCase())) {
      score += 0.3;
    }

    return Math.min(1, score);
  }

  private findMatchedTerms(query: string, item: any): string[] {
    const queryTokens = this.tokenizer.tokenize(query.toLowerCase());
    const itemText = `${item.title} ${item.description}`.toLowerCase();
    
    return queryTokens.filter(token => itemText.includes(token));
  }

  // Mock data methods
  private async getInvoiceData(invoiceId: number): Promise<any> {
    return {
      id: invoiceId,
      clientId: 1,
      amount: 2500,
      dueDate: '2024-01-15',
      description: 'Web development services',
    };
  }

  private async getClientData(clientId: number): Promise<any> {
    return {
      id: clientId,
      name: 'Tech Corp',
      email: 'contact@techcorp.com',
    };
  }

  private async getSearchableInvoices(): Promise<any[]> {
    return [
      {
        id: 1,
        title: 'Invoice #001 - Web Development',
        description: 'Web development services for Tech Corp, React application with payment integration',
      },
      {
        id: 2,
        title: 'Invoice #002 - Design Services',
        description: 'UI/UX design for mobile application, including user research and prototyping',
      },
    ];
  }

  private async getSearchableClients(): Promise<any[]> {
    return [
      {
        id: 1,
        title: 'Tech Corp',
        description: 'Technology company specializing in SaaS solutions, regular client since 2023',
      },
      {
        id: 2,
        title: 'StartupXYZ',
        description: 'Early-stage startup in fintech space, occasional consulting work',
      },
    ];
  }

  private async getSearchablePayments(): Promise<any[]> {
    return [
      {
        id: 1,
        title: 'Payment - Invoice #001',
        description: 'Payment received for web development work, paid 5 days early',
      },
    ];
  }

  private fallbackInvoiceParsing(message: string): InvoiceParseResult {
    const ruleBasedResult = this.extractInvoiceDataRuleBased(message);
    
    return {
      amount: ruleBasedResult.amount,
      dueDate: ruleBasedResult.dueDate,
      description: message.length > 50 ? message.substring(0, 50) + '...' : message,
      confidence: 0.5,
      extractedEntities: this.extractEntitiesNLP(message),
    };
  }

  private fallbackEmailTemplate(tone: string): EmailTemplate {
    const templates = {
      professional: {
        subject: 'Payment Reminder - Invoice Past Due',
        body: 'Dear Client,\n\nI hope this email finds you well. I wanted to follow up regarding the outstanding invoice. Please let me know if you have any questions.\n\nBest regards',
        tone: 'professional',
        urgency: 'medium' as const,
      },
      friendly: {
        subject: 'Quick reminder about your invoice',
        body: 'Hi there!\n\nJust a friendly reminder about the pending invoice. No rush, but wanted to make sure it didn\'t slip through the cracks!\n\nThanks!',
        tone: 'friendly',
        urgency: 'low' as const,
      },
      firm: {
        subject: 'Immediate Attention Required - Overdue Payment',
        body: 'This is a formal notice regarding your overdue payment. Please remit payment immediately to avoid further action.\n\nRegards',
        tone: 'firm',
        urgency: 'high' as const,
      },
    };

    return templates[tone as keyof typeof templates] || templates.professional;
  }

  private fallbackSearch(query: string): SearchResult[] {
    return [
      {
        type: 'invoice',
        id: 1,
        title: 'Sample Invoice',
        description: 'Sample search result',
        relevanceScore: 0.5,
        matchedTerms: [query],
      },
    ];
  }
}