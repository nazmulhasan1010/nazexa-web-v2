'use server';

import { revalidatePath } from 'next/cache';
import { db } from './db';
import { PAGE_USAGE, HOME_SECTIONS_FOR_COLLECTION, type UsageRef } from './content-relationships';

export type HomeSection = {
  id: string;
  type: string;
  position: number;
  visible: boolean;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
};

import { type SiteThemeConfig } from './theme-registry';

export type GlobalThemeState = {
  frontend: SiteThemeConfig;
  admin: SiteThemeConfig;
};

export type SiteTheme = GlobalThemeState;

export type SiteSettings = {
  id: string;
  site_name: string;
  tagline: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  theme: SiteTheme;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published: boolean;
  updated_at: string;
};

export type ContentItem = {
  id: string;
  collection: string;
  slug: string;
  position: number;
  published: boolean;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  tone: string | null;
  category: string | null;
  image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

// --- Server Functions ---

export async function fetchHomeSections() {
  const sections = await db.homeSection.findMany({
    orderBy: { position: 'asc' },
  });
  return sections.map((s) => ({
    ...s,
    content: JSON.parse(s.content) as Record<string, unknown>,
  })) as HomeSection[];
}

export async function fetchSiteSettings() {
  const settings = await db.siteSettings.findUnique({
    where: { id: 'default' },
  });
  if (!settings) return null;
  
  let raw: any;
  try {
    raw = JSON.parse(settings.theme);
  } catch {
    raw = {};
  }
  
  // Migration & fallback structure
  const themeObj = {
    frontend: raw.frontend || {
      activeThemeId: raw.activeThemeId || 'preset-aurora',
      customThemes: raw.customThemes || []
    },
    admin: raw.admin || {
      activeThemeId: 'preset-midnight',
      customThemes: []
    }
  };

  return {
    ...settings,
    theme: themeObj,
  } as any;
}

export async function fetchCmsPages() {
  const pages = await db.page.findMany({
    orderBy: { updated_at: 'desc' },
  });
  return pages.map((p) => ({
    ...p,
    updated_at: p.updated_at.toISOString(),
  })) as CmsPage[];
}

export async function fetchContentItems(collection: string) {
  const items = await db.contentItem.findMany({
    where: { collection, published: true },
    orderBy: { position: 'asc' },
  });
  return items.map((item) => ({
    ...item,
    data: JSON.parse(item.data || '{}') as Record<string, unknown>,
    created_at: item.created_at.toISOString(),
    updated_at: item.updated_at.toISOString(),
  })) as ContentItem[];
}

export async function fetchAdminContentItems(collection: string) {
  const items = await db.contentItem.findMany({
    where: { collection },
    orderBy: { position: 'asc' },
  });
  return items.map((item) => ({
    ...item,
    data: JSON.parse(item.data || '{}') as Record<string, unknown>,
    created_at: item.created_at.toISOString(),
    updated_at: item.updated_at.toISOString(),
  })) as ContentItem[];
}

// Mutations
export async function upsertCmsPage(page: Partial<CmsPage>) {
  try {
    const payload = {
      slug: (page.slug ?? '').trim().replace(/^\/+/, ''),
      title: (page.title ?? '').trim(),
      description: page.description ?? null,
      seo_title: page.seo_title ?? null,
      seo_description: page.seo_description ?? null,
      published: page.published ?? false,
    };
    if (!payload.slug || !payload.title) return { error: 'Slug and title are required' };

    if (page.id) {
      await db.page.update({
        where: { id: page.id },
        data: payload,
      });
    } else {
      await db.page.create({
        data: payload,
      });
    }
    revalidatePath(`/${payload.slug}`);
    return { success: true };
  } catch (err: any) {
    console.error('Save error:', err);
    return { error: 'Failed to save CMS page. Please try again.' };
  }
}

export async function deleteCmsPage(id: string) {
  await db.page.delete({ where: { id } });
  return true;
}

export async function saveContentItems(
  rows: (ContentItem & { _new?: boolean; _deleted?: boolean })[]
) {
  const removed = rows.filter((r) => r._deleted && !r._new).map((r) => r.id);
  if (removed.length > 0) {
    await db.contentItem.deleteMany({ where: { id: { in: removed } } });
  }

  const keep = rows.filter((r) => !r._deleted);
  for (let index = 0; index < keep.length; index++) {
    const row = keep[index]!;
    const payload = {
      collection: row.collection,
      slug: row.slug ?? '',
      position: index,
      published: row.published,
      title: row.title,
      subtitle: row.subtitle,
      body: row.body,
      icon: row.icon,
      tone: row.tone,
      category: row.category,
      image_url: row.image_url,
      link_url: row.link_url,
      link_label: row.link_label,
      data: JSON.stringify(row.data ?? {}),
    };

    let shouldTriggerNewsletter = false;
    let oldTitle = '';

    if (row._new) {
      await db.contentItem.create({ data: payload });
      if (row.collection === 'news' && row.published) {
        shouldTriggerNewsletter = true;
      }
    } else {
      const oldItem = await db.contentItem.findUnique({ where: { id: row.id } });
      if (oldItem) {
        oldTitle = oldItem.title || '';
        if (row.collection === 'news' && !oldItem.published && row.published) {
          shouldTriggerNewsletter = true;
        }
      }

      await db.contentItem.update({
        where: { id: row.id },
        data: payload,
      });
    }

    if (shouldTriggerNewsletter) {
      try {
        const { createNewsCampaign } = await import('@/lib/newsletters/service');
        // Background creation
        createNewsCampaign(
          row.id,
          payload.title || 'Nazexa News Update',
          payload.subtitle || '',
          payload.body || ''
        ).catch((err) => {
          console.error('[CMS] Failed to trigger newsletter campaign:', err);
        });
      } catch (err) {
        console.error('[CMS] Failed to load newsletter service:', err);
      }
    }
  }
  const savedCollection = rows.find((r) => r.collection)?.collection;
  if (savedCollection) revalidateForCollection(savedCollection);
  return true;
}

export async function saveHomeSections(rows: HomeSection[]) {
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    await db.homeSection.update({
      where: { id: row.id },
      data: {
        position: index,
        visible: row.visible,
        title: row.title,
        subtitle: row.subtitle,
        content: JSON.stringify(row.content),
      },
    });
  }
  revalidatePath('/');
  return true;
}

