import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { authenticateApplication } from '@/lib/payments/s2s-auth';

/**
 * Read transaction status — user session OR S2S with payments:status.
 * Never exposes secrets or raw gateway credentials.
 */
export async function GET(req: NextRequest) {
  const publicId = req.nextUrl.searchParams.get('publicId') || req.nextUrl.searchParams.get('id');
  if (!publicId) {
    return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
  }

  const txn = await db.paymentTransaction.findFirst({
    where: {
      OR: [{ publicId }, { id: publicId }],
    },
    include: {
      payment_gateways: { select: { code: true, displayName: true } },
    },
  });

  if (!txn) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const user = await getSession();
  let authorized = Boolean(user && user.id === txn.userId);

  if (!authorized) {
    const clientId = req.headers.get('x-client-id') || undefined;
    const clientSecret = req.headers.get('x-client-secret') || undefined;
    const { app, error } = await authenticateApplication({
      clientId,
      clientSecret,
      requiredScope: 'payments:status',
    });
    if (!error && app && app.id === txn.appId) authorized = true;
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    publicId: txn.publicId,
    status: txn.status,
    amount: txn.amount.toString(),
    currency: txn.currency,
    product: txn.product,
    plan: txn.plan,
    planId: txn.planId,
    gateway: txn.payment_gateways?.code ?? null,
    paidAt: txn.paidAt?.toISOString() ?? null,
    fulfillmentStatus: txn.fulfillmentStatus,
    userId: txn.userId,
    createdAt: txn.createdAt.toISOString(),
  });
}
