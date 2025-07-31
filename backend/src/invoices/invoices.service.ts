import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { EmailService } from '../email/email.service';

/**
 * InvoicesService maintains an in‑memory list of invoices.  It
 * provides CRUD operations and a helper to update an invoice's
 * status.  In a production system invoices would be persisted to a
 * database and more sophisticated validation would be performed.
 */
@Injectable()
export class InvoicesService {
  private invoices: Invoice[] = [];
  private nextId = 1;

  // Keep track of scheduled timers so they can be cancelled or re‑scheduled
  private readonly reminderTimers: Map<number, NodeJS.Timeout[]> = new Map();

  constructor(private readonly emailService: EmailService) {}

  findAll(): Invoice[] {
    return this.invoices;
  }

  findOne(id: number): Invoice {
    const invoice = this.invoices.find((i) => i.id === id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    return invoice;
  }

  create(data: Omit<Invoice, 'id' | 'status'>): Invoice {
    const invoice: Invoice = {
      id: this.nextId++,
      status: 'draft',
      ...data,
    };
    this.invoices.push(invoice);

    // Schedule reminder emails for this invoice
    this.scheduleReminders(invoice);
    return invoice;
  }

  update(id: number, updates: Partial<Omit<Invoice, 'id'>>): Invoice {
    const invoice = this.findOne(id);
    const oldDueDate = invoice.dueDate;
    Object.assign(invoice, updates);
    // If the due date has changed, re‑schedule reminders
    if (updates.dueDate && updates.dueDate !== oldDueDate) {
      this.cancelReminders(id);
      this.scheduleReminders(invoice);
    }
    return invoice;
  }

  remove(id: number): boolean {
    const index = this.invoices.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }
    this.invoices.splice(index, 1);

    // Cancel any scheduled reminders for this invoice
    this.cancelReminders(id);
    return true;
  }

  /**
   * Change the status of an invoice.  Use this to mark an invoice as
   * sent or paid, or to revert it to draft.
   */
  setStatus(id: number, status: InvoiceStatus): Invoice {
    const invoice = this.findOne(id);
    invoice.status = status;
    return invoice;
  }

  /**
   * Schedule reminder emails before and after the due date.  The current
   * implementation schedules two reminders: one three days before the due
   * date, and one one day after the due date if the invoice is not
   * marked as paid.  If the invoice is deleted or the due date changes,
   * previously scheduled reminders are cancelled.
   */
  private scheduleReminders(invoice: Invoice): void {
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const timers: NodeJS.Timeout[] = [];

    // Helper to schedule a reminder at a specific time offset
    const schedule = (msUntil: number, type: 'before' | 'after') => {
      if (msUntil <= 0) return;
      const timer = setTimeout(async () => {
        // Only send reminders if invoice is not yet paid
        if (invoice.status !== 'paid') {
          // For this prototype we don't have access to the client's email. In
          // a real system, you would look up the client by invoice.clientId.
          const recipient = `client-${invoice.clientId}@example.com`;
          await this.emailService.sendInvoiceReminder(
            recipient,
            invoice.id,
            invoice.dueDate,
            type,
          );
        }
      }, msUntil);
      timers.push(timer);
    };

    // Three days (in ms) before the due date
    const msBefore = dueDate.getTime() - now.getTime() - 3 * 24 * 60 * 60 * 1000;
    schedule(msBefore, 'before');

    // One day after the due date
    const msAfter = dueDate.getTime() - now.getTime() + 1 * 24 * 60 * 60 * 1000;
    schedule(msAfter, 'after');

    this.reminderTimers.set(invoice.id, timers);
  }

  /**
   * Cancel all scheduled reminders for an invoice.  Called when an
   * invoice is deleted or its due date changes.
   */
  private cancelReminders(id: number): void {
    const timers = this.reminderTimers.get(id);
    if (timers) {
      for (const timer of timers) {
        clearTimeout(timer);
      }
      this.reminderTimers.delete(id);
    }
  }
}