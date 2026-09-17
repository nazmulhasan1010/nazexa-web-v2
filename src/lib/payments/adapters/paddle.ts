/**
 * Paddle Billing — Bearer API key, POST /transactions, webhook Paddle-Signature (ts:h1).
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
  isSandbox,
  jsonFetch,
  normalizeCurrency,
  parseAmount,
  requireFields,
  safeSummary,
  toMinorUnits,
} from './base';

function baseUrl(environment: PaymentEnvironment, config: Record<string, string>): string {
  const env = isSandbox(environment, config) ? 'sandbox' : 'production';
  return resolveBaseUrl('paddle', env) || gatewayEndpoints.paddle.sandbox;
}

function verifyPaddleSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSec = 300
): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(';').map((p) => {
      const [k, ...rest] = p.trim().split('=');
      return [k, rest.join('=')];
    })
  ) as Record<string, string>;

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(ts));
  if (!Number.isFinite(age) || age > toleranceSec) return false;

  const signed = `${ts}:${payload}`;
  const expected = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(h1, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const paddleAdapter: PaymentGatewayAdapter = {
  code: 'paddle',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'vendorId', label: 'Vendor / Seller ID', type: 'text', required: false },
        { key: 'apiKey', label: 'API key', type: 'password', required: true, secret: true },
        {
          key: 'priceId',
          label: 'Default Price ID',
          type: 'text',
          required: false,
          help: 'Optional Paddle price_… id. If empty, ad-hoc unit_price is used.',
        },
        {
          key: 'webhookSecret',
          label: 'Webhook secret',
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
            { value: 'sandbox', label: 'Sandbox' },
            { value: 'production', label: 'Live' },
          ],
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['apiKey']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    const currency = normalizeCurrency(input.currency);
    const minor = toMinorUnits(input.amount, currency);
    if (minor == null || minor <= 0) return { ok: false, error: 'Invalid amount' };

    const priceId = cfg(input.config, 'priceId');
    const items = priceId
      ? [{ quantity: 1, price_id: priceId }]
      : [
          {
            quantity: 1,
            price: {
              description: input.description || 'Nazexa payment',
              name: input.description || 'Nazexa payment',
              unit_price: {
                amount: String(minor),
                currency_code: currency,
              },
              product: {
                name: input.description || 'Nazexa payment',
                tax_category: 'standard',
              },
            },
          },
        ];

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paddle.paths.transactions}`;
    const res = await jsonFetch<{
      data?: {
        id?: string;
        status?: string;
        checkout?: { url?: string };
        details?: { totals?: { total?: string; currency_code?: string } };
      };
      error?: { detail?: string };
    }>(url, {
      method: 'POST',
      bearer: cfg(input.config, 'apiKey'),
      headers: {
        'Paddle-Version': '1',
      },
      body: {
        items,
        currency_code: currency,
        collection_mode: 'automatic',
        custom_data: {
          nazexaTransactionId: input.publicId,
          transaction_id: input.publicId,
        },
        checkout: {
          url: input.successUrl,
        },
      },
    });

    const checkoutUrl = res.data?.data?.checkout?.url;
    const txnId = res.data?.data?.id;
    if (!res.ok || !checkoutUrl || !txnId) {
      return {
        ok: false,
        error: res.data?.error?.detail || res.error || 'Paddle transaction create failed',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: checkoutUrl,
      gatewayOrderId: txnId,
      gatewayTransactionId: txnId,
      rawSummary: safeSummary({ id: txnId, status: res.data?.data?.status }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const txnId =
      input.gatewayOrderId ||
      input.gatewayTransactionId ||
      input.callbackParams?.transaction_id ||
      input.callbackParams?.txn_id;
    if (!txnId) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing Paddle transaction id' };
    }

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paddle.paths.transactions}/${encodeURIComponent(txnId)}`;
    const res = await jsonFetch<{
      data?: {
        id?: string;
        status?: string;
        custom_data?: { nazexaTransactionId?: string; transaction_id?: string };
        details?: { totals?: { total?: string; currency_code?: string } };
        currency_code?: string;
      };
      error?: { detail?: string };
    }>(url, {
      method: 'GET',
      bearer: cfg(input.config, 'apiKey'),
      headers: { 'Paddle-Version': '1' },
    });

    if (!res.ok || !res.data?.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.data?.error?.detail || res.error || 'Paddle retrieve failed',
      };
    }

    const data = res.data.data;
    const paid = data.status === 'completed' || data.status === 'paid';
    const totalMinor = data.details?.totals?.total;
    const currency = data.details?.totals?.currency_code || data.currency_code;
    let amount: string | undefined;
    if (totalMinor != null && currency) {
      const n = parseAmount(totalMinor);
      // Paddle Billing totals are minor units (cents) as a string.
      if (n != null) amount = (n / 100).toFixed(2);
    }

    const amountOk = amount == null || amountsMatch(input.amount, amount);
    const currencyOk = !currency || currenciesMatch(input.currency, currency);
    const ref = data.custom_data?.nazexaTransactionId || data.custom_data?.transaction_id;
    const refOk = !ref || ref === input.publicId;

    if (paid && (!amountOk || !currencyOk || !refOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'Paddle amount/currency/custom_data mismatch',
        amount,
        currency: currency ? normalizeCurrency(currency) : undefined,
        rawSummary: safeSummary(data),
      };
    }

    return {
      ok: true,
      paid: Boolean(paid && amountOk && currencyOk && refOk),
      status: paid ? 'PAID' : data.status === 'canceled' ? 'CANCELLED' : 'PENDING',
      gatewayOrderId: data.id,
      gatewayTransactionId: data.id,
      amount,
      currency: currency ? normalizeCurrency(currency) : undefined,
      rawSummary: safeSummary({ id: data.id, status: data.status }),
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
    const txnId = input.gatewayOrderId || input.gatewayTransactionId;
    if (!txnId) {
      return { ok: false, status: 'REFUND_FAILED', error: 'Missing transaction id' };
    }
    const url = `${baseUrl(input.environment, input.config)}/adjustments`;
    const currency = normalizeCurrency(input.currency);
    const minor = toMinorUnits(input.amount, currency);
    const res = await jsonFetch<{
      data?: { id?: string; status?: string };
      error?: { detail?: string };
    }>(url, {
      method: 'POST',
      bearer: cfg(input.config, 'apiKey'),
      headers: { 'Paddle-Version': '1' },
      body: {
        action: 'refund',
        transaction_id: txnId,
        reason: input.reason || 'Refund requested',
        type: 'full',
        ...(minor != null
          ? {
              type: 'partial',
              items: [{ type: 'partial', amount: String(minor) }],
            }
          : {}),
      },
    });
    if (!res.ok || !res.data?.data?.id) {
      return {
        ok: false,
        status: 'REFUND_FAILED',
        error: res.data?.error?.detail || res.error || 'Refund failed',
      };
    }
    return {
      ok: true,
      gatewayRefundId: res.data.data.id,
      status:
        res.data.data.status === 'approved' || res.data.data.status === 'completed'
          ? 'REFUNDED'
          : 'REFUND_PROCESSING',
    };
  },

  async handleWebhook(request: Request, config: Record<string, string>): Promise<WebhookResult> {
    const payload = await request.text();
    const signature = request.headers.get('paddle-signature');
    const secret = cfg(config, 'webhookSecret');

    if (secret && !verifyPaddleSignature(payload, signature, secret)) {
      return { ok: false, httpStatus: 400, error: 'Invalid Paddle signature' };
    }

    let event: {
      event_id?: string;
      event_type?: string;
      data?: {
        id?: string;
        status?: string;
        custom_data?: { nazexaTransactionId?: string; transaction_id?: string };
        details?: { totals?: { total?: string; currency_code?: string } };
        currency_code?: string;
      };
    };
    try {
      event = JSON.parse(payload);
    } catch {
      return { ok: false, httpStatus: 400, error: 'Invalid JSON' };
    }

    const data = event.data;
    const paid =
      event.event_type === 'transaction.completed' ||
      data?.status === 'completed' ||
      data?.status === 'paid';

    let amount: string | undefined;
    const totalMinor = data?.details?.totals?.total;
    const currency = data?.details?.totals?.currency_code || data?.currency_code;
    if (totalMinor != null) {
      const n = parseAmount(totalMinor);
      if (n != null) amount = (n / 100).toFixed(2);
    }

    return {
      ok: true,
      eventId: event.event_id,
      eventType: event.event_type,
      transactionPublicId:
        data?.custom_data?.nazexaTransactionId || data?.custom_data?.transaction_id,
      gatewayOrderId: data?.id,
      gatewayTransactionId: data?.id,
      paid,
      amount,
      currency: currency ? normalizeCurrency(currency) : undefined,
      httpStatus: 200,
      responseBody: JSON.stringify({ received: true }),
      rawPayloadSummary: safeSummary({ event_id: event.event_id, type: event.event_type }),
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const res = await jsonFetch(`${baseUrl(environment, config)}/event-types`, {
      method: 'GET',
      bearer: cfg(config, 'apiKey'),
      headers: { 'Paddle-Version': '1' },
    });
    if (!res.ok) {
      return { ok: false, message: res.error || 'Paddle auth failed', liveVerified: false };
    }
    return { ok: true, message: 'Paddle API key verified', liveVerified: true };
  },
};
