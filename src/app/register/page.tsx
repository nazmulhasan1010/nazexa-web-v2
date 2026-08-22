'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuroraBackground, GridBackground } from '@/components/backgrounds/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      toast.success('Account created successfully!');
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error('An error occurred during registration.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-20">
      <AuroraBackground />
      <GridBackground />
      <div className="surface-card border-border/50 relative z-10 w-full max-w-md border p-8 shadow-2xl backdrop-blur-xl">
        <Link href="/" className="font-display flex items-center gap-2 text-lg font-semibold">
          <img src="/logos/logo-sm.svg" alt="Nazexa" className="h-7 w-auto" />
          Nazexa
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Get started with Nazexa ecosystem tools today.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Button variant="outline" className="bg-background hover:bg-muted h-11 w-full" asChild>
            <a href="/api/auth/google/login" className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </a>
          </Button>
          <Button variant="outline" className="bg-background hover:bg-muted h-11 w-full" asChild>
            <a href="/api/auth/github/login" className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Sign up with GitHub
            </a>
          </Button>
        </div>

        <div className="relative mt-7">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs font-medium uppercase">
            <span className="bg-background text-muted-foreground px-2">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              required
            />
          </div>
          <Button type="submit" className="glow-ring h-11 w-full" disabled={busy}>
            {busy ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
