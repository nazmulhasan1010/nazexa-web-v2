import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['customers']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/customers',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('customers');

  if (items.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Customer stories',
      items: items.map((i) => ({
        tag: (i.data?.author_role as string) || '',
        title: i.title || '',
        body: (i.data?.testimonial as string) || '',
      })),
    };
    page.blocks = [...page.blocks.filter((b) => b.kind !== 'cards'), cardsBlock];
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
