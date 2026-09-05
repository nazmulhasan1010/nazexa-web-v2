/**
 * Central payment orchestration — create, select gateway, initiate, verify, fulfill.
 * Products never mark themselves paid; only this module transitions to PAID after verification.
 */

import { createHmac, randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { getAdapter } from '@/lib/payments/adapters';
import {
  appBaseUrl,
  paymentCallbackUrl,
  paymentWebhookUrl,
} from '@/lib/payments/endpoints';
import { getGatewayDef } from '@/lib/payments/registry';
import {
  parseConfig,
  sanitizeForStorage,
  sealConfig,
  truncatePayload,
  unsealConfig,
  type GatewayConfig,
} from '@/lib/payments/secrets';
import { isAllowlistedUrl } from '@/lib/payments/s2s-auth';
import type {
  GatewayConfigField,
  PaymentEnvironment,
  PaymentStatus,
} from '@/lib/payments/types';
import { NON_PAYABLE, TERMINAL_PAID } from '@/lib/payments/types';

function envFromConfig(config: GatewayConfig, rowEnv?: string | null): PaymentEnvironment {
  const fromConfig = (config.environment || config.sandbox || '').toLowerCase();
  if (fromConfig === 'production' || fromConfig === 'live' || fromConfig === 'false') return 'production';
  if (fromConfig === 'sandbox' || fromConfig === 'test' || fromConfig === 'true') return 'sandbox';
  return rowEnv === 'production' ? 'production' : 'sandbox';
}

export async function resolveAuthoritativeAmount(input: {
  product: string;
  planId: string;
  currency: string;
}): Promise<{ amount: number; planName: string; currency: string } | null> {
  const plan = await db.paymentProductPlan.findFirst({
    where: {
      productCode: input.product,
      planCode: input.planId,
      currency: input.currency.toUpperCase(),
      isActive: true,
    },
  });
  if (!plan) return null;
  return {
    amount: Number(plan.amount),
    planName: plan.planName,
    currency: plan.currency,
  };
}

export async function selectGateway(input: {
  currency: string;
  product: string;
  applicationClientId?: string | null;
  preferredGatewayCode?: string | null;
}) {
  const rows = await db.paymentGateway.findMany({
    where: { isEnabled: true },
    orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
  });

  const currency = input.currency.toUpperCase();
  const candidates = [];

  for (const row of rows) {
    const def = getGatewayDef(row.code);
    if (!def) continue;
    const config = parseConfig(row.config);
    const missing = def.fields.filter((f) => f.required && !String(config[f.key] ?? '').trim());
    if (missing.length) continue;

    if (def.currencies.length && !def.currencies.map((c) => c.toUpperCase()).includes(currency)) {
      // Also allow row-level supportedCurrencies override
      const rowCurrencies = (row.supportedCurrencies || '')
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      if (rowCurrencies.length && !rowCurrencies.includes(currency)) continue;
      if (!rowCurrencies.length) continue;
    }

    if (row.allowedProducts?.trim()) {
      const allowed = row.allowedProducts.split(',').map((p) => p.trim());
      if (!allowed.includes(input.product)) continue;
    }
    if (row.allowedApplications?.trim() && input.applicationClientId) {
      const allowed = row.allowedApplications.split(',').map((p) => p.trim());
      if (!allowed.includes(input.applicationClientId)) continue;
    }

    if (input.preferredGatewayCode && row.code !== input.preferredGatewayCode) continue;

    candidates.push(row);
  }

  if (input.preferredGatewayCode && candidates.length === 0) return null;
  return candidates[0] ?? null;
}

export async function createPaymentTransaction(input: {
  userId: string;
  appId: string;
  applicationClientId: string;
  product: string;
  productId?: string | null;
  planId: string;
  currency: string;
  successUrl?: string | null;
  cancelUrl?: string | null;
  metadata?: Record<string, unknown>;
  clientRequestId?: string | null;
  source?: string | null;
  /** Only used when no PaymentProductPlan exists AND caller is trusted internal — prefer plans. */
  fallbackAmount?: number | null;
}) {
  const currency = input.currency.toUpperCase();
  const authoritative = await resolveAuthoritativeAmount({
    product: input.product,
    planId: input.planId,
    currency,
  });

  if (!authoritative && (input.fallbackAmount == null || input.fallbackAmount <= 0)) {
    return { error: 'Unknown product plan or currency — configure PaymentProductPlan', status: 422 as const };
  }

  const amount = authoritative?.amount ?? Number(input.fallbackAmount);
  const planName = authoritative?.planName ?? input.planId;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Invalid amount', status: 400 as const };
  }

  const idempotencyKey = input.clientRequestId
    ? `${input.applicationClientId}:${input.userId}:${input.clientRequestId}`
    : null;

  if (idempotencyKey) {
    const existing = await db.paymentTransaction.findUnique({ where: { idempotencyKey } });
    if (existing) {
      const reusable = ['CREATED', 'REQUIRES_ACTION', 'INITIATED', 'PENDING', 'PROCESSING'].includes(
        existing.status,
      );
      const notExpired = !existing.expiresAt || existing.expiresAt > new Date();
      if (reusable && notExpired) {
        return { transaction: existing, reused: true as const };
      }
      // Free the key so a failed/cancelled/paid attempt does not block a new purchase
      await db.paymentTransaction.update({
        where: { id: existing.id },
        data: {
          idempotencyKey: `${idempotencyKey}:closed:${existing.id.slice(0, 8)}`,
        },
      });
    }
  }

  const app = await db.application.findUnique({ where: { id: input.appId } });
  if (!isAllowlistedUrl(input.successUrl, app?.allowedOrigins)) {
    return { error: 'Invalid success_url', status: 400 as const };
  }
  if (!isAllowlistedUrl(input.cancelUrl, app?.allowedOrigins)) {
    return { error: 'Invalid cancel_url', status: 400 as const };
  }

  const txn = await db.paymentTransaction.create({
    data: {
      publicId: randomUUID(),
      userId: input.userId,
      appId: input.appId,
      product: input.product,
      productId: input.productId ?? null,
      plan: planName,
      planId: input.planId,
      amount,
      currency,
      amountUsd: currency === 'USD' ? amount : 0,
      status: 'CREATED',
      source: input.source ?? app?.name ?? null,
      idempotencyKey,
      returnUrl: input.successUrl ?? null,
      cancelUrl: input.cancelUrl ?? null,
      metadata: JSON.stringify({
        ...(input.metadata ?? {}),
        // Do not trust client redirects later — only stored allowlisted URLs.
      }),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return { transaction: txn, reused: false as const };
}

export async function initiatePayment(input: {
  transactionId: string;
  gatewayId: string;
  userId: string;
}) {
  const txn = await db.paymentTransaction.findUnique({
    where: { id: input.transactionId },
    include: { user: true },
  });
  if (!txn || txn.userId !== input.userId) {
    return { error: 'Transaction not found', status: 404 as const };
  }
  if (NON_PAYABLE.has(txn.status as PaymentStatus) || txn.status === 'PENDING_REVIEW') {
    return { error: `Transaction is ${txn.status}`, status: 409 as const };
  }
  if (txn.expiresAt && txn.expiresAt < new Date()) {
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: { status: 'EXPIRED' },
    });
    return { error: 'Transaction expired', status: 410 as const };
  }

  const gateway = await db.paymentGateway.findUnique({ where: { id: input.gatewayId } });
  if (!gateway || !gateway.isEnabled) {
    return { error: 'Gateway unavailable', status: 400 as const };
  }

  const def = getGatewayDef(gateway.code);
  const adapter = getAdapter(gateway.code);
  if (!def || !adapter) {
    return { error: 'Unknown gateway', status: 400 as const };
  }

  const sealed = parseConfig(gateway.config);
  const config = unsealConfig(def.fields, sealed);
  const environment = envFromConfig(config, gateway.environment);

  const amount = txn.amount.toString();
  const result = await adapter.createPayment({
    transactionId: txn.id,
    publicId: txn.publicId,
    amount,
    currency: txn.currency,
    description: `${txn.product} — ${txn.plan}`,
    customer: {
      name: txn.user.name,
      email: txn.user.email,
      phone: null,
    },
    successUrl: `${paymentCallbackUrl(gateway.code, 'success')}?nazexa_transaction=${encodeURIComponent(txn.publicId)}`,
    failUrl: `${paymentCallbackUrl(gateway.code, 'fail')}?nazexa_transaction=${encodeURIComponent(txn.publicId)}`,
    cancelUrl: `${paymentCallbackUrl(gateway.code, 'cancel')}?nazexa_transaction=${encodeURIComponent(txn.publicId)}`,
    ipnUrl: paymentWebhookUrl(gateway.code),
    metadata: {
      nazexa_transaction_id: txn.publicId,
      product: txn.product,
      planId: txn.planId || txn.plan,
    },
    config,
    environment,
  });

  await db.paymentAttempt.create({
    data: {
      transactionId: txn.id,
      gatewayCode: gateway.code,
      status: result.ok ? 'INITIATED' : 'FAILED',
      gatewayOrderId: result.gatewayOrderId,
      gatewayPaymentId: result.gatewayPaymentId,
      gatewayTransactionId: result.gatewayTransactionId,
      responseSummary: truncatePayload(result.rawSummary || result.error || ''),
      errorMessage: result.error ?? null,
    },
  });

  if (!result.ok) {
    return { error: result.error || 'Payment initiation failed', status: 502 as const };
  }

  const nextStatus = result.requiresManualProof
    ? 'REQUIRES_ACTION'
    : result.redirectUrl
      ? 'INITIATED'
      : 'PENDING';

  const updated = await db.paymentTransaction.update({
    where: { id: txn.id },
    data: {
      gatewayId: gateway.id,
      status: nextStatus,
      gatewayOrderId: result.gatewayOrderId ?? undefined,
      gatewayPaymentId: result.gatewayPaymentId ?? undefined,
      gatewayTransactionId: result.gatewayTransactionId ?? undefined,
    },
  });

  return {
    transaction: updated,
    redirectUrl: result.redirectUrl,
    instructions: result.instructions,
    requiresManualProof: Boolean(result.requiresManualProof),
    checkout: def.checkout,
  };
}

export async function submitManualProof(input: {
  transactionId: string;
  userId: string;
  details: Record<string, string>;
}) {
  const txn = await db.paymentTransaction.findUnique({
    where: { id: input.transactionId },
    include: { gateway: true },
  });
  if (!txn || txn.userId !== input.userId) {
    return { error: 'Transaction not found', status: 404 as const };
  }
  if (!['CREATED', 'REQUIRES_ACTION', 'INITIATED', 'PENDING'].includes(txn.status)) {
    return { error: `Cannot submit proof for status ${txn.status}`, status: 409 as const };
  }
  if (!txn.gatewayId || !txn.gateway) {
    return { error: 'Select a gateway first', status: 400 as const };
  }

  const def = getGatewayDef(txn.gateway.code);
  if (!def) return { error: 'Unknown gateway', status: 400 as const };

  const missing = def.submissionFields.filter(
    (f) => f.required && !String(input.details[f.key] ?? '').trim(),
  );
  if (missing.length) {
    return {
      error: `Missing: ${missing.map((m) => m.label).join(', ')}`,
      status: 400 as const,
    };
  }

  await db.manualPaymentProof.create({
    data: {
      transactionId: txn.id,
      fields: input.details,
    },
  });

  const updated = await db.paymentTransaction.update({
    where: { id: txn.id },
    data: {
      status: 'PENDING_REVIEW',
      details: input.details,
      reference: input.details.transactionId || input.details.reference || null,
    },
  });

  // Local/sandbox bank transfers: auto-verify so plan purchase can complete without admin UI.
  // Production always requires admin review. Set PAYMENT_SANDBOX_AUTO_APPROVE=false to disable.
  const gatewayEnv = (txn.gateway.environment || 'sandbox').toLowerCase();
  const autoApproveEnabled = process.env.PAYMENT_SANDBOX_AUTO_APPROVE !== 'false';
  const isSandboxBank =
    autoApproveEnabled &&
    gatewayEnv !== 'production' &&
    txn.gateway.code === 'bank_transfer';

  if (isSandboxBank) {
    const paid = await markTransactionPaid({
      transactionId: txn.id,
      gatewayTransactionId: input.details.transactionId || input.details.reference || null,
      source: 'sandbox_auto',
    });
    if ('transaction' in paid && paid.transaction) {
      return { transaction: paid.transaction, autoApproved: true as const };
    }
  }

  return { transaction: updated };
}

/**
 * Mark PAID only after gateway verification or admin approval.
 * Idempotent: repeated calls on already-PAID return success without re-fulfilling twice.
 */
export async function markTransactionPaid(input: {
  transactionId: string;
  gatewayTransactionId?: string | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  verifiedAmount?: string | null;
  verifiedCurrency?: string | null;
  source: 'webhook' | 'callback_verify' | 'admin_approve' | 'status_poll' | 'sandbox_auto';
}) {
  const txn = await db.paymentTransaction.findUnique({
    where: { id: input.transactionId },
    include: { application: true },
  });
  if (!txn) return { error: 'Not found', status: 404 as const };

  if (TERMINAL_PAID.has(txn.status as PaymentStatus) && txn.status === 'PAID') {
    return { transaction: txn, alreadyPaid: true as const };
  }

  if (input.verifiedAmount != null) {
    const expected = Number(txn.amount);
    const got = Number(input.verifiedAmount);
    if (!Number.isFinite(got) || Math.abs(expected - got) > 0.001) {
      return { error: 'Amount mismatch', status: 400 as const };
    }
  }
  if (input.verifiedCurrency != null) {
    if (input.verifiedCurrency.toUpperCase() !== txn.currency.toUpperCase()) {
      return { error: 'Currency mismatch', status: 400 as const };
    }
  }

  const claimed = await db.paymentTransaction.updateMany({
    where: {
      id: txn.id,
      status: { notIn: ['PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED'] },
    },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      gatewayTransactionId: input.gatewayTransactionId ?? undefined,
      gatewayOrderId: input.gatewayOrderId ?? undefined,
      gatewayPaymentId: input.gatewayPaymentId ?? undefined,
      fulfillmentStatus: 'PENDING',
    },
  });

  if (claimed.count === 0) {
    const current = await db.paymentTransaction.findUnique({ where: { id: txn.id } });
    return { transaction: current!, alreadyPaid: true as const };
  }

  const paid = await db.paymentTransaction.findUnique({
    where: { id: txn.id },
    include: { application: true },
  });

  await fulfillTransaction(paid!.id);
  return { transaction: paid!, alreadyPaid: false as const };
}

