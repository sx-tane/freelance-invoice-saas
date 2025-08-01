import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Brain,
  Target,
  Clock,
  Zap,
} from 'lucide-react';

interface InsightData {
  revenueForecast: any[];
  churnPredictions: any[];
  seasonalTrends: any[];
  paymentInsights: {
    avgPaymentTime: number;
    riskInvoices: number;
    totalOutstanding: number;
  };
}

export default function AIInsightsDashboard() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'revenue' | 'churn' | 'seasonal' | 'payments'>('revenue');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setInsights({
        revenueForecast: [
          { period: 'Aug 2025', predictedRevenue: 15000, confidence: 0.85, trends: { growth: 12 } },
          { period: 'Sep 2025', predictedRevenue: 16800, confidence: 0.82, trends: { growth: 15 } },
          { period: 'Oct 2025', predictedRevenue: 18200, confidence: 0.78, trends: { growth: 8 } },
        ],
        churnPredictions: [
          {
            clientId: 1,
            clientName: 'Tech Corp',
            churnProbability: 0.75,
            riskLevel: 'high',
            lastActivity: '2 weeks ago',
            factors: ['Late payments', 'Reduced project frequency'],
            recommendations: ['Schedule check-in call', 'Offer payment plan']
          }
        ],
        seasonalTrends: [
          { month: 'Jan', averageRevenue: 12000, invoiceCount: 8, seasonalityFactor: 0.9 },
          { month: 'Feb', averageRevenue: 13500, invoiceCount: 9, seasonalityFactor: 1.0 },
          { month: 'Mar', averageRevenue: 15000, invoiceCount: 12, seasonalityFactor: 1.2 },
          { month: 'Apr', averageRevenue: 14200, invoiceCount: 10, seasonalityFactor: 1.1 },
        ],
        paymentInsights: {
          avgPaymentTime: 18,
          riskInvoices: 3,
          totalOutstanding: 12500,
        },
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load AI insights</p>
      </div>
    );
  }

  const tabs = [
    { id: 'revenue', label: 'Revenue Forecast', icon: TrendingUp },
    { id: 'churn', label: 'Client Risk', icon: AlertTriangle },
    { id: 'seasonal', label: 'Seasonal Trends', icon: Calendar },
    { id: 'payments', label: 'Payment Insights', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Business Insights</h2>
          <p className="text-gray-600">Intelligence-driven analytics for your freelance business</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Predicted Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${insights.revenueForecast[0]?.predictedRevenue.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500">Next 30 days</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">At-Risk Clients</p>
              <p className="text-2xl font-bold text-red-600">
                {insights.churnPredictions.length}
              </p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Payment Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {insights.paymentInsights.avgPaymentTime} days
              </p>
              <p className="text-xs text-gray-500">Industry avg: 24 days</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg border shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                ${insights.paymentInsights.totalOutstanding.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{insights.paymentInsights.riskInvoices} high risk</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        {selectedTab === 'revenue' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Revenue Forecast</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4" />
                AI Confidence: {Math.round((insights.revenueForecast[0]?.confidence || 0.8) * 100)}%
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.revenueForecast.slice(0, 3).map((forecast, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{forecast.period}</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${forecast.predictedRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    Growth: {forecast.trends.growth > 0 ? '+' : ''}{forecast.trends.growth}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'churn' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Client Churn Risk Analysis</h3>
            <div className="space-y-4">
              {insights.churnPredictions.map((client, index) => (
                <motion.div
                  key={client.clientId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    client.riskLevel === 'high'
                      ? 'border-red-500 bg-red-50'
                      : client.riskLevel === 'medium'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{client.clientName}</h4>
                      <p className="text-sm text-gray-600">
                        Churn Risk: {Math.round(client.churnProbability * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Last Activity: {client.lastActivity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        client.riskLevel === 'high'
                          ? 'bg-red-100 text-red-800'
                          : client.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {client.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Risk Factors:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {client.factors.map((factor: string, i: number) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {client.recommendations.map((rec: string, i: number) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'seasonal' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Seasonal Business Trends</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {insights.seasonalTrends.slice(0, 4).map((trend, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{trend.month}</p>
                  <p className="text-lg font-bold text-green-600">
                    ${trend.averageRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {trend.invoiceCount} invoices
                  </p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trend.seasonalityFactor > 1.1
                        ? 'bg-green-100 text-green-800'
                        : trend.seasonalityFactor < 0.9
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {trend.seasonalityFactor > 1.1 ? 'Peak' : trend.seasonalityFactor < 0.9 ? 'Low' : 'Average'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'payments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Payment Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Payment Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Payment Time</span>
                    <span className="font-medium">{insights.paymentInsights.avgPaymentTime} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Industry Benchmark</span>
                    <span className="text-sm text-gray-500">24 days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (24 / insights.paymentInsights.avgPaymentTime) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600">
                    {insights.paymentInsights.avgPaymentTime < 24 ? '25% faster than industry average' : 'Room for improvement'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Risk Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High Risk Invoices</span>
                    <span className="font-medium text-red-600">{insights.paymentInsights.riskInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Outstanding</span>
                    <span className="font-medium">${insights.paymentInsights.totalOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🤖 AI recommends following up on 2 invoices within the next 3 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}