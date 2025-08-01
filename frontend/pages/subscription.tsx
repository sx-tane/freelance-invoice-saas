import React, { useState } from 'react';
import { Check, CreditCard, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    interval: 'month',
    description: 'Perfect for freelancers just getting started',
    features: [
      'Up to 5 clients',
      'Up to 10 invoices per month',
      'Basic invoice templates',
      'Email support',
      'Mobile app access',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29,
    interval: 'month',
    description: 'Ideal for growing businesses',
    features: [
      'Unlimited clients',
      'Unlimited invoices',
      'Custom invoice templates',
      'Recurring invoices',
      'Time tracking',
      'Expense tracking',
      'Advanced reporting',
      'Priority support',
      'Team collaboration',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    description: 'For large teams and agencies',
    features: [
      'Everything in Professional',
      'White-label invoices',
      'API access',
      'Custom integrations',
      'Advanced analytics',
      'Multi-currency support',
      'Dedicated account manager',
      'Custom onboarding',
      'SLA guarantee',
    ],
    popular: false,
  },
];

const currentPlan = {
  id: 'professional',
  name: 'Professional',
  nextBillingDate: '2024-02-15',
  amount: 29,
};

const usageStats = {
  clients: { used: 8, limit: 'unlimited' },
  invoices: { used: 24, limit: 'unlimited' },
  storage: { used: 2.3, limit: 10, unit: 'GB' },
};

export default function SubscriptionPage() {
  useAuth();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan.id);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanChange = async (planId: string) => {
    if (planId === currentPlan.id) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Plan updated successfully!');
      setSelectedPlan(planId);
    } catch (error) {
      toast.error('Failed to update plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Subscription cancelled. You will retain access until your next billing date.');
    } catch (error) {
      toast.error('Failed to cancel subscription. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className=\"space-y-8\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Subscription</h1>
          <p className=\"text-gray-600\">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <Card>
          <div className=\"mb-6\">
            <h2 className=\"text-lg font-semibold text-gray-900\">Current Plan</h2>
          </div>
          
          <div className=\"flex items-center justify-between p-4 bg-primary-50 rounded-lg\">
            <div>
              <h3 className=\"text-lg font-semibold text-gray-900\">{currentPlan.name}</h3>
              <p className=\"text-sm text-gray-600\">
                Next billing date: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
            <div className=\"text-right\">
              <p className=\"text-2xl font-bold text-gray-900\">${currentPlan.amount}</p>
              <p className=\"text-sm text-gray-600\">per month</p>
            </div>
          </div>
        </Card>

        {/* Usage Stats */}
        <Card>
          <div className=\"mb-6\">
            <h2 className=\"text-lg font-semibold text-gray-900\">Usage</h2>
            <p className=\"text-sm text-gray-600\">Your current usage for this billing period</p>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
            <div>
              <div className=\"flex items-center justify-between mb-2\">
                <span className=\"text-sm font-medium text-gray-700\">Clients</span>
                <span className=\"text-sm text-gray-500\">
                  {usageStats.clients.used} / {usageStats.clients.limit}
                </span>
              </div>
              <div className=\"w-full bg-gray-200 rounded-full h-2\">
                <div 
                  className=\"bg-primary-600 h-2 rounded-full\" 
                  style={{ width: usageStats.clients.limit === 'unlimited' ? '20%' : '80%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className=\"flex items-center justify-between mb-2\">
                <span className=\"text-sm font-medium text-gray-700\">Invoices</span>
                <span className=\"text-sm text-gray-500\">
                  {usageStats.invoices.used} / {usageStats.invoices.limit}
                </span>
              </div>
              <div className=\"w-full bg-gray-200 rounded-full h-2\">
                <div 
                  className=\"bg-primary-600 h-2 rounded-full\" 
                  style={{ width: usageStats.invoices.limit === 'unlimited' ? '15%' : '70%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className=\"flex items-center justify-between mb-2\">
                <span className=\"text-sm font-medium text-gray-700\">Storage</span>
                <span className=\"text-sm text-gray-500\">
                  {usageStats.storage.used} / {usageStats.storage.limit} {usageStats.storage.unit}
                </span>
              </div>
              <div className=\"w-full bg-gray-200 rounded-full h-2\">
                <div 
                  className=\"bg-primary-600 h-2 rounded-full\" 
                  style={{ width: `${(usageStats.storage.used / usageStats.storage.limit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className=\"text-lg font-semibold text-gray-900 mb-6\">Available Plans</h2>
          
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
                padding={false}
              >
                {plan.popular && (
                  <div className=\"absolute -top-3 left-1/2 transform -translate-x-1/2\">
                    <span className=\"inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white\">
                      <Star className=\"h-3 w-3 mr-1\" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className=\"p-6\">
                  <div className=\"text-center mb-6\">
                    <h3 className=\"text-xl font-semibold text-gray-900\">{plan.name}</h3>
                    <p className=\"text-sm text-gray-600 mt-1\">{plan.description}</p>
                    <div className=\"mt-4\">
                      <span className=\"text-4xl font-bold text-gray-900\">${plan.price}</span>
                      <span className=\"text-sm text-gray-600\">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className=\"space-y-3 mb-6\">
                    {plan.features.map((feature, index) => (
                      <li key={index} className=\"flex items-start\">
                        <Check className=\"h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0\" />
                        <span className=\"text-sm text-gray-700\">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(plan.id)}
                    variant={plan.id === currentPlan.id ? 'secondary' : 'primary'}
                    className=\"w-full\"
                    loading={isLoading && selectedPlan === plan.id}
                    disabled={plan.id === currentPlan.id}
                  >
                    {plan.id === currentPlan.id ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <Card>
          <div className=\"mb-6\">
            <h2 className=\"text-lg font-semibold text-gray-900\">Billing Information</h2>
          </div>

          <div className=\"flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4\">
            <div className=\"flex items-center\">
              <CreditCard className=\"h-8 w-8 text-gray-400 mr-3\" />
              <div>
                <p className=\"font-medium text-gray-900\">•••• •••• •••• 4242</p>
                <p className=\"text-sm text-gray-600\">Expires 12/25</p>
              </div>
            </div>
            <Button variant=\"secondary\" size=\"sm\">
              Update
            </Button>
          </div>

          <div className=\"text-sm text-gray-600 mb-4\">
            <p>Your next payment of <strong>${currentPlan.amount}</strong> will be charged on <strong>{new Date(currentPlan.nextBillingDate).toLocaleDateString()}</strong></p>
          </div>

          <div className=\"border-t pt-4\">
            <Button
              variant=\"danger\"
              onClick={handleCancelSubscription}
              loading={isLoading}
            >
              Cancel Subscription
            </Button>
          </div>
        </Card>

        {/* Billing History */}
        <Card>
          <div className=\"mb-6\">
            <h2 className=\"text-lg font-semibold text-gray-900\">Billing History</h2>
          </div>

          <div className=\"overflow-x-auto\">
            <table className=\"table\">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jan 15, 2024</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$29.00</td>
                  <td>
                    <span className=\"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800\">
                      Paid
                    </span>
                  </td>
                  <td>
                    <Button variant=\"ghost\" size=\"sm\">
                      Download
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Dec 15, 2023</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$29.00</td>
                  <td>
                    <span className=\"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800\">
                      Paid
                    </span>
                  </td>
                  <td>
                    <Button variant=\"ghost\" size=\"sm\">
                      Download
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Nov 15, 2023</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$29.00</td>
                  <td>
                    <span className=\"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800\">
                      Paid
                    </span>
                  </td>
                  <td>
                    <Button variant=\"ghost\" size=\"sm\">
                      Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}