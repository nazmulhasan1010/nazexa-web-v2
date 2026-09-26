'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/components/providers/SocketProvider';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, User, Sparkles, Clock, Loader2, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';

export default function UserTicketDetails() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { socket } = useSocket();

  const fetchTicket = useCallback(() => {
    fetch(`/api/support/tickets/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.ticket) {
          setTicket(data.ticket);
        } else {
          router.push('/support/tickets');
        }
        setLoading(false);
      });
  }, [id, router]);

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
            status: data.message.senderType === 'ADMIN' ? 'WAITING_FOR_USER' : 'OPEN'
          };
        });
      }
    };

    const onTicketUpdated = (data: any) => {
      if (data.ticketId === ticket.id && data.updates) {
        setTicket((prev: any) => ({ ...prev, ...data.updates }));
      } else if (data.ticketId === ticket.id && data.status) {
        setTicket((prev: any) => ({ ...prev, status: data.status }));
      }
    };

    const onTicketDeleted = (data: any) => {
      if (data.ticketId === ticket.id) {
        alert('This ticket was deleted by an admin.');
        router.push('/support/tickets');
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
      const res = await fetch(`/api/support/tickets/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, attachments })
      });
      
      const data = await res.json();
      if (res.ok) {
        setReplyText('');
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
        alert(data.error || 'Failed to send reply');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) return <div className="container py-24 text-center">Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div className="container max-w-4xl mx-auto py-24 px-4">
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/support/tickets"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">#{ticket.number}: {ticket.subject}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {new Date(ticket.createdAt).toLocaleDateString()}</span>
            <span>Product: {ticket.application?.name || 'General'}</span>
          </div>
        </div>
        <div>
          {getStatusBadge(ticket.status)}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {ticket.messages?.map((msg: any) => (
            <Card key={msg.id} className={msg.senderType === 'USER' ? 'border-primary/20' : 'bg-muted/30'}>
              <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${msg.senderType === 'USER' ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
                  {msg.senderType === 'USER' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div>
                  <CardTitle className="text-sm">
                    {msg.senderType === 'USER' ? 'You' : 'Nazexa Support'}
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

        {ticket.status !== 'CLOSED' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reply to Support</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Type your message here..." 
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
            <CardFooter className="justify-end border-t p-4">
              <Button onClick={handleReply} disabled={submitting || (!replyText.trim() && attachments.length === 0) || uploading}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} 
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
