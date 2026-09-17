/**
 * PayPal Orders v2 — OAuth client credentials, CAPTURE intent, capture on verify.
 */

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
} from './base';

function baseUrl(environment: PaymentEnvironment, config: Record<string, string>): string {
  const env = isSandbox(environment, config) ? 'sandbox' : 'production';
  return resolveBaseUrl('paypal', env) || gatewayEndpoints.paypal.sandbox;
}

async function getAccessToken(
  environment: PaymentEnvironment,
  config: Record<string, string>
): Promise<{ token?: string; error?: string }> {
  const clientId = cfg(config, 'clientId');
  const clientSecret = cfg(config, 'clientSecret');
  if (!clientId || !clientSecret) return { error: 'Missing PayPal credentials' };

  const url = `${baseUrl(environment, config)}${gatewayEndpoints.paypal.paths.token}`;
  const res = await jsonFetch<{ access_token?: string; error_description?: string }>(url, {
    method: 'POST',
    basicAuth: { username: clientId, password: clientSecret },
    form: { grant_type: 'client_credentials' },
  });

  if (!res.ok || !res.data?.access_token) {
    return { error: res.data?.error_description || res.error || 'PayPal OAuth failed' };
  }
  return { token: res.data.access_token };
}

function formatPayPalAmount(amount: string, currency: string): string {
  const n = parseAmount(amount);
  if (n == null) return amount;
  // PayPal expects 2 decimal places for most currencies.
  const zeroDecimal = new Set(['HUF', 'JPY', 'TWD']);
  if (zeroDecimal.has(normalizeCurrency(currency))) return String(Math.round(n));
  return n.toFixed(2);
}

