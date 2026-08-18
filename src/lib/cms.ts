"use server";

import { queryOptions } from "@tanstack/react-query";
import { db } from "./db";

export type HomeSection = {
  id: string;
  type: string;
  position: number;
  visible: boolean;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
};

export type SiteTheme = {
  brand1?: string;
  brand2?: string;
  brand3?: string;
  radius?: string;
  glow?: boolean;
};

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
};

// --- Server Functions ---

export async function fetchHomeSections() {
  const sections = await db.homeSection.findMany({
    orderBy: { position: "asc" },
  });
  return sections.map((s) => ({
    ...s,
    content: JSON.parse(s.content) as Record<string, unknown>,
  })) as HomeSection[];
}

export async function fetchSiteSettings() {
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) return null;
  return {
    ...settings,
    theme: JSON.parse(settings.theme) as SiteTheme,
  } as SiteSettings;
}

export async function fetchCmsPages() {
  const pages = await db.page.findMany({
    orderBy: { updated_at: "desc" },
  });
  return pages.map((p) => ({
    ...p,
    updated_at: p.updated_at.toISOString(),
  })) as CmsPage[];
}

export async function fetchContentItems(collection: string) {
  const items = await db.contentItem.findMany({
    where: { collection, published: true },
    orderBy: { position: "asc" },
  });
  return items.map((item) => ({
    ...item,
    data: JSON.parse(item.data || "{}") as Record<string, unknown>,
  })) as ContentItem[];
}

export async function fetchAdminContentItems(collection: string) {
  const items = await db.contentItem.findMany({
    where: { collection },
    orderBy: { position: "asc" },
  });
  return items.map((item) => ({
    ...item,
    data: JSON.parse(item.data || "{}") as Record<string, unknown>,
  })) as ContentItem[];
}

// Mutations
export async function upsertCmsPage(page: Partial<CmsPage>) {
  try {
    const payload = {
      slug: (page.slug ?? "").trim().replace(/^\/+/, ""),
      title: (page.title ?? "").trim(),
      description: page.description ?? null,
      seo_title: page.seo_title ?? null,
      seo_description: page.seo_description ?? null,
      published: page.published ?? false,
    };
    if (!payload.slug || !payload.title)
      return { error: "Slug and title are required" };

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
    return { success: true };
  } catch (err: any) {
    console.error("Save error:", err);
    return { error: "Failed to save CMS page. Please try again." };
  }
}

export async function deleteCmsPage(id: string) {
  await db.page.delete({ where: { id } });
  return true;
}

export async function saveContentItems(
  rows: (ContentItem & { _new?: boolean; _deleted?: boolean })[],
) {
  const removed = rows.filter((r) => r._deleted && !r._new).map((r) => r.id);
  if (removed.length > 0) {
    await db.contentItem.deleteMany({ where: { id: { in: removed } } });
  }

  const keep = rows.filter((r) => !r._deleted);
  for (const [index, row] of keep.entries()) {
    const payload = {
      collection: row.collection,
      slug: row.slug ?? "",
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

    if (row._new) {
      await db.contentItem.create({ data: payload });
    } else {
      await db.contentItem.update({
        where: { id: row.id },
        data: payload,
      });
    }
  }
  return true;
}

export async function saveHomeSections(rows: HomeSection[]) {
  for (const [index, row] of rows.entries()) {
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
  if (settings.theme !== undefined)
    payload.theme = JSON.stringify(settings.theme);

  await db.siteSettings.update({
    where: { id: "default" },
    data: payload,
  });
  return true;
}
