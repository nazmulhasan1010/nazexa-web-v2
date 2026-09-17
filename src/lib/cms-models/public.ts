import { db } from '@/lib/db';

// Public, published-only reads for the dedicated CMS models. Used by the marketing pages
// (server components). Ordered by `position` unless noted.

export async function getJobPostings() {
  return db.jobPosting.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}
export async function getJobBySlug(slug: string) {
  return db.jobPosting.findFirst({ where: { slug, published: true } });
}

export async function getResources() {
  return db.resource.findMany({
    where: { published: true },
    orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
  });
}

export async function getPressAssets() {
  return db.pressAsset.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getCompanyMilestones() {
  return db.companyMilestone.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getLearningPaths() {
  return db.learningPath.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}
export async function getCertifications() {
  return db.certification.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getReleases() {
  return db.release.findMany({
    where: { published: true },
    orderBy: [{ released_at: 'desc' }, { position: 'asc' }],
  });
}

export async function getDownloadArtifacts() {
  return db.downloadArtifact.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getRoadmapItems() {
  return db.roadmapItem.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getDocArticles() {
  return db.docArticle.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getApiEndpoints() {
  return db.apiEndpoint.findMany({ where: { published: true }, orderBy: { position: 'asc' } });
}

export async function getApiErrorCodes() {
  return db.apiErrorCode.findMany({
    where: { published: true },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });
}

export async function getIncidents() {
  return db.incident.findMany({ where: { published: true }, orderBy: { started_at: 'desc' } });
}

export async function getFeatureRequests() {
  return db.featureRequest.findMany({
    where: { published: true },
    orderBy: [{ vote_count: 'desc' }, { position: 'asc' }],
  });
}

// Status components — live health from a real monitor when STATUS_API_URL is configured,
// otherwise the admin/monitor-fed DB rows. Never fabricated per-request.
export type StatusComponentView = {
  name: string;
  group: string;
  status: string;
  uptime: string;
  latency: string;
};

export async function getStatusComponents(): Promise<StatusComponentView[]> {
  const url = process.env.STATUS_API_URL;
  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (res.ok) {
        const json = await res.json();
        const components = Array.isArray(json?.components)
          ? json.components
          : Array.isArray(json)
            ? json
            : null;
        if (components) {
          return components.map((c: Record<string, unknown>) => ({
            name: String(c.name ?? ''),
            group: String(c.group ?? ''),
            status: String(c.status ?? 'operational'),
            uptime: String(c.uptime ?? ''),
            latency: String(c.latency ?? ''),
          }));
        }
      }
    } catch {
      /* fall back to DB */
    }
  }
  const rows = await db.statusComponent.findMany({
    where: { published: true },
    orderBy: { position: 'asc' },
  });
  return rows.map((r) => ({
    name: r.name,
    group: r.component_group ?? '',
    status: r.current_status,
    uptime: r.uptime_90d ?? '',
    latency: r.p50_latency_ms ?? '',
  }));
}

// Parse a JSON-string column into a string[] (tolerates comma-separated fallback).
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((x) => (typeof x === 'string' ? x : String((x as { title?: string })?.title ?? '')))
        .filter(Boolean);
    }
  } catch {
    return value
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Strip HTML tags to plain text (for rich `body` shown in text-only blocks like timelines).
export function stripHtml(value: string | null | undefined, max = 240): string {
  if (!value) return '';
  const text = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
