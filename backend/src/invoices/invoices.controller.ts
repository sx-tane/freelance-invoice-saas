import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceStatus } from './entities/invoice.entity';

/**
 * InvoicesController defines endpoints for managing invoices.  It
 * supports CRUD operations as well as setting an invoice's status.
 */
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Request() req, @Query() filters: InvoiceFilterDto) {
    return this.invoicesService.findAll(req.user.id, filters);
  }

  @Get('stats')
  getInvoiceStats(@Request() req) {
    return this.invoicesService.getInvoiceStats(req.user.id);
  }

  @Get('monthly-revenue/:year')
  getMonthlyRevenue(
    @Request() req,
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.invoicesService.getMonthlyRevenue(req.user.id, year);
  }

  @Get('overdue')
  getOverdueInvoices(@Request() req) {
    return this.invoicesService.getOverdueInvoices(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.invoicesService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, req.user.id);
  }

  @Post(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: InvoiceStatus,
    @Request() req,
  ) {
    return this.invoicesService.updateStatus(id, status, req.user.id);
  }

  @Post(':id/send')
  sendInvoice(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.invoicesService.updateStatus(id, InvoiceStatus.SENT, req.user.id);
  }

  @Post(':id/mark-paid')
  markAsPaid(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.invoicesService.updateStatus(id, InvoiceStatus.PAID, req.user.id);
  }

  @Get(':id/view')
  viewInvoice(@Param('id', ParseUUIDPipe) id: string) {
    // This endpoint is for client viewing (no auth required)
    return this.invoicesService.markAsViewed(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.invoicesService.remove(id, req.user.id);
  }
}