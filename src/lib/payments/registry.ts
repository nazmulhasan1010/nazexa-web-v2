/**
 * Payment gateway registry.
 *
 * The single place a new gateway gets added. Everything downstream — the admin
 * config form, credential validation, what the payment page renders, what the
 * user is asked to submit — is derived from these descriptors, so adding a
 * gateway means appending an entry here and nothing else. No schema change, no
 * change to the subscription flow.
 *
 * `checkout: 'manual'` gateways have no API callback: the user pays out-of-band
 * and submits a reference, which an admin approves. `checkout: 'redirect'` uses
 * hosted-checkout adapters under `src/lib/payments/adapters/`.
 */

export type GatewayGroup = 'bd_wallet' | 'bd_aggregator' | 'international' | 'bank';

export type GatewayCheckout = 'manual' | 'redirect';

export type GatewayType = 'api' | 'manual' | 'hybrid';

export type FieldType = 'text' | 'password' | 'email' | 'url' | 'textarea' | 'select';

export interface GatewayField {
  key: string;
  label: string;
  type: FieldType;
  /** Blocks enabling the gateway while empty. */
  required: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: string; label: string }>;
  /**
   * Secret values are redacted in every response that isn't the admin config
   * editor, and are never sent to the payment page.
   */
  secret?: boolean;
  /**
   * Shown to the paying user on the payment page (e.g. the merchant number
   * they must send money to). Implies not secret.
   */
  public?: boolean;
}

/** A field the *user* fills in when submitting proof of a manual payment. */
export interface SubmissionField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface GatewayDef {
  code: string;
  name: string;
  group: GatewayGroup;
  checkout: GatewayCheckout;
  description: string;
  /** ISO-3166 alpha-2 codes this gateway serves; empty means global. */
  countries: string[];
  /** Currencies the gateway settles in. Empty means any. */
  currencies: string[];
  /** Admin-configured credentials/settings. */
  fields: GatewayField[];
  /** What the user submits as proof, for manual gateways. */
  submissionFields: SubmissionField[];
  /** Tailwind accent classes for the gateway card. */
  accent: string;
  defaultSortOrder: number;
  /** Adapter capability metadata for admin UI / orchestration. */
  type: GatewayType;
  supportsRefund: boolean;
  supportsWebhook: boolean;
  supportsManualReview: boolean;
}

const TXN_ID: SubmissionField = {
  key: 'transactionId',
  label: 'Transaction ID',
  type: 'text',
  required: true,
  placeholder: 'e.g. 8N7A6D5F4G',
  help: 'The TrxID from the confirmation SMS or receipt.',
};

const SENDER_NUMBER: SubmissionField = {
  key: 'senderNumber',
  label: 'Your account number',
  type: 'text',
  required: true,
  placeholder: '01XXXXXXXXX',
  help: 'The number you sent the payment from.',
};

const ENVIRONMENT: GatewayField = {
  key: 'environment',
  label: 'Environment',
  type: 'select',
  required: true,
  options: [
    { value: 'sandbox', label: 'Sandbox' },
    { value: 'production', label: 'Live' },
  ],
};

/** Manual mobile-wallet gateway (no automated checkout API). */
function mfsGateway(
  code: string,
  name: string,
  description: string,
  sortOrder: number,
  accent: string,
  extras?: Partial<GatewayDef>,
): GatewayDef {
  return {
    code,
    name,
    group: 'bd_wallet',
    checkout: 'manual',
    description,
    countries: ['BD'],
    currencies: ['BDT'],
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
    submissionFields: [SENDER_NUMBER, TXN_ID],
    accent,
    defaultSortOrder: sortOrder,
    type: 'manual',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: true,
    ...extras,
  };
}