export async function saveSiteSettings(settings: Partial<SiteSettings>) {
  const payload: any = {};
  if (settings.site_name !== undefined) payload.site_name = settings.site_name;
  if (settings.tagline !== undefined) payload.tagline = settings.tagline;
  if (settings.default_seo_title !== undefined)
    payload.default_seo_title = settings.default_seo_title;
  if (settings.default_seo_description !== undefined)
    payload.default_seo_description = settings.default_seo_description;
  if (settings.theme !== undefined) payload.theme = JSON.stringify(settings.theme);

  await db.siteSettings.upsert({
    where: { id: 'default' },
    update: payload,
    create: {
      id: 'default',
      site_name: settings.site_name || 'Nazexa',
      tagline: settings.tagline || '',
      theme: payload.theme || '{}',
      ...payload
    },
  });
  revalidatePath('/', 'layout');
  return true;
}

// --- Revalidation ---
// Maps a content collection to the public routes that render it. Always includes '/'.
const COLLECTION_ROUTES: Record<string, string[]> = {
  services: ['/', '/services'],
  products: ['/', '/products'],
  solutions: ['/', '/solutions'],
  industries: ['/', '/industries'],
  'case-studies': ['/', '/case-studies'],
  portfolio: ['/', '/portfolio'],
  pricing: ['/', '/pricing'],
  faq: ['/', '/faq'],
  team: ['/', '/team'],
  partners: ['/', '/partners'],
  integrations: ['/', '/integrations'],
  customers: ['/'],
  blog: ['/blog'],
  news: ['/news'],
  events: ['/events'],
  announcement: ['/announcements'],
  // Homepage-backed collections
  pillars: ['/'],
  missionvision: ['/'],
  technologies: ['/'],
  values: ['/'],
  stats: ['/'],
  process: ['/'],
  testimonials: ['/'],
  brands: ['/'],
  features: ['/'],
  tutorials: ['/tutorials'],
  community: ['/community'],
};

