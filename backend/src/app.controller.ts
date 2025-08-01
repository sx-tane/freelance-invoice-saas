import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Top-level controller with health-check and system info endpoints.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('version')
  getVersion() {
    return this.appService.getVersion();
  }
}