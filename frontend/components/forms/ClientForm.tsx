import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Client } from '@/types';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  company: yup.string(),
  phone: yup.string(),
  address: yup.string(),
});

interface ClientFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
}

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
}

export function ClientForm({ client, onSubmit, isLoading = false }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: yupResolver(schema),
    defaultValues: client ? {
      name: client.name,
      email: client.email,
      company: client.company || '',
      phone: client.phone || '',
      address: client.address || '',
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Client name"
        />
        
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="client@example.com"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company"
          {...register('company')}
          error={errors.company?.message}
          placeholder="Company name (optional)"
        />
        
        <Input
          label="Phone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="Phone number (optional)"
        />
      </div>
      
      <Input
        label="Address"
        {...register('address')}
        error={errors.address?.message}
        placeholder="Full address (optional)"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="submit"
          loading={isLoading}
        >
          {client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}