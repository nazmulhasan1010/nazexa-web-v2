'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Crown, BadgeCheck, Camera, Activity, CalendarDays, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Name must not be longer than 30 characters.',
    }),
  image: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      image: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: (user as any).name || '',
        image: (user as any).image || '',
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      form.setValue('image', data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Image uploaded. Don't forget to save changes!");
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Premium Cover Photo Area */}
      {/* Premium Cover Photo Area */}
      <div className="relative h-48 w-full overflow-hidden bg-muted/20">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <pattern id="tech-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M20 20h20v20M50 20h20v40h10M20 50v20h40v10M70 50v20H50" fill="none" stroke="url(#tech-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="20" r="3" fill="#3b82f6" />
              <circle cx="40" cy="40" r="3" fill="#8b5cf6" />
              <circle cx="70" cy="20" r="3" fill="#ec4899" />
              <circle cx="80" cy="60" r="3" fill="#3b82f6" />
              <circle cx="20" cy="50" r="3" fill="#8b5cf6" />
              <circle cx="60" cy="70" r="3" fill="#ec4899" />
              <circle cx="50" cy="70" r="3" fill="#3b82f6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-circuit)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="px-8 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section overlapping cover */}
            <div className="relative -mt-16 flex items-end justify-between sm:items-center">
              <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:items-end">
                <div className="group relative">
                  <Avatar className="relative h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={form.watch('image') || undefined} className="object-cover" />
                    <AvatarFallback className="bg-muted text-4xl font-medium text-muted-foreground">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="mb-1 h-6 w-6" />
                        <span className="text-xs font-medium">Update</span>
                      </>
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
                
                <div className="flex-1 space-y-1.5 pt-2 sm:pt-14">
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">
                      {form.watch('name') || 'Your Profile'}
                    </h3>
                    {user.emailVerified && (
                      <BadgeCheck className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats/Info Grid */}
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 pt-4">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Active</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Security</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Standard</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Member Since</span>
                </div>
                <p className="text-sm font-semibold text-foreground">2026</p>
              </div>
            </div>

            <div className="grid gap-8 pt-6">
              {/* Form Fields */}
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Display Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your premium name" 
                          className="h-11 bg-background/50 text-base" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        This is your public display name on Nazexa.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden image field */}
                <div className="hidden">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => <Input {...field} />}
                  />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-muted/30 to-muted/10 p-6 shadow-sm">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">Email Address</h4>
                    <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                      Your email address is managed by your authentication provider. It is used for critical account notifications.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end">
                    <Input disabled value={user.email} className="h-10 w-full bg-background/80 sm:w-64" />
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Account
                      </span>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="h-8 shadow-sm" asChild>
                        <Link href="/verify">Verify Email</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-border/40 pt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => form.reset()}
                  disabled={isUpdating || !form.formState.isDirty}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating || !form.formState.isDirty} 
                  className="h-10 min-w-[120px] shadow-md transition-all hover:shadow-lg"
                >
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
