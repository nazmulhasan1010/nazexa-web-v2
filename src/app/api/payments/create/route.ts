import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { authenticateApplication } from '@/lib/payments/s2s-auth';
import { createPaymentTransaction } from '@/lib/payments/orchestration';
import { hasAvailableGateway } from '@/lib/payments/server';
import { appBaseUrl } from '@/lib/payments/endpoints';
import { clientIpFromHeaders } from '@/lib/admin/audit';

/**
 * S2S: Product creates a payment transaction.
 * Amount is NEVER trusted from the client — resolved from PaymentProductPlan.
 *
 * Body:
 * {
 *   client_id, client_secret,
 *   userId, product, planId, currency,
 *   clientRequestId?, success_url?, cancel_url?, metadata?,
 *   gatewayCode? (optional preference)
 * }
 */
export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  if (!rateLimit(`pay-create:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      client_id,
      client_secret,
      userId,
      product,
      productId,
      planId,
      plan,
      planSlug,
      currency,
      success_url,
      cancel_url,
      metadata,
      clientRequestId,
    } = body;

    const { app, error } = await authenticateApplication({
      clientId: client_id,
      clientSecret: client_secret,
      requiredScope: 'payments:create',
    });
    if (error || !app) return error!;

    const productCode = String(productId || product || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
    const resolvedPlanId =
      (typeof planSlug === 'string' && planSlug) ||
      (typeof planId === 'string' && planId) ||
      (typeof plan === 'string' && plan) ||
      '';

    if (!userId || !productCode || !resolvedPlanId || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, product, planId/planSlug, currency' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: String(userId) } });
    if (!user) {
      return NextResponse.json(
        {
          error: 'Central user not found for this account. Re-login via SSO.',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Central user account is not active', code: 'USER_INACTIVE' },
        { status: 403 }
      );
    }

    const hasGateway = await hasAvailableGateway({
      currency: String(currency),
      product: productCode,
    });
    if (!hasGateway) {
      const contactUrl = new URL(appBaseUrl());
      contactUrl.pathname = '/contact';
      contactUrl.searchParams.set('reason', 'no-gateway');
      contactUrl.searchParams.set('product', productCode);
      contactUrl.searchParams.set('plan', resolvedPlanId);
      return NextResponse.json({ redirectUrl: contactUrl.toString(), code: 'NO_GATEWAY' });
    }

    const result = await createPaymentTransaction({
      userId: user.id,
      appId: app.id,
      applicationClientId: app.clientId,
      product: productCode,
      productId: productCode,
      planId: resolvedPlanId,
      currency: String(currency),
      successUrl: success_url ? String(success_url) : null,
      cancelUrl: cancel_url ? String(cancel_url) : null,
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
      clientRequestId: clientRequestId ? String(clientRequestId).slice(0, 128) : null,
      source: app.name,
    });

    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const txn = result.transaction!;
    const checkoutUrl = `${appBaseUrl()}/checkout/${txn.publicId}`;

    return NextResponse.json({
      checkoutUrl,
      transactionId: txn.id,
      publicId: txn.publicId,
      status: txn.status,
      amount: txn.amount.toString(),
      currency: txn.currency,
      reused: result.reused,
    });
  } catch (err) {
    console.error('Payment create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
