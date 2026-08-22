import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['portfolio']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/portfolio',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('portfolio');

  if (items.length > 0) {
    const featuresBlock = {
      kind: 'features' as const,
      title: 'What you get',
      items: items.map((i) => ({
        title: i.title || '',
        body: i.subtitle || (i.body as string) || '',
      })),
    };
    page.blocks = [featuresBlock, ...page.blocks.filter((b) => b.kind !== 'features')];
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
