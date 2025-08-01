import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  async globalSearch(userId: string, query: string, filters?: any) {
    const results = {
      clients: [],
      invoices: [],
    };

    if (!query || query.trim().length === 0) {
      return results;
    }

    const searchTerm = `%${query.trim()}%`;

    // Search clients
    const clients = await this.clientsRepository.find({
      where: [
        { userId, name: Like(searchTerm) },
        { userId, email: Like(searchTerm) },
        { userId, company: Like(searchTerm) },
      ],
      take: 10,
    });

    // Search invoices
    const invoices = await this.invoicesRepository.find({
      where: [
        { userId, invoiceNumber: Like(searchTerm) },
        { userId, notes: Like(searchTerm) },
      ],
      relations: ['client'],
      take: 10,
    });

    results.clients = clients.map(client => ({
      id: client.id,
      type: 'client',
      title: client.name,
      subtitle: client.email,
      data: client,
    }));

    results.invoices = invoices.map(invoice => ({
      id: invoice.id,
      type: 'invoice',
      title: invoice.invoiceNumber,
      subtitle: `${invoice.client?.name || 'Unknown Client'} - $${invoice.total}`,
      data: invoice,
    }));

    return results;
  }
}