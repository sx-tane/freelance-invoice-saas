import Link from 'next/link';

/**
 * Home page serves as a simple dashboard with navigation links to the
 * Clients and Invoices pages.  Styling is minimal; feel free to
 * enhance with a UI library or Tailwind.
 */
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Freelance Invoice SaaS</h1>
      <p>Welcome! Use the links below to manage clients and invoices.</p>
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link href="/clients">Clients</Link>
        <Link href="/invoices">Invoices</Link>
        <Link href="/subscribe">Subscribe</Link>
      </nav>
    </main>
  );
}