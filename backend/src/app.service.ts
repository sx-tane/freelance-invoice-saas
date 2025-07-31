import { Injectable } from '@nestjs/common';

/**
 * Simple service used by the AppController.  It can be expanded to
 * provide application‑wide utilities if needed.
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from the Freelance Invoice SaaS backend!';
  }
}