/**
 * Server-side country detection for currency selection.
 *
 * Resolution order — cheapest and most reliable first:
 *   1. CDN geo headers (Vercel / Cloudflare / Fastly / CloudFront)
 *   2. External IP lookup, only for public IPs, cached in-memory
 *   3. Accept-Language region subtag
 * Never throws: an unresolved country just means the USD default.
 */

import { currencyForCountry, type CurrencyCode } from '@/lib/currency';

export type GeoSource = 'header' | 'lookup' | 'language' | 'default';

export interface GeoResult {
  country: string | null;
  currency: CurrencyCode;
  source: GeoSource;
}

const COUNTRY_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-country-code',
  'fastly-client-country',
  'cloudfront-viewer-country',
];

const IP_HEADERS = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'x-client-ip'];

const LOOKUP_TIMEOUT_MS = 1500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

const cache = new Map<string, { country: string | null; expires: number }>();

function normalizeCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  // Cloudflare uses XX for unknown and T1 for Tor exit nodes.
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX' || code === 'T1') return null;
  return code;
}

export function clientIp(headers: Headers): string | null {
  for (const name of IP_HEADERS) {
    const raw = headers.get(name);
    if (!raw) continue;
    const first = raw.split(',')[0]?.trim();
    if (first) return first.replace(/^\[|\]$/g, '');
  }
  return null;
}

/** True for loopback, link-local, and RFC1918-style addresses — not worth a lookup. */
export function isPrivateIp(ip: string): boolean {
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return true;
  if (ip.startsWith('::ffff:')) return isPrivateIp(ip.slice(7));
  if (/^(10|127)\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  // IPv6 unique-local (fc00::/7) and link-local (fe80::/10).
  if (/^f[cd]/i.test(ip) || /^fe[89ab]/i.test(ip)) return true;
  return false;
}

function countryFromLanguage(headers: Headers): string | null {
  const header = headers.get('accept-language');
  if (!header) return null;
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim();
    if (!tag) continue;
    const region = tag.split('-')[1];
    const code = normalizeCountry(region);
    if (code) return code;
  }
  return null;
}

function readCache(ip: string): string | null | undefined {
  const hit = cache.get(ip);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    cache.delete(ip);
    return undefined;
  }
  return hit.country;
}

function writeCache(ip: string, country: string | null) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(ip, { country, expires: Date.now() + CACHE_TTL_MS });
}

/**
 * External lookup sends the visitor IP to a third party. On by default so
 * currency detection works off-CDN; set GEO_IP_LOOKUP=false to keep IPs local
 * (detection then falls back to CDN headers and Accept-Language).
 */
function externalLookupEnabled(): boolean {
  const flag = process.env.GEO_IP_LOOKUP?.trim().toLowerCase();
  return flag !== 'false' && flag !== '0' && flag !== 'off';
}

/** Public view of the same flag, for callers that batch their own lookups. */
export function isExternalLookupEnabled(): boolean {
  return externalLookupEnabled();
}

/**
 * Resolve a single IP to a country, memoised in the module cache.
 *
 * Exported so the admin dashboard can attribute stored `lastLoginIp` values
 * without duplicating the cache, timeout and failure handling. Callers are
 * responsible for skipping private IPs and honouring `isExternalLookupEnabled`.
 */
export async function lookupCountry(ip: string): Promise<string | null> {
  const cached = readCache(ip);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: controller.signal,
      headers: { accept: 'text/plain' },
      cache: 'no-store',
    });
    if (!res.ok) {
      writeCache(ip, null);
      return null;
    }
    const country = normalizeCountry((await res.text()).slice(0, 8));
    writeCache(ip, country);
    return country;
  } catch {
    // Timeout, network failure, or rate limit — cache the miss briefly via TTL.
    writeCache(ip, null);
    return null;
  } finally {
    // Without this the abort timer stays pending until it fires, holding the
    // event loop open on every successful lookup.
    clearTimeout(timer);
  }
}

export async function resolveGeo(headers: Headers): Promise<GeoResult> {
  for (const name of COUNTRY_HEADERS) {
    const country = normalizeCountry(headers.get(name));
    if (country) {
      return {
        country,
        currency: currencyForCountry(country),
        source: 'header',
      };
    }
  }

  const ip = clientIp(headers);
  if (ip && !isPrivateIp(ip) && externalLookupEnabled()) {
    const country = await lookupCountry(ip);
    if (country) {
      return {
        country,
        currency: currencyForCountry(country),
        source: 'lookup',
      };
    }
  }

  const fromLanguage = countryFromLanguage(headers);
  if (fromLanguage) {
    return {
      country: fromLanguage,
      currency: currencyForCountry(fromLanguage),
      source: 'language',
    };
  }

  return {
    country: null,
    currency: currencyForCountry(null),
    source: 'default',
  };
}
