import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['events']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/events',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('events');

  if (items.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Upcoming & recent events',
      items: items.map((i) => ({
        tag: i.category || undefined,
        title: i.title || '',
        body: i.subtitle || (i.body as string) || '',
        meta: typeof i.data?.start_date === 'string' ? (i.data.start_date as string) : undefined,
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
