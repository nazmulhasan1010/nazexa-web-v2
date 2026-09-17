'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { adminApi, type AdminPaymentRequest } from '@/lib/admin/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { useSocket } from '@/components/providers/SocketProvider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-500/40 text-amber-600',
  PENDING_REVIEW: 'border-amber-500/40 text-amber-600',
  REQUIRES_ACTION: 'border-amber-500/40 text-amber-600',
  CREATED: 'border-border text-muted-foreground',
  INITIATED: 'border-blue-500/40 text-blue-600',
  PROCESSING: 'border-blue-500/40 text-blue-600',
  approved: 'border-emerald-500/40 text-emerald-600',
  PAID: 'border-emerald-500/40 text-emerald-600',
  paid: 'border-emerald-500/40 text-emerald-600',
  rejected: 'border-destructive/40 text-destructive',
  FAILED: 'border-destructive/40 text-destructive',
  cancelled: 'border-border text-muted-foreground',
  CANCELLED: 'border-border text-muted-foreground',
};

export function PaymentRequestsTable({
  onPendingCountChange,
}: {
  onPendingCountChange?: (count: number) => void;
}) {
  const [items, setItems] = useState<AdminPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminPaymentRequest | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 'all' is not a status the API filters on — send it as empty.
      const data = await adminApi.paymentRequests({
        status: status === 'all' ? '' : status,
        page,
      });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      onPendingCountChange?.(data.pendingCount);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  }, [status, page, onPendingCountChange]);

  const { socket } = useSocket();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    // Refresh the table when relevant payment events occur
    socket.on('payment.request.created', load);
    socket.on('payment.request.approved', load);
    socket.on('payment.request.rejected', load);

    return () => {
      socket.off('payment.request.created', load);
      socket.off('payment.request.approved', load);
      socket.off('payment.request.rejected', load);
    };
  }, [socket, load]);

  const review = async (id: string, action: 'approve' | 'reject', reviewNote?: string) => {
    setReviewing(id);
    try {
      await adminApi.reviewPaymentRequest({ id, action, note: reviewNote });
      toast.success(
        action === 'approve' ? 'Payment approved — plan activated' : 'Payment rejected'
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="PENDING_REVIEW">PENDING_REVIEW</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No {status === 'all' ? '' : status} payment requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="border-border/60 rounded-lg border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.planName}</span>
                    <Badge variant="outline" className={cn('text-[10px]', STATUS_STYLES[r.status])}>
                      {r.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {r.gatewayName}
                    </Badge>
                    <span className="text-sm font-medium tabular-nums">
                      {r.amount} {r.currency}
                    </span>
                    {r.currency !== 'USD' && (
                      <span className="text-muted-foreground text-xs tabular-nums">
                        (${r.amountUsd})
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground text-sm">
                    {r.user.name || 'Unnamed'} · {r.user.email}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {Object.entries(r.details).map(([key, value]) => (
                      <span key={key}>
                        <span className="text-muted-foreground">{r.detailLabels[key] ?? key}:</span>{' '}
                        <span className="font-mono">{value}</span>
                      </span>
                    ))}
                  </div>

                  <div className="text-muted-foreground text-[11px]">
                    Submitted {new Date(r.createdAt).toLocaleString()}
                    {r.reviewedAt && ` · reviewed ${new Date(r.reviewedAt).toLocaleString()}`}
                  </div>

                  {r.adminNote && (
                    <p className="text-muted-foreground text-xs">Note: {r.adminNote}</p>
                  )}
                </div>

                {r.status === 'pending' ||
                r.status === 'PENDING_REVIEW' ||
                r.status === 'REQUIRES_ACTION' ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={reviewing === r.id}
                      onClick={() => void review(r.id, 'approve')}
                    >
                      {reviewing === r.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={reviewing === r.id}
                      onClick={() => {
                        setRejectTarget(r);
                        setNote('');
                      }}
                    >
                      <X className="size-3.5" />
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      )}

      <AlertDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejectTarget && (
                <>
                  {rejectTarget.user.email} claimed a {rejectTarget.amount} {rejectTarget.currency}{' '}
                  payment for {rejectTarget.planName}. The plan will not be activated. Your note is
                  shown to them.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Reason (optional) — e.g. transaction ID not found"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = rejectTarget;
                setRejectTarget(null);
                if (target) void review(target.id, 'reject', note);
              }}
            >
              Reject payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
