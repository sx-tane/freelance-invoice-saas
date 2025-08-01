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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColor[changeType]} flex items-center mt-1`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-full">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_paid':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'invoice_sent':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'client_added':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'invoice_created':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: async () => {
      const response = await api.get('/dashboard/revenue');
      return response.data;
    },
  });

  // Fetch invoice status data
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['dashboard-invoice-status'],
    queryFn: async () => {
      const response = await api.get('/dashboard/invoice-status');
      return response.data;
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const response = await api.get('/dashboard/recent-activity');
      return response.data;
    },
  });

  if (statsLoading || revenueLoading || statusLoading || activityLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your business metrics</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              change="+12.5% from last month"
              changeType="positive"
            />
            <StatCard
              title="Unpaid Invoices"
              value={stats.unpaidInvoices}
              icon={FileText}
              change="-2 from last week"
              changeType="positive"
            />
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon={Users}
              change="+3 this month"
              changeType="positive"
            />
            <StatCard
              title="Overdue Invoices"
              value={stats.overdueInvoices}
              icon={AlertCircle}
              change="+1 this week"
              changeType="negative"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-600">Monthly revenue over the last 6 months</p>
            </div>
            {revenueData ? (
              <RevenueChart data={revenueData} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
              <p className="text-sm text-gray-600">Distribution of invoice statuses</p>
            </div>
            {statusData ? (
              <InvoiceStatusChart data={statusData} />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest updates from your account</p>
          </div>
          <div className="space-y-1">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity: RecentActivity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}