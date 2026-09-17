import { describe, it, expect } from 'vitest';

import { serviceBySlug, services, serviceSlugs } from '@/lib/services';

describe('serviceBySlug', () => {
  it('is a callable function (regression: was an object map)', () => {
    expect(typeof serviceBySlug).toBe('function');
  });

  it('returns the matching service for a valid slug', () => {
    const first = services[0];
    expect(first).toBeDefined();
    const found = serviceBySlug(first!.slug);
    expect(found).toBeDefined();
    expect(found?.slug).toBe(first!.slug);
    expect(found?.name).toBe(first!.name);
  });

  it('returns undefined for an invalid slug', () => {
    expect(serviceBySlug('this-slug-does-not-exist')).toBeUndefined();
    expect(serviceBySlug('')).toBeUndefined();
  });

  it('resolves every known service slug', () => {
    expect(serviceSlugs.length).toBeGreaterThan(0);
    for (const slug of serviceSlugs) {
      expect(serviceBySlug(slug)?.slug).toBe(slug);
    }
  });
});
