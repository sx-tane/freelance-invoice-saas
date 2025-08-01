import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Send, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button, ActionButton, MagicButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { useAuth } from '@/hooks/useAuth';
import { debounce, formatCurrency, formatDate, getInvoiceStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import { Invoice, Client } from '@/types';
import { InvoiceEmptyState, SearchEmptyState } from '@/components/ui/EmptyState';
import { Celebration, useCelebration } from '@/components/ui/Celebration';
import { EasterEggProvider } from '@/components/ui/EasterEggs';


interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes?: string;
  tax: number;
}

export default function InvoicesPage() {
  useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  // Fetch invoices with search and filter functionality
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', searchTerm, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/invoices', { params });
      return response.data;
    },
  });

  // Fetch clients for invoice creation
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get('/clients');
      return response.data;
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const response = await api.post('/invoices', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to create invoice');
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InvoiceFormData }) => {
      const response = await api.put(`/invoices/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
      setEditingInvoice(null);
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to update invoice');
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    },
  });

  const handleSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      deleteInvoiceMutation.mutate(invoice.id);
    }
  };

  const sendInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/invoices/${id}/send`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      const invoice = invoices?.find(inv => inv.id === variables);
      toast.success(`Invoice ${invoice?.invoiceNumber} sent successfully!`);
    },
    onError: () => {
      toast.error('Failed to send invoice');
    },
  });

  const handleSendInvoice = async (invoice: Invoice) => {
    sendInvoiceMutation.mutate(invoice.id);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Invoice ${invoice.invoiceNumber} downloaded!`);
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handleSubmit = (data: InvoiceFormData) => {
    if (editingInvoice) {
      updateInvoiceMutation.mutate({ id: editingInvoice.id, data });
    } else {
      createInvoiceMutation.mutate(data);
    }
  };

  if (invoicesLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Create and manage your invoices</p>
          </div>
          <Button onClick={handleCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <Card>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search invoices..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices && invoices.length > 0 && invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium">{invoice.invoiceNumber}</td>
                    <td>
                      <div>
                        <div className="font-medium">{invoice.client?.name}</div>
                        {invoice.client?.company && (
                          <div className="text-sm text-gray-500">{invoice.client.company}</div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(invoice.issueDate)}</td>
                    <td>{formatDate(invoice.dueDate)}</td>
                    <td className="font-medium">{formatCurrency(invoice.total)}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendInvoice(invoice)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Send"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!invoices || invoices.length === 0) && (
            <div className="py-8">
              {searchTerm || statusFilter !== 'all' ? (
                <SearchEmptyState
                  searchTerm={searchTerm || `${statusFilter} invoices`}
                  onClearSearch={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                />
              ) : (
                <InvoiceEmptyState
                  action={{
                    label: "Create Your First Invoice",
                    onClick: handleCreateInvoice,
                    icon: <Plus className="h-4 w-4" />
                  }}
                />
              )}
            </div>
          )}
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingInvoice(null);
          }}
          title={editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          size="xl"
        >
          <InvoiceForm
            invoice={editingInvoice || undefined}
            clients={clients}
            onSubmit={handleSubmit}
            isLoading={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
          />
        </Modal>
      </div>
    </Layout>
  );
}