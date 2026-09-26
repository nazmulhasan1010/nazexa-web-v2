'use client';

import { useState } from 'react';
import { MailSidebar } from '@/components/admin/mailbox/MailSidebar';
import { MessageList } from '@/components/admin/mailbox/MessageList';
import { MessageReader } from '@/components/admin/mailbox/MessageReader';
import { MailOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MailboxPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* ── Mail Sidebar ─────────────────────────────── */}
      {/* ── Mail Sidebar (Desktop) ───────────────────────── */}
      <div className="hidden md:flex w-64 flex-shrink-0 border-r flex-col bg-background overflow-hidden">
        <MailSidebar
          selectedAccountId={selectedAccountId}
          selectedFolder={selectedFolder}
          onAccountChange={(id) => {
            setSelectedAccountId(id);
            setSelectedMessageId(null);
          }}
          onFolderChange={(f) => {
            setSelectedFolder(f);
            setSelectedMessageId(null);
          }}
        />
      </div>

      {/* ── Message List ─────────────────────────────── */}
      <div className={cn("flex-shrink-0 border-r flex-col bg-background overflow-hidden",
        selectedMessageId ? "hidden lg:flex w-80 lg:w-96" : "flex flex-1 md:w-80 lg:w-96"
      )}>
        <MessageList
          accountId={selectedAccountId}
          folder={selectedFolder}
          selectedId={selectedMessageId}
          onSelect={(id) => setSelectedMessageId(id)}
        />
      </div>

      {/* ── Message Reader / Empty State ─────────────── */}
      <div className={cn("flex-col min-w-0 bg-background overflow-hidden",
        selectedMessageId ? "flex flex-1" : "hidden lg:flex flex-1"
      )}>
        {selectedMessageId ? (
          <MessageReader
            messageId={selectedMessageId}
            onBack={() => setSelectedMessageId(null)}
            onDelete={() => setSelectedMessageId(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground select-none">
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 mb-4">
              <MailOpen className="h-14 w-14 opacity-25" />
            </div>
            <h2 className="text-lg font-semibold text-foreground/60 mb-1">No message selected</h2>
            <p className="text-sm">Select a message from the list to read it</p>
          </div>
        )}
      </div>
    </div>
  );
}
