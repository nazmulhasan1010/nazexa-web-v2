import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getLearningPaths, getCertifications } from '@/lib/cms-models/public';

const basePage = pages['learning-center']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/learning-center',
});

export default async function Page() {
  const page = { ...basePage };
  const [paths, certs] = await Promise.all([getLearningPaths(), getCertifications()]);

  let blocks = [...page.blocks];

  if (paths.length > 0) {
    const cardsBlock: PageBlock = {
      kind: 'cards',
      title: 'Learning paths',
      items: paths.map((p) => ({
        tag:
          [p.module_count ? `${p.module_count} modules` : null, p.duration_label]
            .filter(Boolean)
            .join(' · ') || undefined,
        title: p.title,
        body: p.summary || '',
        meta: p.level || undefined,
      })),
    };
    let done = false;
    blocks = blocks.map((b) => (b.kind === 'cards' && !done ? ((done = true), cardsBlock) : b));
    if (!done) blocks = [cardsBlock, ...blocks];
  }

  if (certs.length > 0) {
    const tableBlock: PageBlock = {
      kind: 'table',
      title: 'Certification',
      columns: ['Credential', 'Requirements', 'Validity'],
      rows: certs.map((c) => [c.name, c.requirements || '—', c.validity || '—']),
    };
    let done = false;
    blocks = blocks.map((b) => (b.kind === 'table' && !done ? ((done = true), tableBlock) : b));
    if (!done) blocks = [...blocks, tableBlock];
  }

  page.blocks = blocks;

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
