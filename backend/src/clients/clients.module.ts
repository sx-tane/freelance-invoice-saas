import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

/**
 * Module bundling the ClientsService and ClientsController.  Import
 * this module into the AppModule to enable client management.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Client, Subscription])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}