import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SimpleLinearRegression } from 'ml-regression';
import * as NodeCache from 'node-cache';
import {
  PaymentPrediction,
  ClientScore,
  FollowupSuggestion
} from '../types/ai.types';

@Injectable()
export class PaymentPredictionService {
  private cache: NodeCache;

  constructor(private configService: ConfigService) {
    this.cache = new NodeCache({ stdTTL: 1800 }); // 30 minute cache
  }

  /**
   * Predicts payment likelihood for an invoice
   */
  async predictPaymentLikelihood(invoiceId: number): Promise<PaymentPrediction> {
    const cacheKey = `payment-prediction:${invoiceId}`;
    const cached = this.cache.get<PaymentPrediction>(cacheKey);
    if (cached) return cached;

    try {
      // Get invoice and client data
      const invoiceData = await this.getInvoiceData(invoiceId);
      const clientHistory = await this.getClientPaymentHistory(invoiceData.clientId);
      
      // Calculate prediction based on multiple factors
      const factors = this.analyzePaymentFactors(invoiceData, clientHistory);
      const likelihood = this.calculatePaymentLikelihood(factors);
      const expectedDays = this.predictPaymentDays(factors, clientHistory);
      
      const prediction: PaymentPrediction = {
        likelihood,
        expectedDays,
        riskLevel: this.getRiskLevel(likelihood),
        factors: this.getSignificantFactors(factors),
      };

      this.cache.set(cacheKey, prediction);
      return prediction;
    } catch (error) {
      console.error('Error predicting payment:', error);
      return this.fallbackPaymentPrediction();
    }
  }

  /**
   * Calculates client creditworthiness score
   */
  async calculateClientScore(clientId: number): Promise<ClientScore> {
    const cacheKey = `client-score:${clientId}`;
    const cached = this.cache.get<ClientScore>(cacheKey);
    if (cached) return cached;

    try {
      const paymentHistory = await this.getClientPaymentHistory(clientId);
      const clientData = await this.getClientData(clientId);
      
      const score = this.computeClientScore(paymentHistory, clientData);
      const rating = this.getScoreRating(score);
      const recommendations = this.generateClientRecommendations(score, paymentHistory);

      const clientScore: ClientScore = {
        score,
        rating,
        paymentHistory,
        recommendations,
      };

      this.cache.set(cacheKey, clientScore);
      return clientScore;
    } catch (error) {
      console.error('Error calculating client score:', error);
      return this.fallbackClientScore();
    }
  }

  /**
   * Suggests optimal follow-up timing
   */
  async getOptimalFollowupTiming(invoiceId: number): Promise<FollowupSuggestion> {
    const cacheKey = `followup:${invoiceId}`;
    const cached = this.cache.get<FollowupSuggestion>(cacheKey);
    if (cached) return cached;

    try {
      const invoiceData = await this.getInvoiceData(invoiceId);
      const clientHistory = await this.getClientPaymentHistory(invoiceData.clientId);
      const prediction = await this.predictPaymentLikelihood(invoiceId);
      
      const suggestion = this.calculateOptimalFollowup(invoiceData, clientHistory, prediction);
      
      this.cache.set(cacheKey, suggestion);
      return suggestion;
    } catch (error) {
      console.error('Error calculating followup timing:', error);
      return this.fallbackFollowupSuggestion();
    }
  }

  private analyzePaymentFactors(invoiceData: any, clientHistory: any): any {
    const daysSinceIssued = this.daysBetween(new Date(invoiceData.issueDate), new Date());
    const daysPastDue = Math.max(0, this.daysBetween(new Date(invoiceData.dueDate), new Date()));
    const invoiceAmount = invoiceData.amount;
    const averageAmount = clientHistory.averageAmount || invoiceAmount;
    
    return {
      daysSinceIssued,
      daysPastDue,
      invoiceAmount,
      amountRatio: invoiceAmount / averageAmount,
      clientOnTimeRate: clientHistory.onTimeRate || 0.8,
      clientAverageDays: clientHistory.averageDays || 15,
      invoiceCount: clientHistory.totalInvoices || 1,
      seasonality: this.getSeasonalityFactor(new Date()),
    };
  }

  private calculatePaymentLikelihood(factors: any): number {
    let likelihood = 0.8; // Base likelihood

    // Adjust based on days past due
    if (factors.daysPastDue > 0) {
      likelihood -= Math.min(0.5, factors.daysPastDue * 0.02);
    }

    // Adjust based on client history
    likelihood = likelihood * 0.5 + factors.clientOnTimeRate * 0.5;

    // Adjust based on amount (larger amounts might be paid slower)
    if (factors.amountRatio > 2) {
      likelihood -= 0.1;
    }

    // Seasonal adjustments
    likelihood *= factors.seasonality;

    return Math.max(0.1, Math.min(0.95, likelihood));
  }

  private predictPaymentDays(factors: any, clientHistory: any): number {
    const baseDays = clientHistory.averageDays || 15;
    
    // Use simple linear regression if we have enough data
    if (clientHistory.invoices && clientHistory.invoices.length > 3) {
      const amounts = clientHistory.invoices.map((inv: any) => inv.amount);
      const days = clientHistory.invoices.map((inv: any) => inv.daysToPay);
      
      try {
        const regression = new SimpleLinearRegression(amounts, days);
        return Math.max(1, Math.round(regression.predict(factors.invoiceAmount)));
      } catch (error) {
        // Fall back to average-based prediction
      }
    }

    // Adjust based on amount
    let adjustedDays = baseDays;
    if (factors.amountRatio > 1.5) {
      adjustedDays *= 1.2;
    }

    // Add days if already past due
    adjustedDays += factors.daysPastDue * 0.5;

    return Math.round(adjustedDays);
  }

