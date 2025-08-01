import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as NodeCache from 'node-cache';
import {
  CategoryResult,
  PricingSuggestion
} from '../types/ai.types';

@Injectable()
export class InvoiceAiService {
  private openai: OpenAI;
  private cache: NodeCache;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
  }

  /**
   * Categorizes invoice items using AI
   */
  async categorizeItems(items: string[]): Promise<CategoryResult[]> {
    const cacheKey = `categorize:${items.join('|')}`;
    const cached = this.cache.get<CategoryResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Categorize these invoice items into appropriate business categories:
${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Return a JSON array with objects containing 'category' and 'confidence' (0-1) for each item.
Common categories include: Development, Design, Consulting, Marketing, Content, Support, Training, Other.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error categorizing items:', error);
      // Fallback to simple keyword-based categorization
      return items.map(item => this.fallbackCategorization(item));
    }
  }

  /**
   * Suggests pricing based on description and historical data
   */
  async suggestPricing(
    description: string,
    clientId?: number,
    category?: string,
  ): Promise<PricingSuggestion> {
    const cacheKey = `pricing:${description}:${clientId}:${category}`;
    const cached = this.cache.get<PricingSuggestion>(cacheKey);
    if (cached) return cached;

    try {
      // Get historical data for context
      const historicalContext = await this.getHistoricalPricingContext(clientId, category);
      
      const prompt = `As a freelance pricing expert, suggest pricing for this work:

Description: "${description}"
Category: ${category || 'Not specified'}
${historicalContext ? `Historical context: ${historicalContext}` : ''}

Consider:
- Complexity and scope of work
- Time investment required
- Market rates for similar services
- Value delivered to client

Return JSON with:
- suggestedPrice: number
- reasoning: string explanation
- confidence: number (0-1)
- priceRange: {min: number, max: number}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error suggesting pricing:', error);
      return this.fallbackPricingSuggestion(description, category);
    }
  }

  /**
   * Generates invoice description from project details
   */
  async generateInvoiceDescription(projectDetails: string, clientId?: number): Promise<string> {
    const cacheKey = `description:${projectDetails}:${clientId}`;
    const cached = this.cache.get<string>(cacheKey);
    if (cached) return cached;

    try {
      const clientContext = clientId ? await this.getClientContext(clientId) : '';
      
      const prompt = `Create a professional invoice description from these project details:

Project Details: "${projectDetails}"
${clientContext ? `Client Context: ${clientContext}` : ''}

Make it:
- Professional and clear
- Specific about deliverables
- Appropriate for an invoice
- 1-3 sentences maximum

Return only the description text.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      const result = response.choices[0].message.content?.trim() || projectDetails;
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating description:', error);
      return this.fallbackDescription(projectDetails);
    }
  }

  private fallbackCategorization(item: string): CategoryResult {
    const keywords = {
      Development: ['dev', 'code', 'programming', 'app', 'website', 'software', 'api'],
      Design: ['design', 'ui', 'ux', 'graphics', 'logo', 'brand', 'visual'],
      Consulting: ['consult', 'advice', 'strategy', 'planning', 'analysis'],
      Marketing: ['marketing', 'seo', 'social', 'campaign', 'advertising'],
      Content: ['content', 'writing', 'copy', 'blog', 'article', 'documentation'],
    };

    const itemLower = item.toLowerCase();
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => itemLower.includes(keyword))) {
        return { category, confidence: 0.7 };
      }
    }

    return { category: 'Other', confidence: 0.5 };
  }

  private fallbackPricingSuggestion(description: string, category?: string): PricingSuggestion {
    const basePrices = {
      Development: 75,
      Design: 60,
      Consulting: 100,
      Marketing: 65,
      Content: 50,
      Other: 60,
    };

    const basePrice = basePrices[category as keyof typeof basePrices] || 60;
    const complexity = description.length > 100 ? 1.5 : 1.0;
    const suggestedPrice = Math.round(basePrice * complexity);

    return {
      suggestedPrice,
      reasoning: 'Based on category and description complexity',
      confidence: 0.6,
      priceRange: {
        min: Math.round(suggestedPrice * 0.8),
        max: Math.round(suggestedPrice * 1.3),
      },
    };
  }

  private fallbackDescription(projectDetails: string): string {
    const sentences = projectDetails.split('.').filter(s => s.trim());
    if (sentences.length <= 2) return projectDetails;
    
    return sentences.slice(0, 2).join('. ') + '.';
  }

  private async getHistoricalPricingContext(clientId?: number, category?: string): Promise<string> {
    // In a real implementation, this would query historical invoice data
    // For now, return placeholder context
    return `Average rates for ${category || 'similar work'}: $50-$100/hour`;
  }

  private async getClientContext(clientId: number): Promise<string> {
    // In a real implementation, this would fetch client details
    return `Regular client with established working relationship`;
  }
}