import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { EmailModule } from '../email/email.module';

/**
 * Module bundling invoice-related controllers and providers.  Imported
 * into the AppModule to expose invoice endpoints.
 */
@Module({
  imports: [EmailModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}