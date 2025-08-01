import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPlan } from './entities/subscription.entity';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  getSubscription(@Request() req) {
    return this.subscriptionsService.findByUserId(req.user.id);
  }

  @Get('limits')
  checkLimits(@Request() req) {
    return this.subscriptionsService.checkLimits(req.user.id);
  }

  @Post('upgrade')
  upgradePlan(@Body('plan') plan: SubscriptionPlan, @Request() req) {
    return this.subscriptionsService.updatePlan(req.user.id, plan);
  }

  @Post('cancel')
  cancelSubscription(@Request() req) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }

  @Post('reactivate')
  reactivateSubscription(@Request() req) {
    return this.subscriptionsService.reactivateSubscription(req.user.id);
  }

  @Patch()
  update(@Body() updateSubscriptionDto: UpdateSubscriptionDto, @Request() req) {
    return this.subscriptionsService.update(req.user.id, updateSubscriptionDto);
  }
}