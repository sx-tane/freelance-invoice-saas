import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Request() req) {
    return this.dashboardService.getDashboardData(req.user.id);
  }

  @Get('overview')
  getOverview(@Request() req) {
    return this.dashboardService.getOverview(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.dashboardService.getStats(req.user.id);
  }

  @Get('revenue')
  getRevenue(@Request() req) {
    return this.dashboardService.getRevenue(req.user.id);
  }

  @Get('invoice-status')
  getInvoiceStatus(@Request() req) {
    return this.dashboardService.getInvoiceStatus(req.user.id);
  }

  @Get('recent-activity')
  getRecentActivity(@Request() req) {
    return this.dashboardService.getRecentActivity(req.user.id);
  }
}