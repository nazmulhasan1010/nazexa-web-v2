/**
 * Payment adapter unit tests — no network.
 */

import { createHmac } from 'node:crypto';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { bankTransferAdapter } from '@/lib/payments/adapters/bank-transfer';
import { aamarpayAdapter } from '@/lib/payments/adapters/aamarpay';
import { stripeAdapter } from '@/lib/payments/adapters/stripe';
import { paypalAdapter } from '@/lib/payments/adapters/paypal';
import { razorpayAdapter } from '@/lib/payments/adapters/razorpay';
import { amountsMatch, currenciesMatch, AMOUNT_TOLERANCE } from '@/lib/payments/adapters/base';
import type { CreatePaymentInput, VerifyPaymentInput } from '@/lib/payments/types';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const baseCreate = (overrides: Partial<CreatePaymentInput> = {}): CreatePaymentInput => ({
  transactionId: 'txn_1',
  publicId: 'pub_1',
  amount: '100.00',
  currency: 'BDT',
  description: 'Test',
  customer: { name: 'Test', email: 't@example.com', phone: '01700000000' },
  successUrl: 'https://app.example/ok',
  failUrl: 'https://app.example/fail',
  cancelUrl: 'https://app.example/cancel',
  config: {},
  environment: 'sandbox',
  ...overrides,
});

describe('bank_transfer', () => {
  it('validateConfig requires bank fields', () => {
    expect(bankTransferAdapter.validateConfig({}).valid).toBe(false);
    expect(
      bankTransferAdapter.validateConfig({
        bankName: 'City',
        accountName: 'Nazexa',
        accountNumber: '123',
      }).valid
    ).toBe(true);
  });

  it('createPayment sets requiresManualProof', async () => {
    const result = await bankTransferAdapter.createPayment(
      baseCreate({
        config: {
          bankName: 'City Bank',
          accountName: 'Nazexa Ltd',
          accountNumber: '001122',
        },
      })
    );
    expect(result.ok).toBe(true);
    expect(result.requiresManualProof).toBe(true);
    expect(result.instructions).toContain('City Bank');
  });

  it('verifyPayment never marks paid', async () => {
    const input: VerifyPaymentInput = {
      transactionId: 'txn_1',
      publicId: 'pub_1',
      amount: '100.00',
      currency: 'BDT',
      config: {},
      environment: 'sandbox',
    };
    const result = await bankTransferAdapter.verifyPayment(input);
    expect(result.ok).toBe(true);
    expect(result.paid).toBe(false);
    expect(result.status).toBe('PENDING_REVIEW');
  });
});

describe('config validation', () => {
  it('aamarpay fails without storeId/signatureKey', () => {
    const r = aamarpayAdapter.validateConfig({ storeId: 's' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('signatureKey'))).toBe(true);
  });

  it('stripe fails without publishableKey/secretKey', () => {
    const r = stripeAdapter.validateConfig({ publishableKey: 'pk_test' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('secretKey'))).toBe(true);
  });

  it('paypal fails without clientId/clientSecret', () => {
    const r = paypalAdapter.validateConfig({ clientId: 'id' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('clientSecret'))).toBe(true);
  });

  it('razorpay fails without keyId/keySecret', () => {
    const r = razorpayAdapter.validateConfig({ keyId: 'rzp_test' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('keySecret'))).toBe(true);
  });
});

describe('amountsMatch / currenciesMatch', () => {
  it('matches within tolerance', () => {
    expect(amountsMatch('10.00', 10)).toBe(true);
    expect(amountsMatch('10.00', 10 + AMOUNT_TOLERANCE)).toBe(true);
    expect(amountsMatch('10.00', 10.01)).toBe(false);
  });

  it('currenciesMatch is case-insensitive', () => {
    expect(currenciesMatch('usd', 'USD')).toBe(true);
    expect(currenciesMatch('BDT', 'INR')).toBe(false);
  });
});

describe('razorpay payment signature', () => {
  it('rejects invalid razorpay_signature without calling the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await razorpayAdapter.verifyPayment({
      transactionId: 'txn_1',
      publicId: 'pub_1',
      amount: '100.00',
      currency: 'INR',
      gatewayOrderId: 'order_abc',
      gatewayPaymentId: 'pay_abc',
      config: { keyId: 'rzp_test', keySecret: 'secret_value' },
      environment: 'sandbox',
      callbackParams: {
        razorpay_order_id: 'order_abc',
        razorpay_payment_id: 'pay_abc',
        razorpay_signature: 'deadbeef',
      },
    });

    expect(result.paid).toBe(false);
    expect(result.status).toBe('FAILED');
    expect(result.error).toMatch(/signature/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts valid HMAC then fetches payment (mocked)', async () => {
    const keySecret = 'secret_value';
    const orderId = 'order_abc';
    const paymentId = 'pay_abc';
    const signature = createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`, 'utf8')
      .digest('hex');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            id: paymentId,
            status: 'captured',
            amount: 10000,
            currency: 'INR',
            order_id: orderId,
          }),
      }))
    );

    const result = await razorpayAdapter.verifyPayment({
      transactionId: 'txn_1',
      publicId: 'pub_1',
      amount: '100.00',
      currency: 'INR',
      config: { keyId: 'rzp_test', keySecret },
      environment: 'sandbox',
      callbackParams: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.paid).toBe(true);
    expect(result.status).toBe('PAID');
  });
});

describe('stripe webhook signature (via handleWebhook)', () => {
  it('rejects bad stripe-signature when webhookSecret is set', async () => {
    const body = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { payment_status: 'paid' } },
    });
    const req = new Request('https://nazexa.example/api/payments/webhook/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=invalid' },
      body,
    });

    const result = await stripeAdapter.handleWebhook!(req, {
      webhookSecret: 'whsec_test',
      secretKey: 'sk_test',
      publishableKey: 'pk_test',
    });

    expect(result.ok).toBe(false);
    expect(result.httpStatus).toBe(400);
    expect(result.error).toMatch(/signature/i);
  });
});
