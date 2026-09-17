import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getReleases, stripHtml } from '@/lib/cms-models/public';

const basePage = pages['changelog']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/changelog',
});

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function Page() {
  const page = { ...basePage };
  const releases = await getReleases();

  if (releases.length > 0) {
    const timeline: PageBlock = {
      kind: 'timeline',
      title: 'Recent releases',
      items: releases.map((r) => ({
        date: r.version ? `${r.version} · ${fmt(r.released_at)}` : fmt(r.released_at),
        title: r.title,
        body: stripHtml(r.body) || '',
        tag: r.type || undefined,
      })),
    };
    let done = false;
    page.blocks = page.blocks.map((b) =>
      b.kind === 'timeline' && !done ? ((done = true), timeline) : b
    );
    if (!done) page.blocks = [timeline, ...page.blocks];
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
