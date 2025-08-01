import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { useAuth } from '@/hooks/useAuth';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  useAuth(false);
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8\">
        <div>
          <h2 className=\"mt-6 text-center text-3xl font-extrabold text-gray-900\">
            Sign in to your account
          </h2>
          <p className=\"mt-2 text-center text-sm text-gray-600\">
            Or{' '}
            <Link href=\"/auth/register\" className=\"font-medium text-primary-600 hover:text-primary-500\">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className=\"mt-8 space-y-6\" onSubmit={handleSubmit(onSubmit)}>
          <div className=\"space-y-4\">
            <Input
              label=\"Email address\"
              type=\"email\"
              autoComplete=\"email\"
              {...register('email')}
              error={errors.email?.message}
              placeholder=\"Enter your email\"
            />
            
            <Input
              label=\"Password\"
              type=\"password\"
              autoComplete=\"current-password\"
              {...register('password')}
              error={errors.password?.message}
              placeholder=\"Enter your password\"
            />
          </div>

          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center\">
              <input
                id=\"remember-me\"
                name=\"remember-me\"
                type=\"checkbox\"
                className=\"h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded\"
              />
              <label htmlFor=\"remember-me\" className=\"ml-2 block text-sm text-gray-900\">
                Remember me
              </label>
            </div>

            <div className=\"text-sm\">
              <Link href=\"#\" className=\"font-medium text-primary-600 hover:text-primary-500\">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type=\"submit\"
              loading={isLoading}
              className=\"w-full\"
              size=\"lg\"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}