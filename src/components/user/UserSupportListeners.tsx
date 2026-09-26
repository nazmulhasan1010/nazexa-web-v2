'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useSocket } from '@/components/providers/SocketProvider';
import { useAuth } from '@/hooks/useAuth';
import { PremiumToast } from '@/components/admin/PremiumToast';
import { LifeBuoy } from 'lucide-react';

export function UserSupportListeners() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const processedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !user) return;

    const onReplyCreated = (data: any) => {
      // Don't toast if the user themselves sent it
      if (data.senderType === 'USER') return;

      const eventId = `reply-${data.messageId}`;
      if (processedEvents.current.has(eventId)) return;
      processedEvents.current.add(eventId);

      // We only toast if they aren't actively on this specific ticket page
      if (!pathname?.includes(`/support/tickets/${data.ticketId}`)) {
        toast.custom(
          (t) => (
            <PremiumToast
              id={t}
              title="New Support Reply"
              description={`Admin replied to Ticket #${data.ticketNumber || data.ticketId.slice(0, 8)}`}
              icon={<LifeBuoy className="h-4 w-4" />}
              action={{
                label: 'View',
                onClick: () => router.push(`/support/tickets/${data.ticketId}`),
              }}
            />
          ),
          { id: eventId, duration: 8000 }
        );

        // Optionally dispatch a custom event to update any navbar badges.
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('nazexa:support-unread'));
        }
      }
    };

    const onTicketUpdated = (data: any) => {
      const eventId = `ticket-updated-${data.ticketId}-${data.status}`;
      if (processedEvents.current.has(eventId)) return;
      processedEvents.current.add(eventId);

      if (!pathname?.includes(`/support/tickets/${data.ticketId}`)) {
        toast.custom(
          (t) => (
            <PremiumToast
              id={t}
              title="Ticket Status Changed"
              description={`Ticket #${data.ticketNumber || data.ticketId.slice(0, 8)} is now ${data.status}`}
              icon={<LifeBuoy className="h-4 w-4" />}
              action={{
                label: 'View',
                onClick: () => router.push(`/support/tickets/${data.ticketId}`),
              }}
            />
          ),
          { id: eventId, duration: 8000 }
        );
      }
    };

    socket.on('ticket.reply_created', onReplyCreated);
    socket.on('ticket.updated', onTicketUpdated);

    return () => {
      socket.off('ticket.reply_created', onReplyCreated);
      socket.off('ticket.updated', onTicketUpdated);
    };
  }, [socket, user, router, pathname]);

  return null;
}
