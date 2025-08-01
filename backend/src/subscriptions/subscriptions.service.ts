import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './entities/subscription.entity';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async findByUserId(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    return subscription;
  }

  async updatePlan(userId: string, plan: SubscriptionPlan): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);

    // Set limits based on plan
    const planLimits = this.getPlanLimits(plan);
    const monthlyPrice = this.getPlanPrice(plan);

    Object.assign(subscription, {
      plan,
      monthlyPrice,
      ...planLimits,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async update(userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionsRepository.save(subscription);
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionsRepository.save(subscription);
  }

  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    
    subscription.status = SubscriptionStatus.ACTIVE;
    return this.subscriptionsRepository.save(subscription);
  }

  async checkLimits(userId: string) {
    const subscription = await this.findByUserId(userId);
    
    return {
      canCreateClients: subscription.clientsCreated < subscription.clientLimit,
      canCreateInvoices: subscription.invoicesSent < subscription.invoiceLimit,
      remainingClients: Math.max(0, subscription.clientLimit - subscription.clientsCreated),
      remainingInvoices: Math.max(0, subscription.invoiceLimit - subscription.invoicesSent),
      plan: subscription.plan,
      status: subscription.status,
    };
  }

  private getPlanLimits(plan: SubscriptionPlan) {
    switch (plan) {
      case SubscriptionPlan.FREE:
        return { invoiceLimit: 5, clientLimit: 5 };
      case SubscriptionPlan.BASIC:
        return { invoiceLimit: 50, clientLimit: 25 };
      case SubscriptionPlan.PRO:
        return { invoiceLimit: 200, clientLimit: 100 };
      case SubscriptionPlan.ENTERPRISE:
        return { invoiceLimit: 999999, clientLimit: 999999 };
      default:
        return { invoiceLimit: 5, clientLimit: 5 };
    }
  }

  private getPlanPrice(plan: SubscriptionPlan): number {
    switch (plan) {
      case SubscriptionPlan.FREE:
        return 0;
      case SubscriptionPlan.BASIC:
        return 9.99;
      case SubscriptionPlan.PRO:
        return 29.99;
      case SubscriptionPlan.ENTERPRISE:
        return 99.99;
      default:
        return 0;
    }
  }
}