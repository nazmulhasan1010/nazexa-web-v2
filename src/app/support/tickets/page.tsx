'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, LifeBuoy, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSocket } from '@/components/providers/SocketProvider';

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchTickets = useCallback(() => {
    fetch('/api/support/tickets')
      .then(r => r.json())
      .then(data => {
        if (data.tickets) setTickets(data.tickets);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!socket) return;
    
    const onUpdate = () => fetchTickets();

    socket.on('ticket.updated', onUpdate);
    socket.on('ticket.reply_created', onUpdate);
    socket.on('ticket.deleted', onUpdate);

    return () => {
      socket.off('ticket.updated', onUpdate);
      socket.off('ticket.reply_created', onUpdate);
      socket.off('ticket.deleted', onUpdate);
    };
  }, [socket, fetchTickets]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'IN_PROGRESS': return <Badge variant="outline" className="border-blue-500 text-blue-500">In Progress</Badge>;
      case 'WAITING_FOR_USER': return <Badge variant="outline" className="border-orange-500 text-orange-500">Action Required</Badge>;
      case 'WAITING_FOR_SUPPORT': return <Badge variant="outline" className="border-blue-500 text-blue-500">Waiting on Support</Badge>;
      case 'RESOLVED': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case 'COMPLETED': return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
      case 'UNSOLVED': return <Badge variant="destructive">Unsolved</Badge>;
      case 'SKIPPED': return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Skipped</Badge>;
      case 'CLOSED': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-24 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Support Tickets</h1>
          <p className="text-muted-foreground mt-2">View and manage your support requests.</p>
        </div>
        <Button asChild>
          <Link href="/support/tickets/new"><Plus className="mr-2 h-4 w-4" /> New Ticket</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading your tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center">
              <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-semibold">No tickets yet</h3>
              <p className="text-muted-foreground mt-2 mb-6">You haven't submitted any support requests.</p>
              <Button asChild>
                <Link href="/support/tickets/new">Create your first ticket</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {tickets.map(ticket => (
                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 mb-4 sm:mb-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">#{ticket.number}</span>
                      <span className="font-medium">{ticket.subject}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      <span>Product: {ticket.application?.name || 'General'}</span>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/support/tickets/${ticket.id}`}>
                      View Ticket <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
