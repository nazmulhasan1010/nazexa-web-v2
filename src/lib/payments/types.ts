/**
 * Central payment types — provider-independent contracts.
 */

export const PAYMENT_STATUSES = [
  'CREATED',
  'INITIATED',
  'PENDING',
  'REQUIRES_ACTION',
  'PROCESSING',
  'PENDING_REVIEW',
  'PAID',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TERMINAL_PAID = new Set<PaymentStatus>(['PAID', 'REFUNDED', 'PARTIALLY_REFUNDED']);
export const NON_PAYABLE = new Set<PaymentStatus>([
  'PAID',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'CANCELLED',
  'EXPIRED',
  'FAILED',
]);

export type PaymentEnvironment = 'sandbox' | 'production';

export type GatewayFieldType = 'text' | 'password' | 'email' | 'url' | 'textarea' | 'select';

export interface GatewayConfigField {
  key: string;
  label: string;
  type: GatewayFieldType;
  required: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: string; label: string }>;
  secret?: boolean;
  public?: boolean;
}

export interface GatewayConfigSchema {
  fields: GatewayConfigField[];
  submissionFields?: GatewayConfigField[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CreatePaymentInput {
  transactionId: string;
  publicId: string;
  amount: string;
  currency: string;
  description: string;
  customer: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl?: string;
  metadata?: Record<string, string>;
  config: Record<string, string>;
  environment: PaymentEnvironment;
}

export interface CreatePaymentResult {
  ok: boolean;
  redirectUrl?: string;
  instructions?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayTransactionId?: string;
  requiresManualProof?: boolean;
  rawSummary?: string;
  error?: string;
}

export interface VerifyPaymentInput {
  transactionId: string;
  publicId: string;
  amount: string;
  currency: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  gatewayTransactionId?: string | null;
  config: Record<string, string>;
  environment: PaymentEnvironment;
  callbackParams?: Record<string, string>;
}

export interface PaymentVerificationResult {
  ok: boolean;
  paid: boolean;
  status: PaymentStatus | 'UNKNOWN';
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  amount?: string;
  currency?: string;
  error?: string;
  rawSummary?: string;
}

export interface PaymentStatusInput {
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  gatewayTransactionId?: string | null;
  config: Record<string, string>;
  environment: PaymentEnvironment;
}

export interface PaymentStatusResult {
  ok: boolean;
  status: PaymentStatus | 'UNKNOWN';
  paid: boolean;
  amount?: string;
  currency?: string;
  error?: string;
}

export interface RefundPaymentInput {
  amount: string;
  currency: string;
  gatewayPaymentId?: string | null;
  gatewayOrderId?: string | null;
  gatewayTransactionId?: string | null;
  reason?: string;
  config: Record<string, string>;
  environment: PaymentEnvironment;
}

export interface RefundResult {
  ok: boolean;
  gatewayRefundId?: string;
  status: 'REFUND_PROCESSING' | 'REFUNDED' | 'REFUND_FAILED';
  error?: string;
}

export interface WebhookResult {
  ok: boolean;
  eventId?: string;
  eventType?: string;
  transactionPublicId?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayTransactionId?: string;
  paid?: boolean;
  amount?: string;
  currency?: string;
  httpStatus?: number;
  responseBody?: string;
  rawPayloadSummary?: string;
  error?: string;
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
  liveVerified: boolean;
}

export interface PaymentGatewayAdapter {
  code: string;
  getConfigSchema(): GatewayConfigSchema;
  validateConfig(config: unknown): ValidationResult;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult>;
  getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult>;
  refundPayment?(input: RefundPaymentInput): Promise<RefundResult>;
  handleWebhook?(request: Request, config: Record<string, string>): Promise<WebhookResult>;
  testConnection?(
    config: Record<string, string>,
    environment: PaymentEnvironment
  ): Promise<TestConnectionResult>;
}
