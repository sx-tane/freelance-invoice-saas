import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';

/**
 * ClientsController exposes REST endpoints for managing clients.  It
 * delegates business logic to the ClientsService.
 */
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * List all clients.
   */
  @Get()
  findAll(): Client[] {
    return this.clientsService.findAll();
  }

  /**
   * Retrieve a single client by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string): Client {
    return this.clientsService.findOne(Number(id));
  }

  /**
   * Create a new client.  The request body should include at least
   * name and email.
   */
  @Post()
  create(@Body() body: Omit<Client, 'id'>): Client {
    return this.clientsService.create(body);
  }

  /**
   * Update a client.  Only provided fields will be updated.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updates: Partial<Omit<Client, 'id'>>,
  ): Client {
    return this.clientsService.update(Number(id), updates);
  }

  /**
   * Delete a client.
   */
  @Delete(':id')
  remove(@Param('id') id: string): boolean {
    return this.clientsService.remove(Number(id));
  }
}