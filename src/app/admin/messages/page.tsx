'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminMessages() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
  });

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
        Error loading messages.
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div>
      <h1 className="text-3xl font-semibold">Contact Messages</h1>
      <p className="text-muted-foreground mt-2">
        View all messages submitted via the contact form.
      </p>

      <div className="mt-8 space-y-4">
        {messages.length === 0 ? (
          <div className="border-border/50 bg-card/30 text-muted-foreground rounded-lg border p-8 text-center">
            No messages yet.
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className="surface-card relative p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    {msg.name || 'Anonymous'}
                    {msg.read ? (
                      <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <span className="bg-primary flex h-2 w-2 rounded-full" />
                    )}
                  </h3>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {msg.email || 'No email provided'}
                  </p>
                </div>
                <div className="text-muted-foreground text-sm">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="border-border/50 text-foreground/90 mt-4 border-t pt-4 text-sm whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
