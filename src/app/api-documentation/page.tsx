import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getApiEndpoints, getApiErrorCodes } from '@/lib/cms-models/public';

const basePage = pages['api-documentation']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/api-documentation',
});

export default async function Page() {
  const page = { ...basePage };
  const [endpoints, errors] = await Promise.all([getApiEndpoints(), getApiErrorCodes()]);

  const tables: PageBlock[] = [];
  if (endpoints.length > 0) {
    tables.push({
      kind: 'table',
      title: 'Core endpoints',
      columns: ['Method', 'Path', 'Purpose'],
      rows: endpoints.map((e) => [e.method, e.path, e.summary || '—']),
    });
  }
  if (errors.length > 0) {
    tables.push({
      kind: 'table',
      title: 'Error codes',
      columns: ['Status', 'Code', 'Meaning'],
      rows: errors.map((e) => [String(e.status), e.code, e.meaning || '—']),
    });
  }
  if (tables.length > 0) {
    page.blocks = [...tables, ...page.blocks.filter((b) => b.kind !== 'table')];
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
