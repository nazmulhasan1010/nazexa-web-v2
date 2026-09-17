/**
 * SSLCOMMERZ — form-urlencoded session + IPN validation via val_id.
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
  requireFields,
  safeSummary,
} from './base';

function baseUrl(environment: PaymentEnvironment, config: Record<string, string>): string {
  // Backward-compat: sandbox=true|false in config
  const env =
    config.sandbox === 'false'
      ? 'production'
      : config.sandbox === 'true'
        ? 'sandbox'
        : isSandbox(environment, config)
          ? 'sandbox'
          : 'production';
  return resolveBaseUrl('sslcommerz', env) || gatewayEndpoints.sslcommerz.sandbox;
}

export const sslcommerzAdapter: PaymentGatewayAdapter = {
  code: 'sslcommerz',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'storeId', label: 'Store ID', type: 'text', required: true },
        {
          key: 'storePassword',
          label: 'Store password',
          type: 'password',
          required: true,
          secret: true,
        },
        {
          key: 'sandbox',
          label: 'Environment',
          type: 'select',
          required: true,
          options: [
            { value: 'true', label: 'Sandbox' },
            { value: 'false', label: 'Live' },
          ],
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['storeId', 'storePassword']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) return { ok: false, error: validation.errors.join('; ') };

    const url = `${baseUrl(input.environment, input.config)}${gatewayEndpoints.sslcommerz.paths.session}`;
    const res = await jsonFetch<{
      status?: string;
      GatewayPageURL?: string;
      redirectGatewayURL?: string;
      sessionkey?: string;
      failedreason?: string;
    }>(url, {
      method: 'POST',
      form: {
        store_id: cfg(input.config, 'storeId'),
        store_passwd: cfg(input.config, 'storePassword'),
        total_amount: input.amount,
        currency: normalizeCurrency(input.currency),
        tran_id: input.publicId,
        success_url: input.successUrl,
        fail_url: input.failUrl,
        cancel_url: input.cancelUrl,
        ipn_url: input.ipnUrl || '',
        cus_name: input.customer.name || 'Customer',
        cus_email: input.customer.email || 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: input.customer.phone || '01700000000',
        shipping_method: 'NO',
        product_name: input.description || 'Nazexa payment',
        product_category: 'software',
        product_profile: 'general',
      },
    });

    const redirect = res.data?.GatewayPageURL || res.data?.redirectGatewayURL;
    if (!res.ok || res.data?.status !== 'SUCCESS' || !redirect) {
      return {
        ok: false,
        error: res.data?.failedreason || res.error || 'SSLCOMMERZ session failed',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: redirect,
      gatewayOrderId: res.data.sessionkey || input.publicId,
      gatewayTransactionId: input.publicId,
      rawSummary: safeSummary({ status: res.data.status, sessionkey: res.data.sessionkey }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const valId =
      input.callbackParams?.val_id || input.gatewayPaymentId || input.gatewayTransactionId;
    if (!valId) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: 'Missing SSLCOMMERZ val_id',
      };
    }

    const url =
      `${baseUrl(input.environment, input.config)}${gatewayEndpoints.sslcommerz.paths.validation}` +
      `?val_id=${encodeURIComponent(String(valId))}` +
      `&store_id=${encodeURIComponent(cfg(input.config, 'storeId'))}` +
      `&store_passwd=${encodeURIComponent(cfg(input.config, 'storePassword'))}` +
      `&format=json`;

    const res = await jsonFetch<{
      status?: string;
      tran_id?: string;
      val_id?: string;
      amount?: string;
      currency_amount?: string;
      currency?: string;
      currency_type?: string;
      bank_tran_id?: string;
      error?: string;
    }>(url, { method: 'GET' });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.error || 'SSLCOMMERZ validation failed',
      };
    }

    const status = String(res.data.status || '').toUpperCase();
    const paid = status === 'VALID' || status === 'VALIDATED';
    const amount = res.data.currency_amount || res.data.amount;
    const currency = res.data.currency_type || res.data.currency;
    const amountOk = amount == null || amountsMatch(input.amount, amount);
    const currencyOk = !currency || currenciesMatch(input.currency, currency);
    const tranOk = !res.data.tran_id || res.data.tran_id === input.publicId;

    if (paid && (!amountOk || !currencyOk || !tranOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'SSLCOMMERZ amount/currency/tran_id mismatch',
        amount,
        currency: currency ? normalizeCurrency(currency) : undefined,
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      paid: Boolean(paid && amountOk && currencyOk && tranOk),
      status: paid ? 'PAID' : status.includes('FAIL') ? 'FAILED' : 'PENDING',
      gatewayOrderId: res.data.tran_id,
      gatewayPaymentId: res.data.val_id,
      gatewayTransactionId: res.data.bank_tran_id || res.data.val_id,
      amount,
      currency: currency ? normalizeCurrency(currency) : undefined,
      rawSummary: safeSummary({ status: res.data.status, tran_id: res.data.tran_id }),
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

  async handleWebhook(request: Request, config: Record<string, string>): Promise<WebhookResult> {
    const contentType = request.headers.get('content-type') || '';
    const params: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const json = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      for (const [k, v] of Object.entries(json)) {
        if (v != null) params[k] = String(v);
      }
    } else {
      const text = await request.text();
      const sp = new URLSearchParams(text);
      sp.forEach((v, k) => {
        params[k] = v;
      });
    }

    const valId = params.val_id;
    if (!valId) {
      return { ok: false, httpStatus: 400, error: 'Missing val_id' };
    }

    const verify = await this.verifyPayment({
      transactionId: '',
      publicId: params.tran_id || '',
      amount: params.currency_amount || params.amount || '0',
      currency: params.currency_type || params.currency || 'BDT',
      gatewayPaymentId: valId,
      config,
      environment: config.sandbox === 'false' ? 'production' : 'sandbox',
      callbackParams: params,
    });

    return {
      ok: verify.ok,
      eventType: 'ipn',
      transactionPublicId: params.tran_id,
      gatewayOrderId: params.tran_id,
      gatewayPaymentId: valId,
      gatewayTransactionId: params.bank_tran_id,
      paid: verify.paid,
      amount: verify.amount || params.amount,
      currency: verify.currency,
      httpStatus: 200,
      responseBody: 'OK',
      rawPayloadSummary: safeSummary({ val_id: valId, status: params.status }),
      error: verify.error,
    };
  },

  async testConnection(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) return { ok: false, message: v.errors.join('; '), liveVerified: false };
    return {
      ok: true,
      message: `Config valid for ${baseUrl(environment, config)}. Live verify requires a test payment.`,
      liveVerified: false,
    };
  },
};
