import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { ContactForm } from '@/components/forms/ContactForm';
import { db } from '@/lib/db';

const page = pages['contact']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/contact',
});

export default async function Page() {
  const settings = await db.contactSettings.findFirst();

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
      <div className="pb-24">
        <StandardPage page={page} />
        <div className="relative z-10 px-5">
          <ContactForm settings={settings || undefined} />
        </div>
      </div>
    </>
  );
}
