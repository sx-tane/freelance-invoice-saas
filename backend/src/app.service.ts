import { Injectable } from '@nestjs/common';

/**
 * Simple service used by the AppController.  It can be expanded to
 * provide application-wide utilities if needed.
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from the Freelance Invoice SaaS backend!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'freelance-invoice-saas',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'freelance-invoice-backend',
      description: 'Backend for Freelance Invoice SaaS',
    };
  }
}