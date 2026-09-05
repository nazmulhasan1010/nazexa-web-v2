import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getAvailableGateways } from '@/lib/payments/server';
import CheckoutClient from './CheckoutClient';
import { getSession } from '@/lib/auth';

const RESERVED_CHECKOUT_SLUGS = new Set(['error', 'failed', 'status', 'return']);

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Avoid colliding with static routes / Next.js special files (e.g. /checkout/error)
  if (!id || RESERVED_CHECKOUT_SLUGS.has(id.toLowerCase())) {
    redirect(`/checkout/failed?reason=${id === 'error' ? 'unknown_transaction' : 'unknown'}`);
  }

  const user = await getSession();
  if (!user) {
    redirect('/login?redirect=' + encodeURIComponent('/checkout/' + id));
  }

  const txn = await db.paymentTransaction.findFirst({
    where: {
      OR: [{ publicId: id }, { id }],
    },
  });

  if (!txn) {
    redirect('/checkout/failed?reason=unknown_transaction');
  }

  if (txn.userId !== user.id) {
    return (
              <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="w-full max-w-md rounded-lg bg-card p-6 text-center shadow-sm border">
            <h2 className="text-destructive font-bold text-lg mb-2">Account Mismatch</h2>
            <p className="text-muted-foreground mb-4">
              This checkout session belongs to a different Nazexa account. You are currently logged into Nazexa Web with a different email.
            </p>
            <p className="text-sm mb-6">
              Please log out and log back in with the account you used on the product page.
            </p>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Log Out
              </button>
            </form>
          </div>
        </div>
    );
  }

  const gateways = await getAvailableGateways({
    currency: txn.currency,
    product: txn.product,
  });

  const safeTxn = {
    id: txn.id,
    publicId: txn.publicId,
    status: txn.status,
    product: txn.product,
    plan: txn.plan,
    amount: txn.amount.toString(),
    currency: txn.currency,
  };

  return (
    <div className="bg-background min-h-screen px-4 py-12 sm:px-6 lg:px-8 grid place-items-center">
      <div className="bg-card text-card-foreground border-border mx-auto min-w-lg rounded-xl border p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground mt-2">
            {txn.product} — {txn.plan}
          </p>
          <div className="text-foreground mt-4 text-3xl font-bold">
            {txn.currency} {txn.amount.toString()}
          </div>
          <p className="text-muted-foreground mt-2 font-mono text-xs">{txn.publicId}</p>
        </div>

        <CheckoutClient transaction={safeTxn} gateways={gateways} />
      </div>
    </div>
  );
}
