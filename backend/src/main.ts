import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Entry point for the NestJS application.  It simply bootstraps the
 * AppModule and starts listening on port 3000.  In a real deployment
 * this port could be configured via environment variables.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();