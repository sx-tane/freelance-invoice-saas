import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  FileText, 
  Users, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  Zap,
  Plus
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { InvoiceStatusChart } from '@/components/charts/InvoiceStatusChart';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardStats, RecentActivity } from '@/types';
import { EmptyStateLoading } from '@/components/ui/Loading';
import { RevenueEmptyState, InvoiceEmptyState, ClientEmptyState } from '@/components/ui/EmptyState';
import { Celebration, useCelebration } from '@/components/ui/Celebration';
import { Welcome, useWelcome } from '@/components/ui/Welcome';
import { EasterEggProvider } from '@/components/ui/EasterEggs';
import { ActionButton, MagicButton } from '@/components/ui/Button';

// Mock data for demonstration
const mockStats: DashboardStats = {
  totalRevenue: 45678.90,
  unpaidInvoices: 12,
  totalClients: 28,
  overdueInvoices: 3,
};

const mockRevenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5100 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6200 },
  { month: 'May', revenue: 5900 },
  { month: 'Jun', revenue: 7100 },
];

const mockStatusData = [
  { name: 'paid', value: 15 },
  { name: 'sent', value: 8 },
  { name: 'draft', value: 5 },
  { name: 'overdue', value: 3 },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'invoice_paid',
    description: 'Invoice #INV-2024-001 marked as paid by John Doe',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'invoice_sent',
    description: 'Invoice #INV-2024-002 sent to Jane Smith',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    type: 'client_added',
    description: 'New client \"Acme Corp\" added',
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    type: 'invoice_created',
    description: 'Created invoice #INV-2024-003 for Tech Solutions',
    date: new Date(Date.now() - 259200000).toISOString(),
  },
];

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'positive' 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card>
      <div className=\"flex items-center justify-between\">
        <div>
          <p className=\"text-sm font-medium text-gray-600\">{title}</p>
          <p className=\"text-2xl font-bold text-gray-900\">{value}</p>
          {change && (
            <p className={`text-sm ${changeColor[changeType]} flex items-center mt-1`}>
              <TrendingUp className=\"h-3 w-3 mr-1\" />
              {change}
            </p>
          )}
        </div>
        <div className=\"p-3 bg-primary-50 rounded-full\">
          <Icon className=\"h-6 w-6 text-primary-600\" />
        </div>
      </div>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_paid':
        return <DollarSign className=\"h-4 w-4 text-green-600\" />;
      case 'invoice_sent':
        return <FileText className=\"h-4 w-4 text-blue-600\" />;
      case 'client_added':
        return <Users className=\"h-4 w-4 text-purple-600\" />;
      case 'invoice_created':
        return <FileText className=\"h-4 w-4 text-gray-600\" />;
      default:
        return <Calendar className=\"h-4 w-4 text-gray-600\" />;
    }
  };

  return (
    <div className=\"flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors\">
      <div className=\"flex-shrink-0\">
        {getActivityIcon(activity.type)}
      </div>
      <div className=\"flex-1 min-w-0\">
        <p className=\"text-sm text-gray-900\">{activity.description}</p>
        <p className=\"text-xs text-gray-500 mt-1\">{formatDate(activity.date)}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  useAuth();

  return (
    <Layout>
      <div className=\"space-y-6\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Dashboard</h1>
          <p className=\"text-gray-600\">Overview of your business metrics</p>
        </div>

        {/* Stats Grid */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
          <StatCard
            title=\"Total Revenue\"
            value={formatCurrency(mockStats.totalRevenue)}
            icon={DollarSign}
            change=\"+12.5% from last month\"
            changeType=\"positive\"
          />
          <StatCard
            title=\"Unpaid Invoices\"
            value={mockStats.unpaidInvoices}
            icon={FileText}
            change=\"-2 from last week\"
            changeType=\"positive\"
          />
          <StatCard
            title=\"Total Clients\"
            value={mockStats.totalClients}
            icon={Users}
            change=\"+3 this month\"
            changeType=\"positive\"
          />
          <StatCard
            title=\"Overdue Invoices\"
            value={mockStats.overdueInvoices}
            icon={AlertCircle}
            change=\"+1 this week\"
            changeType=\"negative\"
          />
        </div>

        {/* Charts Grid */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
          <Card>
            <div className=\"mb-4\">
              <h3 className=\"text-lg font-semibold text-gray-900\">Revenue Trend</h3>
              <p className=\"text-sm text-gray-600\">Monthly revenue over the last 6 months</p>
            </div>
            <RevenueChart data={mockRevenueData} />
          </Card>

          <Card>
            <div className=\"mb-4\">
              <h3 className=\"text-lg font-semibold text-gray-900\">Invoice Status</h3>
              <p className=\"text-sm text-gray-600\">Distribution of invoice statuses</p>
            </div>
            <InvoiceStatusChart data={mockStatusData} />
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className=\"mb-4\">
            <h3 className=\"text-lg font-semibold text-gray-900\">Recent Activity</h3>
            <p className=\"text-sm text-gray-600\">Latest updates from your account</p>
          </div>
          <div className=\"space-y-1\">
            {mockRecentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}