'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Inbox, Send, FileText, Trash2, AlertOctagon, Archive, Star,
  ChevronDown, ChevronRight, RefreshCw, Plus, Settings,
  Mail, Loader2, Circle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MailAccount {
  id: string;
  email: string;
  displayName: string;
  status: string;
  lastSyncAt: string | null;
  folders: { id: string; name: string; displayName: string; type: string; unreadCount: number }[];
  unreadCount: number;
}

const SYSTEM_FOLDERS = [
  { type: 'inbox', label: 'Inbox', icon: Inbox },
  { type: 'starred', label: 'Starred', icon: Star },
  { type: 'sent', label: 'Sent', icon: Send },
  { type: 'drafts', label: 'Drafts', icon: FileText },
  { type: 'archive', label: 'Archive', icon: Archive },
  { type: 'spam', label: 'Spam', icon: AlertOctagon },
  { type: 'trash', label: 'Trash', icon: Trash2 },
];

export function MailSidebar({
  selectedAccountId,
  selectedFolder,
  onAccountChange,
  onFolderChange,
}: {
  selectedAccountId: string | null;
  selectedFolder: string;
  onAccountChange: (id: string | null) => void;
  onFolderChange: (folder: string) => void;
}) {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/mailbox/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const handleRefresh = () => fetchAccounts();
    window.addEventListener('nazexa:mail-refresh', handleRefresh);
    return () => window.removeEventListener('nazexa:mail-refresh', handleRefresh);
  }, [fetchAccounts]);

  const totalUnread = accounts.reduce((s, a) => s + (a.unreadCount || 0), 0);

  const handleSync = async (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncing(accountId);
    try {
      const res = await fetch(`/api/admin/mailbox/accounts/${accountId}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sync complete — ${data.result.messagesAdded} new messages`);
        fetchAccounts();
      } else {
        toast.error('Sync failed');
      }
    } finally {
      setSyncing(null);
    }
  };

  const toggleAccount = (id: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Compose Button */}
      <div className="p-3 border-b">
        <Button className="w-full gap-2" asChild>
          <Link href="/admin/mailbox/compose">
            <Plus className="h-4 w-4" />
            Compose
          </Link>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* All Inboxes */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 mb-1">
            All Mailboxes
          </div>
          {SYSTEM_FOLDERS.map(({ type, label, icon: Icon }) => {
            const isActive = !selectedAccountId && selectedFolder === type;
            const unread = type === 'inbox' ? totalUnread : 0;
            return (
              <button
                key={type}
                onClick={() => { onAccountChange(null); onFolderChange(type); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {unread > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">{unread}</Badge>
                )}
              </button>
            );
          })}

          {/* Per-Account */}
          {accounts.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-1">
                Accounts
              </div>
              {accounts.map(account => (
                <div key={account.id}>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors group',
                      selectedAccountId === account.id
                        ? 'bg-accent text-foreground'
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => toggleAccount(account.id)}
                  >
                    <div className="relative">
                      <Mail className="h-4 w-4 shrink-0" />
                      {account.status === 'error' && (
                        <Circle className="h-2 w-2 fill-destructive text-destructive absolute -top-0.5 -right-0.5" />
                      )}
                      {account.status === 'active' && (
                        <Circle className="h-2 w-2 fill-green-500 text-green-500 absolute -top-0.5 -right-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{account.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">{account.unreadCount}</Badge>
                      )}
                      <button
                        onClick={(e) => handleSync(account.id, e)}
                        disabled={syncing === account.id}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background transition-opacity"
                        title="Sync now"
                      >
                        <RefreshCw className={cn('h-3 w-3', syncing === account.id && 'animate-spin')} />
                      </button>
                      {expandedAccounts.has(account.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                  </div>

                  {/* Account folders */}
                  {expandedAccounts.has(account.id) && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                      {SYSTEM_FOLDERS.map(({ type, label, icon: Icon }) => {
                        const isActive = selectedAccountId === account.id && selectedFolder === type;
                        const folder = account.folders?.find(f => f.type === type);
                        const unread = folder?.unreadCount || 0;

                        return (
                          <button
                            key={type}
                            onClick={() => { onAccountChange(account.id); onFolderChange(type); }}
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left',
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1 truncate">{label}</span>
                            {unread > 0 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{unread}</Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t">
        <Button variant="ghost" size="sm" className="w-full gap-2 justify-start text-muted-foreground" asChild>
          <Link href="/admin/mailbox/accounts">
            <Settings className="h-4 w-4" />
            Manage Accounts
          </Link>
        </Button>
      </div>
    </div>
  );
}
