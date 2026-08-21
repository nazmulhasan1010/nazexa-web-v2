"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function AdminMessages() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Error loading messages.
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div>
      <h1 className="text-3xl font-semibold">Contact Messages</h1>
      <p className="mt-2 text-muted-foreground">
        View all messages submitted via the contact form.
      </p>

      <div className="mt-8 space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">
            No messages yet.
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className="surface-card p-5 relative">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {msg.name || "Anonymous"}
                    {msg.read ? (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-primary" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {msg.email || "No email provided"}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 whitespace-pre-wrap text-sm text-foreground/90">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
