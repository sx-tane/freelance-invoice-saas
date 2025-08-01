import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SimpleLinearRegression } from 'ml-regression';
import * as NodeCache from 'node-cache';
import {
  RevenueForecast,
  ChurnPrediction,
  SeasonalTrend
} from '../types/ai.types';

@Injectable()
export class BusinessInsightsService {
  private cache: NodeCache;

  constructor(private configService: ConfigService) {
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
  }

  /**
   * Forecasts revenue for specified number of months
   */
  async forecastRevenue(months: number = 6): Promise<RevenueForecast[]> {
    const cacheKey = `revenue-forecast:${months}`;
    const cached = this.cache.get<RevenueForecast[]>(cacheKey);
    if (cached) return cached;

    try {
      const historicalData = await this.getHistoricalRevenueData();
      const recurringRevenue = await this.getRecurringRevenueData();
      
      const forecasts = this.generateRevenueForecast(historicalData, recurringRevenue, months);
      
      this.cache.set(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error generating revenue forecast:', error);
      return this.fallbackRevenueForecast(months);
    }
  }

  /**
   * Predicts which clients are at risk of churning
   */
  async predictClientChurn(): Promise<ChurnPrediction[]> {
    const cacheKey = 'churn-prediction';
    const cached = this.cache.get<ChurnPrediction[]>(cacheKey);
    if (cached) return cached;

    try {
      const clients = await this.getAllClientsData();
      const predictions = await Promise.all(
        clients.map(client => this.analyzeClientChurnRisk(client))
      );
      
      // Sort by churn probability (highest risk first)
      const sortedPredictions = predictions
        .filter(p => p.churnProbability > 0.3)
        .sort((a, b) => b.churnProbability - a.churnProbability);

      this.cache.set(cacheKey, sortedPredictions);
      return sortedPredictions;
    } catch (error) {
      console.error('Error predicting churn:', error);
      return this.fallbackChurnPredictions();
    }
  }

  /**
   * Analyzes seasonal trends in the business
   */
  async analyzeSeasonalTrends(): Promise<SeasonalTrend[]> {
    const cacheKey = 'seasonal-trends';
    const cached = this.cache.get<SeasonalTrend[]>(cacheKey);
    if (cached) return cached;

    try {
      const monthlyData = await this.getMonthlyRevenueData();
      const trends = this.calculateSeasonalTrends(monthlyData);
      
      this.cache.set(cacheKey, trends);
      return trends;
    } catch (error) {
      console.error('Error analyzing seasonal trends:', error);
      return this.fallbackSeasonalTrends();
    }
  }

  private generateRevenueForecast(
    historicalData: any[],
    recurringRevenue: number,
    months: number
  ): RevenueForecast[] {
    const forecasts: RevenueForecast[] = [];
    
    // Prepare data for regression
    const monthIndices = historicalData.map((_, index) => index);
    const revenues = historicalData.map(data => data.revenue);
    
    let regression: SimpleLinearRegression | null = null;
    try {
      if (revenues.length >= 3) {
        regression = new SimpleLinearRegression(monthIndices, revenues);
      }
    } catch (error) {
      console.warn('Could not create regression model:', error);
    }

    for (let i = 1; i <= months; i++) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + i);
      
      let predictedRevenue = recurringRevenue;
      let confidence = 0.6;

      if (regression) {
        const trendRevenue = regression.predict(historicalData.length + i - 1);
        predictedRevenue = Math.max(0, trendRevenue);
        confidence = this.calculateForecastConfidence(historicalData, i);
      } else {
        // Simple moving average fallback
        const recentRevenues = revenues.slice(-3);
        const avgRevenue = recentRevenues.reduce((sum, rev) => sum + rev, 0) / recentRevenues.length;
        predictedRevenue = avgRevenue;
      }

      // Apply seasonal adjustments
      const seasonalFactor = this.getSeasonalFactor(currentDate.getMonth());
      predictedRevenue *= seasonalFactor;

      // Calculate growth rate
      const lastRevenue = revenues[revenues.length - 1] || predictedRevenue;
      const growth = ((predictedRevenue - lastRevenue) / lastRevenue) * 100;

      forecasts.push({
        period: `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
        predictedRevenue: Math.round(predictedRevenue),
        confidence: Math.round(confidence * 100) / 100,
        trends: {
          growth: Math.round(growth * 100) / 100,
          seasonality: this.getSeasonalityDescription(currentDate.getMonth()),
          volatility: this.calculateVolatility(revenues),
        },
        breakdown: {
          recurring: Math.round(recurringRevenue),
          oneTime: Math.round(predictedRevenue - recurringRevenue),
          projected: Math.round(predictedRevenue),
        },
      });
    }

    return forecasts;
  }

  private async analyzeClientChurnRisk(client: any): Promise<ChurnPrediction> {
    const now = new Date();
    const lastInvoiceDate = new Date(client.lastInvoiceDate);
    const daysSinceLastInvoice = Math.floor((now.getTime() - lastInvoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let churnProbability = 0.1; // Base probability

    // Time since last invoice
    if (daysSinceLastInvoice > 90) churnProbability += 0.3;
    else if (daysSinceLastInvoice > 60) churnProbability += 0.2;
    else if (daysSinceLastInvoice > 30) churnProbability += 0.1;

    // Invoice frequency trend
    const invoiceFrequency = client.totalInvoices / client.relationshipMonths;
    if (invoiceFrequency < 0.5) churnProbability += 0.2;

    // Payment behavior
    if (client.averagePaymentDays > 45) churnProbability += 0.1;
    if (client.onTimePaymentRate < 0.7) churnProbability += 0.1;

    // Revenue trend
    if (client.recentRevenueChange < -0.2) churnProbability += 0.2;

    churnProbability = Math.min(0.95, churnProbability);

    const factors = this.identifyChurnFactors(client, daysSinceLastInvoice);
    const recommendations = this.generateChurnPreventionRecommendations(churnProbability, factors);

    return {
      clientId: client.id,
      clientName: client.name,
      churnProbability: Math.round(churnProbability * 100) / 100,
      riskLevel: this.getChurnRiskLevel(churnProbability),
      lastActivity: client.lastInvoiceDate,
      factors,
      recommendations,
    };
  }

  private calculateSeasonalTrends(monthlyData: any[]): SeasonalTrend[] {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyStats = new Array(12).fill(null).map((_, index) => ({
      month: monthNames[index],
      revenues: [] as number[],
      invoiceCounts: [] as number[],
    }));

    // Group data by month
    monthlyData.forEach(data => {
      const monthIndex = new Date(data.date).getMonth();
      monthlyStats[monthIndex].revenues.push(data.revenue);
      monthlyStats[monthIndex].invoiceCounts.push(data.invoiceCount);
    });

    // Calculate trends
    return monthlyStats.map(stat => {
      const avgRevenue = stat.revenues.length > 0 
        ? stat.revenues.reduce((sum, rev) => sum + rev, 0) / stat.revenues.length 
        : 0;
      
      const avgInvoiceCount = stat.invoiceCounts.length > 0
        ? stat.invoiceCounts.reduce((sum, count) => sum + count, 0) / stat.invoiceCounts.length
        : 0;

      // Calculate growth rate (compare to previous year)
      const currentYear = stat.revenues.slice(-1)[0] || 0;
      const previousYear = stat.revenues.slice(-2, -1)[0] || currentYear;
      const growthRate = previousYear > 0 ? ((currentYear - previousYear) / previousYear) * 100 : 0;

      // Calculate seasonality factor (relative to annual average)
      const annualAverage = monthlyStats.reduce((sum, s) => {
        const monthAvg = s.revenues.length > 0 ? s.revenues.reduce((a, b) => a + b, 0) / s.revenues.length : 0;
        return sum + monthAvg;
      }, 0) / 12;
      
      const seasonalityFactor = annualAverage > 0 ? avgRevenue / annualAverage : 1;

      return {
        month: stat.month,
        averageRevenue: Math.round(avgRevenue),
        invoiceCount: Math.round(avgInvoiceCount),
        growthRate: Math.round(growthRate * 100) / 100,
        seasonalityFactor: Math.round(seasonalityFactor * 100) / 100,
      };
    });
  }

  private calculateForecastConfidence(historicalData: any[], monthsAhead: number): number {
    const baseConfidence = 0.8;
    const decayRate = 0.05; // Confidence decreases by 5% per month ahead
    const volatilityPenalty = this.calculateVolatility(historicalData.map(d => d.revenue)) * 0.1;
    
    return Math.max(0.3, baseConfidence - (monthsAhead * decayRate) - volatilityPenalty);
  }

  private calculateVolatility(revenues: number[]): number {
    if (revenues.length < 2) return 0;
    
    const mean = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;
    const variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - mean, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0; // Coefficient of variation
  }

  private getSeasonalFactor(month: number): number {
    const factors = [
      0.9,  // January - slower start
      1.0,  // February
      1.1,  // March - picking up
      1.1,  // April
      1.0,  // May
      0.9,  // June - summer slowdown
      0.8,  // July
      0.9,  // August
      1.1,  // September - back to business
      1.1,  // October
      0.9,  // November - holidays approaching
      0.8,  // December - holiday slowdown
    ];
    return factors[month];
  }

  private getSeasonalityDescription(month: number): string {
    const descriptions = [
      'Post-holiday recovery', 'Winter steady', 'Spring growth', 'Spring peak',
      'Late spring', 'Summer slowdown', 'Mid-summer low', 'Summer recovery',
      'Fall growth', 'Fall peak', 'Pre-holiday', 'Holiday period'
    ];
    return descriptions[month];
  }

  private identifyChurnFactors(client: any, daysSinceLastInvoice: number): string[] {
    const factors = [];

    if (daysSinceLastInvoice > 90) factors.push('No recent activity (90+ days)');
    else if (daysSinceLastInvoice > 60) factors.push('Reduced activity (60+ days)');
    
    if (client.recentRevenueChange < -0.2) factors.push('Declining revenue trend');
    if (client.averagePaymentDays > 45) factors.push('Slow payment history');
    if (client.onTimePaymentRate < 0.7) factors.push('Poor payment reliability');
    
    const invoiceFrequency = client.totalInvoices / client.relationshipMonths;
    if (invoiceFrequency < 0.5) factors.push('Low engagement frequency');

    return factors.length > 0 ? factors : ['Standard engagement pattern'];
  }

  private generateChurnPreventionRecommendations(probability: number, factors: string[]): string[] {
    const recommendations = [];

    if (probability > 0.7) {
      recommendations.push('Immediate outreach recommended');
      recommendations.push('Schedule check-in call');
      recommendations.push('Offer special engagement or discount');
    } else if (probability > 0.5) {
      recommendations.push('Proactive communication needed');
      recommendations.push('Send project proposal or ideas');
      recommendations.push('Schedule quarterly business review');
    } else if (probability > 0.3) {
      recommendations.push('Monitor engagement closely');
      recommendations.push('Send regular value-add content');
    }

    if (factors.some(f => f.includes('payment'))) {
      recommendations.push('Address payment terms or issues');
    }

    if (factors.some(f => f.includes('activity') || f.includes('engagement'))) {
      recommendations.push('Propose new project opportunities');
    }

    return recommendations;
  }

  private getChurnRiskLevel(probability: number): 'low' | 'medium' | 'high' {
    if (probability > 0.6) return 'high';
    if (probability > 0.4) return 'medium';
    return 'low';
  }

  // Mock data methods - in production, these would query actual database
  private async getHistoricalRevenueData(): Promise<any[]> {
    // Mock 12 months of historical data
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        revenue: Math.round(8000 + Math.random() * 4000 + Math.sin(i * 0.5) * 2000),
        invoiceCount: Math.round(15 + Math.random() * 10),
      });
    }
    return data;
  }

  private async getRecurringRevenueData(): Promise<number> {
    // Mock recurring revenue calculation
    return 6000;
  }

  private async getAllClientsData(): Promise<any[]> {
    // Mock client data
    return [
      {
        id: 1,
        name: 'Tech Corp',
        lastInvoiceDate: '2024-06-15',
        totalInvoices: 12,
        relationshipMonths: 18,
        averagePaymentDays: 25,
        onTimePaymentRate: 0.8,
        recentRevenueChange: -0.1,
      },
      {
        id: 2,
        name: 'StartupXYZ',
        lastInvoiceDate: '2024-03-20',
        totalInvoices: 4,
        relationshipMonths: 8,
        averagePaymentDays: 52,
        onTimePaymentRate: 0.5,
        recentRevenueChange: -0.3,
      },
    ];
  }

  private async getMonthlyRevenueData(): Promise<any[]> {
    // Mock monthly data for 2 years
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      data.push({
        date: date.toISOString(),
        revenue: Math.round(7000 + Math.random() * 6000 + Math.sin(i * 0.5) * 2000),
        invoiceCount: Math.round(12 + Math.random() * 8),
      });
    }
    return data;
  }

  private fallbackRevenueForecast(months: number): RevenueForecast[] {
    const forecasts = [];
    for (let i = 1; i <= months; i++) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + i);
      
      forecasts.push({
        period: `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
        predictedRevenue: 8000,
        confidence: 0.6,
        trends: {
          growth: 5,
          seasonality: 'Stable',
          volatility: 0.2,
        },
        breakdown: {
          recurring: 6000,
          oneTime: 2000,
          projected: 8000,
        },
      });
    }
    return forecasts;
  }

  private fallbackChurnPredictions(): ChurnPrediction[] {
    return [
      {
        clientId: 1,
        clientName: 'Sample Client',
        churnProbability: 0.4,
        riskLevel: 'medium',
        lastActivity: '2024-05-15',
        factors: ['Reduced recent activity'],
        recommendations: ['Schedule check-in call'],
      },
    ];
  }

  private fallbackSeasonalTrends(): SeasonalTrend[] {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames.map(month => ({
      month,
      averageRevenue: 8000,
      invoiceCount: 15,
      growthRate: 5,
      seasonalityFactor: 1.0,
    }));
  }
}