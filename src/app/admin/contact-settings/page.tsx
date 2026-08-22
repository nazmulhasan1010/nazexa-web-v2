'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ContactSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    phone: '',
    email: '',
    address: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['contactSettings'],
    queryFn: async () => {
      const res = await fetch('/api/contact-settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        title: data.settings.title || '',
        subtitle: data.settings.subtitle || '',
        phone: data.settings.phone || '',
        email: data.settings.email || '',
        address: data.settings.address || '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const res = await fetch('/api/contact-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSettings'] });
      toast.success('Contact settings updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update settings. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
        Error loading contact settings.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Contact Settings</h1>
      <p className="text-muted-foreground mt-2">
        Manage the contact details displayed on the /contact page.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        <div className="border-border/50 bg-card/30 space-y-4 rounded-xl border p-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Let's talk about your project"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="A brief description..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@nazexa.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Physical Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Tech Avenue, NY 10001"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
}
