import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Mock the admin session so mutations are authorized (and can be flipped to test rejection).
vi.mock('@/lib/admin-auth.server', () => ({
  getAdminSession: vi.fn(() =>
    Promise.resolve({ user: { role: 'super_admin', permissions: ['*'] } })
  ),
}));
// Avoid Next request-scope errors from revalidatePath in a plain node test.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getAdminSession } from '@/lib/admin-auth.server';
import {
  createModel,
  updateModel,
  deleteModel,
  getModel,
  listModel,
  reorderModel,
} from '@/lib/cms-models/actions';
import { getRoadmapItems } from '@/lib/cms-models/public';
import { db } from '@/lib/db';

const P = 'zzt-rm-'; // slug-safe prefix (survives slugify)

async function cleanup() {
  await db.roadmapItem.deleteMany({ where: { slug: { startsWith: P } } });
}

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(getAdminSession).mockResolvedValue({
    user: { role: 'super_admin', permissions: ['*'] },
  } as any);
});

afterAll(async () => {
  await cleanup();
  await db.$disconnect();
});

describe('cms-models generic actions', () => {
  it('creates, reads, updates and deletes a record', async () => {
    const { id } = await createModel('roadmap', {
      title: 'T1',
      slug: `${P}one`,
      phase: 'now',
      published: true,
    });
    expect(id).toBeTruthy();
    const rec = await getModel('roadmap', id);
    expect(rec.title).toBe('T1');
    await updateModel('roadmap', id, { title: 'T1 updated' });
    expect((await getModel('roadmap', id)).title).toBe('T1 updated');
    await deleteModel('roadmap', id);
    expect(await getModel('roadmap', id)).toBeNull();
  });

  it('enforces slug uniqueness', async () => {
    await createModel('roadmap', { title: 'A', slug: `${P}dup`, published: true });
    await expect(createModel('roadmap', { title: 'B', slug: `${P}dup` })).rejects.toThrow(/slug/i);
  });

  it('hides drafts from public reads but shows them to admin list', async () => {
    await createModel('roadmap', { title: 'Draft', slug: `${P}draft`, published: false });
    await createModel('roadmap', { title: 'Live', slug: `${P}live`, published: true });
    const publicSlugs = (await getRoadmapItems()).map((r) => r.slug);
    expect(publicSlugs).toContain(`${P}live`);
    expect(publicSlugs).not.toContain(`${P}draft`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminSlugs = (await listModel('roadmap', { take: 500 })).items.map((r: any) => r.slug);
    expect(adminSlugs).toContain(`${P}draft`);
  });

  it('reorders records by position', async () => {
    const a = await createModel('roadmap', { title: 'O1', slug: `${P}o1` });
    const b = await createModel('roadmap', { title: 'O2', slug: `${P}o2` });
    await reorderModel('roadmap', [b.id, a.id]);
    expect((await getModel('roadmap', b.id)).position).toBe(0);
    expect((await getModel('roadmap', a.id)).position).toBe(1);
  });

  it('stores the featured flag', async () => {
    const { id } = await createModel('roadmap', {
      title: 'F',
      slug: `${P}feat`,
      featured: true,
      published: true,
    });
    expect((await getModel('roadmap', id)).featured).toBe(true);
  });

  it('returns an empty result set for a no-match query (empty state)', async () => {
    const res = await listModel('roadmap', { q: 'zzz-definitely-no-match-xyz-123' });
    expect(res.total).toBe(0);
    expect(res.items).toEqual([]);
  });

  it('rejects unauthenticated writes', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAdminSession).mockResolvedValueOnce(null as any);
    await expect(createModel('roadmap', { title: 'X', slug: `${P}unauth` })).rejects.toThrow(
      /unauthorized/i
    );
  });
});