  private getRiskLevel(likelihood: number): 'low' | 'medium' | 'high' {
    if (likelihood > 0.8) return 'low';
    if (likelihood > 0.6) return 'medium';
    return 'high';
  }

  private getSignificantFactors(factors: any): string[] {
    const significantFactors = [];

    if (factors.daysPastDue > 7) {
      significantFactors.push(`${factors.daysPastDue} days overdue`);
    }
    if (factors.clientOnTimeRate < 0.7) {
      significantFactors.push('Poor payment history');
    }
    if (factors.amountRatio > 2) {
      significantFactors.push('Above average invoice amount');
    }
    if (factors.seasonality < 0.9) {
      significantFactors.push('Seasonal payment delays expected');
    }

    return significantFactors.length > 0 ? significantFactors : ['Standard payment pattern expected'];
  }

  private computeClientScore(paymentHistory: any, clientData: any): number {
    let score = 50; // Base score

    // Payment timing (40% weight)
    score += (paymentHistory.onTimeRate - 0.5) * 80;

    // Average payment days (30% weight)
    const daysPenalty = Math.max(0, paymentHistory.averageDays - 30) * 0.5;
    score -= daysPenalty;

    // Total volume (20% weight)
    if (paymentHistory.totalInvoices > 10) score += 10;
    if (paymentHistory.totalPaid > 10000) score += 10;

    // Relationship length (10% weight)
    if (clientData?.relationshipMonths > 12) score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private getScoreRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  private generateClientRecommendations(score: number, paymentHistory: any): string[] {
    const recommendations = [];

    if (score < 50) {
      recommendations.push('Require payment upfront or shorter payment terms');
      recommendations.push('Consider more frequent follow-ups');
    } else if (score < 70) {
      recommendations.push('Monitor payment closely');
      recommendations.push('Consider 15-day payment terms');
    } else if (score < 85) {
      recommendations.push('Standard 30-day terms appropriate');
      recommendations.push('Reliable client for larger projects');
    } else {
      recommendations.push('Excellent client - consider extended terms');
      recommendations.push('Ideal for high-value projects');
    }

    if (paymentHistory.averageDays > 45) {
      recommendations.push('Consider shorter payment terms');
    }

    return recommendations;
  }

  private calculateOptimalFollowup(invoiceData: any, clientHistory: any, prediction: PaymentPrediction): FollowupSuggestion {
    const daysPastDue = Math.max(0, this.daysBetween(new Date(invoiceData.dueDate), new Date()));
    
    let suggestedDays = 0;
    let method: 'email' | 'phone' | 'formal' = 'email';
    let urgency: 'low' | 'medium' | 'high' = 'low';

    if (daysPastDue === 0) {
      // Not yet due
      suggestedDays = Math.max(3, clientHistory.averageDays - 7);
      method = 'email';
      urgency = 'low';
    } else if (daysPastDue <= 7) {
      // Recently overdue
      suggestedDays = 2;
      method = 'email';
      urgency = 'medium';
    } else if (daysPastDue <= 30) {
      // Significantly overdue
      suggestedDays = 1;
      method = prediction.likelihood < 0.5 ? 'phone' : 'email';
      urgency = 'high';
    } else {
      // Very overdue
      suggestedDays = 0;
      method = 'formal';
      urgency = 'high';
    }

    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + suggestedDays);

    const messages = {
      email: 'Friendly reminder about pending payment',
      phone: 'Direct call to discuss payment status',
      formal: 'Formal collection notice may be required',
    };

    return {
      suggestedDate: followupDate.toISOString().split('T')[0],
      method,
      urgency,
      message: messages[method],
    };
  }

  private getSeasonalityFactor(date: Date): number {
    const month = date.getMonth();
    // Holiday months typically see slower payments
    if (month === 11 || month === 0) return 0.85; // Dec, Jan
    if (month === 6 || month === 7) return 0.9;   // Jul, Aug
    return 1.0;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Mock data methods - in production, these would query actual database
  private async getInvoiceData(invoiceId: number): Promise<any> {
    return {
      id: invoiceId,
      clientId: 1,
      amount: 2500,
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'sent',
    };
  }

  private async getClientPaymentHistory(clientId: number): Promise<any> {
    return {
      averageDays: 18,
      onTimeRate: 0.75,
      totalInvoices: 8,
      totalPaid: 15000,
      averageAmount: 1875,
      invoices: [], // Would contain actual invoice payment data
    };
  }

  private async getClientData(clientId: number): Promise<any> {
    return {
      id: clientId,
      relationshipMonths: 24,
      businessSize: 'medium',
    };
  }

  private fallbackPaymentPrediction(): PaymentPrediction {
    return {
      likelihood: 0.75,
      expectedDays: 21,
      riskLevel: 'medium',
      factors: ['Insufficient data for detailed analysis'],
    };
  }

  private fallbackClientScore(): ClientScore {
    return {
      score: 70,
      rating: 'good',
      paymentHistory: {
        averageDays: 21,
        onTimeRate: 0.75,
        totalInvoices: 5,
        totalPaid: 7500,
      },
      recommendations: ['Monitor payment patterns', 'Standard terms appropriate'],
    };
  }

  private fallbackFollowupSuggestion(): FollowupSuggestion {
    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + 7);

    return {
      suggestedDate: followupDate.toISOString().split('T')[0],
      method: 'email',
      urgency: 'medium',
      message: 'Standard follow-up recommended',
    };
  }
}