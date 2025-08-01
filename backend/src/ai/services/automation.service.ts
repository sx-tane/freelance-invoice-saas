import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as NodeCache from 'node-cache';
import {
  ReminderSuggestion,
  AutoDraftResult,
  ExpenseCategory
} from '../types/ai.types';

@Injectable()
export class AutomationService {
  private cache: NodeCache;

  constructor(private configService: ConfigService) {
    this.cache = new NodeCache({ stdTTL: 900 }); // 15 minute cache
  }

  /**
   * Gets intelligent reminder suggestions for overdue invoices
   */
  async getIntelligentReminders(): Promise<ReminderSuggestion[]> {
    const cacheKey = 'reminder-suggestions';
    const cached = this.cache.get<ReminderSuggestion[]>(cacheKey);
    if (cached) return cached;

    try {
      const overdueInvoices = await this.getOverdueInvoices();
      const suggestions = await Promise.all(
        overdueInvoices.map(invoice => this.createReminderSuggestion(invoice))
      );

      // Sort by priority and days overdue
      const sortedSuggestions = suggestions
        .sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
          return priorityDiff !== 0 ? priorityDiff : b.daysPastDue - a.daysPastDue;
        });

      this.cache.set(cacheKey, sortedSuggestions);
      return sortedSuggestions;
    } catch (error) {
      console.error('Error getting reminder suggestions:', error);
      return [];
    }
  }

  /**
   * Auto-drafts invoices for recurring clients
   */
  async autoDraftRecurringInvoice(clientId: number): Promise<AutoDraftResult> {
    const cacheKey = `auto-draft:${clientId}`;
    const cached = this.cache.get<AutoDraftResult>(cacheKey);
    if (cached) return cached;

    try {
      const clientData = await this.getClientData(clientId);
      const invoiceHistory = await this.getClientInvoiceHistory(clientId);
      
      if (invoiceHistory.length < 2) {
        return {
          success: false,
          error: 'Insufficient invoice history for auto-drafting',
          details: {
            clientId,
            amount: 0,
            description: '',
            confidence: 0,
            basedOn: [],
          },
        };
      }

      const pattern = this.analyzeInvoicePattern(invoiceHistory);
      const predictedInvoice = this.generatePredictedInvoice(clientData, pattern);

      if (predictedInvoice.confidence < 0.7) {
        return {
          success: false,
          error: 'Low confidence in auto-draft prediction',
          details: predictedInvoice,
        };
      }

      // In a real implementation, this would create the invoice
      const mockInvoiceId = Math.floor(Math.random() * 1000) + 1000;

      const result: AutoDraftResult = {
        success: true,
        invoiceId: mockInvoiceId,
        details: predictedInvoice,
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error auto-drafting invoice:', error);
      return {
        success: false,
        error: 'Failed to auto-draft invoice',
        details: {
          clientId,
          amount: 0,
          description: '',
          confidence: 0,
          basedOn: [],
        },
      };
    }
  }

  /**
   * Categorizes expenses from descriptions
   */
  async categorizeExpenses(expenses: { description: string; amount: number }[]): Promise<ExpenseCategory[]> {
    const cacheKey = `categorize-expenses:${JSON.stringify(expenses)}`;
    const cached = this.cache.get<ExpenseCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const categorized = expenses.map(expense => this.categorizeExpense(expense));
      
      this.cache.set(cacheKey, categorized);
      return categorized;
    } catch (error) {
      console.error('Error categorizing expenses:', error);
      return expenses.map(expense => this.fallbackExpenseCategory(expense.description));
    }
  }

  private async createReminderSuggestion(invoice: any): Promise<ReminderSuggestion> {
    const daysPastDue = this.calculateDaysPastDue(invoice.dueDate);
    const reminderHistory = await this.getReminderHistory(invoice.id);
    
    let suggestionType: ReminderSuggestion['suggestionType'] = 'first_reminder';
    let priority: ReminderSuggestion['priority'] = 'low';
    let method: ReminderSuggestion['method'] = 'email';
    let scheduledDays = 0;

    // Determine reminder type based on history and days overdue
    if (reminderHistory.length === 0) {
      suggestionType = 'first_reminder';
      scheduledDays = daysPastDue < 7 ? 1 : 0;
      priority = daysPastDue > 14 ? 'medium' : 'low';
    } else if (reminderHistory.length === 1) {
      suggestionType = 'second_reminder';
      scheduledDays = daysPastDue > 14 ? 0 : 3;
      priority = daysPastDue > 21 ? 'high' : 'medium';
      method = daysPastDue > 21 ? 'phone' : 'email';
    } else if (reminderHistory.length === 2) {
      suggestionType = 'final_notice';
      scheduledDays = 0;
      priority = 'high';
      method = 'email';
    } else {
      suggestionType = 'collection';
      scheduledDays = 0;
      priority = 'high';
      method = 'letter';
    }

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + scheduledDays);

    const message = this.generateReminderMessage(suggestionType, invoice, daysPastDue);

    return {
      invoiceId: invoice.id,
      clientName: invoice.clientName,
      amount: invoice.amount,
      daysPastDue,
      suggestionType,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      priority,
      method,
      message,
    };
  }

  private analyzeInvoicePattern(invoiceHistory: any[]): any {
    // Sort by date
    const sortedHistory = invoiceHistory.sort((a, b) => 
      new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    );

    // Analyze patterns
    const amounts = sortedHistory.map(inv => inv.amount);
    const descriptions = sortedHistory.map(inv => inv.description);
    const intervals = this.calculateIntervals(sortedHistory);

    return {
      averageAmount: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
      mostCommonAmount: this.findMostFrequent(amounts),
      averageInterval: intervals.length > 0 ? intervals.reduce((sum, int) => sum + int, 0) / intervals.length : 30,
      mostCommonDescription: this.findMostSimilarDescription(descriptions),
      consistency: this.calculateConsistency(amounts, intervals),
    };
  }

  private generatePredictedInvoice(clientData: any, pattern: any): any {
    const confidence = Math.min(0.95, 0.5 + pattern.consistency * 0.5);
    
    return {
      clientId: clientData.id,
      amount: Math.round(pattern.mostCommonAmount || pattern.averageAmount),
      description: pattern.mostCommonDescription || `Services for ${clientData.name}`,
      confidence,
      basedOn: [
        `${pattern.consistency > 0.8 ? 'Consistent' : 'Variable'} payment history`,
        `Average amount: $${Math.round(pattern.averageAmount)}`,
        `Typical interval: ${Math.round(pattern.averageInterval)} days`,
      ],
    };
  }

  private categorizeExpense(expense: { description: string; amount: number }): ExpenseCategory {
    const description = expense.description.toLowerCase();
    
    // Define category rules
    const categoryRules = {
      'Office Supplies': {
        keywords: ['paper', 'pen', 'office', 'supplies', 'stationery', 'printer'],
        taxDeductible: true,
      },
      'Software & Subscriptions': {
        keywords: ['subscription', 'software', 'saas', 'license', 'app', 'service'],
        taxDeductible: true,
      },
      'Travel & Transportation': {
        keywords: ['uber', 'taxi', 'gas', 'fuel', 'hotel', 'flight', 'travel', 'parking'],
        taxDeductible: true,
      },
      'Meals & Entertainment': {
        keywords: ['restaurant', 'meal', 'coffee', 'lunch', 'dinner', 'client'],
        taxDeductible: true, // Often 50% deductible
      },
      'Marketing & Advertising': {
        keywords: ['ads', 'marketing', 'advertising', 'promotion', 'facebook', 'google'],
        taxDeductible: true,
      },
      'Professional Services': {
        keywords: ['consulting', 'legal', 'accounting', 'contractor', 'freelancer'],
        taxDeductible: true,
      },
      'Equipment & Hardware': {
        keywords: ['computer', 'laptop', 'equipment', 'hardware', 'monitor', 'keyboard'],
        taxDeductible: true,
      },
      'Internet & Communications': {
        keywords: ['internet', 'phone', 'mobile', 'communication', 'hosting', 'domain'],
        taxDeductible: true,
      },
    };

    let bestMatch = { category: 'Other', confidence: 0, taxDeductible: false };

    for (const [category, rules] of Object.entries(categoryRules)) {
      const matchedKeywords = rules.keywords.filter(keyword => 
        description.includes(keyword)
      );
      
      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length / rules.keywords.length;
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            category,
            confidence,
            taxDeductible: rules.taxDeductible,
          };
        }
      }
    }

    // Generate business purpose based on category
    const businessPurpose = this.generateBusinessPurpose(bestMatch.category, description);

    return {
      originalDescription: expense.description,
      category: bestMatch.category,
      confidence: Math.round(bestMatch.confidence * 100) / 100,
      taxDeductible: bestMatch.taxDeductible,
      businessPurpose,
    };
  }

  private generateReminderMessage(
    type: ReminderSuggestion['suggestionType'],
    invoice: any,
    daysPastDue: number
  ): string {
    const messages = {
      first_reminder: `Friendly reminder: Invoice #${invoice.id} for $${invoice.amount} is ${daysPastDue} days overdue. Please let us know if you need any assistance with payment.`,
      second_reminder: `Second notice: Payment for Invoice #${invoice.id} ($${invoice.amount}) is now ${daysPastDue} days past due. Please arrange payment at your earliest convenience.`,
      final_notice: `FINAL NOTICE: Invoice #${invoice.id} for $${invoice.amount} is ${daysPastDue} days overdue. Payment must be received within 7 days to avoid collection proceedings.`,
      collection: `This account is now ${daysPastDue} days past due and will be forwarded to our collection agency if payment is not received immediately.`,
    };

    return messages[type];
  }

  private calculateDaysPastDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private calculateIntervals(invoices: any[]): number[] {
    const intervals = [];
    for (let i = 1; i < invoices.length; i++) {
      const prevDate = new Date(invoices[i - 1].issueDate);
      const currDate = new Date(invoices[i].issueDate);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(diffDays);
    }
    return intervals;
  }

  private findMostFrequent(arr: number[]): number {
    const frequency: { [key: number]: number } = {};
    let maxCount = 0;
    let mostFrequent = arr[0];

    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxCount) {
        maxCount = frequency[item];
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  private findMostSimilarDescription(descriptions: string[]): string {
    if (descriptions.length === 0) return '';
    if (descriptions.length === 1) return descriptions[0];

    // Simple similarity - find common words
    const wordCounts: { [key: string]: number } = {};
    descriptions.forEach(desc => {
      const words = desc.toLowerCase().split(/\s+/);
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    const commonWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > 1 && word.length > 3)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    return commonWords.length > 0 
      ? `Services including ${commonWords.join(', ')}`
      : descriptions[descriptions.length - 1];
  }

  private calculateConsistency(amounts: number[], intervals: number[]): number {
    const amountVariance = this.calculateVariance(amounts);
    const intervalVariance = intervals.length > 0 ? this.calculateVariance(intervals) : 0;
    
    const amountMean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const intervalMean = intervals.length > 0 ? intervals.reduce((sum, int) => sum + int, 0) / intervals.length : 30;

    const amountCV = amountMean > 0 ? Math.sqrt(amountVariance) / amountMean : 1;
    const intervalCV = intervalMean > 0 ? Math.sqrt(intervalVariance) / intervalMean : 1;

    // Lower coefficient of variation = higher consistency
    return Math.max(0, 1 - (amountCV + intervalCV) / 2);
  }

  private calculateVariance(arr: number[]): number {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }

  private generateBusinessPurpose(category: string, description: string): string {
    const purposes: { [key: string]: string } = {
      'Office Supplies': 'General office operations and administrative tasks',
      'Software & Subscriptions': 'Business software and tools for operations',
      'Travel & Transportation': 'Business travel and client meetings',
      'Meals & Entertainment': 'Client meetings and business development',
      'Marketing & Advertising': 'Business promotion and client acquisition',
      'Professional Services': 'Specialized business services and consulting',
      'Equipment & Hardware': 'Business equipment and technology infrastructure',
      'Internet & Communications': 'Business communications and online presence',
      'Other': 'General business operations',
    };

    return purposes[category] || purposes['Other'];
  }

  private fallbackExpenseCategory(description: string): ExpenseCategory {
    return {
      originalDescription: description,
      category: 'Other',
      confidence: 0.5,
      taxDeductible: true,
      businessPurpose: 'General business expense',
    };
  }

  // Mock data methods
  private async getOverdueInvoices(): Promise<any[]> {
    return [
      {
        id: 1,
        clientName: 'Tech Corp',
        amount: 2500,
        dueDate: '2024-07-01',
        issueDate: '2024-06-01',
      },
      {
        id: 2,
        clientName: 'StartupXYZ',
        amount: 1200,
        dueDate: '2024-07-15',
        issueDate: '2024-06-15',
      },
    ];
  }

  private async getReminderHistory(invoiceId: number): Promise<any[]> {
    // Mock reminder history
    return [];
  }

  private async getClientData(clientId: number): Promise<any> {
    return {
      id: clientId,
      name: 'Tech Corp',
      email: 'contact@techcorp.com',
    };
  }

  private async getClientInvoiceHistory(clientId: number): Promise<any[]> {
    return [
      {
        id: 1,
        amount: 2500,
        description: 'Web development services',
        issueDate: '2024-05-01',
      },
      {
        id: 2,
        amount: 2500,
        description: 'Web development services - Phase 2',
        issueDate: '2024-06-01',
      },
      {
        id: 3,
        amount: 2000,
        description: 'Web development maintenance',
        issueDate: '2024-07-01',
      },
    ];
  }
}