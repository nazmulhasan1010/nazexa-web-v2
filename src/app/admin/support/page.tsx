'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, urgent: 0, resolved: 0, total: 0 });
  const { socket } = useSocket();

  const fetchTickets = useCallback(() => {
    fetch('/api/admin/support/tickets?limit=100')
      .then(r => r.json())
      .then(data => {
        if (data.tickets) {
          setTickets(data.tickets);
          setStats({
            open: data.tickets.filter((t: any) => t.status === 'OPEN').length,
            urgent: data.tickets.filter((t: any) => t.priority === 'URGENT').length,
            resolved: data.tickets.filter((t: any) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
            total: data.pagination.total
          });
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!socket) return;
    
    const onEvent = () => fetchTickets();
    
    socket.on('ticket.created', onEvent);
    socket.on('ticket.reply_created', onEvent);
    socket.on('ticket.updated', onEvent);
    socket.on('ticket.deleted', onEvent);
    
    return () => {
      socket.off('ticket.created', onEvent);
      socket.off('ticket.reply_created', onEvent);
      socket.off('ticket.updated', onEvent);
      socket.off('ticket.deleted', onEvent);
    };
  }, [socket, fetchTickets]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case 'IN_PROGRESS': return <Badge variant="outline" className="border-blue-500 text-blue-500">In Progress</Badge>;
      case 'WAITING_FOR_USER': return <Badge variant="outline" className="border-orange-500 text-orange-500">Waiting on User</Badge>;
      case 'WAITING_FOR_SUPPORT': return <Badge variant="outline" className="border-red-500 text-red-500">Waiting on Support</Badge>;
      case 'RESOLVED': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case 'COMPLETED': return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
      case 'UNSOLVED': return <Badge variant="destructive">Unsolved</Badge>;
      case 'SKIPPED': return <Badge variant="secondary" className="bg-gray-200 text-gray-700">Skipped</Badge>;
      case 'CLOSED': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Desk</h2>
          <p className="text-muted-foreground">Manage support tickets and customer requests across all Nazexa products.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <LifeBuoy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">High impact issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time volume</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Ticket Inbox</CardTitle>
            <CardDescription>Recent support requests from users.</CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets..."
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button asChild>
              <Link href="/admin/support/settings">Settings</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center">
              <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
              <p className="text-sm text-muted-foreground">All caught up! There are no support tickets matching your criteria.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Priority</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Update</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">#{ticket.number}</td>
                      <td className="p-4 align-middle font-medium max-w-[200px] truncate">{ticket.subject}</td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span>{ticket.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{ticket.user?.email}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{getStatusBadge(ticket.status)}</td>
                      <td className="p-4 align-middle">
                        <Badge variant={getPriorityColor(ticket.priority) as any}>{ticket.priority}</Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {ticket.application?.name || '-'}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/support/${ticket.id}`}>
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
