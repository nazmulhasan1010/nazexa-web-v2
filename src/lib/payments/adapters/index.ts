/**
 * Payment gateway adapter registry.
 */

import type { PaymentGatewayAdapter } from '@/lib/payments/types';
import { aamarpayAdapter } from './aamarpay';
import { bankTransferAdapter } from './bank-transfer';
import { bkashAdapter } from './bkash';
import { nagadAdapter } from './nagad';
import { paddleAdapter } from './paddle';
import { paypalAdapter } from './paypal';
import { razorpayAdapter } from './razorpay';
import { rocketAdapter } from './rocket';
import { shurjopayAdapter } from './shurjopay';
import { sslcommerzAdapter } from './sslcommerz';
import { stripeAdapter } from './stripe';
import { upayAdapter } from './upay';
import { customPaymentAdapter } from './custom';

const ADAPTERS: PaymentGatewayAdapter[] = [
  customPaymentAdapter,
  bankTransferAdapter,
  rocketAdapter,
  upayAdapter,
  aamarpayAdapter,
  stripeAdapter,
  paypalAdapter,
  razorpayAdapter,
  sslcommerzAdapter,
  bkashAdapter,
  paddleAdapter,
  shurjopayAdapter,
  nagadAdapter,
];

const BY_CODE = new Map(ADAPTERS.map((a) => [a.code, a]));

export function getAdapter(code: string): PaymentGatewayAdapter | undefined {
  return BY_CODE.get(code);
}

export function listAdapters(): PaymentGatewayAdapter[] {
  return [...ADAPTERS];
}

export {
  customPaymentAdapter,
  aamarpayAdapter,
  bankTransferAdapter,
  bkashAdapter,
  nagadAdapter,
  paddleAdapter,
  paypalAdapter,
  razorpayAdapter,
  rocketAdapter,
  shurjopayAdapter,
  sslcommerzAdapter,
  stripeAdapter,
  upayAdapter,
};
