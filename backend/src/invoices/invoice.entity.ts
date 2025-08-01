/**
 * InvoiceStatus enumerates the possible states an invoice can occupy.
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

/**
 * Invoice defines the shape of invoice objects.  Each invoice refers
 * to a client by clientId and tracks an amount and due date.  The
 * status indicates where the invoice is in its life cycle.
 * Enhanced with AI features for smart categorization and predictions.
 */
export interface Invoice {
  id: number;
  clientId: number;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  description?: string;
  // AI-enhanced fields
  category?: string;
  items?: InvoiceItem[];
  issueDate?: string;
  paymentLikelihood?: number;
  estimatedPaymentDate?: string;
  aiGenerated?: boolean;
  tags?: string[];
}

/**
 * InvoiceItem represents individual line items within an invoice
 */
export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category?: string;
}