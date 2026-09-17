import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';

const basePage = pages['team']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/team',
});

export default async function Page() {
  const page = { ...basePage };
  const teamMembers = await fetchContentItems('team');

  if (teamMembers.length > 0) {
    const categories = Array.from(new Set(teamMembers.map((t) => t.category || 'Team')));

    const peopleBlocks = categories.map((cat) => ({
      kind: 'people' as const,
      title: cat,
      items: teamMembers
        .filter((t) => (t.category || 'Team') === cat)
        .map((t) => ({
          name: t.title || 'Unnamed',
          role: t.subtitle || '',
          location: (t.data?.location as string) || '',
          focus: (t.body as string) || '',
          image: t.image_url || '',
        })),
    }));

    page.blocks = [...page.blocks.filter((b) => b.kind !== 'people'), ...peopleBlocks];
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
