import Link from 'next/link';

const REASONS: Record<string, { title: string; body: string }> = {
  unknown_transaction: {
    title: 'Payment not found',
    body: 'We could not match this return to a Nazexa payment. The session may have expired, or the gateway returned without a transaction reference.',
  },
  cancelled: {
    title: 'Payment cancelled',
    body: 'You cancelled the payment or the gateway reported a cancellation.',
  },
  failed: {
    title: 'Payment failed',
    body: 'The payment provider reported a failure. No charge should have completed — you can try again from your product account.',
  },
  expired: {
    title: 'Checkout expired',
    body: 'This checkout session is no longer valid. Start a new purchase from your product.',
  },
};

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason: raw } = await searchParams;
  const reason = (raw || 'unknown').toLowerCase();
  const copy = REASONS[reason] ?? {
    title: 'Checkout could not continue',
    body: 'Something went wrong while returning from the payment provider. You can safely close this page and retry from your product.',
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="border-border bg-card max-w-md rounded-xl border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Checkout</p>
        <h1 className="text-foreground mt-2 text-xl font-semibold">{copy.title}</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{copy.body}</p>
        {reason !== 'unknown' && (
          <p className="text-muted-foreground mt-4 font-mono text-xs">reason: {reason}</p>
        )}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="border-border text-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
