import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  company: yup.string(),
  phone: yup.string(),
  address: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface ProfileFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  useAuth();
  const { user, updateUser } = useAuthStore();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      resetPasswordForm();
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                {...registerProfile('name')}
                error={profileErrors.name?.message}
                placeholder="Your full name"
              />

              <Input
                label="Email Address"
                type="email"
                {...registerProfile('email')}
                error={profileErrors.email?.message}
                placeholder="your@email.com"
              />

              <Input
                label="Company (Optional)"
                {...registerProfile('company')}
                error={profileErrors.company?.message}
                placeholder="Your company name"
              />

              <Input
                label="Phone (Optional)"
                {...registerProfile('phone')}
                error={profileErrors.phone?.message}
                placeholder="Your phone number"
              />

              <Input
                label="Address (Optional)"
                {...registerProfile('address')}
                error={profileErrors.address?.message}
                placeholder="Your business address"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={isProfileLoading}
                  className="w-full"
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Settings */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
            </div>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                {...registerPassword('currentPassword')}
                error={passwordErrors.currentPassword?.message}
                placeholder="Enter current password"
              />

              <Input
                label="New Password"
                type="password"
                {...registerPassword('newPassword')}
                error={passwordErrors.newPassword?.message}
                placeholder="Enter new password"
              />

              <Input
                label="Confirm New Password"
                type="password"
                {...registerPassword('confirmPassword')}
                error={passwordErrors.confirmPassword?.message}
                placeholder="Confirm new password"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={isPasswordLoading}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Invoice Settings */}
        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Settings</h2>
            <p className="text-sm text-gray-600">Configure your invoice defaults</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Payment Terms
              </label>
              <select className="input">
                <option value="net-15">Net 15</option>
                <option value="net-30" selected>Net 30</option>
                <option value="net-45">Net 45</option>
                <option value="net-60">Net 60</option>
                <option value="due-on-receipt">Due on Receipt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Tax Rate (%)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select className="input">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number Format
              </label>
              <select className="input">
                <option value="INV-YYYY-000">INV-YYYY-000</option>
                <option value="YYYY-000">YYYY-000</option>
                <option value="000">000</option>
              </select>
            </div>
          </div>

          <div className="pt-6">
            <Button variant="secondary">
              Save Invoice Settings
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600">Choose what notifications you'd like to receive</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Invoice Reminders</h3>
                <p className="text-sm text-gray-500">Get notified about overdue invoices</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Payment Notifications</h3>
                <p className="text-sm text-gray-500">Get notified when invoices are paid</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                <p className="text-sm text-gray-500">Receive weekly business summaries</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button variant="secondary">
              Save Notification Settings
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}