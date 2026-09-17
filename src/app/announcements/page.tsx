import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { fetchContentItems } from '@/lib/cms';
import type { PageContent } from '@/lib/site-content';

const TITLE = 'Announcements';
const DESCRIPTION = 'Product announcements, alerts and important updates from Nazexa.';

export const metadata = constructMetadata({
  title: TITLE,
  description: DESCRIPTION,
  url: '/announcements',
});

export default async function Page() {
  const items = await fetchContentItems('announcement');

  const page: PageContent = {
    slug: 'announcements',
    eyebrow: 'Announcements',
    title: TITLE,
    description: DESCRIPTION,
    blocks:
      items.length > 0
        ? [
            {
              kind: 'cards',
              title: 'Latest announcements',
              items: items.map((i) => ({
                tag: typeof i.data?.priority === 'string' ? (i.data.priority as string) : undefined,
                title: i.title || '',
                body: i.body || i.subtitle || '',
              })),
            },
          ]
        : [
            {
              kind: 'cards',
              title: 'Latest announcements',
              items: [
                {
                  title: 'No announcements yet',
                  body: 'Check back soon for product news and important updates.',
                },
              ],
            },
          ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: TITLE,
            description: DESCRIPTION,
          }),
        }}
      />
      <StandardPage page={page} />
    </>
  );
}
