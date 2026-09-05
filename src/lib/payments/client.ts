/** Browser-side payment API calls. */

export class PaymentApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'PaymentApiError';
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new PaymentApiError(
      data?.error || `Request failed (${res.status})`,
      res.status,
      data?.code,
    );
  }
  return data as T;
}

export const paymentsApi = {
  async isAvailable(currency?: string, product?: string): Promise<boolean> {
    try {
      const sp = new URLSearchParams();
      if (currency) sp.set('currency', currency);
      if (product) sp.set('product', product);
      const q = sp.toString();
      const data = await request<{ available: boolean }>(
        `/api/payments/availability${q ? `?${q}` : ''}`,
      );
      return Boolean(data.available);
    } catch {
      return false;
    }
  },

  initiate(input: { transactionId: string; gatewayId: string }) {
    return request<{
      redirectUrl: string | null;
      requiresManualProof: boolean;
      status: string;
    }>('/api/payments/submit', {
      method: 'POST',
      body: JSON.stringify({ ...input, action: 'initiate' }),
    });
  },

  submitProof(input: {
    transactionId: string;
    gatewayId: string;
    details: Record<string, string>;
  }) {
    return request<{ status: string }>('/api/payments/submit', {
      method: 'POST',
      body: JSON.stringify({ ...input, action: 'submit_proof' }),
    });
  },

  status(publicId: string) {
    return request<{ status: string; paidAt: string | null }>(
      `/api/payments/status?publicId=${encodeURIComponent(publicId)}`,
    );
  },
};