export const GATEWAYS: GatewayDef[] = [
  {
    code: 'custom_payment',
    name: 'Custom Payment',
    group: 'bank',
    checkout: 'manual',
    description: 'Nested custom payment method containing bKash, Nagad, and Bank Transfer.',
    countries: [],
    currencies: [],
    fields: [
      { key: 'bkashEnabled', label: 'bKash - Enabled', type: 'select', required: true, options: [{value: 'true', label: 'ON'}, {value: 'false', label: 'OFF'}], public: true },
      { key: 'bkashNumber', label: 'bKash Number', type: 'text', required: false, public: true },
      { key: 'bkashInstructions', label: 'bKash Instructions', type: 'textarea', required: false, public: true },
      
      { key: 'nagadEnabled', label: 'Nagad - Enabled', type: 'select', required: true, options: [{value: 'true', label: 'ON'}, {value: 'false', label: 'OFF'}], public: true },
      { key: 'nagadNumber', label: 'Nagad Number', type: 'text', required: false, public: true },
      { key: 'nagadInstructions', label: 'Nagad Instructions', type: 'textarea', required: false, public: true },
      
      { key: 'bankEnabled', label: 'Bank Transfer - Enabled', type: 'select', required: true, options: [{value: 'true', label: 'ON'}, {value: 'false', label: 'OFF'}], public: true },
      { key: 'bankName', label: 'Bank Name', type: 'text', required: false, public: true },
      { key: 'accountName', label: 'Account Name', type: 'text', required: false, public: true },
      { key: 'accountNumber', label: 'Account Number', type: 'text', required: false, public: true },
      { key: 'branch', label: 'Branch Name', type: 'text', required: false, public: true },
      { key: 'routingNumber', label: 'Routing Number', type: 'text', required: false, public: true },
      { key: 'bankInstructions', label: 'Bank Instructions', type: 'textarea', required: false, public: true },
    ],
    submissionFields: [
      { key: 'customPaymentType', label: 'Payment Method Used', type: 'select', required: true, options: [{value: 'bkash', label: 'bKash'}, {value: 'nagad', label: 'Nagad'}, {value: 'bank_transfer', label: 'Bank Transfer'}] },
      TXN_ID,
      SENDER_NUMBER,
    ],
    accent: 'text-gray-600 border-gray-500/30 bg-gray-500/10',
    defaultSortOrder: 5,
    type: 'manual',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: true,
  },
  // ── Bangladeshi mobile wallets ────────────────────────────────────────────
  {
    code: 'bkash',
    name: 'bKash',
    group: 'bd_wallet',
    checkout: 'redirect',
    description: 'bKash Tokenized Checkout (grant → create → execute).',
    countries: ['BD'],
    currencies: ['BDT'],
    fields: [
      { key: 'appKey', label: 'App key', type: 'text', required: true },
      {
        key: 'appSecret',
        label: 'App secret',
        type: 'password',
        required: true,
        secret: true,
      },
      { key: 'username', label: 'Username', type: 'text', required: true },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        secret: true,
      },
      ENVIRONMENT,
      {
        key: 'apiBaseUrl',
        label: 'API base URL override',
        type: 'url',
        required: false,
        help: 'Optional — only if merchant docs require a different base.',
      },
    ],
    submissionFields: [],
    accent: 'text-pink-600 border-pink-500/30 bg-pink-500/10',
    defaultSortOrder: 10,
    type: 'api',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: false,
  },
  {
    code: 'nagad',
    name: 'Nagad',
    group: 'bd_wallet',
    checkout: 'redirect',
    description:
      'Nagad DFS checkout. Merchant-doc dependent — confirm RSA/crypto before production.',
    countries: ['BD'],
    currencies: ['BDT'],
    fields: [
      { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
      {
        key: 'merchantNumber',
        label: 'Merchant number (display)',
        type: 'text',
        required: false,
        public: true,
      },
      {
        key: 'merchantPrivateKey',
        label: 'Merchant RSA private key (PEM)',
        type: 'textarea',
        required: true,
        secret: true,
      },
      {
        key: 'nagadPublicKey',
        label: 'Nagad RSA public key (PEM)',
        type: 'textarea',
        required: true,
      },
      ENVIRONMENT,
      {
        key: 'apiBaseUrl',
        label: 'API base URL override',
        type: 'url',
        required: false,
      },
    ],
    submissionFields: [],
    accent: 'text-orange-600 border-orange-500/30 bg-orange-500/10',
    defaultSortOrder: 20,
    type: 'api',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: false,
  },
  mfsGateway(
    'rocket',
    'Rocket',
    'Dutch-Bangla Bank mobile banking — manual MFS only (no automated API).',
    30,
    'text-purple-600 border-purple-500/30 bg-purple-500/10',
  ),
  {
    ...mfsGateway(
      'upay',
      'Upay',
      'UCB-backed MFS. Manual by default; optional HTTPS apiBaseUrl enables merchant API.',
      40,
      'text-sky-600 border-sky-500/30 bg-sky-500/10',
    ),
    type: 'hybrid',
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
        help: 'Only set if your Upay merchant docs provide a fixed HTTPS base.',
      },
      { key: 'merchantId', label: 'Merchant ID (API)', type: 'text', required: false },
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
  },

  // ── Bangladeshi aggregators ───────────────────────────────────────────────
  {
    code: 'sslcommerz',
    name: 'SSLCommerz',
    group: 'bd_aggregator',
    checkout: 'redirect',
    description: 'Cards, MFS and net banking aggregator for Bangladesh.',
    countries: ['BD'],
    currencies: ['BDT', 'USD'],
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
    submissionFields: [],
    accent: 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10',
    defaultSortOrder: 50,
    type: 'api',
    supportsRefund: false,
    supportsWebhook: true,
    supportsManualReview: false,
  },
  {
    code: 'aamarpay',
    name: 'aamarPay',
    group: 'bd_aggregator',
    checkout: 'redirect',
    description: 'Bangladeshi payment aggregator supporting cards and MFS.',
    countries: ['BD'],
    currencies: ['BDT'],
    fields: [
      { key: 'storeId', label: 'Store ID', type: 'text', required: true },
      {
        key: 'signatureKey',
        label: 'Signature key',
        type: 'password',
        required: true,
        secret: true,
      },
      ENVIRONMENT,
    ],
    submissionFields: [],
    accent: 'text-teal-600 border-teal-500/30 bg-teal-500/10',
    defaultSortOrder: 60,
    type: 'api',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: false,
  },
  {
    code: 'shurjopay',
    name: 'ShurjoPay',
    group: 'bd_aggregator',
    checkout: 'redirect',
    description: 'Payment gateway by ShurjoMukhi, Bangladesh.',
    countries: ['BD'],
    currencies: ['BDT'],
    fields: [
      { key: 'merchantUsername', label: 'Merchant username', type: 'text', required: true },
      {
        key: 'merchantPassword',
        label: 'Merchant password',
        type: 'password',
        required: true,
        secret: true,
      },
      { key: 'prefix', label: 'Order prefix', type: 'text', required: false },
      ENVIRONMENT,
    ],
    submissionFields: [],
    accent: 'text-indigo-600 border-indigo-500/30 bg-indigo-500/10',
    defaultSortOrder: 70,
    type: 'api',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: false,
  },

  // ── International cards ───────────────────────────────────────────────────
  {
    code: 'stripe',
    name: 'Stripe',
    group: 'international',
    checkout: 'redirect',
    description: 'Card payments worldwide via Checkout Sessions.',
    countries: [],
    currencies: [],
    fields: [
      {
        key: 'publishableKey',
        label: 'Publishable key',
        type: 'text',
        required: true,
        placeholder: 'pk_live_…',
      },
      {
        key: 'secretKey',
        label: 'Secret key',
        type: 'password',
        required: true,
        placeholder: 'sk_live_…',
        secret: true,
      },
      {
        key: 'webhookSecret',
        label: 'Webhook signing secret',
        type: 'password',
        required: false,
        secret: true,
      },
      ENVIRONMENT,
    ],
    submissionFields: [],
    accent: 'text-violet-600 border-violet-500/30 bg-violet-500/10',
    defaultSortOrder: 80,
    type: 'api',
    supportsRefund: true,
    supportsWebhook: true,
    supportsManualReview: false,
  },
  {
    code: 'paypal',
    name: 'PayPal',
    group: 'international',
    checkout: 'redirect',
    description: 'PayPal Orders v2 (CAPTURE).',
    countries: [],
    currencies: [],
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      {
        key: 'clientSecret',
        label: 'Client secret',
        type: 'password',
        required: true,
        secret: true,
      },
      ENVIRONMENT,
      {
        key: 'webhookId',
        label: 'Webhook ID',
        type: 'text',
        required: false,
      },
    ],
    submissionFields: [],
    accent: 'text-blue-600 border-blue-500/30 bg-blue-500/10',
    defaultSortOrder: 90,
    type: 'api',
    supportsRefund: true,
    supportsWebhook: true,
    supportsManualReview: false,
  },
  {
    code: 'paddle',
    name: 'Paddle',
    group: 'international',
    checkout: 'redirect',
    description: 'Merchant of record — handles VAT and sales tax.',
    countries: [],
    currencies: [],
    fields: [
      { key: 'vendorId', label: 'Vendor / Seller ID', type: 'text', required: false },
      { key: 'apiKey', label: 'API key', type: 'password', required: true, secret: true },
      {
        key: 'priceId',
        label: 'Default Price ID',
        type: 'text',
        required: false,
        help: 'Optional price_… id; otherwise ad-hoc unit_price is used.',
      },
      {
        key: 'webhookSecret',
        label: 'Webhook secret',
        type: 'password',
        required: false,
        secret: true,
      },
      ENVIRONMENT,
    ],
    submissionFields: [],
    accent: 'text-amber-600 border-amber-500/30 bg-amber-500/10',
    defaultSortOrder: 100,
    type: 'api',
    supportsRefund: true,
    supportsWebhook: true,
    supportsManualReview: false,
  },
  {
    code: 'razorpay',
    name: 'Razorpay',
    group: 'international',
    checkout: 'redirect',
    description: 'Cards, UPI and netbanking for India.',
    countries: ['IN'],
    currencies: ['INR'],
    fields: [
      { key: 'keyId', label: 'Key ID', type: 'text', required: true, placeholder: 'rzp_live_…' },
      { key: 'keySecret', label: 'Key secret', type: 'password', required: true, secret: true },
      {
        key: 'webhookSecret',
        label: 'Webhook secret',
        type: 'password',
        required: false,
        secret: true,
      },
      ENVIRONMENT,
    ],
    submissionFields: [],
    accent: 'text-cyan-600 border-cyan-500/30 bg-cyan-500/10',
    defaultSortOrder: 110,
    type: 'api',
    supportsRefund: true,
    supportsWebhook: true,
    supportsManualReview: false,
  },

  // ── Bank transfer ─────────────────────────────────────────────────────────
  {
    code: 'bank_transfer',
    name: 'Bank Transfer',
    group: 'bank',
    checkout: 'manual',
    description: 'Direct bank deposit or wire transfer.',
    countries: [],
    currencies: [],
    fields: [
      { key: 'bankName', label: 'Bank name', type: 'text', required: true, public: true },
      { key: 'accountName', label: 'Account name', type: 'text', required: true, public: true },
      { key: 'accountNumber', label: 'Account number', type: 'text', required: true, public: true },
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
      { key: 'transactionId', label: 'Reference / slip number', type: 'text', required: true },
      { key: 'senderName', label: 'Sender account name', type: 'text', required: false },
    ],
    accent: 'text-slate-600 border-slate-500/30 bg-slate-500/10',
    defaultSortOrder: 120,
    type: 'manual',
    supportsRefund: false,
    supportsWebhook: false,
    supportsManualReview: true,
  },
];

