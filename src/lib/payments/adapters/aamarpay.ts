/**
 * aamarPay — JSON initiation + optional search verification.
 * Official: POST {base}/jsonpost.php → payment_url
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
  requireFields,
  safeSummary,
} from './base';

function baseUrl(environment: PaymentEnvironment, config: Record<string, string>): string {
  const env = isSandbox(environment, config) ? 'sandbox' : 'production';
  return resolveBaseUrl('aamarpay', env) || gatewayEndpoints.aamarpay.sandbox;
}

export const aamarpayAdapter: PaymentGatewayAdapter = {
  code: 'aamarpay',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'storeId', label: 'Store ID', type: 'text', required: true },
        {
          key: 'signatureKey',
          label: 'Signature key',
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
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['storeId', 'signatureKey']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join('; ') };
    }

    const base = baseUrl(input.environment, input.config);
    const url = `${base}${gatewayEndpoints.aamarpay.paths.jsonPost}`;

    const payload = {
      store_id: cfg(input.config, 'storeId'),
      signature_key: cfg(input.config, 'signatureKey'),
      cus_name: input.customer.name || 'Customer',
      cus_email: input.customer.email || 'customer@example.com',
      cus_phone: input.customer.phone || '01700000000',
      amount: input.amount,
      currency: normalizeCurrency(input.currency),
      tran_id: input.publicId,
      desc: input.description || 'Nazexa payment',
      success_url: input.successUrl,
      fail_url: input.failUrl,
      cancel_url: input.cancelUrl,
      type: 'json',
    };

    const res = await jsonFetch<{
      result?: string | boolean;
      payment_url?: string;
      error_title?: string;
      error_msg?: string;
    }>(url, { method: 'POST', body: payload });

    const paymentUrl = res.data?.payment_url;
    if (!res.ok || !paymentUrl) {
      return {
        ok: false,
        error:
          res.data?.error_msg ||
          res.data?.error_title ||
          res.error ||
          'aamarPay did not return payment_url',
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      redirectUrl: paymentUrl,
      gatewayOrderId: input.publicId,
      gatewayTransactionId: input.publicId,
      rawSummary: safeSummary({ result: res.data?.result, hasUrl: true }),
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const storeId = cfg(input.config, 'storeId');
    const signatureKey = cfg(input.config, 'signatureKey');
    if (!storeId || !signatureKey) {
      return { ok: false, paid: false, status: 'UNKNOWN', error: 'Missing credentials' };
    }

    const base = baseUrl(input.environment, input.config);
    const requestId =
      input.callbackParams?.mer_txnid ||
      input.callbackParams?.tran_id ||
      input.gatewayTransactionId ||
      input.publicId;

    const searchUrl =
      `${base}${gatewayEndpoints.aamarpay.paths.search}` +
      `?request_id=${encodeURIComponent(String(requestId))}` +
      `&store_id=${encodeURIComponent(storeId)}` +
      `&signature_key=${encodeURIComponent(signatureKey)}` +
      `&type=json`;

    const res = await jsonFetch<{
      status_code?: string | number;
      status_title?: string;
      pay_status?: string;
      amount?: string;
      currency?: string;
      mer_txnid?: string;
      bank_trxid?: string;
      payment_type?: string;
    }>(searchUrl, { method: 'GET' });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.error || 'aamarPay search failed',
        rawSummary: safeSummary(res.data),
      };
    }

    const statusTitle = String(res.data.status_title || res.data.pay_status || '').toLowerCase();
    const paid =
      statusTitle.includes('successful') ||
      statusTitle === 'success' ||
      String(res.data.status_code) === '2';

    const amountOk =
      res.data.amount == null || amountsMatch(input.amount, res.data.amount);
    const currencyOk =
      !res.data.currency || currenciesMatch(input.currency, res.data.currency);

    if (paid && (!amountOk || !currencyOk)) {
      return {
        ok: false,
        paid: false,
        status: 'FAILED',
        error: 'Amount/currency mismatch on aamarPay verification',
        amount: res.data.amount,
        currency: res.data.currency,
        rawSummary: safeSummary(res.data),
      };
    }

    return {
      ok: true,
      paid: paid && amountOk && currencyOk,
      status: paid ? 'PAID' : statusTitle.includes('fail') ? 'FAILED' : 'PENDING',
      gatewayTransactionId: res.data.bank_trxid || res.data.mer_txnid || String(requestId),
      gatewayOrderId: res.data.mer_txnid || input.publicId,
      amount: res.data.amount,
      currency: res.data.currency ? normalizeCurrency(res.data.currency) : undefined,
      rawSummary: safeSummary(res.data),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    const result = await this.verifyPayment({
      transactionId: '',
      publicId: String(input.gatewayOrderId || input.gatewayTransactionId || ''),
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
    environment: PaymentEnvironment,
  ): Promise<TestConnectionResult> {
    const v = this.validateConfig(config);
    if (!v.valid) {
      return { ok: false, message: v.errors.join('; '), liveVerified: false };
    }
    const base = baseUrl(environment, config);
    return {
      ok: true,
      message: `Config valid. Endpoint base: ${base}. Live verify requires a test payment.`,
      liveVerified: false,
    };
  },
};
