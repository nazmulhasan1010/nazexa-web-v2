'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, KeyRound, ShieldCheck, ShieldAlert, Smartphone, Fingerprint, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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

// --- Change Password Schema ---
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// --- Set Password Schema ---
const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function SecurityForm() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const changeForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const setForm = useForm<z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  async function onChangeSubmit(data: z.infer<typeof changePasswordSchema>) {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update password');

      toast.success('Password updated successfully');
      changeForm.reset();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setIsUpdating(false);
    }
  }

  async function onSetSubmit(data: z.infer<typeof setPasswordSchema>) {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/me/password/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to set password');

      toast.success('Password set successfully!');
      setForm.reset();
      window.location.reload(); // Reload to update auth session state
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setIsUpdating(false);
    }
  }

  if (!user) return null;

  return (
    <div className="flex flex-col">
      {/* Premium Cover Photo Area for Security */}
      <div className="relative h-48 w-full overflow-hidden bg-muted/20">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tech-gradient-security" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
            <pattern id="tech-circuit-security" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M20 20h20v20M50 20h20v40h10M20 50v20h40v10M70 50v20H50" fill="none" stroke="url(#tech-gradient-security)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="20" r="3" fill="#10b981" />
              <circle cx="40" cy="40" r="3" fill="#3b82f6" />
              <circle cx="70" cy="20" r="3" fill="#8b5cf6" />
              <circle cx="80" cy="60" r="3" fill="#10b981" />
              <circle cx="20" cy="50" r="3" fill="#3b82f6" />
              <circle cx="60" cy="70" r="3" fill="#8b5cf6" />
              <circle cx="50" cy="70" r="3" fill="#10b981" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-circuit-security)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-6 left-8 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-background bg-background shadow-xl">
            <ShieldCheck className="h-8 w-8 text-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Security Center</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Manage your authentication and account safety
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-8">
        {/* Security Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-muted/40 to-muted/10 p-5">
          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Account Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">Protected & Secure</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-muted/40 to-muted/10 p-5 opacity-70">
          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Two-Factor Auth</p>
              <p className="text-xs text-muted-foreground mt-0.5">Not configured</p>
            </div>
            <Button variant="link" className="h-auto p-0 text-xs justify-start text-blue-500 mt-1">Configure &rarr;</Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-muted/40 to-muted/10 p-5 opacity-70">
          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Passkeys</p>
              <p className="text-xs text-muted-foreground mt-0.5">0 passkeys registered</p>
            </div>
            <Button variant="link" className="h-auto p-0 text-xs justify-start text-violet-500 mt-1">Add Passkey &rarr;</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 shadow-sm overflow-hidden">
        <div className="border-b border-border/50 bg-muted/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {user.hasPassword ? 'Change Password' : 'Set Password'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.hasPassword 
                  ? 'Update your password to keep your account secure.' 
                  : 'Set a secure password for your account.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          {!user.hasPassword ? (
            <Form {...setForm}>
              <form onSubmit={setForm.handleSubmit(onSetSubmit)} className="space-y-6 max-w-md">
                <FormField
                  control={setForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="h-11 bg-background/50 text-base transition-all focus:bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          className="h-11 bg-background/50 text-base transition-all focus:bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" disabled={isUpdating} className="h-11 w-full sm:w-auto px-8 shadow-md hover:shadow-lg transition-all">
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Set Password
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...changeForm}>
              <form onSubmit={changeForm.handleSubmit(onChangeSubmit)} className="space-y-6 max-w-md">
                <FormField
                  control={changeForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          className="h-11 bg-background/50 text-base transition-all focus:bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="my-6 h-px w-full bg-gradient-to-r from-border/50 via-border to-transparent" />

                <FormField
                  control={changeForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="h-11 bg-background/50 text-base transition-all focus:bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changeForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="h-11 bg-background/50 text-base transition-all focus:bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" disabled={isUpdating} className="h-11 w-full sm:w-auto px-8 shadow-md hover:shadow-lg transition-all">
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Password
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-red-600">Deactivate Account</h4>
              <p className="text-sm text-red-600/80 mt-1 max-w-md">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <Button variant="destructive" className="sm:self-center shadow-sm">
            Deactivate Account
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
