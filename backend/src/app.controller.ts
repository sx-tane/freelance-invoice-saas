import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Top‑level controller with a single health‑check endpoint.  This is
 * provided mainly for convenience while developing; it can be expanded
 * or removed in a production system.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}