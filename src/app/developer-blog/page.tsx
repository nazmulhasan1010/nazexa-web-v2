import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['developer-blog']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/developer-blog',
});

// Engineering posts reuse the `blog` collection, filtered to the engineering category when tagged.
export default async function Page() {
  const page = { ...basePage };
  const all = await fetchContentItems('blog');
  const posts = all.filter((p) => (p.category || '').toLowerCase() === 'engineering');
  const items = posts.length > 0 ? posts : all;

  if (items.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Recent posts',
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
