'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
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

  if (!user.hasPassword) {
    return (
      <Form {...setForm}>
        <form onSubmit={setForm.handleSubmit(onSetSubmit)} className="space-y-6">
          <div className="border-border/40 mb-6 flex items-center gap-4 border-b pb-4">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <ShieldCheck className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Set Password</h3>
              <p className="text-muted-foreground text-sm">
                Set a secure password for your account
              </p>
            </div>
          </div>

          <FormField
            control={setForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                    className="bg-background/50 max-w-md"
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
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...field}
                    className="bg-background/50 max-w-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" disabled={isUpdating} className="h-10 w-full px-8 sm:w-auto">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Set Password
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...changeForm}>
      <form onSubmit={changeForm.handleSubmit(onChangeSubmit)} className="space-y-6">
        <div className="border-border/40 mb-6 flex items-center gap-4 border-b pb-4">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <KeyRound className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Change Password</h3>
            <p className="text-muted-foreground text-sm">Update your account password</p>
          </div>
        </div>

        <FormField
          control={changeForm.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  {...field}
                  className="bg-background/50 max-w-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-border/40 my-4 h-px w-full max-w-md" />

        <FormField
          control={changeForm.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  {...field}
                  className="bg-background/50 max-w-md"
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
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...field}
                  className="bg-background/50 max-w-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" disabled={isUpdating} className="h-10 w-full px-8 sm:w-auto">
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </div>
      </form>
    </Form>
  );
}
