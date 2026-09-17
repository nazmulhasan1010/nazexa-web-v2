'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSocket } from '@/components/providers/SocketProvider';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { PremiumToast } from '@/components/admin/PremiumToast';
import { CreditCard, MessageSquare } from 'lucide-react';

export function AdminSocketListeners({
  setPendingPaymentCount,
  setUnreadMessageCount,
  onAiUsage,
}: {
  setPendingPaymentCount: React.Dispatch<React.SetStateAction<number>>;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<number>>;
  onAiUsage?: (data: any) => void;
}) {
  const { user } = useAdminAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const processedEvents = useRef<Set<string>>(new Set());

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

  return null;
}
