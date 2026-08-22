'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/backgrounds/AnimatedBackground';

const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (!loading && user && user.hasPassword) {
      router.replace('/');
    }
    if (!loading && user && !user.emailVerified) {
      router.replace('/verify');
    }
  }, [user, loading, router]);

  async function onSubmit(data: z.infer<typeof setPasswordSchema>) {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/me/password/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to set password');
      }

      toast.success('Password configured successfully!');
      // Force reload to get updated session with hasPassword=true
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading || !user || user.hasPassword || !user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center p-4">
      <AuroraBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="surface-card p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner">
              <ShieldCheck className="text-primary h-8 w-8" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Secure Your Account</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Since you logged in with a third-party provider, please set a backup password to
              secure your account.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="bg-background/50 pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                          className="bg-background/50 pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-11 w-full text-base font-medium"
                >
                  {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Complete Setup
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  disabled={isUpdating}
                  className="h-11 w-full text-base"
                >
                  Maybe later
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
