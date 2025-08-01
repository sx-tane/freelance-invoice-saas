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
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  useAuth(false);
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const success = await registerUser(data.name, data.email, data.password);
      if (success) {
        toast.success('Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Failed to create account. Please try again.');
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
            Create your account
          </h2>
          <p className=\"mt-2 text-center text-sm text-gray-600\">
            Or{' '}
            <Link href=\"/auth/login\" className=\"font-medium text-primary-600 hover:text-primary-500\">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className=\"mt-8 space-y-6\" onSubmit={handleSubmit(onSubmit)}>
          <div className=\"space-y-4\">
            <Input
              label=\"Full name\"
              {...register('name')}
              error={errors.name?.message}
              placeholder=\"Enter your full name\"
            />
            
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
              autoComplete=\"new-password\"
              {...register('password')}
              error={errors.password?.message}
              placeholder=\"Create a password\"
            />
            
            <Input
              label=\"Confirm password\"
              type=\"password\"
              autoComplete=\"new-password\"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder=\"Confirm your password\"
            />
          </div>

          <div>
            <Button
              type=\"submit\"
              loading={isLoading}
              className=\"w-full\"
              size=\"lg\"
            >
              Create account
            </Button>
          </div>
          
          <div className=\"text-center\">
            <p className=\"text-xs text-gray-500\">
              By creating an account, you agree to our{' '}
              <Link href=\"#\" className=\"font-medium text-primary-600 hover:text-primary-500\">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href=\"#\" className=\"font-medium text-primary-600 hover:text-primary-500\">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}