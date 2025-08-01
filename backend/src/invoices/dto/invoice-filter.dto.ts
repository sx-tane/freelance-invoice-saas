import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceFilterDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}