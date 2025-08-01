/**
 * Client entity defines the shape of client objects stored by the
 * application.  In a production system this would be represented by
 * a database model. Enhanced with AI-driven insights and predictions.
 */
export class Client {
  id!: number;
  name!: string;
  email!: string;
  address?: string;
  defaultPaymentTerms?: string;
  // AI-enhanced fields
  creditScore?: number;
  paymentRating?: 'excellent' | 'good' | 'fair' | 'poor';
  averagePaymentDays?: number;
  churnRisk?: number;
  totalRevenue?: number;
  lastInvoiceDate?: string;
  preferredCommunication?: 'email' | 'phone' | 'both';
  tags?: string[];
  notes?: string;
}