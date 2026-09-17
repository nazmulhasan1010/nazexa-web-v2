import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getReleases, stripHtml } from '@/lib/cms-models/public';

const basePage = pages['release-notes']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/release-notes',
});

const fmt = (d: Date | null) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export default async function Page() {
  const page = { ...basePage };
  const releases = await getReleases();

  if (releases.length > 0) {
    const timeline: PageBlock = {
      kind: 'timeline',
      title: 'Stable releases',
      items: releases.map((r) => ({
        date: r.version ? `${r.version} · ${fmt(r.released_at)}` : fmt(r.released_at),
        title: r.title,
        body: stripHtml(r.body) || '',
        tag: r.type || undefined,
      })),
    };
    const versionTable: PageBlock = {
      kind: 'table',
      title: 'Version support',
      columns: ['Version', 'Released', 'Security fixes until', 'Status'],
      rows: releases
        .filter((r) => r.version)
        .map((r) => [r.version || '—', fmt(r.released_at), fmt(r.security_until), r.status || '—']),
    };

    let tl = false;
    let tb = false;
    page.blocks = page.blocks.map((b) => {
      if (b.kind === 'timeline' && !tl) return ((tl = true), timeline);
      if (b.kind === 'table' && !tb) return ((tb = true), versionTable);
      return b;
    });
    if (!tl) page.blocks = [timeline, ...page.blocks];
    if (!tb && versionTable.rows.length > 0) page.blocks = [...page.blocks, versionTable];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description: page.description,
          }),
        }}
      />
      <StandardPage page={page} />
    </>
  );
}
