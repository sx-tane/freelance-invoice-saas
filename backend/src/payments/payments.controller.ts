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
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * PaymentsController exposes endpoints related to payment operations.
 */
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.paymentsService.findAll(req.user.id);
  }

  @Get('stats')
  getPaymentStats(@Request() req) {
    return this.paymentsService.getPaymentStats(req.user.id);
  }

  @Get('recent')
  getRecentPayments(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.paymentsService.getRecentPayments(req.user.id, limit);
  }

  @Get('invoice/:invoiceId')
  findByInvoice(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Request() req,
  ) {
    return this.paymentsService.findByInvoice(invoiceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.paymentsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.paymentsService.remove(id, req.user.id);
  }
}