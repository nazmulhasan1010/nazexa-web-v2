/**
 * Razorpay — Basic auth orders (paise), HMAC verify, webhook X-Razorpay-Signature.
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
    resolveBaseUrl('razorpay', environment === 'sandbox' ? 'sandbox' : 'production') ||
    gatewayEndpoints.razorpay.production
  );
}

function auth(config: Record<string, string>) {
  return {
    username: cfg(config, 'keyId'),
    password: cfg(config, 'keySecret'),
  };
}

function hmacHex(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const razorpayAdapter: PaymentGatewayAdapter = {
  code: 'razorpay',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        {
          key: 'keyId',
          label: 'Key ID',
          type: 'text',
          required: true,
          placeholder: 'rzp_live_…',
        },
        {
          key: 'keySecret',
          label: 'Key secret',
          type: 'password',
          required: true,
          secret: true,
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
            { value: 'sandbox', label: 'Test' },
            { value: 'production', label: 'Live' },
          ],
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['keyId', 'keySecret']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    const currency = normalizeCurrency(input.currency);
    const amountPaise = toMinorUnits(input.amount, currency);
    if (amountPaise == null || amountPaise <= 0) {
      return { ok: false, error: 'Invalid amount' };
    }

    const ordersUrl = `${apiBase(input.environment)}${gatewayEndpoints.razorpay.paths.orders}`;
    const orderRes = await jsonFetch<{
      id?: string;
      amount?: number;
      currency?: string;
      error?: { description?: string };
    }>(ordersUrl, {
      method: 'POST',
      basicAuth: auth(input.config),
      body: {
        amount: amountPaise,
        currency,
        receipt: input.publicId.slice(0, 40),
        notes: {
          nazexa_transaction_id: input.publicId,
          transaction_id: input.publicId,
        },
      },
    });

    if (!orderRes.ok || !orderRes.data?.id) {
      return {
        ok: false,
        error:
          orderRes.data?.error?.description || orderRes.error || 'Razorpay order create failed',
        rawSummary: safeSummary(orderRes.data),
      };
    }

    // Hosted redirect via Payment Links (order alone has no checkout URL).
    const linkRes = await jsonFetch<{
      id?: string;
      short_url?: string;
      error?: { description?: string };
    }>(`${apiBase(input.environment)}/v1/payment_links`, {
      method: 'POST',
      basicAuth: auth(input.config),
      body: {
        amount: amountPaise,
        currency,
        accept_partial: false,
        reference_id: input.publicId.slice(0, 40),
        description: input.description || 'Nazexa payment',
        callback_url: input.successUrl,
        callback_method: 'get',
        notes: {
          nazexa_transaction_id: input.publicId,
          razorpay_order_id: orderRes.data.id,
        },
      },
    });

    if (!linkRes.ok || !linkRes.data?.short_url) {
      return {
        ok: false,
        error:
          linkRes.data?.error?.description ||
          linkRes.error ||
          'Razorpay payment link create failed (order was created)',
        gatewayOrderId: orderRes.data.id,
        rawSummary: safeSummary({ order: orderRes.data, link: linkRes.data }),
      };
    }

    return {
      ok: true,
      redirectUrl: linkRes.data.short_url,
      gatewayOrderId: orderRes.data.id,
      gatewayPaymentId: linkRes.data.id,
      rawSummary: safeSummary({ orderId: orderRes.data.id, linkId: linkRes.data.id }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const keySecret = cfg(input.config, 'keySecret');
    const orderId =
      input.gatewayOrderId ||
      input.callbackParams?.razorpay_order_id ||
      input.callbackParams?.order_id;
    const paymentId =
      input.gatewayPaymentId ||
      input.callbackParams?.razorpay_payment_id ||
      input.callbackParams?.payment_id;
    const signature = input.callbackParams?.razorpay_signature || input.callbackParams?.signature;

    if (orderId && paymentId && signature && keySecret) {
      const expected = hmacHex(keySecret, `${orderId}|${paymentId}`);
      if (!safeEqualHex(expected, signature)) {
        return {
          ok: false,
          paid: false,
          status: 'FAILED',
          error: 'Invalid Razorpay payment signature',
        };
      }
    }

    if (!paymentId && !orderId) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing Razorpay ids' };
    }

    if (paymentId) {
      const url = `${apiBase(input.environment)}${gatewayEndpoints.razorpay.paths.payments}/${encodeURIComponent(paymentId)}`;
      const res = await jsonFetch<{
        id?: string;
        status?: string;
        amount?: number;
        currency?: string;
        order_id?: string;
        error?: { description?: string };
      }>(url, { method: 'GET', basicAuth: auth(input.config) });

      if (!res.ok || !res.data) {
        return {
          ok: false,
          paid: false,
          status: 'UNKNOWN',
          error: res.data?.error?.description || res.error,
        };
      }

      const paid = res.data.status === 'captured' || res.data.status === 'authorized';
      const currency = res.data.currency
        ? normalizeCurrency(res.data.currency)
        : normalizeCurrency(input.currency);
      const amount =
        res.data.amount != null ? fromMinorUnits(res.data.amount, currency) : undefined;
      const amountOk = amount == null || amountsMatch(input.amount, amount);
      const currencyOk = currenciesMatch(input.currency, currency);

      if (paid && (!amountOk || !currencyOk)) {
        return {
          ok: false,
          paid: false,
          status: 'FAILED',
          error: 'Razorpay amount/currency mismatch',
          amount,
          currency,
          rawSummary: safeSummary(res.data),
        };
      }

      return {
        ok: true,
        paid: Boolean(paid && amountOk && currencyOk),
        status: paid ? 'PAID' : res.data.status === 'failed' ? 'FAILED' : 'PENDING',
        gatewayPaymentId: res.data.id,
        gatewayOrderId: res.data.order_id || orderId || undefined,
        amount,
        currency,
        rawSummary: safeSummary({ id: res.data.id, status: res.data.status }),
      };
    }

    // Order-only check
    const url = `${apiBase(input.environment)}${gatewayEndpoints.razorpay.paths.orders}/${encodeURIComponent(orderId!)}`;
    const res = await jsonFetch<{
      id?: string;
      status?: string;
      amount?: number;
      currency?: string;
      amount_paid?: number;
    }>(url, { method: 'GET', basicAuth: auth(input.config) });

    if (!res.ok || !res.data) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: res.error };
    }

    const paid = res.data.status === 'paid';
    const currency = res.data.currency
      ? normalizeCurrency(res.data.currency)
      : normalizeCurrency(input.currency);
    const amount =
      res.data.amount_paid != null
        ? fromMinorUnits(res.data.amount_paid, currency)
        : res.data.amount != null
          ? fromMinorUnits(res.data.amount, currency)
          : undefined;

    return {
      ok: true,
      paid,
      status: paid ? 'PAID' : 'PENDING',
      gatewayOrderId: res.data.id,
      amount,
      currency,
      rawSummary: safeSummary(res.data),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const result = await this.verifyPayment({
      transactionId: '',
      publicId: '',
      amount: '0',
      currency: 'INR',
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
    const paymentId = input.gatewayPaymentId;
    if (!paymentId) {
      return { ok: false, status: 'REFUND_FAILED', error: 'Missing payment id' };
    }
    const currency = normalizeCurrency(input.currency);
    const amount = toMinorUnits(input.amount, currency);
    const url = `${apiBase(input.environment)}${gatewayEndpoints.razorpay.paths.refunds(paymentId)}`;
    const res = await jsonFetch<{ id?: string; status?: string; error?: { description?: string } }>(
      url,
      {
        method: 'POST',
        basicAuth: auth(input.config),
        body: amount != null ? { amount } : {},
      }
    );
    if (!res.ok || !res.data?.id) {
      return {
        ok: false,
        status: 'REFUND_FAILED',
        error: res.data?.error?.description || res.error || 'Refund failed',
      };
    }
    return {
      ok: true,
      gatewayRefundId: res.data.id,
      status: res.data.status === 'processed' ? 'REFUNDED' : 'REFUND_PROCESSING',
    };
  },

  async handleWebhook(request: Request, config: Record<string, string>): Promise<WebhookResult> {
    const payload = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = cfg(config, 'webhookSecret');

    if (webhookSecret) {
      if (!signature) {
        return { ok: false, httpStatus: 400, error: 'Missing X-Razorpay-Signature' };
      }
      const expected = hmacHex(webhookSecret, payload);
      if (!safeEqualHex(expected, signature)) {
        return { ok: false, httpStatus: 400, error: 'Invalid Razorpay webhook signature' };
      }
    }

    let body: {
      event?: string;
      payload?: {
        payment?: { entity?: Record<string, unknown> };
        order?: { entity?: Record<string, unknown> };
      };
    };
    try {
      body = JSON.parse(payload);
    } catch {
      return { ok: false, httpStatus: 400, error: 'Invalid JSON' };
    }

    const payment = body.payload?.payment?.entity as
      | {
          id?: string;
          order_id?: string;
          status?: string;
          amount?: number;
          currency?: string;
          notes?: { nazexa_transaction_id?: string; transaction_id?: string };
        }
      | undefined;

    const paid =
      body.event === 'payment.captured' ||
      (body.event === 'payment.authorized' && payment?.status === 'authorized');

    const currency = payment?.currency ? normalizeCurrency(payment.currency) : undefined;
    const amount =
      payment?.amount != null && currency ? fromMinorUnits(payment.amount, currency) : undefined;

    return {
      ok: true,
      eventType: body.event,
      transactionPublicId: payment?.notes?.nazexa_transaction_id || payment?.notes?.transaction_id,
      gatewayOrderId: payment?.order_id,
      gatewayPaymentId: payment?.id,
      paid,
      amount,
      currency,
      httpStatus: 200,
      responseBody: JSON.stringify({ status: 'ok' }),
      rawPayloadSummary: safeSummary({ event: body.event, paymentId: payment?.id }),
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const res = await jsonFetch(`${apiBase(environment)}/v1/orders?count=1`, {
      method: 'GET',
      basicAuth: auth(config),
    });
    if (!res.ok) {
      return { ok: false, message: res.error || 'Razorpay auth failed', liveVerified: false };
    }
    return { ok: true, message: 'Razorpay credentials verified', liveVerified: true };
  },
};
