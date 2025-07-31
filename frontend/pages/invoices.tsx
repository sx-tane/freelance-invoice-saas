import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface Client {
  id: number;
  name: string;
}

interface Invoice {
  id: number;
  clientId: number;
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

/**
 * InvoicesPage fetches invoices and clients from the backend and
 * displays them.  It also provides a form to create new invoices.
 */
export default function InvoicesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState<{
    clientId: string;
    amount: string;
    dueDate: string;
    description: string;
  }>({ clientId: '', amount: '', dueDate: '', description: '' });

  // Fetch invoices and clients on mount
  useEffect(() => {
    fetch('http://localhost:3000/clients')
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error(err));
    fetch('http://localhost:3000/invoices')
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Convert amount and clientId to numbers
    const payload = {
      clientId: Number(form.clientId),
      amount: Number(form.amount),
      dueDate: form.dueDate,
      description: form.description || undefined,
    };
    fetch('http://localhost:3000/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((newInvoice: Invoice) => {
        setInvoices((prev) => [...prev, newInvoice]);
        setForm({ clientId: '', amount: '', dueDate: '', description: '' });
      })
      .catch((err) => console.error(err));
  };

  // Change the status of an invoice and update local state.  Exposed
  // outside the render loop to avoid redefining on every row.
  const handleStatusChange = async (
    id: number,
    status: InvoiceStatus,
  ) => {
    try {
      const res = await fetch(
        `http://localhost:3000/invoices/${id}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updated.id ? updated : inv)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Invoices</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h2>Add Invoice</h2>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Client:{' '}
            <select
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select client
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Amount:{' '}
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Due Date:{' '}
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Description:{' '}
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit">Create Invoice</button>
      </form>
      <h2>Existing Invoices</h2>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const client = clients.find((c) => c.id === invoice.clientId);
              return (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{client ? client.name : invoice.clientId}</td>
                  <td>{invoice.amount}</td>
                  <td>{invoice.dueDate}</td>
                  <td>{invoice.status}</td>
                  <td>{invoice.description || '-'}</td>
                  <td>
                    <select
                      value={invoice.status}
                      onChange={(e) =>
                        handleStatusChange(
                          invoice.id,
                          e.target
                            .value as InvoiceStatus,
                        )
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}