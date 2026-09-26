'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSocket } from '@/components/providers/SocketProvider';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PremiumToast } from '@/components/admin/PremiumToast';
import { CreditCard, MessageSquare, LifeBuoy, Inbox } from 'lucide-react';

export function AdminSocketListeners({
  setPendingPaymentCount,
  setUnreadMessageCount,
  setUnreadSupportCount,
  setMailboxUnreadCount,
  onAiUsage,
}: {
  setPendingPaymentCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadSupportCount: React.Dispatch<React.SetStateAction<number>>;
  setMailboxUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  onAiUsage?: (data: any) => void;
}) {
  const { user } = useAdminAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const processedEvents = useRef<Set<string>>(new Set());
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    if (!socket || !user) return;

    const canSeePayments =
      user.permissions.includes('*') || user.permissions.includes('/admin/payments');

    if (canSeePayments) {
      const onPaymentCreated = (data: any) => {
        const eventId = data.paymentId || JSON.stringify(data);
        if (processedEvents.current.has(eventId)) return;
        processedEvents.current.add(eventId);

        setPendingPaymentCount((prev) => prev + 1);
        const toastId = `payment-${eventId}`;

        toast.custom(
          (t) => (
            <PremiumToast
              id={t}
              title="New Payment Request"
              description={`Custom payment requires review.\nUser: ${data.userName || data.userEmail}\nPlan: ${data.plan}\nMethod: ${data.paymentMethod}\nAmount: ${data.amount} ${data.currency}`}
              icon={<CreditCard className="h-4 w-4" />}
              action={{
                label: 'Review',
                onClick: () => router.push('/admin/payments'),
              }}
            />
          ),
          { id: toastId, duration: 10000 }
        );
      };

      const onPaymentResolved = () => {
        setPendingPaymentCount((prev) => Math.max(0, prev - 1));
      };

      socket.on('payment.request.created', onPaymentCreated);
      socket.on('payment.request.approved', onPaymentResolved);
      socket.on('payment.request.rejected', onPaymentResolved);

      return () => {
        socket.off('payment.request.created', onPaymentCreated);
        socket.off('payment.request.approved', onPaymentResolved);
        socket.off('payment.request.rejected', onPaymentResolved);
      };
    }
  }, [socket, user, router, setPendingPaymentCount]);

  useEffect(() => {
    if (!socket || !user) return;

    const canSeeMessages =
      user.permissions.includes('*') || user.permissions.includes('/admin/messages');

    if (canSeeMessages) {
      const onMessageCreated = (data: any) => {
        const eventId = data.messageId || JSON.stringify(data);
        if (processedEvents.current.has(eventId)) return;
        processedEvents.current.add(eventId);

        setUnreadMessageCount((prev) => prev + 1);
        const toastId = `msg-${eventId}`;

        toast.custom(
          (t) => (
            <PremiumToast
              id={t}
              title="New Contact Message"
              description={`From: ${data.name} (${data.email})\n\n"${data.preview}"`}
              icon={<MessageSquare className="h-4 w-4" />}
              action={{
                label: 'View',
                onClick: () => router.push('/admin/messages'),
              }}
            />
          ),
          { id: toastId, duration: 8000 }
        );
      };

      const onMessagesRead = (data: any) => {
        const readCount = data?.count || 1;
        setUnreadMessageCount((prev) => Math.max(0, prev - readCount));
      };

      socket.on('contact.message.created', onMessageCreated);
      socket.on('contact.messages.read', onMessagesRead);

      return () => {
        socket.off('contact.message.created', onMessageCreated);
        socket.off('contact.messages.read', onMessagesRead);
      };
    }
  }, [socket, user, router, setUnreadMessageCount]);

  // Support tickets telemetry
  useEffect(() => {
    if (!socket || !user) return;

    const canSeeSupport = user.permissions.includes('*') || user.permissions.includes('/admin/support');
    if (!canSeeSupport) return;

    const onTicketCreated = (data: any) => {
      const eventId = `ticket-${data.ticketId}`;
      if (processedEvents.current.has(eventId)) return;
      processedEvents.current.add(eventId);

      setUnreadSupportCount((prev) => prev + 1);

      if (!pathname.includes(`/admin/support`)) {
        toast.custom(
          (t) => (
            <PremiumToast
              id={t}
              title="New Support Ticket"
              description={`Ticket #${data.ticketNumber} was submitted.`}
              icon={<LifeBuoy className="h-4 w-4" />}
              action={{
                label: 'View',
                onClick: () => router.push(`/admin/support/${data.ticketId}`),
              }}
            />
          ),
          { id: eventId, duration: 8000 }
        );
      }
    };

    const onReplyCreated = (data: any) => {
      if (data.senderType === 'ADMIN') return; // Don't notify self

      const eventId = `reply-${data.messageId}`;
      if (processedEvents.current.has(eventId)) return;
      processedEvents.current.add(eventId);

      setUnreadSupportCount((prev) => prev + 1);

      if (!pathname.includes(`/admin/support/${data.ticketId}`)) {
        toast.custom(
          (t) => (
            <PremiumToast
              id={t}
              title="New Ticket Reply"
              description={`User replied to Ticket #${data.ticketNumber || data.ticketId.slice(0, 8)}`}
              icon={<LifeBuoy className="h-4 w-4" />}
              action={{
                label: 'View',
                onClick: () => router.push(`/admin/support/${data.ticketId}`),
              }}
            />
          ),
          { id: eventId, duration: 8000 }
        );
      }
    };

    const onTicketChange = () => {
      // Re-fetch count securely instead of blindly updating
      fetch('/api/admin/support/unread-count')
        .then(r => r.json())
        .then(d => {
          if (d.success) setUnreadSupportCount(d.count);
        });
    };

    socket.on('ticket.created', onTicketCreated);
    socket.on('ticket.reply_created', onReplyCreated);
    socket.on('ticket.updated', onTicketChange);
    socket.on('ticket.deleted', onTicketChange);

    return () => {
      socket.off('ticket.created', onTicketCreated);
      socket.off('ticket.reply_created', onReplyCreated);
      socket.off('ticket.updated', onTicketChange);
      socket.off('ticket.deleted', onTicketChange);
    };
  }, [socket, user, router, setUnreadSupportCount, pathname]);

  // AI usage telemetry — keeps the AI analytics + overview surfaces live.
  useEffect(() => {
    if (!socket || !user || !onAiUsage) return;

    const canSeeAi =
      user.permissions.includes('*') || user.permissions.includes('/admin/ai-management');
    if (!canSeeAi) return;

    const onUsage = (data: any) => onAiUsage(data);
    socket.on('ai.usage.recorded', onUsage);

    return () => {
      socket.off('ai.usage.recorded', onUsage);
    };
  }, [socket, user, onAiUsage]);

  // Mail.new — new email arrived via sync
  useEffect(() => {
    if (!socket || !user) return;

    const canSeeMail = user.permissions.includes('*') || user.permissions.includes('/admin/mailbox');
    if (!canSeeMail) return;

    const onMailNew = (data: any) => {
      const eventId = `mail-${data.accountId}-${Date.now()}`;
      if (processedEvents.current.has(eventId)) return;
      processedEvents.current.add(eventId);

      // Refresh unread count from server
      fetch('/api/admin/mailbox/unread-count')
        .then(r => r.json())
        .then(d => { if (d.total !== undefined) setMailboxUnreadCount(d.total); });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nazexa:mail-refresh'));
      }

      const count = data.count || 1;
      toast.custom(
        (t) => (
          <PremiumToast
            id={t}
            title="New Mail"
            description={`${count} new message${count > 1 ? 's' : ''} in ${data.email}`}
            icon={<Inbox className="h-4 w-4" />}
            action={{
              label: 'Open',
              onClick: () => router.push('/admin/mailbox'),
            }}
          />
        ),
        { id: eventId, duration: 8000 }
      );
    };

    socket.on('mail.new', onMailNew);
    return () => { socket.off('mail.new', onMailNew); };
  }, [socket, user, router, setMailboxUnreadCount]);

  return null;
}
