import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { getJobPostings } from '@/lib/cms-models/public';

const basePage = pages['careers']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/careers',
});

export default async function Page() {
  const page = { ...basePage };
  const jobs = await getJobPostings();

  if (jobs.length > 0) {
    const cardsBlock = {
      kind: 'cards' as const,
      title: 'Open positions',
      items: jobs.map((j) => ({
        tag: j.level || undefined,
        title: j.title,
        body: [j.department, j.location].filter(Boolean).join(' · ') || j.excerpt || '',
        meta: j.employment_type || (j.remote ? 'Remote' : undefined),
        href: `/careers/${j.slug}`,
      })),
    };
    // Replace the static "Open positions" table with linked, CMS-driven cards.
    page.blocks = [cardsBlock, ...page.blocks.filter((b) => b.kind !== 'table')];
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
