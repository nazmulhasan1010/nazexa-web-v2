import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['integrations']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/integrations',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('integrations');

  if (items.length > 0) {
    const tableBlock = {
      kind: 'table' as const,
      title: 'Integration directory',
      columns: ['Category', 'Integrations', 'Setup'],
      rows: items.map((i) => [i.category || '', i.title || '', i.subtitle || '']),
    };
    page.blocks = [tableBlock, ...page.blocks.filter((b) => b.kind !== 'table')];
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
