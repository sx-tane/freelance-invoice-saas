import { Injectable, Logger } from '@nestjs/common';

/**
 * EmailService provides a thin abstraction over sending email.  For
 * this prototype it simply logs the details of each email to the
 * console.  In a production application you would integrate with a
 * transactional email provider such as SendGrid or AWS SES here.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // In a real implementation, send the email via an external service.
    this.logger.log(`Sending email to ${to}: ${subject}\n${body}`);
  }

  async sendInvoiceReminder(
    to: string,
    invoiceId: number,
    dueDate: string,
    type: 'before' | 'after',
  ): Promise<void> {
    const subject =
      type === 'before'
        ? `Reminder: Invoice #${invoiceId} is due on ${dueDate}`
        : `Invoice #${invoiceId} is overdue (due ${dueDate})`;
    const body =
      type === 'before'
        ? `This is a friendly reminder that your invoice #${invoiceId} is due on ${dueDate}. Please arrange payment accordingly.`
        : `Your invoice #${invoiceId} was due on ${dueDate} and is now overdue. Please remit payment as soon as possible.`;
    await this.sendEmail(to, subject, body);
  }
}