export async function fulfillTransaction(transactionId: string) {
  const txn = await db.paymentTransaction.findUnique({
    where: { id: transactionId },
    include: { application: true },
  });
  if (!txn || txn.status !== 'PAID') return;

  if (txn.fulfillmentStatus === 'FULFILLED') return;

  const claim = await db.paymentTransaction.updateMany({
    where: { id: txn.id, fulfillmentStatus: { in: ['PENDING', 'FAILED'] } },
    data: { fulfillmentStatus: 'PROCESSING' },
  });
  if (claim.count === 0) return;

  const app = txn.application;
  if (!app?.paymentWebhookUrl) {
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: { fulfillmentStatus: 'SKIPPED', fulfilledAt: new Date() },
    });
    return;
  }

  try {
    const payload = {
      event: 'payment.paid',
      transactionId: txn.id,
      publicId: txn.publicId,
      userId: txn.userId,
      // Prefer local plan id from metadata when present; else slug/planId
      planId: (() => {
        try {
          const meta = txn.metadata ? JSON.parse(txn.metadata) : {};
          return meta.localPlanId || txn.planId || txn.plan;
        } catch {
          return txn.planId || txn.plan;
        }
      })(),
      status: 'paid',
      product: txn.product,
      amount: txn.amount.toString(),
      currency: txn.currency,
    };
    const body = JSON.stringify(payload);
    const hmacSecret =
      process.env.PAYMENT_WEBHOOK_SECRET ||
      process.env.NAZEXA_WEBHOOK_SECRET ||
      app.clientSecret;
    const signature = createHmac('sha256', hmacSecret).update(body).digest('hex');

    const res = await fetch(app.paymentWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': app.clientId,
        'x-client-secret': app.clientSecret,
        'x-nazexa-event': 'payment.paid',
        'x-nazexa-transaction': txn.publicId,
        'x-webhook-signature': `sha256=${signature}`,
      },
      body,
    });

    if (!res.ok) {
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          fulfillmentStatus: 'FAILED',
          failureReason: truncatePayload(`Fulfillment webhook HTTP ${res.status}`),
        },
      });
      return;
    }

    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: { fulfillmentStatus: 'FULFILLED', fulfilledAt: new Date() },
    });
  } catch (err) {
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: {
        fulfillmentStatus: 'FAILED',
        failureReason: truncatePayload(err instanceof Error ? err.message : 'fulfillment error'),
      },
    });
  }
}

