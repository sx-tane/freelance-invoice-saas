import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

// Global test setup
beforeAll(async () => {
  // Setup test database configuration
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USERNAME = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_NAME = 'freelance_invoice_test';
  process.env.JWT_SECRET = 'test-jwt-secret';
});

afterAll(async () => {
  // Cleanup after all tests
});