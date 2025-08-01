import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);

    // Create default free subscription
    const subscription = this.subscriptionsRepository.create({
      userId: savedUser.id,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 0,
      invoiceLimit: 5,
      clientLimit: 5,
    });
    await this.subscriptionsRepository.save(subscription);

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['subscription'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['subscription'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        taxId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['subscription'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.usersRepository.save(user);
  }

  async getUserStats(userId: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.clients', 'client')
      .leftJoin('user.invoices', 'invoice')
      .leftJoin('user.subscription', 'subscription')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'subscription.plan',
        'subscription.invoicesSent',
        'subscription.invoiceLimit',
        'subscription.clientsCreated',
        'subscription.clientLimit',
      ])
      .addSelect('COUNT(DISTINCT client.id)', 'totalClients')
      .addSelect('COUNT(DISTINCT invoice.id)', 'totalInvoices')
      .addSelect('COUNT(DISTINCT CASE WHEN invoice.status = \'paid\' THEN invoice.id END)', 'paidInvoices')
      .addSelect('SUM(CASE WHEN invoice.status = \'paid\' THEN invoice.total ELSE 0 END)', 'totalRevenue')
      .addSelect('SUM(CASE WHEN invoice.status != \'paid\' THEN invoice.amountDue ELSE 0 END)', 'outstandingAmount')
      .where('user.id = :userId', { userId })
      .groupBy('user.id, subscription.id')
      .getRawOne();

    return {
      user: {
        id: user.user_id,
        firstName: user.user_firstName,
        lastName: user.user_lastName,
        email: user.user_email,
      },
      subscription: {
        plan: user.subscription_plan,
        invoicesSent: parseInt(user.subscription_invoicesSent) || 0,
        invoiceLimit: parseInt(user.subscription_invoiceLimit) || 0,
        clientsCreated: parseInt(user.subscription_clientsCreated) || 0,
        clientLimit: parseInt(user.subscription_clientLimit) || 0,
      },
      stats: {
        totalClients: parseInt(user.totalClients) || 0,
        totalInvoices: parseInt(user.totalInvoices) || 0,
        paidInvoices: parseInt(user.paidInvoices) || 0,
        totalRevenue: parseFloat(user.totalRevenue) || 0,
        outstandingAmount: parseFloat(user.outstandingAmount) || 0,
      },
    };
  }
}