function revalidateForCollection(collection: string) {
  const routes = COLLECTION_ROUTES[collection] ?? ['/'];
  for (const route of routes) {
    try {
      revalidatePath(route);
    } catch {
      /* best-effort */
    }
  }
}

// Fire the news → newsletter campaign in the background (best-effort).
function triggerNewsCampaign(
  id: string,
  title: string | null,
  subtitle: string | null,
  body: string | null
) {
  import('@/lib/newsletters/service')
    .then(({ createNewsCampaign }) => {
      createNewsCampaign(id, title || 'Nazexa News Update', subtitle || '', body || '').catch(
        (err) => {
          console.error('[CMS] Failed to trigger newsletter campaign:', err);
        }
      );
    })
    .catch((err) => console.error('[CMS] Failed to load newsletter service:', err));
}

const CONTENT_TOP_FIELDS = [
  'slug',
  'position',
  'published',
  'title',
  'subtitle',
  'body',
  'icon',
  'tone',
  'category',
  'image_url',
  'link_url',
  'link_label',
] as const;

function buildContentPayload(values: Partial<ContentItem>) {
  const payload: Record<string, unknown> = {};
  for (const key of CONTENT_TOP_FIELDS) {
    if (values[key] !== undefined) payload[key] = values[key];
  }
  if (values.data !== undefined) payload.data = JSON.stringify(values.data ?? {});
  return payload;
}

// --- Single item ---
export async function fetchContentItemById(id: string) {
  const item = await db.contentItem.findUnique({ where: { id } });
  if (!item) return null;
  return {
    ...item,
    data: JSON.parse(item.data || '{}') as Record<string, unknown>,
    created_at: item.created_at.toISOString(),
    updated_at: item.updated_at.toISOString(),
  } as ContentItem;
}

// --- Per-item CRUD (powers the smart Content Library) ---
export async function createContentItem(collection: string, values: Partial<ContentItem> = {}) {
  const count = await db.contentItem.count({ where: { collection } });
  const item = await db.contentItem.create({
    data: {
      collection,
      slug: values.slug ?? '',
      position: values.position ?? count,
      published: values.published ?? false,
      title: values.title ?? null,
      subtitle: values.subtitle ?? null,
      body: values.body ?? null,
      icon: values.icon ?? null,
      tone: values.tone ?? null,
      category: values.category ?? null,
      image_url: values.image_url ?? null,
      link_url: values.link_url ?? null,
      link_label: values.link_label ?? null,
      data: JSON.stringify(values.data ?? {}),
    },
  });
  if (collection === 'news' && item.published) {
    triggerNewsCampaign(item.id, item.title, item.subtitle, item.body);
  }
  revalidateForCollection(collection);
  return { id: item.id };
}

export async function updateContentItem(id: string, values: Partial<ContentItem>) {
  const existing = await db.contentItem.findUnique({ where: { id } });
  if (!existing) return { error: 'Not found' };
  const willPublishNews =
    existing.collection === 'news' &&
    !existing.published &&
    (values.published ?? existing.published) === true;
  const item = await db.contentItem.update({ where: { id }, data: buildContentPayload(values) });
  if (willPublishNews && item.published) {
    triggerNewsCampaign(item.id, item.title, item.subtitle, item.body);
  }
  revalidateForCollection(existing.collection);
  return { id };
}

export async function setContentStatus(id: string, published: boolean) {
  const existing = await db.contentItem.findUnique({ where: { id } });
  if (!existing) return { error: 'Not found' };
  await db.contentItem.update({ where: { id }, data: { published } });
  if (existing.collection === 'news' && !existing.published && published) {
    triggerNewsCampaign(id, existing.title, existing.subtitle, existing.body);
  }
  revalidateForCollection(existing.collection);
  return { success: true };
}

