'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Loader2, InboxIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageRow } from './MessageRow';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  fromName?: string;
  fromEmail: string;
  subject: string;
  preview?: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  hasAttachment: boolean;
  folderType: string;
  account?: { email: string; displayName: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface MessageListProps {
  accountId: string | null;
  folder: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MessageList({ accountId, folder, selectedId, onSelect }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30', folder });
      if (accountId) params.set('accountId', accountId);
      if (folder === 'starred') { params.delete('folder'); params.set('isStarred', 'true'); }
      if (searchDebounced) params.set('search', searchDebounced);

      const res = await fetch(`/api/admin/mailbox/messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [accountId, folder, page, searchDebounced]);

  useEffect(() => {
    setPage(1);
    setMessages([]);
  }, [accountId, folder, searchDebounced]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const handleRefresh = () => fetchMessages();
    window.addEventListener('nazexa:mail-refresh', handleRefresh);
    return () => window.removeEventListener('nazexa:mail-refresh', handleRefresh);
  }, [fetchMessages]);

  const handleStar = async (msg: Message, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !msg.isStarred;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: updated } : m));
    await fetch(`/api/admin/mailbox/messages/${msg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: updated }),
    });
  };

  const folderLabel = {
    inbox: 'Inbox', sent: 'Sent', drafts: 'Drafts', trash: 'Trash',
    spam: 'Spam', archive: 'Archive', starred: 'Starred',
  }[folder] || folder;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">{folderLabel}</h2>
          <div className="flex items-center gap-1">
            {pagination && (
              <span className="text-xs text-muted-foreground">{pagination.total} messages</span>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchMessages} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Message list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-3 border-b">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3.5 w-full mb-1.5" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <InboxIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No messages</p>
            <p className="text-xs mt-1">
              {search ? 'Try a different search term' : `Your ${folderLabel.toLowerCase()} is empty`}
            </p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageRow
                key={msg.id}
                message={msg}
                isSelected={selectedId === msg.id}
                onClick={() => {
                  onSelect(msg.id);
                  if (!msg.isRead) {
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
                  }
                }}
                onStar={(e) => handleStar(msg, e)}
              />
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Button
                  variant="outline" size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >Previous</Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline" size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >Next</Button>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
