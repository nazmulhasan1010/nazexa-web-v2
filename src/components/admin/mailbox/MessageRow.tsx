'use client';

import { formatDistanceToNow, format } from 'date-fns';
import { Star, Paperclip, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  _count?: { attachments: number };
}

interface MessageRowProps {
  message: Message;
  isSelected: boolean;
  onClick: () => void;
  onStar: (e: React.MouseEvent) => void;
}

export function MessageRow({ message, isSelected, onClick, onStar }: MessageRowProps) {
  const senderName = message.fromName || message.fromEmail;
  const date = new Date(message.date);
  const isToday = new Date().toDateString() === date.toDateString();
  const timeLabel = isToday ? format(date, 'HH:mm') : formatDistanceToNow(date, { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border/50 transition-colors group',
        isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-accent/50',
        !message.isRead && 'bg-blue-50/30 dark:bg-blue-950/10'
      )}
    >
      {/* Unread indicator */}
      <div className="mt-1 shrink-0">
        {!message.isRead ? (
          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
        ) : (
          <div className="h-2 w-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn(
            'text-sm truncate',
            !message.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
          )}>
            {senderName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">{timeLabel}</span>
        </div>

        <p className={cn(
          'text-sm truncate mb-0.5',
          !message.isRead ? 'font-medium text-foreground' : 'text-foreground/70'
        )}>
          {message.subject}
        </p>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground truncate flex-1">
            {message.preview || 'No preview available'}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {message.hasAttachment && (
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {message.isImportant && (
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
            )}
          </div>
        </div>

        {/* Account indicator for "all mailboxes" view */}
        {message.account && (
          <Badge variant="outline" className="mt-1 text-xs px-1.5 py-0 h-4 font-normal">
            {message.account.email}
          </Badge>
        )}
      </div>

      {/* Star action */}
      <button
        onClick={onStar}
        className={cn(
          'shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
          message.isStarred && 'opacity-100'
        )}
        title={message.isStarred ? 'Unstar' : 'Star'}
      >
        <Star className={cn(
          'h-4 w-4 transition-colors',
          message.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
        )} />
      </button>
    </div>
  );
}
