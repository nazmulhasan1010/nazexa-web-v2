import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['community']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/community',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('community');

  if (items.length > 0) {
    const channels: PageBlock = {
      kind: 'channels',
      title: 'Where people gather',
      items: items.map((i) => ({
        title: i.title || '',
        body: i.subtitle || '',
        action: i.link_label || 'Open',
      })),
    };
    let done = false;
    page.blocks = page.blocks.map((b) =>
      b.kind === 'channels' && !done ? ((done = true), channels) : b
    );
    if (!done) page.blocks = [channels, ...page.blocks];
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
