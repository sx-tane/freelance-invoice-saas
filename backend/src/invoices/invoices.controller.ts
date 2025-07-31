import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceStatus } from './invoice.entity';

/**
 * InvoicesController defines endpoints for managing invoices.  It
 * supports CRUD operations as well as setting an invoice's status.
 */
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * List all invoices.
   */
  @Get()
  findAll(): Invoice[] {
    return this.invoicesService.findAll();
  }

  /**
   * Retrieve a single invoice by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string): Invoice {
    return this.invoicesService.findOne(Number(id));
  }

  /**
   * Create a new invoice.  Requires clientId, amount and dueDate.
   * The status is set to "draft" automatically.
   */
  @Post()
  create(@Body() body: Omit<Invoice, 'id' | 'status'>): Invoice {
    return this.invoicesService.create(body);
  }

  /**
   * Update an invoice.  Only provided fields are updated; the ID
   * cannot be changed.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updates: Partial<Omit<Invoice, 'id'>>,
  ): Invoice {
    return this.invoicesService.update(Number(id), updates);
  }

  /**
   * Delete an invoice by ID.
   */
  @Delete(':id')
  remove(@Param('id') id: string): boolean {
    return this.invoicesService.remove(Number(id));
  }

  /**
   * Set the status of an invoice to one of draft, sent, paid or overdue.
   */
  @Post(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus,
  ): Invoice {
    return this.invoicesService.setStatus(Number(id), status);
  }
}