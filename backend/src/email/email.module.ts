import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * EmailModule exposes the EmailService for dependency injection.  It
 * could be extended to configure API keys or other settings via
 * environment variables.
 */
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}