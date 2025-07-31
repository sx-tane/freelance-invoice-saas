import { Injectable, NotFoundException } from '@nestjs/common';
import { Client } from './client.entity';

/**
 * ClientsService provides an in‑memory store for clients.  Each client
 * receives a numeric ID on creation.  Note that this implementation
 * does not persist data between application restarts.
 */
@Injectable()
export class ClientsService {
  private clients: Client[] = [];
  private nextId = 1;

  findAll(): Client[] {
    return this.clients;
  }

  findOne(id: number): Client {
    const client = this.clients.find((c) => c.id === id);
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
    return client;
  }

  create(data: Omit<Client, 'id'>): Client {
    const client: Client = { id: this.nextId++, ...data };
    this.clients.push(client);
    return client;
  }

  update(id: number, updates: Partial<Omit<Client, 'id'>>): Client {
    const client = this.findOne(id);
    Object.assign(client, updates);
    return client;
  }

  remove(id: number): boolean {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
    this.clients.splice(index, 1);
    return true;
  }
}