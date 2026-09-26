'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Reply, ReplyAll, Forward, Trash2, Star, ArchiveIcon,
  Paperclip, ExternalLink, Loader2, AlertTriangle, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

interface FullMessage {
  id: string;
  fromName?: string;
  fromEmail: string;
  toAddresses: string;
  ccAddresses?: string;
  subject: string;
  date: string;
  bodyHtml?: string;
  bodyText?: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folderType: string;
  attachments: Attachment[];
  account: { id: string; email: string; displayName: string };
  folder?: { name: string; type: string };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function MessageReader({
  messageId,
  onBack,
  onDelete,
}: {
  messageId: string;
  onBack?: () => void;
  onDelete?: () => void;
}) {
  const [message, setMessage] = useState<FullMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/mailbox/messages/${messageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) setMessage(data.message);
        else setError(data.error || 'Failed to load message');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [messageId]);

  const handleDelete = async () => {
    if (!message) return;
    const res = await fetch(`/api/admin/mailbox/messages/${message.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Moved to trash');
      onDelete?.();
    }
  };

  const handleStar = async () => {
    if (!message) return;
    const updated = !message.isStarred;
    setMessage(prev => prev ? { ...prev, isStarred: updated } : prev);
    await fetch(`/api/admin/mailbox/messages/${message.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: updated }),
    });
  };

  const handleMarkUnread = async () => {
    if (!message) return;
    await fetch(`/api/admin/mailbox/messages/${message.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: false }),
    });
    setMessage(prev => prev ? { ...prev, isRead: false } : prev);
    toast.success('Marked as unread');
  };

  const handleArchive = async () => {
    if (!message) return;
    await fetch(`/api/admin/mailbox/messages/${message.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderType: 'archive' }),
    });
    toast.success('Archived');
    onDelete?.();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mb-3 text-destructive/50" />
        <p className="text-sm font-medium">{error || 'Message not found'}</p>
        {onBack && (
          <Button variant="ghost" size="sm" className="mt-4" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
          </Button>
        )}
      </div>
    );
  }

  const toList = JSON.parse(message.toAddresses || '[]');
  const ccList = message.ccAddresses ? JSON.parse(message.ccAddresses) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-background/50 backdrop-blur-sm">
        {onBack && (
          <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href={`/admin/mailbox/compose?replyTo=${message.id}`}>
            <Reply className="h-4 w-4" /> Reply
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href={`/admin/mailbox/compose?replyAll=${message.id}`}>
            <ReplyAll className="h-4 w-4" /> Reply All
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link href={`/admin/mailbox/compose?forward=${message.id}`}>
            <Forward className="h-4 w-4" /> Forward
          </Link>
        </Button>

        <div className="flex-1" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStar} title={message.isStarred ? 'Unstar' : 'Star'}>
          <Star className={cn('h-4 w-4', message.isStarred && 'fill-yellow-400 text-yellow-400')} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleArchive} title="Archive">
          <ArchiveIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete} title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMarkUnread}>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem onClick={() => fetch(`/api/admin/mailbox/messages/${message.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isImportant: !message.isImportant }),
            }).then(() => setMessage(prev => prev ? { ...prev, isImportant: !prev.isImportant } : prev))}>
              {message.isImportant ? 'Mark not important' : 'Mark as important'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-3xl mx-auto">
          {/* Subject */}
          <h1 className="text-2xl font-bold tracking-tight mb-4">{message.subject}</h1>

          {/* From / To / Date */}
          <div className="space-y-1.5 mb-6 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground w-8 shrink-0">From</span>
              <span className="font-medium">{message.fromName || message.fromEmail}
                {message.fromName && <span className="text-muted-foreground font-normal ml-1">&lt;{message.fromEmail}&gt;</span>}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground w-8 shrink-0">To</span>
              <span>{toList.map((a: any) => a.email).join(', ')}</span>
            </div>
            {ccList.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground w-8 shrink-0">CC</span>
                <span>{ccList.map((a: any) => a.email).join(', ')}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground w-8 shrink-0">Date</span>
              <span>{format(new Date(message.date), 'PPpp')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground w-8 shrink-0">Via</span>
              <Badge variant="outline" className="text-xs">{message.account.email}</Badge>
            </div>
          </div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="mb-6 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Paperclip className="h-4 w-4" />
                {message.attachments.length} Attachment{message.attachments.length > 1 ? 's' : ''}
              </div>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map(att => (
                  <a
                    key={att.id}
                    href={`/api/admin/mailbox/attachments/${att.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 p-2 border rounded-md bg-background hover:bg-accent transition-colors text-sm"
                  >
                    {att.mimeType.startsWith('image/') ? (
                      <img
                        src={`/api/admin/mailbox/attachments/${att.id}`}
                        alt={att.fileName}
                        className="h-12 w-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center border rounded bg-muted">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium truncate max-w-[120px]">{att.fileName}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(att.fileSize)}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 ml-1" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Email body */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {message.bodyHtml ? (
              <div
                className="email-body"
                dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
              />
            ) : message.bodyText ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.bodyText}</pre>
            ) : (
              <p className="text-muted-foreground italic">No message content</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
