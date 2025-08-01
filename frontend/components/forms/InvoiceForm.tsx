import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Client, Invoice, InvoiceItem } from '@/types';
import { formatCurrency, formatDateInput, generateInvoiceNumber } from '@/lib/utils';

const itemSchema = yup.object({
  description: yup.string().required('Description is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  rate: yup.number().positive('Rate must be positive').required('Rate is required'),
});

const schema = yup.object({
  clientId: yup.string().required('Client is required'),
  issueDate: yup.string().required('Issue date is required'),
  dueDate: yup.string().required('Due date is required'),
  items: yup.array().of(itemSchema).min(1, 'At least one item is required'),
  notes: yup.string(),
  tax: yup.number().min(0, 'Tax must be 0 or greater').required('Tax is required'),
});

interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  tax: number;
}

interface InvoiceFormProps {
  invoice?: Invoice;
  clients: Client[];
  onSubmit: (data: InvoiceFormData) => void;
  isLoading?: boolean;
}

export function InvoiceForm({ invoice, clients, onSubmit, isLoading = false }: InvoiceFormProps) {
  const [invoiceNumber] = useState(invoice?.invoiceNumber || generateInvoiceNumber());

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: yupResolver(schema),
    defaultValues: invoice ? {
      clientId: invoice.clientId,
      issueDate: formatDateInput(invoice.issueDate),
      dueDate: formatDateInput(invoice.dueDate),
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      notes: invoice.notes || '',
      tax: invoice.tax,
    } : {
      clientId: '',
      issueDate: formatDateInput(new Date()),
      dueDate: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      notes: '',
      tax: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedTax = watch('tax');

  const calculateSubtotal = () => {
    return watchedItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (watchedTax || 0);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...watchedItems];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = (items[index].quantity || 0) * (items[index].rate || 0);
    }
  };

  const addItem = () => {
    append({ description: '', quantity: 1, rate: 0, amount: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-6\">
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-1\">
            Invoice Number
          </label>
          <input
            type=\"text\"
            value={invoiceNumber}
            disabled
            className=\"input bg-gray-50\"
          />
        </div>
        
        <div>
          <label className=\"block text-sm font-medium text-gray-700 mb-1\">
            Client
          </label>
          <select
            {...register('clientId')}
            className=\"input\"
          >
            <option value=\"\">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.company && `(${client.company})`}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className=\"text-sm text-red-600 mt-1\">{errors.clientId.message}</p>
          )}
        </div>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
        <Input
          label=\"Issue Date\"
          type=\"date\"
          {...register('issueDate')}
          error={errors.issueDate?.message}
        />
        
        <Input
          label=\"Due Date\"
          type=\"date\"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />
      </div>

      <div className=\"space-y-4\">
        <div className=\"flex items-center justify-between\">
          <h3 className=\"text-lg font-medium text-gray-900\">Items</h3>
          <Button type=\"button\" variant=\"secondary\" size=\"sm\" onClick={addItem}>
            <Plus className=\"h-4 w-4 mr-1\" />
            Add Item
          </Button>
        </div>

        <div className=\"space-y-3\">
          {fields.map((field, index) => (
            <div key={field.id} className=\"grid grid-cols-12 gap-3 items-start p-4 border border-gray-200 rounded-lg\">
              <div className=\"col-span-5\">
                <Input
                  placeholder=\"Description\"
                  {...register(`items.${index}.description`)}
                  error={errors.items?.[index]?.description?.message}
                />
              </div>
              
              <div className=\"col-span-2\">
                <Input
                  type=\"number\"
                  placeholder=\"Qty\"
                  step=\"0.01\"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    onChange: (e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                  })}
                  error={errors.items?.[index]?.quantity?.message}
                />
              </div>
              
              <div className=\"col-span-2\">
                <Input
                  type=\"number\"
                  placeholder=\"Rate\"
                  step=\"0.01\"
                  {...register(`items.${index}.rate`, {
                    valueAsNumber: true,
                    onChange: (e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)
                  })}
                  error={errors.items?.[index]?.rate?.message}
                />
              </div>
              
              <div className=\"col-span-2\">
                <div className=\"input bg-gray-50 text-right\">
                  {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0))}
                </div>
              </div>
              
              <div className=\"col-span-1 flex justify-center\">
                <button
                  type=\"button\"
                  onClick={() => removeItem(index)}
                  disabled={fields.length === 1}
                  className=\"p-2 text-gray-400 hover:text-red-600 disabled:opacity-50\"
                >
                  <Trash2 className=\"h-4 w-4\" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className=\"border-t pt-4\">
        <div className=\"flex justify-end\">
          <div className=\"w-64 space-y-2\">
            <div className=\"flex justify-between text-sm\">
              <span className=\"text-gray-600\">Subtotal:</span>
              <span className=\"font-medium\">{formatCurrency(calculateSubtotal())}</span>
            </div>
            
            <div className=\"flex justify-between items-center\">
              <label className=\"text-sm text-gray-600\">Tax:</label>
              <Input
                type=\"number\"
                step=\"0.01\"
                className=\"w-20 text-right\"
                {...register('tax', { valueAsNumber: true })}
              />
            </div>
            
            <div className=\"flex justify-between text-lg font-semibold border-t pt-2\">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className=\"block text-sm font-medium text-gray-700 mb-1\">
          Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500\"
          placeholder=\"Additional notes or payment terms...\"
        />
      </div>

      <div className=\"flex justify-end space-x-3 pt-4\">
        <Button
          type=\"submit\"
          loading={isLoading}
        >
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}