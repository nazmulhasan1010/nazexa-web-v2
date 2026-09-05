/**
 * Payment security helpers — unit tests.
 */

import { describe, expect, it } from 'vitest';
import { isAllowlistedUrl } from '@/lib/payments/s2s-auth';
import { sanitizeForStorage, truncatePayload } from '@/lib/payments/secrets';

describe('isAllowlistedUrl', () => {
  const allowed = 'https://app.nazexa.com,https://billing.example.com';

  it('allows matching origin', () => {
    expect(isAllowlistedUrl('https://app.nazexa.com/billing/done', allowed)).toBe(true);
    expect(isAllowlistedUrl('https://billing.example.com/x?y=1', allowed)).toBe(true);
  });

  it('rejects evil.com and other origins', () => {
    expect(isAllowlistedUrl('https://evil.com/steal', allowed)).toBe(false);
    expect(isAllowlistedUrl('https://app.nazexa.com.evil.com/', allowed)).toBe(false);
    expect(isAllowlistedUrl('http://app.nazexa.com/billing/done', allowed)).toBe(false);
  });

  it('rejects when allowlist empty but url present', () => {
    expect(isAllowlistedUrl('https://app.nazexa.com/', '')).toBe(false);
    expect(isAllowlistedUrl('https://app.nazexa.com/', null)).toBe(false);
  });

  it('allows missing url', () => {
    expect(isAllowlistedUrl(null, allowed)).toBe(true);
    expect(isAllowlistedUrl(undefined, allowed)).toBe(true);
  });
});

describe('sanitizeForStorage', () => {
  it('redacts secret-looking keys', () => {
    const out = sanitizeForStorage({
      storeId: 'store_1',
      signature_key: 'sk_live_xxx',
      nested: { clientSecret: 'shh', amount: '10' },
      password: 'p',
      token: 't',
    }) as Record<string, unknown>;

    expect(out.storeId).toBe('store_1');
    expect(out.signature_key).toBe('[redacted]');
    expect(out.password).toBe('[redacted]');
    expect(out.token).toBe('[redacted]');
    expect((out.nested as Record<string, unknown>).clientSecret).toBe('[redacted]');
    expect((out.nested as Record<string, unknown>).amount).toBe('10');
  });
});

describe('truncatePayload', () => {
  it('leaves short strings unchanged', () => {
    expect(truncatePayload('hello', 100)).toBe('hello');
  });

  it('truncates long payloads with marker', () => {
    const long = 'a'.repeat(50);
    const out = truncatePayload(long, 20);
    expect(out.startsWith('a'.repeat(20))).toBe(true);
    expect(out).toContain('[truncated]');
    expect(out.length).toBeLessThan(long.length + 20);
  });
});
