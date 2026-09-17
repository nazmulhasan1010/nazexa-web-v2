import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages, type PageBlock } from '@/lib/site-content';
import { getStatusComponents, getIncidents, stripHtml } from '@/lib/cms-models/public';

const basePage = pages['status']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/status',
});

const STATUS_LABEL: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  partial_outage: 'Partial outage',
  major_outage: 'Major outage',
  maintenance: 'Maintenance',
};

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function Page() {
  const page = { ...basePage };
  const [components, incidents] = await Promise.all([getStatusComponents(), getIncidents()]);

  if (components.length > 0) {
    const allOperational = components.every((c) => c.status === 'operational');
    const openIncidents = incidents.filter(
      (i) => i.status !== 'resolved' && i.status !== 'maintenance'
    ).length;
    // Derived hero summary from real component/incident state (not fabricated).
    page.meta = [
      {
        label: 'Current status',
        value: allOperational ? 'All systems operational' : 'Some systems affected',
      },
      { label: 'Components', value: String(components.length) },
      { label: 'Open incidents', value: String(openIncidents) },
    ];

    const statusTable: PageBlock = {
      kind: 'table',
      title: 'Service status',
      columns: ['Service', 'Status', '90-day uptime', 'p50 latency'],
      rows: components.map((c) => [
        c.name,
        STATUS_LABEL[c.status] || c.status,
        c.uptime || '—',
        c.latency || '—',
      ]),
    };
    let done = false;
    page.blocks = page.blocks.map((b) =>
      b.kind === 'table' && !done ? ((done = true), statusTable) : b
    );
    if (!done) page.blocks = [statusTable, ...page.blocks];
  }

  if (incidents.length > 0) {
    const timeline: PageBlock = {
      kind: 'timeline',
      title: 'Incident history',
      items: incidents.map((i) => ({
        date: fmt(i.started_at),
        title: i.title,
        body: stripHtml(i.body) || '',
        tag:
          i.status === 'resolved'
            ? 'Resolved'
            : i.status === 'maintenance'
              ? 'Maintenance'
              : 'Active',
      })),
    };
    let done = false;
    page.blocks = page.blocks.map((b) =>
      b.kind === 'timeline' && !done ? ((done = true), timeline) : b
    );
    if (!done) page.blocks = [...page.blocks, timeline];
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
