import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { getResources } from '@/lib/cms-models/public';

const basePage = pages['resources']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/resources',
});

export default async function Page() {
  const page = { ...basePage };
  const resources = await getResources();

  if (resources.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Latest resources',
      items: resources.map((r) => ({
        tag: r.type || undefined,
        title: r.title,
        body: r.excerpt || '',
        meta: r.format || undefined,
        href: r.external_url || r.file_url || undefined,
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