export const GATEWAY_GROUP_LABELS: Record<GatewayGroup, string> = {
  bd_wallet: 'Bangladesh — Mobile Wallets',
  bd_aggregator: 'Bangladesh — Aggregators',
  international: 'International',
  bank: 'Bank Transfer',
};

/** Adapter capability snapshot keyed by gateway code. */
export const GATEWAY_CAPABILITIES = Object.fromEntries(
  GATEWAYS.map((g) => [
    g.code,
    {
      type: g.type,
      checkout: g.checkout,
      supportsRefund: g.supportsRefund,
      supportsWebhook: g.supportsWebhook,
      supportsManualReview: g.supportsManualReview,
    },
  ]),
) as Record<
  string,
  {
    type: GatewayType;
    checkout: GatewayCheckout;
    supportsRefund: boolean;
    supportsWebhook: boolean;
    supportsManualReview: boolean;
  }
>;

const BY_CODE = new Map(GATEWAYS.map((g) => [g.code, g]));

export function getGatewayDef(code: string): GatewayDef | undefined {
  return BY_CODE.get(code);
}

export function isKnownGateway(code: string): boolean {
  return BY_CODE.has(code);
}

export type GatewayConfig = Record<string, string>;

/**
 * Which required fields are still empty. An empty array means the gateway is
 * safe to enable — the admin API refuses to flip `isEnabled` otherwise.
 */
