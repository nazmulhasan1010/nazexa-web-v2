import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['blog']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/blog',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('blog');

  if (items.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Latest articles',
      items: items.map((i) => ({
        tag: i.category || undefined,
        title: i.title || '',
        body: i.subtitle || '',
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
