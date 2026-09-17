'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';
import { MODEL_REGISTRY, type ModelConfig } from './registry';

// Public routes to revalidate when a model changes.
const MODEL_ROUTES: Record<string, string[]> = {
  jobs: ['/careers'],
  resources: ['/resources'],
  'press-assets': ['/press-kit'],
  milestones: ['/about'],
  'learning-paths': ['/learning-center'],
  certifications: ['/learning-center'],
  releases: ['/changelog', '/release-notes'],
  downloads: ['/download-center'],
  roadmap: ['/roadmap'],
  docs: ['/documentation'],
  'api-endpoints': ['/api-documentation'],
  'api-errors': ['/api-documentation'],
  'status-components': ['/status'],
  incidents: ['/status'],
  'feature-requests': ['/feature-requests'],
};

// --- auth ---
// Every mutation is admin-gated here (the generic content actions historically relied only on
// the middleware cookie; new dedicated-model writes assert an authorized session explicitly).
async function assertAdmin() {
  const session = await getAdminSession();
  if (!session || !session.user) throw new Error('Unauthorized');
  const { role, permissions } = session.user as { role: string; permissions: string[] };
  if (role === 'super_admin') return;
  if (
    !permissions.includes('*') &&
    !permissions.includes('/admin/models') &&
    !permissions.includes('/admin/content')
  ) {
    throw new Error('Forbidden');
  }
}

function config(key: string): ModelConfig {
  const c = MODEL_REGISTRY[key];
  if (!c) throw new Error(`Unknown model: ${key}`);
  return c;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(c: ModelConfig): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (db as any)[c.delegate];
  if (!d) throw new Error(`No Prisma delegate: ${c.delegate}`);
  return d;
}

function slugify(v: string): string {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Coerce raw form values to the DB shape based on field types; validate required fields.
function coerce(c: ModelConfig, data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  const byName = new Map(c.fields.map((f) => [f.name, f]));
  for (const [k, v] of Object.entries(data)) {
    const f = byName.get(k);
    if (!f) continue;
    if (f.required && (v == null || v === '')) throw new Error(`${f.label} is required`);
    if (f.type === 'boolean') out[k] = Boolean(v);
    else if (f.type === 'number') out[k] = v === '' || v == null ? 0 : Number(v);
    else if (f.type === 'date') out[k] = v ? new Date(v as string) : null;
    else if (f.type === 'slug') out[k] = v ? slugify(String(v)) : '';
    else out[k] = v === '' ? null : v;
  }
  return out;
}

// Convert Date instances to ISO strings so records are safe to hand to client editors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(record: any) {
  if (!record) return record;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
}

function revalidateModel(key: string) {
  for (const route of MODEL_ROUTES[key] ?? []) {
    try {
      revalidatePath(route);
    } catch {
      /* best-effort */
    }
  }
}

async function assertSlugFree(c: ModelConfig, slug: string, exceptId?: string) {
  if (!c.slugField || !slug) return;
  const existing = await delegate(c).findFirst({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw new Error('That slug is already in use');
}

// --- reads ---
export async function listModel(
  key: string,
  opts: {
    q?: string;
    status?: 'all' | 'published' | 'draft';
    sort?: string;
    skip?: number;
    take?: number;
  } = {}
) {
  const c = config(key);
  const where: Record<string, unknown> = {};
  if (opts.status === 'published' && c.statusField) where[c.statusField] = true;
  if (opts.status === 'draft' && c.statusField) where[c.statusField] = false;
  if (opts.q && opts.q.trim()) where[c.titleField] = { contains: opts.q.trim() };

  const orderBy =
    opts.sort === 'created'
      ? { created_at: 'desc' as const }
      : opts.sort === 'updated'
        ? { updated_at: 'desc' as const }
        : opts.sort === 'title'
          ? { [c.titleField]: 'asc' as const }
          : c.orderField
            ? { [c.orderField]: 'asc' as const }
            : { created_at: 'desc' as const };

  const [items, total] = await Promise.all([
    delegate(c).findMany({ where, orderBy, skip: opts.skip ?? 0, take: opts.take ?? 100 }),
    delegate(c).count({ where }),
  ]);
  return { items: items.map(serialize), total };
}

export async function getModel(key: string, id: string) {
  const c = config(key);
  const record = await delegate(c).findUnique({ where: { id } });
  return serialize(record);
}

// --- mutations ---
export async function createModel(key: string, data: Record<string, unknown>) {
  await assertAdmin();
  const c = config(key);
  const payload = coerce(c, data);
  if (c.slugField) await assertSlugFree(c, payload[c.slugField] as string);
  const created = await delegate(c).create({ data: payload });
  revalidateModel(key);
  return { id: created.id as string };
}

export async function updateModel(key: string, id: string, data: Record<string, unknown>) {
  await assertAdmin();
  const c = config(key);
  const payload = coerce(c, data);
  if (c.slugField && payload[c.slugField])
    await assertSlugFree(c, payload[c.slugField] as string, id);
  await delegate(c).update({ where: { id }, data: payload });
  revalidateModel(key);
  return { id };
}

export async function deleteModel(key: string, id: string) {
  await assertAdmin();
  const c = config(key);
  await delegate(c).delete({ where: { id } });
  revalidateModel(key);
  return { success: true };
}

export async function setModelStatus(key: string, id: string, published: boolean) {
  await assertAdmin();
  const c = config(key);
  if (!c.statusField) return { success: false };
  await delegate(c).update({ where: { id }, data: { [c.statusField]: published } });
  revalidateModel(key);
  return { success: true };
}

export async function duplicateModel(key: string, id: string) {
  await assertAdmin();
  const c = config(key);
  const src = await delegate(c).findUnique({ where: { id } });
  if (!src) return { error: 'Not found' };
  const { id: _omit, created_at, updated_at, release, artifacts, ...rest } = src;
  void _omit;
  void created_at;
  void updated_at;
  void release;
  void artifacts;
  if (c.slugField && rest[c.slugField]) rest[c.slugField] = `${rest[c.slugField]}-copy`;
  if (c.statusField) rest[c.statusField] = false;
  rest[c.titleField] = `${rest[c.titleField]} (copy)`;
  const created = await delegate(c).create({ data: rest });
  revalidateModel(key);
  return { id: created.id as string };
}

export async function bulkModel(
  key: string,
  ids: string[],
  action: 'publish' | 'unpublish' | 'delete'
) {
  await assertAdmin();
  const c = config(key);
  if (!ids.length) return { success: true };
  if (action === 'delete') {
    await delegate(c).deleteMany({ where: { id: { in: ids } } });
  } else if (c.statusField) {
    await delegate(c).updateMany({
      where: { id: { in: ids } },
      data: { [c.statusField]: action === 'publish' },
    });
  }
  revalidateModel(key);
  return { success: true };
}

export async function reorderModel(key: string, orderedIds: string[]) {
  await assertAdmin();
  const c = config(key);
  if (!c.orderField) return { success: false };
  await Promise.all(
    orderedIds.map((id, index) =>
      delegate(c).update({ where: { id }, data: { [c.orderField as string]: index } })
    )
  );
  revalidateModel(key);
  return { success: true };
}

// counts per model for the admin hub
export async function modelCounts() {
  const entries = await Promise.all(
    Object.values(MODEL_REGISTRY).map(async (c) => {
      const total = await delegate(c).count();
      const published = c.statusField
        ? await delegate(c).count({ where: { [c.statusField]: true } })
        : total;
      return [c.key, { total, published }] as const;
    })
  );
  return Object.fromEntries(entries) as Record<string, { total: number; published: number }>;
}