export const paypalAdapter: PaymentGatewayAdapter = {
  code: 'paypal',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text', required: true },
        {
          key: 'clientSecret',
          label: 'Client secret',
          type: 'password',
          required: true,
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
        {
          key: 'webhookId',
          label: 'Webhook ID',
          type: 'text',
          required: false,
          help: 'Optional — for webhook signature verification.',
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['clientId', 'clientSecret']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    const auth = await getAccessToken(input.environment, input.config);
    if (!auth.token) return { ok: false, error: auth.error };

    const currency = normalizeCurrency(input.currency);
    const value = formatPayPalAmount(input.amount, currency);

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paypal.paths.orders}`;
    const res = await jsonFetch<{
      id?: string;
      status?: string;
      links?: Array<{ rel?: string; href?: string }>;
      message?: string;
      details?: Array<{ description?: string }>;
    }>(url, {
      method: 'POST',
      bearer: auth.token,
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.publicId,
            custom_id: input.publicId,
            description: input.description?.slice(0, 127),
            amount: { currency_code: currency, value },
          },
        ],
        application_context: {
          brand_name: 'Nazexa',
          user_action: 'PAY_NOW',
          return_url: input.successUrl,
          cancel_url: input.cancelUrl,
        },
      },
    });

    const approve = res.data?.links?.find((l) => l.rel === 'approve')?.href;
    if (!res.ok || !res.data?.id || !approve) {
      return {
        ok: false,
        error:
          res.data?.details?.[0]?.description ||
          res.data?.message ||
          res.error ||
          'PayPal order create failed',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: approve,
      gatewayOrderId: res.data.id,
      rawSummary: safeSummary({ id: res.data.id, status: res.data.status }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const auth = await getAccessToken(input.environment, input.config);
    if (!auth.token) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: auth.error };
    }

    const orderId =
      input.gatewayOrderId ||
      input.callbackParams?.token ||
      input.callbackParams?.orderID ||
      input.callbackParams?.orderId;
    if (!orderId) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing PayPal order id' };
    }

    const captureUrl = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paypal.paths.capture(orderId)}`;
    const res = await jsonFetch<{
      id?: string;
      status?: string;
      purchase_units?: Array<{
        reference_id?: string;
        custom_id?: string;
        payments?: {
          captures?: Array<{
            id?: string;
            status?: string;
            amount?: { currency_code?: string; value?: string };
          }>;
        };
        amount?: { currency_code?: string; value?: string };
      }>;
      message?: string;
    }>(captureUrl, {
      method: 'POST',
      bearer: auth.token,
      body: {},
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });

    // If already captured, GET the order instead.
    let data = res.data;
    if ((!res.ok || !data) && (res.status === 422 || res.status === 400)) {
      const getUrl = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paypal.paths.orders}/${encodeURIComponent(orderId)}`;
      const getRes = await jsonFetch<typeof res.data>(getUrl, {
        method: 'GET',
        bearer: auth.token,
      });
      data = getRes.data;
      if (!getRes.ok || !data) {
        return {
          ok: false,
          paid: false,
          status: 'UNKNOWN',
          error: getRes.error || res.error || 'PayPal capture/retrieve failed',
          rawSummary: safeSummary(res.data),
        };
      }
    } else if (!res.ok || !data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: data?.message || res.error || 'PayPal capture failed',
        rawSummary: safeSummary(data),
      };
    }

    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const paid =
      data.status === 'COMPLETED' ||
      capture?.status === 'COMPLETED' ||
      capture?.status === 'CAPTURED';

    const amount = capture?.amount?.value || unit?.amount?.value;
    const currency = capture?.amount?.currency_code || unit?.amount?.currency_code;
    const amountOk = amount == null || amountsMatch(input.amount, amount);
    const currencyOk = !currency || currenciesMatch(input.currency, currency);
    const ref = unit?.custom_id || unit?.reference_id;
    const refOk = !ref || ref === input.publicId;

    if (paid && (!amountOk || !currencyOk || !refOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'PayPal amount/currency/reference mismatch',
        amount,
        currency: currency ? normalizeCurrency(currency) : undefined,
        rawSummary: safeSummary(data),
      };
    }

    return {
      ok: true,
      paid: Boolean(paid && amountOk && currencyOk && refOk),
      status: paid ? 'PAID' : data.status === 'VOIDED' ? 'CANCELLED' : 'PENDING',
      gatewayOrderId: data.id,
      gatewayPaymentId: capture?.id,
      gatewayTransactionId: capture?.id,
      amount,
      currency: currency ? normalizeCurrency(currency) : undefined,
      rawSummary: safeSummary({ id: data.id, status: data.status }),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const auth = await getAccessToken(input.environment, input.config);
    if (!auth.token || !input.gatewayOrderId) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: auth.error || 'Missing order id' };
    }
    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paypal.paths.orders}/${encodeURIComponent(input.gatewayOrderId)}`;
    const res = await jsonFetch<{
      status?: string;
      purchase_units?: Array<{
        payments?: {
          captures?: Array<{
            status?: string;
            amount?: { value?: string; currency_code?: string };
          }>;
        };
        amount?: { value?: string; currency_code?: string };
      }>;
    }>(url, { method: 'GET', bearer: auth.token });

    if (!res.ok || !res.data) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: res.error };
    }
    const capture = res.data.purchase_units?.[0]?.payments?.captures?.[0];
    const paid = res.data.status === 'COMPLETED' || capture?.status === 'COMPLETED';
    return {
      ok: true,
      paid,
      status: paid ? 'PAID' : 'PENDING',
      amount: capture?.amount?.value || res.data.purchase_units?.[0]?.amount?.value,
      currency:
        capture?.amount?.currency_code || res.data.purchase_units?.[0]?.amount?.currency_code,
    };
  },

  async refundPayment(input: RefundPaymentInput): Promise<RefundResult> {
    const auth = await getAccessToken(input.environment, input.config);
    if (!auth.token) return { ok: false, status: 'REFUND_FAILED', error: auth.error };
    const captureId = input.gatewayPaymentId || input.gatewayTransactionId;
    if (!captureId) {
      return { ok: false, status: 'REFUND_FAILED', error: 'Missing capture id' };
    }
    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.paypal.paths.refund(captureId)}`;
    const currency = normalizeCurrency(input.currency);
    const res = await jsonFetch<{ id?: string; status?: string; message?: string }>(url, {
      method: 'POST',
      bearer: auth.token,
      body: {
        amount: {
          value: formatPayPalAmount(input.amount, currency),
          currency_code: currency,
        },
        note_to_payer: input.reason,
      },
    });
    if (!res.ok || !res.data?.id) {
      return {
        ok: false,
        status: 'REFUND_FAILED',
        error: res.data?.message || res.error || 'Refund failed',
      };
    }
    return {
      ok: true,
      gatewayRefundId: res.data.id,
      status: res.data.status === 'COMPLETED' ? 'REFUNDED' : 'REFUND_PROCESSING',
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const auth = await getAccessToken(environment, config);
    if (!auth.token) {
      return { ok: false, message: auth.error || 'OAuth failed', liveVerified: false };
    }
    return { ok: true, message: 'PayPal OAuth token obtained', liveVerified: true };
  },
};
