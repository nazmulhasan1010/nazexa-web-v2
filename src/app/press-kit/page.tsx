import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { getPressAssets } from '@/lib/cms-models/public';

const basePage = pages['press-kit']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/press-kit',
});

export default async function Page() {
  const page = { ...basePage };
  const assets = await getPressAssets();

  if (assets.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Download assets',
      items: assets.map((a) => ({
        tag: a.type || undefined,
        title: a.title,
        body: a.description || '',
        meta: a.formats || undefined,
        href: a.file_url || undefined,
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
