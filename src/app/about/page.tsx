import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getCompanyMilestones } from '@/lib/cms-models/public';

const basePage = pages['about']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/about',
});

export default async function Page() {
  const page = { ...basePage };
  const milestones = await getCompanyMilestones();

  if (milestones.length > 0) {
    const timeline: PageBlock = {
      kind: 'timeline',
      title: 'How we got here',
      items: milestones.map((m) => ({
        date: m.date,
        title: m.title,
        body: m.body || '',
        tag: m.tag || undefined,
      })),
    };
    // Replace the static timeline in place (keeps the surrounding About sections/order).
    let replaced = false;
    page.blocks = page.blocks.map((b) => {
      if (b.kind === 'timeline' && !replaced) {
        replaced = true;
        return timeline;
      }
      return b;
    });
    if (!replaced) page.blocks = [...page.blocks, timeline];
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
