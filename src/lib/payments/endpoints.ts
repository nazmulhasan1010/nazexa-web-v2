/**
 * Provider endpoint registry — single source of sandbox/production base URLs.
 * Do not scatter gateway URLs across route handlers.
 */

export type EndpointEnv = 'sandbox' | 'production';

type EnvUrls = Partial<Record<EndpointEnv, string>>;

export const gatewayEndpoints = {
  aamarpay: {
    sandbox: 'https://sandbox.aamarpay.com',
    production: 'https://secure.aamarpay.com',
    paths: {
      jsonPost: '/jsonpost.php',
      search: '/api/v1/trxcheck/request.php',
    },
  },
  sslcommerz: {
    sandbox: 'https://sandbox.sslcommerz.com',
    production: 'https://securepay.sslcommerz.com',
    paths: {
      session: '/gwprocess/v4/api.php',
      validation: '/validator/api/validationserverAPI.php',
    },
  },
  stripe: {
    sandbox: 'https://api.stripe.com',
    production: 'https://api.stripe.com',
    paths: {
      checkoutSessions: '/v1/checkout/sessions',
      refunds: '/v1/refunds',
    },
  },
  paypal: {
    sandbox: 'https://api-m.sandbox.paypal.com',
    production: 'https://api-m.paypal.com',
    paths: {
      token: '/v1/oauth2/token',
      orders: '/v2/checkout/orders',
      capture: (orderId: string) => `/v2/checkout/orders/${orderId}/capture`,
      refund: (captureId: string) => `/v2/payments/captures/${captureId}/refund`,
    },
  },
  razorpay: {
    sandbox: 'https://api.razorpay.com',
    production: 'https://api.razorpay.com',
    paths: {
      orders: '/v1/orders',
      payments: '/v1/payments',
      refunds: (paymentId: string) => `/v1/payments/${paymentId}/refund`,
    },
  },
  paddle: {
    sandbox: 'https://sandbox-api.paddle.com',
    production: 'https://api.paddle.com',
    paths: {
      transactions: '/transactions',
    },
  },
  bkash: {
    // Official bKash Checkout (Tokenized) base paths — merchant may override via config if docs require.
    sandbox: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    production: 'https://tokenized.pay.bka.sh/v1.2.0-beta',
    paths: {
      grantToken: '/tokenized/checkout/token/grant',
      create: '/tokenized/checkout/create',
      execute: '/tokenized/checkout/execute',
      query: '/tokenized/checkout/payment/status',
    },
  },
  shurjopay: {
    sandbox: 'https://sandbox.shurjopayment.com',
    production: 'https://engine.shurjopayment.com',
    paths: {
      token: '/api/get_token',
      checkout: '/api/secret-pay',
      verification: '/api/verification',
    },
  },
  nagad: {
    // Merchant-documentation dependent — base URLs must be confirmed before production.
    sandbox: 'https://sandbox.mynagad.com:10060/remote-payment-gateway-1.0',
    production: 'https://api.mynagad.com/api/dfs',
    paths: {
      init: '/api/dfs/check-out/initialize',
      complete: '/api/dfs/check-out/complete',
      verify: '/api/dfs/verify',
    },
    documentationStatus: 'verify' as const,
  },
  upay: {
    // Bangladesh Upay merchant API is account-specific — do not invent endpoints.
    sandbox: null as string | null,
    production: null as string | null,
    documentationStatus: 'merchant-specific' as const,
  },
  rocket: {
    sandbox: null as string | null,
    production: null as string | null,
    documentationStatus: 'manual' as const,
  },
  bank_transfer: {
    sandbox: null as string | null,
    production: null as string | null,
    documentationStatus: 'manual' as const,
  },
} as const;

export function resolveBaseUrl(
  gateway: keyof typeof gatewayEndpoints,
  environment: EndpointEnv
): string | null {
  const entry = gatewayEndpoints[gateway] as EnvUrls & { documentationStatus?: string };
  const url = entry[environment];
  return typeof url === 'string' ? url : null;
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function paymentCallbackUrl(
  gateway: string,
  outcome: 'success' | 'fail' | 'cancel'
): string {
  return `${appBaseUrl()}/api/payments/callback/${gateway}/${outcome}`;
}

export function paymentWebhookUrl(gateway: string): string {
  return `${appBaseUrl()}/api/payments/webhook/${gateway}`;
}

export function paymentReturnPage(publicId: string): string {
  return `${appBaseUrl()}/checkout/${publicId}/return`;
}
