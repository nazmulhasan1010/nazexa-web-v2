/**
 * bKash Tokenized Checkout — grant token → create → execute on return.
 */

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayConfigSchema,
  PaymentEnvironment,
  PaymentGatewayAdapter,
  PaymentStatusInput,
  PaymentStatusResult,
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
  const override = cfg(config, 'apiBaseUrl');
  if (override && /^https:\/\//i.test(override)) return override.replace(/\/$/, '');
  const env = isSandbox(environment, config) ? 'sandbox' : 'production';
  return resolveBaseUrl('bkash', env) || gatewayEndpoints.bkash.sandbox;
}

async function grantToken(
  environment: PaymentEnvironment,
  config: Record<string, string>
): Promise<{ token?: string; error?: string }> {
  const url = `${baseUrl(environment, config)}${gatewayEndpoints.bkash.paths.grantToken}`;
  const res = await jsonFetch<{
    id_token?: string;
    statusCode?: string;
    statusMessage?: string;
    msg?: string;
  }>(url, {
    method: 'POST',
    headers: {
      username: cfg(config, 'username'),
      password: cfg(config, 'password'),
      'X-APP-Key': cfg(config, 'appKey'),
    },
    body: {
      app_key: cfg(config, 'appKey'),
      app_secret: cfg(config, 'appSecret'),
    },
  });

  if (!res.ok || !res.data?.id_token) {
    return {
      error: res.data?.statusMessage || res.data?.msg || res.error || 'bKash grant token failed',
    };
  }
  return { token: res.data.id_token };
}

function authHeaders(config: Record<string, string>, token: string): Record<string, string> {
  return {
    Authorization: token,
    'X-APP-Key': cfg(config, 'appKey'),
  };
}

export const bkashAdapter: PaymentGatewayAdapter = {
  code: 'bkash',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'appKey', label: 'App key', type: 'text', required: true },
        {
          key: 'appSecret',
          label: 'App secret',
          type: 'password',
          required: true,
          secret: true,
        },
        { key: 'username', label: 'Username', type: 'text', required: true },
        {
          key: 'password',
          label: 'Password',
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
          key: 'apiBaseUrl',
          label: 'API base URL override',
          type: 'url',
          required: false,
          help: 'Optional — only if merchant docs require a different base.',
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['appKey', 'appSecret', 'username', 'password']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    if (normalizeCurrency(input.currency) !== 'BDT') {
      return { ok: false, error: 'bKash only supports BDT' };
    }

    const auth = await grantToken(input.environment, input.config);
    if (!auth.token) return { ok: false, error: auth.error };

    const amount = parseAmount(input.amount);
    if (amount == null || amount <= 0) return { ok: false, error: 'Invalid amount' };

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.bkash.paths.create}`;
    const res = await jsonFetch<{
      paymentID?: string;
      bkashURL?: string;
      statusCode?: string;
      statusMessage?: string;
      transactionStatus?: string;
    }>(url, {
      method: 'POST',
      headers: authHeaders(input.config, auth.token),
      body: {
        mode: '0011',
        payerReference: input.customer.phone || '01700000000',
        callbackURL: input.successUrl,
        amount: amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: input.publicId.slice(0, 30),
      },
    });

    if (!res.ok || !res.data?.paymentID || !res.data?.bkashURL) {
      return {
        ok: false,
        error: res.data?.statusMessage || res.error || 'bKash create payment failed',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: res.data.bkashURL,
      gatewayPaymentId: res.data.paymentID,
      gatewayOrderId: input.publicId,
      rawSummary: safeSummary({
        paymentID: res.data.paymentID,
        statusCode: res.data.statusCode,
      }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const paymentID =
      input.gatewayPaymentId || input.callbackParams?.paymentID || input.callbackParams?.paymentId;
    if (!paymentID) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing bKash paymentID' };
    }

    const auth = await grantToken(input.environment, input.config);
    if (!auth.token) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: auth.error };
    }

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.bkash.paths.execute}`;
    const res = await jsonFetch<{
      paymentID?: string;
      trxID?: string;
      transactionStatus?: string;
      amount?: string;
      currency?: string;
      merchantInvoiceNumber?: string;
      statusCode?: string;
      statusMessage?: string;
    }>(url, {
      method: 'POST',
      headers: authHeaders(input.config, auth.token),
      body: { paymentID },
    });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.data?.statusMessage || res.error || 'bKash execute failed',
        rawSummary: safeSummary(res.data),
      };
    }

    const status = String(res.data.transactionStatus || '').toLowerCase();
    const paid = status === 'completed' || status === 'success';
    const amountOk = res.data.amount == null || amountsMatch(input.amount, res.data.amount);
    const currencyOk = !res.data.currency || currenciesMatch(input.currency, res.data.currency);

    if (paid && (!amountOk || !currencyOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'bKash amount/currency mismatch',
        amount: res.data.amount,
        currency: res.data.currency,
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      paid: Boolean(paid && amountOk && currencyOk),
      status: paid ? 'PAID' : status.includes('cancel') ? 'CANCELLED' : 'PENDING',
      gatewayPaymentId: res.data.paymentID || paymentID,
      gatewayTransactionId: res.data.trxID,
      gatewayOrderId: res.data.merchantInvoiceNumber || input.publicId,
      amount: res.data.amount,
      currency: res.data.currency ? normalizeCurrency(res.data.currency) : 'BDT',
      rawSummary: safeSummary({
        paymentID: res.data.paymentID,
        trxID: res.data.trxID,
        transactionStatus: res.data.transactionStatus,
      }),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const paymentID = input.gatewayPaymentId;
    if (!paymentID) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing paymentID' };
    }
    const auth = await grantToken(input.environment, input.config);
    if (!auth.token) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: auth.error };
    }

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.bkash.paths.query}`;
    const res = await jsonFetch<{
      transactionStatus?: string;
      amount?: string;
      currency?: string;
      statusMessage?: string;
    }>(url, {
      method: 'POST',
      headers: authHeaders(input.config, auth.token),
      body: { paymentID },
    });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.data?.statusMessage || res.error,
      };
    }

    const status = String(res.data.transactionStatus || '').toLowerCase();
    const paid = status === 'completed' || status === 'success';
    return {
      ok: true,
      paid,
      status: paid ? 'PAID' : 'PENDING',
      amount: res.data.amount,
      currency: res.data.currency,
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const auth = await grantToken(environment, config);
    if (!auth.token) {
      return { ok: false, message: auth.error || 'Grant token failed', liveVerified: false };
    }
    return { ok: true, message: 'bKash grant token succeeded', liveVerified: true };
  },
};
