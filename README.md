# Freelance Invoice SaaS

A complete, modern invoice management system designed for freelancers and small businesses. Built with a Next.js frontend and NestJS backend, featuring professional invoice creation, client management, payment tracking, and business analytics.

## 🚀 Features

### Complete Invoice Management System
- **Professional Invoices**: Create, customize, and send beautiful invoices with line items
- **Client Management**: Comprehensive client database with search and filtering
- **Payment Tracking**: Real-time invoice status updates (Draft, Sent, Paid, Overdue)
- **Business Analytics**: Revenue charts, payment insights, and performance metrics
- **Subscription Management**: Multi-tier pricing with usage tracking

### Modern User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Authentication System**: Secure JWT-based login and registration
- **Real-time Updates**: Live status updates and notifications
- **Professional UI**: Clean, modern interface built with Tailwind CSS
- **Form Validation**: Comprehensive form handling with error management

### Technical Excellence
- **Full-Stack TypeScript**: Type-safe development across frontend and backend
- **Modern Architecture**: Next.js frontend with NestJS backend
- **State Management**: Efficient client-side state with Zustand and React Query
- **Database Ready**: Structured for easy database integration
- **Payment Integration**: Stripe integration for subscription billing

## 🏗️ Project Structure

```
freelance-invoice-saas/
├── frontend/           # Next.js frontend application
│   ├── components/     # Reusable UI components
│   ├── pages/         # Next.js pages and routing
│   ├── lib/           # Utilities and configurations
│   ├── hooks/         # Custom React hooks
│   ├── store/         # State management
│   └── types/         # TypeScript definitions
├── backend/           # NestJS backend API
│   ├── src/           # Source code
│   ├── dist/          # Compiled output
│   └── test/          # Test files
└── README.md          # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with SSR
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **Recharts** - Data visualization
- **Lucide React** - Modern icons

### Backend
- **NestJS** - Scalable Node.js framework
- **TypeScript** - Type-safe backend development
- **Express** - Web application framework
- **JWT** - Authentication tokens
- **Stripe** - Payment processing
- **Nodemailer** - Email service

## 🚦 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelance-invoice-saas
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   Backend will be available at: http://localhost:3001

3. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at: http://localhost:3000

### Environment Variables

#### Backend (.env)
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=price_id_for_your_subscription
SUCCESS_URL=http://localhost:3000/success
CANCEL_URL=http://localhost:3000/cancel
JWT_SECRET=your_jwt_secret_key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Application Features

### Dashboard
- Revenue and client metrics overview
- Interactive charts showing business trends
- Recent activity feed
- Quick access to key functions

### Client Management
- Add, edit, and delete clients
- Store contact information and addresses
- Search and filter client database
- Track client payment history

### Invoice Management
- Create professional invoices with line items
- Automatic tax calculations and totals
- Multiple invoice statuses (Draft, Sent, Paid, Overdue)
- Send invoices via email
- Download invoices as PDF
- Search and filter invoices

### Settings & Subscription
- User profile management
- Password change functionality
- Invoice defaults and preferences
- Subscription plan management
- Billing history and usage tracking

## 🎨 Design System

The application uses a consistent design system built with Tailwind CSS:

- **Colors**: Primary blue theme with semantic colors for success, warning, and error states
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing scale for layouts
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Mobile-first responsive design

## 🔒 Security Features

- JWT-based authentication
- Protected routes and API endpoints
- Input validation and sanitization
- Error boundaries for graceful error handling
- Secure environment variable management

## 🧪 Development

### Code Organization
- **Component-based architecture**: Modular, reusable components
- **Type safety**: Full TypeScript implementation
- **State management**: Efficient state handling with Zustand and React Query
- **Form handling**: Robust form management with validation
- **Error handling**: Comprehensive error boundaries and user feedback

### Available Scripts

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

#### Backend
```bash
npm run start:dev  # Start development server
npm run build      # Build for production
npm run start:prod # Start production server
npm run test       # Run tests
```

## 📦 Production Deployment

The application is ready for production deployment:

1. **Frontend**: Can be deployed to Vercel, Netlify, or any static hosting
2. **Backend**: Can be deployed to Heroku, DigitalOcean, AWS, or any Node.js hosting
3. **Database**: Ready for PostgreSQL, MySQL, or MongoDB integration
4. **Payments**: Stripe integration for subscription billing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built for freelancers and small businesses who need professional invoice management without the complexity.**