export async function duplicateContentItem(id: string) {
  const src = await db.contentItem.findUnique({ where: { id } });
  if (!src) return { error: 'Not found' };
  const count = await db.contentItem.count({ where: { collection: src.collection } });
  const copy = await db.contentItem.create({
    data: {
      collection: src.collection,
      slug: src.slug ? `${src.slug}-copy` : '',
      position: count,
      published: false,
      title: src.title ? `${src.title} (copy)` : null,
      subtitle: src.subtitle,
      body: src.body,
      icon: src.icon,
      tone: src.tone,
      category: src.category,
      image_url: src.image_url,
      link_url: src.link_url,
      link_label: src.link_label,
      data: src.data ?? '{}',
    },
  });
  revalidateForCollection(src.collection);
  return { id: copy.id };
}

export async function deleteContentItem(id: string) {
  const item = await db.contentItem.findUnique({ where: { id }, select: { collection: true } });
  if (!item) return { success: true };
  await db.contentItem.delete({ where: { id } });
  revalidateForCollection(item.collection);
  return { success: true };
}

export async function bulkContentAction(ids: string[], action: 'publish' | 'unpublish' | 'delete') {
  if (!ids.length) return { success: true };
  const items = await db.contentItem.findMany({
    where: { id: { in: ids } },
    select: { collection: true },
  });
  const collections = Array.from(new Set(items.map((i) => i.collection)));
  if (action === 'delete') {
    await db.contentItem.deleteMany({ where: { id: { in: ids } } });
  } else {
    await db.contentItem.updateMany({
      where: { id: { in: ids } },
      data: { published: action === 'publish' },
    });
  }
  for (const collection of collections) revalidateForCollection(collection);
  return { success: true };
}

// --- Library index & search ---
export type ContentLibraryEntry = {
  collection: string;
  total: number;
  published: number;
  lastUpdated: string | null;
};

export async function fetchContentLibraryIndex(): Promise<ContentLibraryEntry[]> {
  const [grouped, publishedGrouped] = await Promise.all([
    db.contentItem.groupBy({
      by: ['collection'],
      _count: { _all: true },
      _max: { updated_at: true },
    }),
    db.contentItem.groupBy({
      by: ['collection'],
      where: { published: true },
      _count: { _all: true },
    }),
  ]);
  const pubMap = new Map(publishedGrouped.map((g) => [g.collection, g._count._all]));
  return grouped.map((g) => ({
    collection: g.collection,
    total: g._count._all,
    published: pubMap.get(g.collection) ?? 0,
    lastUpdated: g._max.updated_at ? g._max.updated_at.toISOString() : null,
  }));
}

export type ContentSearchRow = {
  id: string;
  collection: string;
  slug: string;
  title: string | null;
  subtitle: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export async function searchContent(opts: {
  q?: string;
  collection?: string;
  status?: 'all' | 'published' | 'draft';
  sort?: 'updated' | 'created' | 'title' | 'position';
  limit?: number;
  offset?: number;
}): Promise<{ total: number; items: ContentSearchRow[] }> {
  const where: Record<string, unknown> = {};
  if (opts.collection) where.collection = opts.collection;
  if (opts.status === 'published') where.published = true;
  if (opts.status === 'draft') where.published = false;
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { title: { contains: q } },
      { subtitle: { contains: q } },
      { body: { contains: q } },
    ];
  }
  const orderBy =
    opts.sort === 'created'
      ? { created_at: 'desc' as const }
      : opts.sort === 'title'
        ? { title: 'asc' as const }
        : opts.sort === 'position'
          ? { position: 'asc' as const }
          : { updated_at: 'desc' as const };

  const [items, total] = await Promise.all([
    db.contentItem.findMany({ where, orderBy, take: opts.limit ?? 50, skip: opts.offset ?? 0 }),
    db.contentItem.count({ where }),
  ]);
  return {
    total,
    items: items.map((i) => ({
      id: i.id,
      collection: i.collection,
      slug: i.slug,
      title: i.title,
      subtitle: i.subtitle,
      published: i.published,
      created_at: i.created_at.toISOString(),
      updated_at: i.updated_at.toISOString(),
    })),
  };
}

// --- Homepage draft / publish workflow ---
export type HomepageDraft = { sections: HomeSection[]; updatedAt: string };

