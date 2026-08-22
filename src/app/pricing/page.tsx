import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['pricing']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/pricing',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('pricing');

  if (items.length > 0) {
    const pricingBlock = {
      kind: 'pricing' as const,
      title: 'Usage pricing',
      tiers: items.map((i) => ({
        name: i.title || '',
        price: (i.subtitle || '').split('/')[0]?.trim() || '',
        cadence: (i.subtitle || '').includes('/') ? 'mo' : undefined,
        body: i.body ? i.body.replace(/<[^>]*>?/gm, '') : '',
        features: (i.data?.features as string[]) || [],
      })),
    };
    page.blocks = [pricingBlock, ...page.blocks.filter((b) => b.kind !== 'pricing')];
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
