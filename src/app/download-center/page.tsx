import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getDownloadArtifacts } from '@/lib/cms-models/public';

const basePage = pages['download-center']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/download-center',
});

export default async function Page() {
  const page = { ...basePage };
  const artifacts = await getDownloadArtifacts();

  const cli = artifacts.filter((a) => a.kind === 'CLI' || a.kind === 'Desktop');
  const sdk = artifacts.filter((a) => a.kind === 'SDK');
  const tables: PageBlock[] = [];
  if (cli.length > 0) {
    tables.push({
      kind: 'table',
      title: 'CLI & desktop downloads',
      columns: ['Platform', 'Architecture', 'File', 'Size'],
      rows: cli.map((a) => [a.platform || '—', a.architecture || '—', a.name, a.file_size || '—']),
    });
  }
  if (sdk.length > 0) {
    tables.push({
      kind: 'table',
      title: 'SDKs',
      columns: ['Language', 'Package', 'Version', 'Status'],
      rows: sdk.map((a) => [
        a.language || a.name,
        a.package_name || '—',
        a.version || '—',
        a.status || '—',
      ]),
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
