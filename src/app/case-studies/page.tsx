import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['case-studies']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/case-studies',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('case-studies');

  if (items.length > 0) {
    const featuresBlock = {
      kind: 'features' as const,
      title: 'What you get',
      items: items.map((i) => ({
        title: (i.subtitle ? `${i.subtitle}: ` : '') + (i.title || ''),
        body: i.body ? i.body.replace(/<[^>]*>?/gm, '') : '',
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
