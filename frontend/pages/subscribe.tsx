import { useState } from 'react';

/**
 * SubscribePage exposes a button that initiates a subscription via the
 * backend payment endpoint.  When the checkout session is created,
 * the browser redirects to the Stripe checkout page.
 */
export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        'http://localhost:3000/payments/create-checkout-session',
        {
          method: 'POST',
        },
      );
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Subscribe</h1>
      <p>Click the button below to subscribe to the premium plan.</p>
      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? 'Redirecting…' : 'Subscribe Now'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}