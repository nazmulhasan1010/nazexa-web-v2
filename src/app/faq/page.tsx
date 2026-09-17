import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['faq']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/faq',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('faq');

  if (items.length > 0) {
    const faqBlock = {
      kind: 'faq' as const,
      title: 'Frequently asked questions',
      items: items.map((i) => ({
        title: i.title || '',
        body: i.body ? i.body.replace(/<[^>]*>?/gm, '') : '',
      })),
    };
    page.blocks = [faqBlock, ...page.blocks.filter((b) => b.kind !== 'faq')];
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
