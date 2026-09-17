/**
 * Stripe Checkout Sessions + webhook HMAC verification (stripe-signature t=,v1).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayConfigSchema,
  PaymentEnvironment,
  PaymentGatewayAdapter,
  PaymentStatusInput,
  PaymentStatusResult,
  RefundPaymentInput,
  RefundResult,
  ValidationResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
  WebhookResult,
  TestConnectionResult,
} from '@/lib/payments/types';
import { gatewayEndpoints, resolveBaseUrl } from '@/lib/payments/endpoints';
import {
  amountsMatch,
  asStringConfig,
  cfg,
  currenciesMatch,
  fromMinorUnits,
  jsonFetch,
  normalizeCurrency,
  requireFields,
  safeSummary,
  toMinorUnits,
} from './base';

function apiBase(environment: PaymentEnvironment): string {
  return (
    resolveBaseUrl('stripe', environment === 'sandbox' ? 'sandbox' : 'production') ||
    gatewayEndpoints.stripe.production
  );
}

function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSec = 300
): boolean {
  if (!header || !secret) return false;
  const parts = header.split(',').map((p) => p.trim());
  let timestamp = '';
  const signatures: string[] = [];
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k === 't') timestamp = v;
    if (k === 'v1' && v) signatures.push(v);
  }
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSec) return false;

  const signed = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');

  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, 'utf8');
    if (sigBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(sigBuf, expectedBuf);
  });
}

export const stripeAdapter: PaymentGatewayAdapter = {
  code: 'stripe',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        {
          key: 'publishableKey',
          label: 'Publishable key',
          type: 'text',
          required: true,
          placeholder: 'pk_live_…',
        },
        {
          key: 'secretKey',
          label: 'Secret key',
          type: 'password',
          required: true,
          placeholder: 'sk_live_…',
          secret: true,
        },
        {
          key: 'webhookSecret',
          label: 'Webhook signing secret',
          type: 'password',
          required: false,
          secret: true,
        },
        {
          key: 'environment',
          label: 'Environment',
          type: 'select',
          required: true,
          options: [
            { value: 'sandbox', label: 'Test' },
            { value: 'production', label: 'Live' },
          ],
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['publishableKey', 'secretKey']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join('; ') };
    }

    const secret = cfg(input.config, 'secretKey');
    const currency = normalizeCurrency(input.currency);
    const unitAmount = toMinorUnits(input.amount, currency);
    if (unitAmount == null || unitAmount <= 0) {
      return { ok: false, error: 'Invalid amount' };
    }

    const form: Record<string, string | number> = {
      mode: 'payment',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      'line_items[0][price_data][currency]': currency.toLowerCase(),
      'line_items[0][price_data][product_data][name]': input.description || 'Nazexa payment',
      'line_items[0][price_data][unit_amount]': unitAmount,
      'line_items[0][quantity]': 1,
      'metadata[transaction_id]': input.publicId,
      client_reference_id: input.publicId,
    };

    if (input.customer.email) {
      form.customer_email = input.customer.email;
    }

    const url = `${apiBase(input.environment)}${gatewayEndpoints.stripe.paths.checkoutSessions}`;
    const res = await jsonFetch<{
      id?: string;
      url?: string;
      payment_intent?: string;
      error?: { message?: string };
    }>(url, { method: 'POST', bearer: secret, form });

    if (!res.ok || !res.data?.url) {
      return {
        ok: false,
        error: res.data?.error?.message || res.error || 'Stripe session create failed',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: res.data.url,
      gatewayOrderId: res.data.id,
      gatewayPaymentId:
        typeof res.data.payment_intent === 'string' ? res.data.payment_intent : undefined,
      rawSummary: safeSummary({ id: res.data.id }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const secret = cfg(input.config, 'secretKey');
    const sessionId =
      input.gatewayOrderId ||
      input.callbackParams?.session_id ||
      input.callbackParams?.checkout_session_id;
    if (!secret || !sessionId) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: 'Missing Stripe session id or secret',
      };
    }

    const url = `${apiBase(input.environment)}${gatewayEndpoints.stripe.paths.checkoutSessions}/${encodeURIComponent(sessionId)}`;
    const res = await jsonFetch<{
      id?: string;
      payment_status?: string;
      status?: string;
      amount_total?: number;
      currency?: string;
      payment_intent?: string;
      metadata?: { transaction_id?: string };
      error?: { message?: string };
    }>(url, { method: 'GET', bearer: secret });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.data?.error?.message || res.error || 'Stripe retrieve failed',
      };
    }

    const paid = res.data.payment_status === 'paid';
    const currency = res.data.currency
      ? normalizeCurrency(res.data.currency)
      : normalizeCurrency(input.currency);
    const amount =
      res.data.amount_total != null ? fromMinorUnits(res.data.amount_total, currency) : undefined;

    const amountOk = amount == null || amountsMatch(input.amount, amount);
    const currencyOk = currenciesMatch(input.currency, currency);
    const metaOk =
      !res.data.metadata?.transaction_id || res.data.metadata.transaction_id === input.publicId;

    if (paid && (!amountOk || !currencyOk || !metaOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'Stripe session amount/currency/metadata mismatch',
        amount,
        currency,
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      paid: paid && amountOk && currencyOk && metaOk,
      status: paid ? 'PAID' : res.data.status === 'expired' ? 'EXPIRED' : 'PENDING',
      gatewayOrderId: res.data.id,
      gatewayPaymentId:
        typeof res.data.payment_intent === 'string' ? res.data.payment_intent : undefined,
      amount,
      currency,
      rawSummary: safeSummary({
        id: res.data.id,
        payment_status: res.data.payment_status,
      }),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const result = await this.verifyPayment({
      transactionId: '',
      publicId: '',
      amount: '0',
      currency: 'USD',
      gatewayOrderId: input.gatewayOrderId,
      gatewayPaymentId: input.gatewayPaymentId,
      gatewayTransactionId: input.gatewayTransactionId,
      config: input.config,
      environment: input.environment,
    });
    return {
      ok: result.ok,
      paid: result.paid,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      error: result.error,
    };
  },

  async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    const secret = cfg(input.config, 'secretKey');
    const paymentIntent = input.gatewayPaymentId;
    if (!secret || !paymentIntent) {
      return { ok: false, status: 'REFUND_FAILED', error: 'Missing payment intent or secret' };
    }
    const currency = normalizeCurrency(input.currency);
    const amount = toMinorUnits(input.amount, currency);
    const form: Record<string, string | number> = {
      payment_intent: paymentIntent,
    };
    if (amount != null) form.amount = amount;
    if (input.reason) form.reason = 'requested_by_customer';

    const url = `${apiBase(input.environment)}${gatewayEndpoints.stripe.paths.refunds}`;
    const res = await jsonFetch<{ id?: string; status?: string; error?: { message?: string } }>(
      url,
      { method: 'POST', bearer: secret, form }
    );
    if (!res.ok || !res.data?.id) {
      return {
        ok: false,
        status: 'REFUND_FAILED',
        error: res.data?.error?.message || res.error || 'Refund failed',
      };
    }
    return {
      ok: true,
      gatewayRefundId: res.data.id,
      status: res.data.status === 'succeeded' ? 'REFUNDED' : 'REFUND_PROCESSING',
    };
  },

  async handleWebhook(request: Request, config: Record<string, string>): Promise<WebhookResult> {
    const secret = cfg(config, 'webhookSecret');
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (secret && !verifyStripeSignature(payload, sig, secret)) {
      return { ok: false, httpStatus: 400, error: 'Invalid Stripe signature' };
    }

    let event: {
      id?: string;
      type?: string;
      data?: { object?: Record<string, unknown> };
    };
    try {
      event = JSON.parse(payload);
    } catch {
      return { ok: false, httpStatus: 400, error: 'Invalid JSON' };
    }

    const obj = (event.data?.object || {}) as {
      id?: string;
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      payment_intent?: string;
      metadata?: { transaction_id?: string };
      client_reference_id?: string;
    };

    const paid = event.type === 'checkout.session.completed' && obj.payment_status === 'paid';
    const currency = obj.currency ? normalizeCurrency(obj.currency) : undefined;
    const amount =
      obj.amount_total != null && currency ? fromMinorUnits(obj.amount_total, currency) : undefined;

    return {
      ok: true,
      eventId: event.id,
      eventType: event.type,
      transactionPublicId: obj.metadata?.transaction_id || obj.client_reference_id,
      gatewayOrderId: obj.id,
      gatewayPaymentId: typeof obj.payment_intent === 'string' ? obj.payment_intent : undefined,
      paid,
      amount,
      currency,
      httpStatus: 200,
      responseBody: JSON.stringify({ received: true }),
      rawPayloadSummary: safeSummary({ id: event.id, type: event.type }),
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const secret = cfg(config, 'secretKey');
    const res = await jsonFetch(`${apiBase(environment)}/v1/balance`, {
      method: 'GET',
      bearer: secret,
    });
    if (!res.ok) {
      return {
        ok: false,
        message: res.error || 'Stripe credential check failed',
        liveVerified: false,
      };
    }
    return { ok: true, message: 'Stripe credentials verified via /v1/balance', liveVerified: true };
  },
};
