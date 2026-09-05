/**
 * Upay (Bangladesh MFS) — merchant-specific API.
 * Automated checkout ONLY when admin sets `apiBaseUrl`; otherwise manual MFS proof.
 * Do not invent undocumented endpoints.
 */

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GatewayConfigSchema,
  PaymentGatewayAdapter,
  PaymentStatusInput,
  PaymentStatusResult,
  ValidationResult,
  VerifyPaymentInput,
  PaymentVerificationResult,
} from '@/lib/payments/types';
import { gatewayEndpoints } from '@/lib/payments/endpoints';
import { asStringConfig, cfg, jsonFetch, requireFields, safeSummary } from './base';

function hasApiBase(config: Record<string, string>): boolean {
  const base = cfg(config, 'apiBaseUrl');
  return Boolean(base && /^https:\/\//i.test(base));
}

export const upayAdapter: PaymentGatewayAdapter = {
  code: 'upay',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        {
          key: 'merchantNumber',
          label: 'Merchant / receiving number',
          type: 'text',
          required: true,
          placeholder: '01XXXXXXXXX',
          public: true,
        },
        {
          key: 'accountType',
          label: 'Account type',
          type: 'select',
          required: true,
          options: [
            { value: 'personal', label: 'Personal (Send Money)' },
            { value: 'agent', label: 'Agent (Cash Out)' },
            { value: 'merchant', label: 'Merchant (Payment)' },
          ],
          public: true,
        },
        {
          key: 'accountName',
          label: 'Account holder name',
          type: 'text',
          required: false,
          public: true,
        },
        {
          key: 'apiBaseUrl',
          label: 'API base URL (optional)',
          type: 'url',
          required: false,
          help: 'Only set if your Upay merchant docs provide a fixed HTTPS base. Leave empty for manual MFS.',
        },
        {
          key: 'merchantId',
          label: 'Merchant ID (API)',
          type: 'text',
          required: false,
        },
        {
          key: 'apiKey',
          label: 'API key',
          type: 'password',
          required: false,
          secret: true,
        },
        {
          key: 'apiSecret',
          label: 'API / signing secret',
          type: 'password',
          required: false,
          secret: true,
        },
      ],
      submissionFields: [
        {
          key: 'senderNumber',
          label: 'Your account number',
          type: 'text',
          required: true,
          placeholder: '01XXXXXXXXX',
        },
        {
          key: 'transactionId',
          label: 'Transaction ID',
          type: 'text',
          required: true,
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    const c = asStringConfig(config);
    const base = requireFields(c, ['merchantNumber', 'accountType']);
    if (!base.valid) return base;
    if (c.apiBaseUrl && !/^https:\/\//i.test(c.apiBaseUrl.trim())) {
      return { valid: false, errors: ['apiBaseUrl must be an https:// URL when set'] };
    }
    return { valid: true, errors: [] };
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join('; ') };
    }

    // Automated path only when merchant-configured base URL is present.
    if (hasApiBase(input.config)) {
      const base = cfg(input.config, 'apiBaseUrl').replace(/\/$/, '');
      const res = await jsonFetch<{
        payment_url?: string;
        redirectUrl?: string;
        checkoutUrl?: string;
        orderId?: string;
        transactionId?: string;
        message?: string;
        error?: string;
      }>(`${base}/checkout/init`, {
        method: 'POST',
        headers: {
          ...(cfg(input.config, 'apiKey')
            ? { 'X-API-Key': cfg(input.config, 'apiKey') }
            : {}),
        },
        body: {
          merchantId: cfg(input.config, 'merchantId'),
          amount: input.amount,
          currency: input.currency,
          orderId: input.publicId,
          description: input.description,
          successUrl: input.successUrl,
          failUrl: input.failUrl,
          cancelUrl: input.cancelUrl,
          customer: input.customer,
        },
      });

      const redirectUrl =
        res.data?.payment_url || res.data?.redirectUrl || res.data?.checkoutUrl;
      if (res.ok && redirectUrl) {
        return {
          ok: true,
          redirectUrl,
          gatewayOrderId: res.data?.orderId || input.publicId,
          gatewayTransactionId: res.data?.transactionId,
          rawSummary: safeSummary(res.data),
        };
      }

      // Fall through to manual if merchant endpoint is unavailable/misconfigured.
      return {
        ok: true,
        requiresManualProof: true,
        instructions: [
          'Upay API init failed or returned no redirect — using manual MFS fallback.',
          `Send ${input.amount} ${input.currency} to ${input.config.merchantNumber}.`,
          'Submit TrxID after payment for admin review.',
          `documentationStatus: ${gatewayEndpoints.upay.documentationStatus}`,
        ].join('\n'),
        rawSummary: safeSummary({ apiError: res.error, body: res.data }),
      };
    }

    return {
      ok: true,
      requiresManualProof: true,
      instructions: [
        'Pay via Upay (manual MFS).',
        '',
        `Send ${input.amount} ${input.currency} to: ${input.config.merchantNumber}`,
        input.config.accountName ? `Account name: ${input.config.accountName}` : '',
        '',
        'Submit your TrxID and sender number for admin review.',
        `documentationStatus: ${gatewayEndpoints.upay.documentationStatus}`,
      ]
        .filter(Boolean)
        .join('\n'),
      rawSummary: 'upay:manual_mfs',
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    if (!hasApiBase(input.config)) {
      return {
        ok: true,
        paid: false,
        status: 'PENDING_REVIEW',
        error: 'Upay manual mode — admin review required.',
      };
    }

    const base = cfg(input.config, 'apiBaseUrl').replace(/\/$/, '');
    const orderId = input.gatewayOrderId || input.publicId;
    const res = await jsonFetch<{
      status?: string;
      paid?: boolean;
      amount?: string;
      currency?: string;
      transactionId?: string;
    }>(`${base}/checkout/verify/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        ...(cfg(input.config, 'apiKey') ? { 'X-API-Key': cfg(input.config, 'apiKey') } : {}),
      },
    });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        paid: false,
        status: 'UNKNOWN',
        error: res.error || 'Upay verify failed',
        rawSummary: safeSummary(res.data),
      };
    }

    const paid =
      res.data.paid === true ||
      String(res.data.status || '').toUpperCase() === 'PAID' ||
      String(res.data.status || '').toUpperCase() === 'SUCCESS';

    return {
      ok: true,
      paid,
      status: paid ? 'PAID' : 'PENDING',
      amount: res.data.amount,
      currency: res.data.currency,
      gatewayTransactionId: res.data.transactionId,
      gatewayOrderId: orderId ?? undefined,
      rawSummary: safeSummary(res.data),
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    if (!hasApiBase(input.config)) {
      return { ok: true, paid: false, status: 'PENDING_REVIEW' };
    }
    const verify = await this.verifyPayment({
      transactionId: '',
      publicId: String(input.gatewayOrderId || ''),
      amount: '0',
      currency: 'BDT',
      gatewayOrderId: input.gatewayOrderId,
      gatewayPaymentId: input.gatewayPaymentId,
      gatewayTransactionId: input.gatewayTransactionId,
      config: input.config,
      environment: input.environment,
    });
    return {
      ok: verify.ok,
      paid: verify.paid,
      status: verify.status,
      amount: verify.amount,
      currency: verify.currency,
      error: verify.error,
    };
  },
};
