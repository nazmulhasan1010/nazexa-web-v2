'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { AuroraBackground, GridBackground } from '@/components/backgrounds/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminLogin as login } from '@/lib/admin-auth.server';
import { useAdminAuth as useAuth } from '@/hooks/useAdminAuth';

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/admin';
  return raw;
}

export default function AuthPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const next = safeNext(new URLSearchParams(window.location.search).get('next'));
      router.replace(next);
    }
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login({ email, password });
      if (res && res.error) {
        toast.error(res.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-auth-session'] });
      const next = safeNext(new URLSearchParams(window.location.search).get('next'));
      router.replace(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-20">
      <AuroraBackground />
      <GridBackground />
      <div className="surface-card w-full max-w-md p-8">
        <Link href="/" className="font-display flex items-center gap-2 text-lg font-semibold">
          <img src="/logos/logo-sm.svg" alt="Nazexa" className="h-7 w-auto" />
          Nazexa
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">Sign in to the CMS</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Manage the homepage, pages, theme and SEO.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nazexa.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="glow-ring h-11 w-full" disabled={busy}>
            {busy ? 'Please wait…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
