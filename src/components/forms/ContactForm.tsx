'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type ContactSettings = {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
};

export function ContactForm({ settings }: { settings?: ContactSettings }) {
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setMessage('');
      if (!user) {
        setName('');
        setEmail('');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );

  const title = settings?.title || "Let's talk about your project";
  const subtitle =
    settings?.subtitle ||
    'Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.';
  const phone = settings?.phone || '+1 (555) 000-0000';
  const contactEmail = settings?.email || 'hello@nazexa.com';
  const address = settings?.address || '123 Tech Avenue, NY 10001';

  return (
    <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Left info block */}
      <div className="flex flex-col justify-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg">{subtitle}</p>

        <div className="mt-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Call us</h3>
              <p className="text-muted-foreground">{phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Email us</h3>
              <p className="text-muted-foreground">{contactEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Visit us</h3>
              <p className="text-muted-foreground">{address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form block */}
      <div className="bg-card/50 border-border/50 relative z-10 rounded-xl border p-6 shadow-xl backdrop-blur-sm md:p-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Send us a message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              className="min-h-[120px]"
              required
            />
          </div>

          <Button type="submit" className="mt-2 w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
