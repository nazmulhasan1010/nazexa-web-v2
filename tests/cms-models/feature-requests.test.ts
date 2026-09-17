import { describe, it, expect, afterAll, vi } from 'vitest';

// Fixed voter cookie so dedup is deterministic; stub revalidate + request scope.
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => ({ value: 'zzt-voter-1' }), set: () => {} }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { voteFeatureRequest } from '@/lib/cms-models/feature-requests';
import { getStatusComponents } from '@/lib/cms-models/public';
import { db } from '@/lib/db';

afterAll(async () => {
  await db.featureRequestVote.deleteMany({ where: { voter_key: 'zzt-voter-1' } });
  await db.featureRequest.deleteMany({ where: { slug: { startsWith: 'zzt-fr-' } } });
  await db.$disconnect();
});

describe('feature-request voting', () => {
  it('records a vote once and dedups a repeat from the same browser', async () => {
    const fr = await db.featureRequest.create({
      data: { title: 'Vote test', slug: 'zzt-fr-vote', published: true },
    });
    const first = await voteFeatureRequest(fr.id);
    expect(first.ok).toBe(true);
    expect(first.votes).toBe(1);

    const second = await voteFeatureRequest(fr.id);
    expect(second.ok).toBe(false);
    expect(second.already).toBe(true);

    const fresh = await db.featureRequest.findUnique({ where: { id: fr.id } });
    expect(fresh?.vote_count).toBe(1);
  });
});

describe('status adapter', () => {
  it('falls back to DB components when no external monitor is configured', async () => {
    delete process.env.STATUS_API_URL;
    const components = await getStatusComponents();
    expect(Array.isArray(components)).toBe(true);
    // Shape check (name/status present) — seeded data provides real rows.
    if (components.length > 0) {
      expect(components[0]).toHaveProperty('name');
      expect(components[0]).toHaveProperty('status');
    }
  });
});
