import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getRoadmapItems } from '@/lib/cms-models/public';

const basePage = pages['roadmap']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/roadmap',
});

const PHASES = [
  { key: 'now', title: 'Now — shipping this quarter' },
  { key: 'next', title: 'Next — designed, not yet built' },
  { key: 'later', title: 'Later — under exploration' },
];

export default async function Page() {
  const page = { ...basePage };
  const items = await getRoadmapItems();

  if (items.length > 0) {
    const cardBlocks: PageBlock[] = PHASES.map((ph) => ({
      ph,
      list: items.filter((i) => i.phase === ph.key),
    }))
      .filter((x) => x.list.length > 0)
      .map(({ ph, list }) => ({
        kind: 'cards',
        title: ph.title,
        items: list.map((i) => ({
          tag: i.tag || undefined,
          title: i.title,
          body: i.body || '',
          meta: i.target_label || undefined,
        })),
      }));
    if (cardBlocks.length > 0) {
      page.blocks = [...cardBlocks, ...page.blocks.filter((b) => b.kind !== 'cards')];
    }
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
