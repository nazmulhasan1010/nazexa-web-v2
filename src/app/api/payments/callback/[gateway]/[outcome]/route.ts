import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdapter } from '@/lib/payments/adapters';
import { getGatewayDef } from '@/lib/payments/registry';
import { parseConfig, unsealConfig } from '@/lib/payments/secrets';
import {
  markTransactionPaid,
  recordWebhookEvent,
  resolveSafeReturnUrl,
} from '@/lib/payments/orchestration';
import type { PaymentEnvironment } from '@/lib/payments/types';

function paramsFromSearch(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

async function paramsFromBody(req: NextRequest): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => ({}));
      if (json && typeof json === 'object') {
        for (const [k, v] of Object.entries(json)) {
          if (v != null && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
            out[k] = String(v);
          }
        }
      }
      return out;
    }
    const form = await req.formData().catch(() => null);
    if (form) {
      form.forEach((v, k) => {
        if (typeof v === 'string') out[k] = v;
      });
    }
  } catch {
    // ignore body parse errors
  }
  return out;
}

/**
 * Browser return from gateway. NEVER marks PAID without verifyPayment().
 * Redirects to allowlisted product URL after verification attempt.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ gateway: string; outcome: string }> },
) {
  return handleCallback(req, ctx, paramsFromSearch(req));
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ gateway: string; outcome: string }> },
) {
  // Some gateways POST form bodies (e.g. SSLCOMMERZ) — merge body + query.
  const bodyParams = await paramsFromBody(req);
  const params = { ...paramsFromSearch(req), ...bodyParams };
  return handleCallback(req, ctx, params);
}

async function handleCallback(
  req: NextRequest,
  ctx: { params: Promise<{ gateway: string; outcome: string }> },
  params: Record<string, string>,
) {
  const { gateway: gatewayCode, outcome } = await ctx.params;

  // Common reference keys across providers
  const publicId =
    params.nazexa_transaction ||
    params.tran_id ||
    params.merchantInvoiceNumber ||
    params.reference_id ||
    params.custom_data ||
    params.transaction_id ||
    params.tranId ||
    '';

  let txn = publicId
    ? await db.paymentTransaction.findFirst({
        where: {
          OR: [
            { publicId },
            { gatewayTransactionId: publicId },
            { gatewayOrderId: params.order_id || params.token || params.paymentID || publicId },
            { gatewayPaymentId: params.paymentID || params.payment_id || undefined },
          ],
        },
        include: { gateway: true, application: true },
      })
    : null;

  // Fallback: match by gateway payment/order ids in query/body
  if (!txn) {
    const orderId = params.token || params.order_id || params.session_id || params.paymentID || params.val_id;
    if (orderId) {
      txn = await db.paymentTransaction.findFirst({
        where: {
          OR: [
            { gatewayOrderId: orderId },
            { gatewayPaymentId: orderId },
            { gatewayTransactionId: orderId },
          ],
        },
        include: { gateway: true, application: true },
      });
    }
  }

  if (!txn) {
    return NextResponse.redirect(new URL('/checkout/failed?reason=unknown_transaction', req.url));
  }

  if (outcome === 'cancel' || outcome === 'fail') {
    if (!['PAID', 'PENDING_REVIEW', 'REFUNDED'].includes(txn.status)) {
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          status: outcome === 'cancel' ? 'CANCELLED' : 'FAILED',
          failureReason: outcome === 'cancel' ? 'User cancelled' : 'Gateway reported failure',
        },
      });
      txn = { ...txn, status: outcome === 'cancel' ? 'CANCELLED' : 'FAILED' };
    }
    const url = await resolveSafeReturnUrl(txn);
    return NextResponse.redirect(url);
  }

  // success path — verify with adapter; do not trust redirect alone
  const gatewayRow = txn.gateway;
  const def = gatewayRow ? getGatewayDef(gatewayRow.code) : getGatewayDef(gatewayCode);
  const adapter = getAdapter(gatewayRow?.code || gatewayCode);

  if (gatewayRow && def && adapter) {
    const config = unsealConfig(def.fields, parseConfig(gatewayRow.config));
    const environment = (gatewayRow.environment === 'production' ? 'production' : 'sandbox') as PaymentEnvironment;

    const verification = await adapter.verifyPayment({
      transactionId: txn.id,
      publicId: txn.publicId,
      amount: txn.amount.toString(),
      currency: txn.currency,
      gatewayOrderId: txn.gatewayOrderId,
      gatewayPaymentId: txn.gatewayPaymentId,
      gatewayTransactionId: txn.gatewayTransactionId,
      config,
      environment,
      callbackParams: params,
    });

    if (verification.ok && verification.paid) {
      await markTransactionPaid({
        transactionId: txn.id,
        gatewayTransactionId: verification.gatewayTransactionId,
        gatewayOrderId: verification.gatewayOrderId,
        gatewayPaymentId: verification.gatewayPaymentId,
        verifiedAmount: verification.amount,
        verifiedCurrency: verification.currency,
        source: 'callback_verify',
      });
      const refreshed = await db.paymentTransaction.findUnique({ where: { id: txn.id } });
      if (refreshed) txn = { ...txn, ...refreshed };
    } else if (verification.ok && !verification.paid) {
      // Still pending at provider — leave INITIATED/PROCESSING; webhook may complete later.
      if (!['PAID', 'PENDING_REVIEW'].includes(txn.status)) {
        await db.paymentTransaction.update({
          where: { id: txn.id },
          data: { status: 'PROCESSING' },
        });
        txn = { ...txn, status: 'PROCESSING' };
      }
    }
  }

  await recordWebhookEvent({
    gateway: gatewayCode,
    eventId: `callback:${txn.publicId}:${outcome}:${Date.now()}`,
    eventType: `callback.${outcome}`,
    transactionId: txn.id,
    payload: params,
    processingStatus: 'PROCESSED',
  });

  const url = await resolveSafeReturnUrl(txn);
  return NextResponse.redirect(url);
}
