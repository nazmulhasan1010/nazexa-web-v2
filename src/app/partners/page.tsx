import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['partners']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/partners',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('partners');

  if (items.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Programme tracks',
      items: items.map((i) => ({
        tag: i.category || 'Partner',
        title: i.title || '',
        body: i.subtitle || (i.body as string) || '',
        meta: (i.data?.meta as string) || '',
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
