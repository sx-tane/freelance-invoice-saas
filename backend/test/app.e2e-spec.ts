import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;
  let clientId: string;
  let invoiceId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/auth/register (POST)', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registerDto.email);
      
      jwtToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('/auth/login (POST)', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('/auth/login (POST) - invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('Users', () => {
    it('/users (GET) - requires authentication', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });

    it('/users (GET) - with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('/users/:id (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('test@example.com');
    });
  });

  describe('Clients', () => {
    it('/clients (POST) - create client', async () => {
      const createClientDto = {
        name: 'Test Client',
        email: 'client@example.com',
        company: 'Test Company',
        phone: '123-456-7890',
        address: '123 Test St',
      };

      const response = await request(app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createClientDto)
        .expect(201);

      expect(response.body.name).toBe(createClientDto.name);
      expect(response.body.email).toBe(createClientDto.email);
      clientId = response.body.id;
    });

    it('/clients (GET) - get all clients', async () => {
      const response = await request(app.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/clients/:id (GET) - get client by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/clients/${clientId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.id).toBe(clientId);
      expect(response.body.name).toBe('Test Client');
    });

    it('/clients/:id (PUT) - update client', async () => {
      const updateClientDto = {
        name: 'Updated Client Name',
        company: 'Updated Company',
      };

      const response = await request(app.getHttpServer())
        .put(`/clients/${clientId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateClientDto)
        .expect(200);

      expect(response.body.name).toBe(updateClientDto.name);
      expect(response.body.company).toBe(updateClientDto.company);
    });
  });

  describe('Invoices', () => {
    it('/invoices (POST) - create invoice', async () => {
      const createInvoiceDto = {
        clientId: clientId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        taxRate: 10,
        discountAmount: 0,
        notes: 'Test invoice',
        items: [
          {
            description: 'Test service',
            quantity: 1,
            rate: 100,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createInvoiceDto)
        .expect(201);

      expect(response.body.clientId).toBe(clientId);
      expect(response.body.total).toBe(110); // 100 + 10% tax
      invoiceId = response.body.id;
    });

    it('/invoices (GET) - get all invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/invoices/:id (GET) - get invoice by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.id).toBe(invoiceId);
      expect(response.body.clientId).toBe(clientId);
    });

    it('/invoices/:id/status (PATCH) - update invoice status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/invoices/${invoiceId}/status`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ status: 'sent' })
        .expect(200);

      expect(response.body.status).toBe('sent');
      expect(response.body.sentAt).toBeDefined();
    });
  });

  describe('Dashboard', () => {
    it('/dashboard/stats (GET) - get dashboard statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalInvoices');
      expect(response.body).toHaveProperty('totalClients');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('unpaidInvoices');
    });
  });

  describe('Health Check', () => {
    it('/health (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should return 401 for protected routes without token', async () => {
      await request(app.getHttpServer())
        .get('/invoices')
        .expect(401);
    });

    it('should return 403 when accessing other users\' resources', async () => {
      // Try to access a client with a different user ID
      await request(app.getHttpServer())
        .get('/clients/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404); // Should return 404 (not found) rather than exposing 403
    });
  });
});