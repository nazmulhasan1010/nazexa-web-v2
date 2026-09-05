export async function adminFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const adminApi = {
  gateways: () => adminFetch<AdminGateway[]>('/api/admin/payments/gateways'),

  updateGateway: (body: {
    id: string;
    displayName?: string;
    instructions?: string;
    config?: Record<string, string>;
    isEnabled?: boolean;
    priority?: number;
    environment?: 'sandbox' | 'production';
  }) =>
    adminFetch<{ id: string; isEnabled: boolean }>('/api/admin/payments/gateways', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  testGateway: (id: string) =>
    adminFetch<{ ok: boolean; message: string; liveVerified: boolean }>(
      '/api/admin/payments/gateways',
      {
        method: 'PATCH',
        body: JSON.stringify({ id, action: 'test' }),
      },
    ),

  paymentRequests: (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') sp.set(k, String(v));
    });
    return adminFetch<AdminPaymentRequestResponse>(`/api/admin/payments/requests?${sp}`);
  },

  reviewPaymentRequest: (body: {
    id: string;
    action: 'approve' | 'reject' | 'clarify';
    note?: string;
  }) =>
    adminFetch<{ id: string; status: string }>('/api/admin/payments/requests', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export type AdminGatewayField = {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: string; label: string }>;
  secret?: boolean;
  public?: boolean;
};

export type AdminGatewaySubmissionField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  help?: string;
};

export type AdminGateway = {
  id: string;
  code: string;
  name: string;
  displayName: string | null;
  group: 'bd_wallet' | 'bd_aggregator' | 'international' | 'bank';
  checkout: 'manual' | 'redirect';
  type?: string;
  description: string;
  instructions: string | null;
  isEnabled: boolean;
  sortOrder: number;
  priority?: number;
  environment?: string;
  accent: string;
  fields: AdminGatewayField[];
  submissionFields: AdminGatewaySubmissionField[];
  config: Record<string, string>;
  missingFields: string[];
  isConfigured: boolean;
  lastTestStatus?: string | null;
  lastTestMessage?: string | null;
};

export type AdminPaymentRequest = {
  id: string;
  publicId?: string;
  status: string;
  amount: string;
  currency: string;
  amountUsd: string;
  reference: string | null;
  details: Record<string, string>;
  detailLabels: Record<string, string>;
  adminNote: string | null;
  user: { id: string; email: string; name: string | null };
  planName: string;
  planSlug: string;
  product: string;
  gatewayCode: string;
  gatewayName: string;
  createdAt: string;
  reviewedAt: string | null;
  fulfillmentStatus?: string;
};

export type AdminPaymentRequestResponse = {
  items: AdminPaymentRequest[];
  total: number;
  pendingCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