export async function recordWebhookEvent(input: {
  gateway: string;
  eventId?: string | null;
  eventType?: string | null;
  transactionId?: string | null;
  payload: unknown;
  processingStatus: string;
  failureReason?: string | null;
}) {
  const payloadStr = truncatePayload(
    JSON.stringify(sanitizeForStorage(input.payload) ?? {}),
  );

  if (input.eventId) {
    const existing = await db.paymentWebhookEvent.findUnique({
      where: { gateway_eventId: { gateway: input.gateway, eventId: input.eventId } },
    });
    if (existing) {
      return { event: existing, duplicate: true as const };
    }
  }

  try {
    const event = await db.paymentWebhookEvent.create({
      data: {
        gateway: input.gateway,
        eventId: input.eventId ?? `anon-${randomUUID()}`,
        eventType: input.eventType,
        transactionId: input.transactionId,
        processingStatus: input.processingStatus,
        failureReason: input.failureReason,
        payload: payloadStr,
        processedAt: input.processingStatus === 'PROCESSED' ? new Date() : null,
      },
    });
    return { event, duplicate: false as const };
  } catch {
    // Unique race
    return { event: null, duplicate: true as const };
  }
}

export async function resolveSafeReturnUrl(txn: {
  returnUrl: string | null;
  cancelUrl: string | null;
  appId: string | null;
  publicId: string;
  status: string;
}): Promise<string> {
  const app = txn.appId
    ? await db.application.findUnique({ where: { id: txn.appId } })
    : null;

  const preferred = txn.status === 'PAID' || txn.status === 'PENDING_REVIEW' ? txn.returnUrl : txn.cancelUrl;
  if (preferred && isAllowlistedUrl(preferred, app?.allowedOrigins)) {
    try {
      const url = new URL(preferred);
      url.searchParams.set('nazexa_transaction', txn.publicId);
      url.searchParams.set('status', txn.status);
      return url.toString();
    } catch {
      // Fall through to status page if stored URL is malformed
    }
  }

  return `${appBaseUrl()}/checkout/status/${txn.publicId}`;
}

/** Persist admin gateway config with sealed secrets. */
export function prepareGatewayConfigForSave(
  fields: GatewayConfigField[],
  submitted: GatewayConfig,
  current: GatewayConfig,
  secretMask: string,
): GatewayConfig {
  const merged: GatewayConfig = {};
  for (const field of fields) {
    const value = submitted[field.key];
    if (field.secret && (value === secretMask || value === undefined)) {
      if (current[field.key]) merged[field.key] = current[field.key];
    } else if (value !== undefined && value !== null && String(value).trim()) {
      merged[field.key] = String(value).slice(0, 2000);
    }
  }
  return sealConfig(fields, merged);
}

