import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * ClientsController exposes REST endpoints for managing clients.  It
 * delegates business logic to the ClientsService.
 */
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * List all clients for the authenticated user with optional search.
   */
  @Get()
  findAll(@Request() req, @Query('search') search?: string) {
    return this.clientsService.findAll(req.user.id, search);
  }

  /**
   * Retrieve a single client by ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.clientsService.findOne(id, req.user.id);
  }

  /**
   * Get client statistics and metrics.
   */
  @Get(':id/stats')
  getClientStats(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.clientsService.getClientStats(id, req.user.id);
  }

  /**
   * Create a new client. The request body should include at least
   * name and email.
   */
  @Post()
  create(@Body() createClientDto: CreateClientDto, @Request() req) {
    return this.clientsService.create(createClientDto, req.user.id);
  }

  /**
   * Update a client. Only provided fields will be updated.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req,
  ) {
    return this.clientsService.update(id, updateClientDto, req.user.id);
  }

  /**
   * Update a client (PUT method for frontend compatibility).
   */
  @Put(':id')
  updatePut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req,
  ) {
    return this.clientsService.update(id, updateClientDto, req.user.id);
  }

  /**
   * Deactivate a client.
   */
  @Post(':id/deactivate')
  deactivate(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.clientsService.deactivateClient(id, req.user.id);
  }

  /**
   * Activate a client.
   */
  @Post(':id/activate')
  activate(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.clientsService.activateClient(id, req.user.id);
  }

  /**
   * Delete a client.
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.clientsService.remove(id, req.user.id);
  }
}