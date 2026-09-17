import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['tutorials']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/tutorials',
});

export default async function Page() {
  const page = { ...basePage };
  const items = await fetchContentItems('tutorials');

  if (items.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Popular tutorials',
      items: items.map((i) => {
        const duration = typeof i.data?.duration === 'string' ? i.data.duration : '';
        const difficulty = typeof i.data?.difficulty === 'string' ? i.data.difficulty : '';
        const language = typeof i.data?.language === 'string' ? i.data.language : '';
        return {
          tag: duration || difficulty || undefined,
          title: i.title || '',
          body: i.subtitle || '',
          meta: [language, difficulty].filter(Boolean).join(' · ') || undefined,
          href: (typeof i.data?.repo_url === 'string' && i.data.repo_url) || undefined,
        };
      }),
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
