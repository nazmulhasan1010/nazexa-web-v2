/**
 * shurjoPay — get_token → secret-pay → verification.
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
  const env = isSandbox(environment, config) ? 'sandbox' : 'production';
  return resolveBaseUrl('shurjopay', env) || gatewayEndpoints.shurjopay.sandbox;
}

async function getToken(
  environment: PaymentEnvironment,
  config: Record<string, string>
): Promise<{
  token?: string;
  storeId?: string | number;
  spCreateUrl?: string;
  spVerifyUrl?: string;
  error?: string;
}> {
  const url = `${baseUrl(environment, config)}${gatewayEndpoints.shurjopay.paths.token}`;
  const res = await jsonFetch<{
    token?: string;
    store_id?: string | number;
    sp_create_url?: string;
    sp_verify_url?: string;
    execute_url?: string;
    message?: string;
  }>(url, {
    method: 'POST',
    body: {
      username: cfg(config, 'merchantUsername'),
      password: cfg(config, 'merchantPassword'),
    },
  });

  if (!res.ok || !res.data?.token) {
    return { error: res.data?.message || res.error || 'shurjoPay get_token failed' };
  }
  return {
    token: res.data.token,
    storeId: res.data.store_id,
    spCreateUrl: res.data.sp_create_url || res.data.execute_url,
    spVerifyUrl: res.data.sp_verify_url,
  };
}

export const shurjopayAdapter: PaymentGatewayAdapter = {
  code: 'shurjopay',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'merchantUsername', label: 'Merchant username', type: 'text', required: true },
        {
          key: 'merchantPassword',
          label: 'Merchant password',
          type: 'password',
          required: true,
          secret: true,
        },
        { key: 'prefix', label: 'Order prefix', type: 'text', required: false },
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
    return requireFields(asStringConfig(config), ['merchantUsername', 'merchantPassword']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    const auth = await getToken(input.environment, input.config);
    if (!auth.token) return { ok: false, error: auth.error };

    const amount = parseAmount(input.amount);
    if (amount == null || amount <= 0) return { ok: false, error: 'Invalid amount' };

    const prefix = cfg(input.config, 'prefix') || 'NZX';
    const orderId = `${prefix}${input.publicId}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30);

    const checkoutUrl =
      auth.spCreateUrl ||
      `${baseUrl(input.environment, input.config)}${gatewayEndpoints.shurjopay.paths.checkout}`;

    const res = await jsonFetch<{
      checkout_url?: string;
      sp_order_id?: string;
      customer_order_id?: string;
      message?: string;
    }>(checkoutUrl, {
      method: 'POST',
      bearer: auth.token,
      body: {
        prefix,
        token: auth.token,
        return_url: input.successUrl,
        cancel_url: input.cancelUrl,
        store_id: auth.storeId,
        amount,
        order_id: orderId,
        currency: normalizeCurrency(input.currency),
        customer_name: input.customer.name || 'Customer',
        customer_address: 'Dhaka',
        customer_phone: input.customer.phone || '01700000000',
        customer_city: 'Dhaka',
        customer_email: input.customer.email || undefined,
        client_ip: '127.0.0.1',
        value1: input.publicId,
      },
    });

    if (!res.ok || !res.data?.checkout_url) {
      return {
        ok: false,
        error: res.data?.message || res.error || 'shurjoPay secret-pay failed',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: res.data.checkout_url,
      gatewayOrderId: res.data.sp_order_id || orderId,
      gatewayTransactionId: res.data.customer_order_id || orderId,
      rawSummary: safeSummary({
        sp_order_id: res.data.sp_order_id,
        customer_order_id: res.data.customer_order_id,
      }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const auth = await getToken(input.environment, input.config);
    if (!auth.token) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: auth.error };
    }

    const orderId =
      input.callbackParams?.order_id ||
      input.callbackParams?.sp_order_id ||
      input.gatewayOrderId ||
      input.gatewayTransactionId;

    if (!orderId) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing shurjoPay order id' };
    }

    const verifyUrl =
      auth.spVerifyUrl ||
      `${baseUrl(input.environment, input.config)}${gatewayEndpoints.shurjopay.paths.verification}`;

    const res = await jsonFetch<
      Array<{
        sp_code?: string | number;
        sp_message?: string;
        bank_status?: string;
        order_id?: string;
        customer_order_id?: string;
        sp_order_id?: string;
        amount?: string | number;
        currency?: string;
        bank_trx_id?: string;
        value1?: string;
      }>
    >(verifyUrl, {
      method: 'POST',
      bearer: auth.token,
      body: { order_id: orderId },
    });

    const row = Array.isArray(res.data) ? res.data[0] : null;
    if (!res.ok || !row) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.error || 'shurjoPay verification failed',
        rawSummary: safeSummary(res.data),
      };
    }

    const code = String(row.sp_code ?? '');
    const paid =
      code === '1000' ||
      String(row.bank_status || '').toLowerCase() === 'success' ||
      String(row.sp_message || '')
        .toLowerCase()
        .includes('success');

    const amount = row.amount != null ? String(row.amount) : undefined;
    const amountOk = amount == null || amountsMatch(input.amount, amount);
    const currencyOk = !row.currency || currenciesMatch(input.currency, row.currency);
    const refOk = !row.value1 || row.value1 === input.publicId;

    if (paid && (!amountOk || !currencyOk || !refOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'shurjoPay amount/currency/reference mismatch',
        amount,
        currency: row.currency ? normalizeCurrency(row.currency) : undefined,
        rawSummary: safeSummary(row),
      };
    }

    return {
      ok: true,
      paid: Boolean(paid && amountOk && currencyOk && refOk),
      status: paid ? 'PAID' : 'FAILED',
      gatewayOrderId: row.sp_order_id || row.order_id || String(orderId),
      gatewayTransactionId: row.bank_trx_id || row.customer_order_id,
      amount,
      currency: row.currency ? normalizeCurrency(row.currency) : undefined,
      rawSummary: safeSummary({
        sp_code: row.sp_code,
        sp_order_id: row.sp_order_id,
        bank_status: row.bank_status,
      }),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const result = await this.verifyPayment({
      transactionId: '',
      publicId: '',
      amount: '0',
      currency: 'BDT',
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

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    const auth = await getToken(environment, config);
    if (!auth.token) {
      return { ok: false, message: auth.error || 'get_token failed', liveVerified: false };
    }
    return { ok: true, message: 'shurjoPay token obtained', liveVerified: true };
  },
};
