'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 flex max-w-sm gap-2" onSubmit={handleSubscribe}>
      <Input
        type="email"
        placeholder="you@company.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
}
