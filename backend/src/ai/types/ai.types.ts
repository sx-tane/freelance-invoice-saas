// Payment Prediction Types
export interface PaymentPrediction {
  likelihood: number; // 0-1
  expectedDays: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface ClientScore {
  score: number; // 0-100
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  paymentHistory: {
    averageDays: number;
    onTimeRate: number;
    totalInvoices: number;
    totalPaid: number;
  };
  recommendations: string[];
}

export interface FollowupSuggestion {
  suggestedDate: string;
  method: 'email' | 'phone' | 'formal';
  urgency: 'low' | 'medium' | 'high';
  message: string;
}

// Business Insights Types
export interface RevenueForecast {
  period: string;
  predictedRevenue: number;
  confidence: number;
  trends: {
    growth: number; // percentage
    seasonality: string;
    volatility: number;
  };
  breakdown: {
    recurring: number;
    oneTime: number;
    projected: number;
  };
}

export interface ChurnPrediction {
  clientId: number;
  clientName: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
  factors: string[];
  recommendations: string[];
}

export interface SeasonalTrend {
  month: string;
  averageRevenue: number;
  invoiceCount: number;
  growthRate: number;
  seasonalityFactor: number;
}

// NLP Types
export interface InvoiceParseResult {
  clientName?: string;
  amount?: number;
  description?: string;
  dueDate?: string;
  items?: { description: string; amount: number; quantity?: number }[];
  confidence: number;
  extractedEntities: any;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  tone: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface SearchResult {
  type: 'invoice' | 'client' | 'payment';
  id: number;
  title: string;
  description: string;
  relevanceScore: number;
  matchedTerms: string[];
}

// Automation Types
export interface ReminderSuggestion {
  invoiceId: number;
  clientName: string;
  amount: number;
  daysPastDue: number;
  suggestionType: 'first_reminder' | 'second_reminder' | 'final_notice' | 'collection';
  scheduledDate: string;
  priority: 'low' | 'medium' | 'high';
  method: 'email' | 'phone' | 'letter';
  message: string;
}

export interface AutoDraftResult {
  success: boolean;
  invoiceId?: number;
  error?: string;
  details: {
    clientId: number;
    amount: number;
    description: string;
    confidence: number;
    basedOn: string[];
  };
}

export interface ExpenseCategory {
  originalDescription: string;
  category: string;
  subcategory?: string;
  confidence: number;
  taxDeductible: boolean;
  businessPurpose?: string;
}

// Invoice AI Types
export interface CategoryResult {
  category: string;
  confidence: number;
}

export interface PricingSuggestion {
  suggestedPrice: number;
  reasoning: string;
  confidence: number;
  priceRange: { min: number; max: number };
}