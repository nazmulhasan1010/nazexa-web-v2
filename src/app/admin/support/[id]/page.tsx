'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/components/providers/SocketProvider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Send, Sparkles, User, FileText, Clock, Loader2, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetails() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const { socket } = useSocket();

  const fetchTicket = useCallback(() => {
    fetch(`/api/admin/support/tickets/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.ticket) {
          setTicket(data.ticket);
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    if (!socket || !ticket) return;

    const onReply = (data: any) => {
      if (data.ticketId === ticket.id && data.message) {
        setTicket((prev: any) => {
          if (!prev) return prev;
          const msgs = prev.messages || [];
          // Check for duplicate message
          if (msgs.some((m: any) => m.id === data.message.id)) {
            return prev;
          }
          return {
            ...prev,
            messages: [...msgs, data.message],
            status: data.message.senderType === 'USER' ? 'OPEN' : 'WAITING_FOR_USER'
          };
        });
      }
    };

    const onTicketUpdated = (data: any) => {
      if (data.ticketId === ticket.id && data.updates) {
        setTicket((prev: any) => ({ ...prev, ...data.updates }));
      }
    };

    const onTicketDeleted = (data: any) => {
      if (data.ticketId === ticket.id) {
        alert('This ticket was deleted by another admin.');
        router.push('/admin/support');
      }
    };

    socket.on('ticket.reply_created', onReply);
    socket.on('ticket.updated', onTicketUpdated);
    socket.on('ticket.deleted', onTicketDeleted);

    return () => {
      socket.off('ticket.reply_created', onReply);
      socket.off('ticket.updated', onTicketUpdated);
      socket.off('ticket.deleted', onTicketDeleted);
    };
  }, [socket, ticket?.id, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ticketId', ticket.id);
        
        const res = await fetch('/api/support/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        if (res.ok) {
          setAttachments(prev => [...prev, data]);
        } else {
          alert(data.error || 'Upload failed');
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReply = async () => {
    if (!replyText.trim() && attachments.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/support/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, internalNote, attachments })
      });
      
      const data = await res.json();
      if (res.ok) {
        setReplyText('');
        setInternalNote(false);
        setAttachments([]);
        setTicket((prev: any) => {
          if (!prev) return prev;
          const msgs = prev.messages || [];
          if (msgs.some((m: any) => m.id === data.message.id)) {
            return { ...prev, ...data.ticket, messages: msgs };
          }
          return {
            ...prev,
            ...data.ticket,
            messages: [...msgs, data.message]
          };
        });
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setTicket((prev: any) => ({ ...prev, status: newStatus }));
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/admin/support');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete ticket');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

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

  if (loading) return <div className="p-8">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/support"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">#{ticket.number}: {ticket.subject}</h2>
            {getStatusBadge(ticket.status)}
            <Badge variant={getPriorityColor(ticket.priority) as any}>{ticket.priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created on {new Date(ticket.createdAt).toLocaleString()} via {ticket.application?.name || 'Nazexa Web'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Conversation Thread */}
        <div className="space-y-6">
          <div className="space-y-4">
            {ticket.messages?.map((msg: any) => (
              <Card key={msg.id} className={msg.internalNote ? 'border-yellow-500/50 bg-yellow-500/5' : ''}>
                <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    {msg.senderType === 'USER' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <CardTitle className="text-sm">
                      {msg.senderType === 'USER' ? ticket.user?.name : 'Support Agent'}
                      {msg.internalNote && <Badge variant="secondary" className="ml-2 text-xs bg-yellow-500/20 text-yellow-600">Internal Note</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs">{new Date(msg.createdAt).toLocaleString()}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm whitespace-pre-wrap">
                  {msg.body}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="font-semibold text-xs text-muted-foreground uppercase">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.attachments.map((att: any) => (
                          <div key={att.id} className="relative group overflow-hidden border rounded-md max-w-xs">
                            {att.mimeType?.startsWith('image/') ? (
                              <a href={`/api/support/attachments/${att.id}`} target="_blank" rel="noreferrer" className="block">
                                <img src={`/api/support/attachments/${att.id}`} alt={att.fileName} className="object-cover max-h-48 w-full transition-transform hover:scale-105" />
                                <div className="absolute bottom-0 inset-x-0 bg-background/80 p-1 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                  {att.fileName}
                                </div>
                              </a>
                            ) : (
                              <a 
                                href={`/api/support/attachments/${att.id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center text-xs bg-background p-2 hover:bg-muted"
                              >
                                {att.fileName}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Type your response here..." 
                className="min-h-[150px] mb-4"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Attachments</p>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Files
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  {uploading && <span className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Uploading...</span>}
                </div>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex items-center justify-between p-2 text-sm border rounded-md bg-muted/50">
                        <span className="truncate max-w-[200px]">{att.fileName}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeAttachment(i)} type="button">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <div className="flex items-center gap-2">
                <Switch id="internal-note" checked={internalNote} onCheckedChange={setInternalNote} />
                <Label htmlFor="internal-note">Internal Note (Hidden from user)</Label>
              </div>
              <Button onClick={handleReply} disabled={submitting || (!replyText.trim() && attachments.length === 0) || uploading} variant={internalNote ? 'secondary' : 'default'}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} 
                {internalNote ? 'Save Note' : 'Send Reply'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ticket Status</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_FOR_USER">Waiting for User</option>
                  <option value="WAITING_FOR_SUPPORT">Waiting for Support</option>
                  <option value="UNSOLVED">Unsolved</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SKIPPED">Skipped</option>
                </select>
              </div>
              <div className="pt-4 border-t border-border mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Ticket
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the ticket, all its messages, and any attached files.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="font-medium">{ticket.user?.name}</div>
                <div className="text-muted-foreground">{ticket.user?.email}</div>
              </div>
              <Button variant="outline" className="w-full">View Profile</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-3">
                <div className="text-muted-foreground">Product</div>
                <div className="font-medium text-right">{ticket.application?.name || '-'}</div>
                
                <div className="text-muted-foreground">Category</div>
                <div className="font-medium text-right">{ticket.category?.name || '-'}</div>
                
                <div className="text-muted-foreground">Assigned To</div>
                <div className="font-medium text-right">{ticket.assignedTo?.name || 'Unassigned'}</div>
                
                <div className="text-muted-foreground">Last Reply</div>
                <div className="font-medium text-right">
                  {new Date(ticket.lastReplyAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {ticket.histories && ticket.histories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm max-h-[300px] overflow-y-auto">
                <div className="relative border-l border-border ml-3 space-y-4">
                  {ticket.histories.map((history: any) => (
                    <div key={history.id} className="relative pl-4">
                      <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border border-background bg-muted-foreground" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{history.changedBy === 'ADMIN' ? 'Admin' : 'User'}</span>
                          <span className="text-muted-foreground">changed status to</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs scale-90 origin-left">{history.previousStatus || 'NEW'}</Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="default" className="text-xs scale-90 origin-left">{history.newStatus}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(history.createdAt).toLocaleString()}
                        </div>
                        {history.note && (
                          <div className="text-xs mt-1 italic text-muted-foreground">"{history.note}"</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
