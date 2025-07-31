import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

/**
 * Module bundling the ClientsService and ClientsController.  Import
 * this module into the AppModule to enable client management.
 */
@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}