import type { ProviderRateLimits } from './types';

/** Header-like: a fetch `Headers`, a plain object, or anything with `.get()`. */
type HeaderLike =
  Headers | Record<string, string | string[] | undefined> | { get(name: string): string | null };

function readHeader(headers: HeaderLike, name: string): string | null {
  if (!headers) return null;
  // fetch Headers / openai SDK response.headers
  if (typeof (headers as { get?: unknown }).get === 'function') {
    return (headers as { get(n: string): string | null }).get(name);
  }
  // plain object — headers are case-insensitive, so try a few forms
  const obj = headers as Record<string, string | string[] | undefined>;
  const raw = obj[name] ?? obj[name.toLowerCase()] ?? obj[name.toUpperCase()];
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

function toNum(value: string | null): number | null {
  if (value == null) return null;
  // Some providers suffix reset values (e.g. "1m30s", "6ms") — those stay strings.
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse the standard `x-ratelimit-*` headers returned by OpenAI- and
 * Groq-style APIs into our normalized shape. Returns `null` when no
 * rate-limit headers are present (e.g. Google, which sends none).
 */
export function parseRateLimitHeaders(headers: HeaderLike): ProviderRateLimits | null {
  const limitRequests = readHeader(headers, 'x-ratelimit-limit-requests');
  const remainingRequests = readHeader(headers, 'x-ratelimit-remaining-requests');
  const resetRequests = readHeader(headers, 'x-ratelimit-reset-requests');
  const limitTokens = readHeader(headers, 'x-ratelimit-limit-tokens');
  const remainingTokens = readHeader(headers, 'x-ratelimit-remaining-tokens');
  const resetTokens = readHeader(headers, 'x-ratelimit-reset-tokens');
  const retryAfter = readHeader(headers, 'retry-after');

  const hasRequests = limitRequests != null || remainingRequests != null;
  const hasTokens = limitTokens != null || remainingTokens != null;
  if (!hasRequests && !hasTokens && retryAfter == null) return null;

  const result: ProviderRateLimits = {};
  if (hasRequests) {
    result.requests = {
      limit: toNum(limitRequests),
      remaining: toNum(remainingRequests),
      reset: resetRequests ?? null,
    };
  }
  if (hasTokens) {
    result.tokens = {
      limit: toNum(limitTokens),
      remaining: toNum(remainingTokens),
      reset: resetTokens ?? null,
    };
  }
  if (retryAfter != null) result.retryAfter = toNum(retryAfter);
  return result;
}
