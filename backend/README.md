# Freelance Invoice SaaS Backend

A complete backend for a freelance invoice management SaaS application built with NestJS, TypeORM, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: User registration, profiles, and admin functions  
- **Client Management**: CRUD operations for client data
- **Invoice Management**: Create, edit, send, and track invoices with line items
- **Payment Tracking**: Record and track payments against invoices
- **Subscription Management**: Handle different subscription tiers and limits
- **Dashboard Analytics**: Revenue charts, stats, and recent activity
- **Security**: Rate limiting, input validation, password hashing
- **Database**: PostgreSQL with TypeORM for robust data persistence

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, bcrypt, rate limiting
- **Documentation**: Auto-generated from decorators

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile  
- `GET /api/users/stats` - Get user statistics

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/:id/stats` - Get client statistics

### Invoices
- `GET /api/invoices` - List invoices with filters
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice details
- `PATCH /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/send` - Send invoice to client
- `POST /api/invoices/:id/mark-paid` - Mark invoice as paid
- `GET /api/invoices/stats` - Get invoice statistics
- `GET /api/invoices/overdue` - Get overdue invoices

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Record new payment
- `GET /api/payments/:id` - Get payment details
- `PATCH /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/stats` - Get payment statistics

### Dashboard
- `GET /api/dashboard` - Get complete dashboard data
- `GET /api/dashboard/overview` - Get overview metrics

### Subscriptions
- `GET /api/subscriptions` - Get user subscription
- `GET /api/subscriptions/limits` - Check subscription limits
- `POST /api/subscriptions/upgrade` - Upgrade subscription plan

## Database Schema

### Users
- Authentication and profile information
- Role-based permissions (admin, freelancer)
- Contact and business details

### Clients  
- Client contact information
- Business details and notes
- Relationship to user (multi-tenant)

### Invoices
- Invoice metadata (number, dates, status)
- Financial calculations (subtotal, tax, total)
- Relationship to user and client

### Invoice Items
- Line items for each invoice
- Description, quantity, rate, amount
- Sort order for display

### Payments
- Payment records against invoices
- Multiple payment methods supported
- Payment status tracking

### Subscriptions
- User subscription plans and limits
- Usage tracking and enforcement
- Stripe integration ready

## Installation

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up PostgreSQL database**:
```bash
# Create database
createdb freelance_invoice
```

4. **Run the application**:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=freelance_invoice

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Multiple tiers to prevent abuse
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: TypeORM parameterized queries
- **CORS Configuration**: Configurable cross-origin policies
- **Helmet**: Security headers middleware

## Business Logic

### Invoice Numbering
- Auto-generated unique invoice numbers
- Format: INV-YYYYMM-XXXX

### Tax Calculations
- Configurable tax rates per invoice
- Automatic calculation: (subtotal - discount) * tax rate

### Subscription Limits
- Free: 5 invoices, 5 clients
- Basic: 50 invoices, 25 clients  
- Pro: 200 invoices, 100 clients
- Enterprise: Unlimited

### Payment Processing
- Multiple payment methods supported
- Automatic invoice status updates
- Partial payment handling

## Development

### Code Structure
```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── clients/        # Client management  
├── invoices/       # Invoice management
├── payments/       # Payment tracking
├── subscriptions/  # Subscription management
├── dashboard/      # Analytics dashboard
└── config/         # Configuration
```

### Database Migrations
TypeORM handles schema synchronization in development. For production:

```bash
npm run typeorm:migration:generate
npm run typeorm:migration:run
```

### Testing
```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Deployment

### Docker
```bash
docker build -t freelance-invoice-backend .
docker run -p 3002:3002 freelance-invoice-backend
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set secure JWT secret
- Configure CORS for production domains

## API Documentation

The API is self-documenting through NestJS decorators. Key patterns:

- All routes require authentication except public invoice viewing
- UUID parameters for all resources
- Consistent error responses
- Pagination support where applicable
- Filter and search capabilities

## License

MIT