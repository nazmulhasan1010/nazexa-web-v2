/**
 * Bank transfer — manual proof only. Never auto-marks paid.
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
import { asStringConfig, requireFields } from './base';

function buildInstructions(config: Record<string, string>): string {
  const lines = [
    'Please transfer the exact amount to the following account:',
    '',
    config.bankName ? `Bank: ${config.bankName}` : null,
    config.accountName ? `Account name: ${config.accountName}` : null,
    config.accountNumber ? `Account number: ${config.accountNumber}` : null,
    config.branch ? `Branch: ${config.branch}` : null,
    config.routingNumber ? `Routing number: ${config.routingNumber}` : null,
    config.swift ? `SWIFT / BIC: ${config.swift}` : null,
    '',
    'Include your payment reference in the transfer narration.',
    'Submit proof after transferring — an admin will verify before activation.',
  ];
  return lines.filter((l) => l != null).join('\n');
}

export const bankTransferAdapter: PaymentGatewayAdapter = {
  code: 'bank_transfer',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [
        { key: 'bankName', label: 'Bank name', type: 'text', required: true, public: true },
        { key: 'accountName', label: 'Account name', type: 'text', required: true, public: true },
        {
          key: 'accountNumber',
          label: 'Account number',
          type: 'text',
          required: true,
          public: true,
        },
        { key: 'branch', label: 'Branch', type: 'text', required: false, public: true },
        {
          key: 'routingNumber',
          label: 'Routing number',
          type: 'text',
          required: false,
          public: true,
        },
        { key: 'swift', label: 'SWIFT / BIC', type: 'text', required: false, public: true },
      ],
      submissionFields: [
        {
          key: 'transactionId',
          label: 'Reference / slip number',
          type: 'text',
          required: true,
        },
        { key: 'senderName', label: 'Sender account name', type: 'text', required: false },
      ],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    return requireFields(asStringConfig(config), ['bankName', 'accountName', 'accountNumber']);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join('; ') };
    }
    return {
      ok: true,
      requiresManualProof: true,
      instructions: buildInstructions(input.config),
      rawSummary: 'bank_transfer:manual',
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    void input;
    return {
      ok: true,
      paid: false,
      status: 'PENDING_REVIEW',
      error: 'Bank transfer never auto-verifies; admin review required.',
    };
  },

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult> {
    void input;
    return {
      ok: true,
      paid: false,
      status: 'PENDING_REVIEW',
    };
  },
};
