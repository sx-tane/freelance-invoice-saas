# Freelance Invoice SaaS Frontend

A modern, full-featured invoice management system built with Next.js, React, and Tailwind CSS.

## Features

### 🔐 Authentication
- **Login/Registration**: Secure authentication system with JWT tokens
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Management**: Profile updates and password changes

### 📊 Dashboard
- **Business Metrics**: Overview of revenue, unpaid invoices, clients, and overdue invoices
- **Interactive Charts**: Revenue trends and invoice status distribution using Recharts
- **Recent Activity**: Real-time feed of business activities
- **Responsive Design**: Optimized for all device sizes

### 👥 Client Management
- **Client Directory**: Comprehensive client database with search and filtering
- **CRUD Operations**: Add, edit, and delete clients with validation
- **Contact Information**: Store company details, contact info, and addresses
- **Client Cards**: Beautiful card-based layout with quick actions

### 📄 Invoice Management
- **Professional Invoices**: Create detailed invoices with line items
- **Multiple Templates**: Choose from various professional templates
- **Status Tracking**: Track draft, sent, paid, and overdue invoices
- **Line Item Management**: Dynamic item addition/removal with automatic calculations
- **Tax Calculations**: Built-in tax calculation and totaling
- **Search & Filter**: Advanced filtering by status, client, and date ranges
- **Actions**: Send, download, edit, and delete invoices

### ⚙️ Settings
- **Profile Management**: Update personal and business information
- **Password Security**: Change passwords with validation
- **Invoice Defaults**: Configure default tax rates, payment terms, and formats
- **Notification Preferences**: Customize email and system notifications

### 💳 Subscription Management
- **Plan Comparison**: Clear pricing tiers with feature comparisons
- **Usage Tracking**: Monitor current usage against plan limits
- **Billing History**: View past payments and download invoices
- **Plan Upgrades**: Easy plan switching with prorated billing

## Tech Stack

### Core Framework
- **Next.js 15**: React framework with SSR and routing
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe development

### State Management
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **React Hook Form**: Form management with validation

### UI/UX
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Hot Toast**: Elegant toast notifications
- **Recharts**: Responsive charts and analytics

### Data & Validation
- **Yup**: Schema validation
- **Axios**: HTTP client with interceptors
- **Date-fns**: Date manipulation utilities

## Project Structure

```
frontend/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Modal, etc.)
│   ├── layout/          # Layout components (Sidebar, Header, Layout)
│   ├── forms/           # Form components (ClientForm, InvoiceForm)
│   └── charts/          # Chart components (RevenueChart, StatusChart)
├── pages/               # Next.js pages and routing
│   ├── auth/           # Authentication pages
│   ├── invoices/       # Invoice management pages
│   └── [other pages]   # Dashboard, clients, settings, etc.
├── lib/                # Utility functions and configurations
├── hooks/              # Custom React hooks
├── store/              # Zustand state stores
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

## Key Components

### Authentication Flow
- JWT token management with secure storage
- Automatic token refresh and validation
- Protected route HOC for secure pages

### Form Management
- React Hook Form integration with Yup validation
- Reusable form components with error handling
- Dynamic form fields (invoice line items)

### Data Fetching
- React Query for efficient server state management
- Optimistic updates for better UX
- Error handling and retry logic

### UI Components
- Consistent design system with Tailwind
- Responsive layouts for mobile and desktop
- Loading states and skeleton screens
- Toast notifications for user feedback

## Development Features

### Type Safety
- Comprehensive TypeScript types for all data structures
- Strong typing for API responses and form data
- Type-safe routing and component props

### Code Organization
- Modular component architecture
- Separation of concerns (UI, logic, data)
- Reusable utilities and hooks
- Consistent naming conventions

### Performance
- Optimized bundle size with tree shaking
- Lazy loading for routes and components
- Efficient re-renders with React Query
- Image optimization with Next.js

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Update with your API URL and other configs
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow TypeScript best practices
2. Use Tailwind for styling
3. Implement proper error handling
4. Add loading states for async operations
5. Write responsive, accessible components

## License

This project is licensed under the MIT License.