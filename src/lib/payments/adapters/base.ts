/**
 * Shared helpers for payment gateway adapters.
 * Never log secrets, tokens, or raw credential values.
 */

import type { PaymentEnvironment, ValidationResult } from '@/lib/payments/types';

/** Zero-decimal currencies (amount already in minor units for Stripe-style APIs). */
const ZERO_DECIMAL = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'JPY',
  'KMF',
  'KRW',
  'MGA',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

export const AMOUNT_TOLERANCE = 0.001;

export function normalizeCurrency(currency: string): string {
  return String(currency || '')
    .trim()
    .toUpperCase();
}

export function parseAmount(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Compare amounts with a small tolerance for decimal currencies. */
export function amountsMatch(
  expected: string | number,
  actual: string | number,
  tolerance = AMOUNT_TOLERANCE
): boolean {
  const a = parseAmount(expected);
  const b = parseAmount(actual);
  if (a == null || b == null) return false;
  return Math.abs(a - b) <= tolerance;
}

export function currenciesMatch(a: string, b: string): boolean {
  return normalizeCurrency(a) === normalizeCurrency(b);
}

/** Convert major units to minor (cents/paise). */
export function toMinorUnits(amount: string | number, currency: string): number | null {
  const major = parseAmount(amount);
  if (major == null) return null;
  const cur = normalizeCurrency(currency);
  if (ZERO_DECIMAL.has(cur)) return Math.round(major);
  return Math.round(major * 100);
}

export function fromMinorUnits(minor: number, currency: string): string {
  const cur = normalizeCurrency(currency);
  if (ZERO_DECIMAL.has(cur)) return String(minor);
  return (minor / 100).toFixed(2);
}

export function isSandbox(
  environment: PaymentEnvironment,
  config?: Record<string, string>
): boolean {
  if (config?.environment === 'production' || config?.environment === 'live') return false;
  if (config?.environment === 'sandbox' || config?.environment === 'test') return true;
  if (config?.sandbox === 'false' || config?.sandbox === '0') return false;
  if (config?.sandbox === 'true' || config?.sandbox === '1') return true;
  return environment === 'sandbox';
}

export function requireFields(config: Record<string, string>, keys: string[]): ValidationResult {
  const errors: string[] = [];
  for (const key of keys) {
    if (!String(config?.[key] ?? '').trim()) {
      errors.push(`Missing required field: ${key}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function asStringConfig(config: unknown): Record<string, string> {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(config as Record<string, unknown>)) {
    if (v == null) continue;
    out[k] = String(v);
  }
  return out;
}

export function formEncode(
  data: Record<string, string | number | boolean | null | undefined>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export interface JsonFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  /** Form-urlencoded body (mutually exclusive with JSON body). */
  form?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
  /** Basic auth username:password */
  basicAuth?: { username: string; password: string };
  bearer?: string;
}

export interface JsonFetchResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  text: string;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 25_000;

export async function jsonFetch<T = unknown>(
  url: string,
  options: JsonFetchOptions = {}
): Promise<JsonFetchResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { ...(options.headers ?? {}) };

    if (options.basicAuth) {
      const token = Buffer.from(
        `${options.basicAuth.username}:${options.basicAuth.password}`,
        'utf8'
      ).toString('base64');
      headers.Authorization = `Basic ${token}`;
    }
    if (options.bearer) {
      headers.Authorization = `Bearer ${options.bearer}`;
    }

    let body: string | undefined;
    if (options.form) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/x-www-form-urlencoded';
      body = formEncode(options.form);
    } else if (options.body !== undefined) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const res = await fetch(url, {
      method: options.method ?? (body ? 'POST' : 'GET'),
      headers,
      body,
      signal: controller.signal,
    });

    const text = await res.text();
    let data: T | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = null;
      }
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
      text,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Request timed out'
          : err.message
        : 'Network error';
    return { ok: false, status: 0, data: null, text: '', error: message };
  } finally {
    clearTimeout(timeout);
  }
}

/** Safe summary for storage — never include secret-looking keys. */
export function safeSummary(value: unknown, max = 2_000): string {
  try {
    const SENSITIVE = /(secret|password|passwd|signature|private|token|authorization|key)/i;
    const scrub = (v: unknown): unknown => {
      if (Array.isArray(v)) return v.map(scrub);
      if (!v || typeof v !== 'object') return v;
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        out[k] = SENSITIVE.test(k) ? '[redacted]' : scrub(val);
      }
      return out;
    };
    const s = JSON.stringify(scrub(value));
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return '[unserializable]';
  }
}

export function cfg(config: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const v = config[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}
