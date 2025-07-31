/**
 * InvoiceStatus enumerates the possible states an invoice can occupy.
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

/**
 * Invoice defines the shape of invoice objects.  Each invoice refers
 * to a client by clientId and tracks an amount and due date.  The
 * status indicates where the invoice is in its life cycle.
 */
export interface Invoice {
  id: number;
  clientId: number;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  description?: string;
}