import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function CheckoutStatusPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const txn = await db.paymentTransaction.findUnique({ where: { publicId } });
  if (!txn) return notFound();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="border-border bg-card max-w-md rounded-xl border p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Payment status</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs">{txn.publicId}</p>
        <p className="mt-6 text-2xl font-bold">{txn.status}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {txn.currency} {txn.amount.toString()} · {txn.product} / {txn.plan}
        </p>
        {txn.status === 'PAID' ? (
          <p className="mt-4 text-sm text-emerald-600">Payment verified. Fulfillment: {txn.fulfillmentStatus}</p>
        ) : txn.status === 'PENDING_REVIEW' ? (
          <p className="mt-4 text-sm text-amber-600">Awaiting admin verification.</p>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Status updates after gateway verification or admin review — not from browser redirects alone.
          </p>
        )}
        <Link href="/" className="text-primary mt-6 inline-block text-sm underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