export function missingRequiredFields(code: string, config: GatewayConfig): string[] {
  const def = getGatewayDef(code);
  if (!def) return ['unknown gateway'];
  const missing = def.fields
    .filter((f) => f.required && !String(config?.[f.key] ?? '').trim())
    .map((f) => f.label);

  if (code === 'custom_payment') {
    if (config?.bkashEnabled === 'true') { if (!config?.bkashNumber?.trim()) missing.push('bKash Number'); else if (!/^01[3-9]\d{8}$/.test(config.bkashNumber.trim())) missing.push('Valid bKash Number (01XXXXXXXXX)'); }
    if (config?.nagadEnabled === 'true') { if (!config?.nagadNumber?.trim()) missing.push('Nagad Number'); else if (!/^01[3-9]\d{8}$/.test(config.nagadNumber.trim())) missing.push('Valid Nagad Number (01XXXXXXXXX)'); }
    if (config?.bankEnabled === 'true') {
      if (!config?.bankName?.trim()) missing.push('Bank Name');
      if (!config?.accountName?.trim()) missing.push('Account Name');
      if (!config?.accountNumber?.trim()) missing.push('Account Number');
    }
  }

  return missing;
}

export function isGatewayConfigured(code: string, config: GatewayConfig): boolean {
  return missingRequiredFields(code, config).length === 0;
}

/** Strip secrets — used for anything an admin isn't reading. */
export function publicConfig(code: string, config: GatewayConfig): GatewayConfig {
  const def = getGatewayDef(code);
  if (!def) return {};
  const out: GatewayConfig = {};
  for (const field of def.fields) {
    if (!field.public) continue;
    const value = config?.[field.key];
    if (value != null && String(value).trim()) out[field.key] = String(value);
  }
  return out;
}

/** Replace secret values with a placeholder so the admin form can show state. */
export const SECRET_MASK = '••••••••';

export function maskedConfig(code: string, config: GatewayConfig): GatewayConfig {
  const def = getGatewayDef(code);
  if (!def) return {};
  const out: GatewayConfig = {};
  for (const field of def.fields) {
    const value = config?.[field.key];
    if (value == null || !String(value).trim()) continue;
    out[field.key] = field.secret ? SECRET_MASK : String(value);
  }
  return out;
}
