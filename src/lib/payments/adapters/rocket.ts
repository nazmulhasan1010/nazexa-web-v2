/**
 * Rocket (Dutch-Bangla Bank MFS) — manual proof only.
 * Never claims an automated API; no public Rocket checkout API is invented.
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
import { asStringConfig, requireFields } from './base';

export const rocketAdapter: PaymentGatewayAdapter = {
  code: 'rocket',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        {
          key: 'merchantNumber',
          label: 'Merchant / receiving number',
          type: 'text',
          required: true,
          placeholder: '01XXXXXXXXX',
          help: 'Shown to users as the number to send payment to.',
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
          placeholder: 'e.g. 8N7A6D5F4G',
        },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['merchantNumber', 'accountType']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join('; ') };
    }

    const typeLabel =
      input.config.accountType === 'agent'
        ? 'Cash Out'
        : input.config.accountType === 'merchant'
          ? 'Payment'
          : 'Send Money';

    const lines = [
      'Pay via Rocket (manual MFS — no automated API).',
      '',
      `Send ${input.amount} ${input.currency} to: ${input.config.merchantNumber}`,
      `Method: ${typeLabel}`,
      input.config.accountName ? `Account name: ${input.config.accountName}` : null,
      '',
      'After payment, submit your TrxID and sender number for admin review.',
      `documentationStatus: ${gatewayEndpoints.rocket.documentationStatus}`,
    ];

    return {
      ok: true,
      requiresManualProof: true,
      instructions: lines.filter((l) => l != null).join('\n'),
      rawSummary: 'rocket:manual_mfs',
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    void input;
    return {
      ok: true,
      paid: false,
      status: 'PENDING_REVIEW',
      error: 'Rocket is manual MFS only; admin review required. No automated verification.',
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    void input;
    return { ok: true, paid: false, status: 'PENDING_REVIEW' };
  },
};
