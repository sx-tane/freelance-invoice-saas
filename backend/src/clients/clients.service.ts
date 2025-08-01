import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

/**
 * ClientsService provides database operations for clients using TypeORM.
 * Includes subscription limit checking for client creation.
 */
@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async findAll(userId: string): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, userId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    // Check subscription limits
    const subscription = await this.subscriptionsRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      throw new ForbiddenException('No active subscription found');
    }

    const currentClientCount = await this.clientsRepository.count({
      where: { userId },
    });

    if (currentClientCount >= subscription.clientLimit) {
      throw new ForbiddenException(
        `Client limit reached. Current plan allows ${subscription.clientLimit} clients.`,
      );
    }

    const client = this.clientsRepository.create({
      ...createClientDto,
      userId,
    });

    const savedClient = await this.clientsRepository.save(client);

    // Update subscription counter
    await this.subscriptionsRepository.update(
      { userId },
      { clientsCreated: subscription.clientsCreated + 1 },
    );

    return savedClient;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);
    
    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.clientsRepository.remove(client);
  }

  async deactivateClient(id: string, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);
    client.isActive = false;
    return this.clientsRepository.save(client);
  }

  async activateClient(id: string, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);
    client.isActive = true;
    return this.clientsRepository.save(client);
  }

  async findByEmail(email: string, userId: string): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { email, userId },
    });
  }

  async getClientStats(id: string, userId: string) {
    const client = await this.clientsRepository
      .createQueryBuilder('client')
      .leftJoin('client.invoices', 'invoice')
      .select([
        'client.id',
        'client.name',
        'client.email',
        'client.company',
      ])
      .addSelect('COUNT(DISTINCT invoice.id)', 'totalInvoices')
      .addSelect('COUNT(DISTINCT CASE WHEN invoice.status = \'paid\' THEN invoice.id END)', 'paidInvoices')
      .addSelect('SUM(CASE WHEN invoice.status = \'paid\' THEN invoice.total ELSE 0 END)', 'totalRevenue')
      .addSelect('SUM(CASE WHEN invoice.status != \'paid\' THEN invoice.amountDue ELSE 0 END)', 'outstandingAmount')
      .where('client.id = :id AND client.userId = :userId', { id, userId })
      .groupBy('client.id')
      .getRawOne();

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return {
      client: {
        id: client.client_id,
        name: client.client_name,
        email: client.client_email,
        company: client.client_company,
      },
      stats: {
        totalInvoices: parseInt(client.totalInvoices) || 0,
        paidInvoices: parseInt(client.paidInvoices) || 0,
        totalRevenue: parseFloat(client.totalRevenue) || 0,
        outstandingAmount: parseFloat(client.outstandingAmount) || 0,
      },
    };
  }
}