export async function fetchHomepageDraft(): Promise<HomepageDraft | null> {
  const row = await db.builderDraft.findUnique({ where: { key: 'home' } });
  if (!row) return null;
  try {
    const sections = JSON.parse(row.data) as HomeSection[];
    return { sections, updatedAt: row.updatedAt.toISOString() };
  } catch {
    return null;
  }
}

export async function saveHomepageDraft(sections: HomeSection[]) {
  const payload = JSON.stringify(sections);
  await db.builderDraft.upsert({
    where: { key: 'home' },
    create: { key: 'home', data: payload },
    update: { data: payload },
  });
  return { success: true };
}

export async function discardHomepageDraft() {
  await db.builderDraft.deleteMany({ where: { key: 'home' } });
  return { success: true };
}

// Promote the working draft to the live homepage: update existing rows,
// create newly-added sections, delete removed ones, then revalidate '/'.
export async function publishHomepage(sections: HomeSection[]) {
  const existing = await db.homeSection.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((e) => e.id));
  const incomingKnownIds = new Set(sections.filter((s) => existingIds.has(s.id)).map((s) => s.id));

  const toDelete = Array.from(existingIds).filter((id) => !incomingKnownIds.has(id));
  if (toDelete.length) await db.homeSection.deleteMany({ where: { id: { in: toDelete } } });

  for (let index = 0; index < sections.length; index++) {
    const section = sections[index]!;
    const data = {
      type: section.type,
      position: index,
      visible: section.visible,
      title: section.title,
      subtitle: section.subtitle,
      content: JSON.stringify(section.content ?? {}),
    };
    if (existingIds.has(section.id)) {
      await db.homeSection.update({ where: { id: section.id }, data });
    } else {
      await db.homeSection.create({ data });
    }
  }

  await db.builderDraft.deleteMany({ where: { key: 'home' } });
  revalidatePath('/');
  return { success: true };
}

// --- Theme draft / publish workflow ---
export type ThemeDraft = { config: SiteThemeConfig; updatedAt: string };

export async function fetchThemeDraft(target: 'frontend' | 'admin'): Promise<ThemeDraft | null> {
  const row = await db.builderDraft.findUnique({ where: { key: `theme_${target}` } });
  if (!row) return null;
  try {
    const config = JSON.parse(row.data) as SiteThemeConfig;
    return { config, updatedAt: row.updatedAt.toISOString() };
  } catch {
    return null;
  }
}

export async function saveThemeDraft(target: 'frontend' | 'admin', config: SiteThemeConfig) {
  const payload = JSON.stringify(config);
  await db.builderDraft.upsert({
    where: { key: `theme_${target}` },
    create: { key: `theme_${target}`, data: payload },
    update: { data: payload },
  });
  return { success: true };
}

export async function discardThemeDraft(target: 'frontend' | 'admin') {
  await db.builderDraft.deleteMany({ where: { key: `theme_${target}` } });
  return { success: true };
}

export async function publishTheme(target: 'frontend' | 'admin', config: SiteThemeConfig) {
  const current = await fetchSiteSettings();
  const theme = current?.theme || {
    frontend: { activeThemeId: 'preset-aurora', customThemes: [] },
    admin: { activeThemeId: 'preset-midnight', customThemes: [] }
  };
  
  theme[target] = config;
  
  await saveSiteSettings({ theme: theme as any });
  await discardThemeDraft(target);
  return { success: true };
}

// --- Relationships ---
// Where a collection is currently surfaced: static page refs + any live homepage sections.
export async function getContentUsage(collection: string): Promise<UsageRef[]> {
  const refs: UsageRef[] = [...(PAGE_USAGE[collection] ?? [])];
  const sectionDefs = HOME_SECTIONS_FOR_COLLECTION[collection];
  if (sectionDefs?.length) {
    const types = sectionDefs.map((s) => s.type);
    const live = await db.homeSection.findMany({
      where: { type: { in: types }, visible: true },
      select: { type: true },
    });
    const liveTypes = new Set(live.map((l) => l.type));
    for (const def of sectionDefs) {
      if (liveTypes.has(def.type)) {
        refs.push({ label: `Homepage · ${def.label}`, href: '/', kind: 'section' });
      }
    }
  }
  return refs;
}
