'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    };

    socket.on('contact.message.created', handleNewMessage);
    return () => {
      socket.off('contact.message.created', handleNewMessage);
    };
  }, [socket, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/messages/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete message');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Message deleted');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (err) => {
      toast.error(err.message);
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
                      <span className="bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                        New
                      </span>
                    )}
                  </h3>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {msg.email || 'No email provided'}
                  </p>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  {new Date(msg.createdAt).toLocaleString()}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        disabled={deleteMutation.isPending && deleteMutation.variables === msg.id}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === msg.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the message from{' '}
                          <b>{msg.name || 'Anonymous'}</b>. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(msg.id)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Delete Message
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
