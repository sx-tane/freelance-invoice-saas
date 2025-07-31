import { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface Client {
  id: number;
  name: string;
  email: string;
  address?: string;
  defaultPaymentTerms?: string;
}

/**
 * ClientsPage fetches and displays clients from the backend and provides
 * a simple form to add new clients.  On successful creation, the
 * client list refreshes.
 */
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<Omit<Client, 'id'>>({
    name: '',
    email: '',
    address: '',
    defaultPaymentTerms: '',
  });

  // Fetch clients on mount
  useEffect(() => {
    fetch('http://localhost:3000/clients')
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:3000/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((newClient: Client) => {
        setClients((prev) => [...prev, newClient]);
        setForm({ name: '', email: '', address: '', defaultPaymentTerms: '' });
      })
      .catch((err) => console.error(err));
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Clients</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h2>Add Client</h2>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Name:{' '}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Email:{' '}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Address:{' '}
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Payment Terms:{' '}
            <input
              type="text"
              name="defaultPaymentTerms"
              value={form.defaultPaymentTerms}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit">Create Client</button>
      </form>
      <h2>Existing Clients</h2>
      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Payment Terms</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.address}</td>
                <td>{client.defaultPaymentTerms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}