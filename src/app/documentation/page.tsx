import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { getDocArticles } from '@/lib/cms-models/public';

const basePage = pages['documentation']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/documentation',
});

export default async function Page() {
  const page = { ...basePage };
  const docs = await getDocArticles();

  if (docs.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Start here',
      items: docs.map((d) => ({
        tag: d.difficulty || (d.reading_minutes ? `${d.reading_minutes} min` : undefined),
        title: d.title,
        body: d.excerpt || '',
        meta: d.area || undefined,
      })),
    };
    page.blocks = [cardsBlock, ...page.blocks.filter((b) => b.kind !== 'cards')];
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
