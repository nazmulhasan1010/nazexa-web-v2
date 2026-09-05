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
import { asStringConfig } from './base';

export const customPaymentAdapter: PaymentGatewayAdapter = {
  code: 'custom_payment',

  getConfigSchema(): GatewayConfigSchema {
    return {
      fields: [],
      submissionFields: [],
    };
  },

  validateConfig(config: unknown): ValidationResult {
    const c = asStringConfig(config);
    const errors: string[] = [];

    const phoneRegex = /^01[3-9]\d{8}$/;

    if (c.bkashEnabled === 'true') {
      if (!c.bkashNumber?.trim()) errors.push('bKash Number is required when enabled');
      else if (!phoneRegex.test(c.bkashNumber.trim())) errors.push('bKash Number must be a valid BD phone number (e.g., 017XXXXXXXX)');
    }
    if (c.nagadEnabled === 'true') {
      if (!c.nagadNumber?.trim()) errors.push('Nagad Number is required when enabled');
      else if (!phoneRegex.test(c.nagadNumber.trim())) errors.push('Nagad Number must be a valid BD phone number (e.g., 017XXXXXXXX)');
    }
    if (c.bankEnabled === 'true') {
      if (!c.bankName?.trim()) errors.push('Bank Name is required when enabled');
      if (!c.accountName?.trim()) errors.push('Account Name is required when enabled');
      if (!c.accountNumber?.trim()) errors.push('Account Number is required when enabled');
    }

    return { valid: errors.length === 0, errors };
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const validation = this.validateConfig(input.config);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join('; ') };
    }
    
    return {
      ok: true,
      requiresManualProof: true,
      instructions: 'Please select a custom payment option to proceed.',
      rawSummary: 'custom_payment:manual',
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    void input;
    return {
      ok: true,
      paid: false,
      status: 'PENDING_REVIEW',
      error: 'Custom payment never auto-verifies; admin review required.',
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