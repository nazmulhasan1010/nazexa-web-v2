import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { ContactForm } from '@/components/forms/ContactForm';
import { db } from '@/lib/db';

import { ConfigService } from '@/lib/config/service';

const page = pages['contact']!;

export const metadata = constructMetadata({
  title: typeof page !== 'undefined' && page.title ? page.title : undefined,
  description: typeof page !== 'undefined' && page.description ? page.description : undefined,
  url: '/contact',
});

export default async function Page() {
  const title = await ConfigService.getConfig<string>('contact.title', '');
  const subtitle = await ConfigService.getConfig<string>('contact.subtitle', '');
  const email = await ConfigService.getConfig<string>('contact.supportEmail', 'hello@nazexa.com');
  const phone = await ConfigService.getConfig<string>('contact.phone', '+1 (555) 000-0000');
  const address = await ConfigService.getConfig<string>('contact.address', '123 Tech Avenue, NY 10001');
  const whatsapp = await ConfigService.getConfig<string>('contact.whatsapp', '');
  const enableForm = await ConfigService.getConfig<boolean>('contact.enableForm', true);
  const formHeading = await ConfigService.getConfig<string>('contact.formHeading', '');
  const formSuccessMessage = await ConfigService.getConfig<string>('contact.formSuccessMessage', '');
  const formButtonText = await ConfigService.getConfig<string>('contact.formButtonText', '');
  const workingHours = await ConfigService.getConfig<string>('contact.workingHours', '');
  const facebookUrl = await ConfigService.getConfig<string>('contact.facebookUrl', '');
  const twitterUrl = await ConfigService.getConfig<string>('contact.twitterUrl', '');
  const linkedinUrl = await ConfigService.getConfig<string>('contact.linkedinUrl', '');
  const instagramUrl = await ConfigService.getConfig<string>('contact.instagramUrl', '');

  const dynamicChannels = await ConfigService.getConfig<any>('contact.channels', null);
  const dynamicOffices = await ConfigService.getConfig<any>('contact.offices', null);
  const dynamicFaq = await ConfigService.getConfig<any>('contact.faq', null);

  const settings = {
    title: title || "Let's talk about your project",
    subtitle: subtitle || 'Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.',
    email,
    phone,
    address,
    whatsapp: whatsapp || undefined,
    enableForm,
    formHeading: formHeading || undefined,
    formSuccessMessage: formSuccessMessage || undefined,
    formButtonText: formButtonText || undefined,
    workingHours: workingHours || undefined,
    facebookUrl: facebookUrl || undefined,
    twitterUrl: twitterUrl || undefined,
    linkedinUrl: linkedinUrl || undefined,
    instagramUrl: instagramUrl || undefined,
  };

  // Deep clone the page object to avoid mutating the global static object
  const dynamicPage = JSON.parse(JSON.stringify(page));

  // Override blocks if dynamic values exist
  if (dynamicPage.blocks) {
    dynamicPage.blocks = dynamicPage.blocks.map((block: any) => {
      if (block.kind === 'channels' && dynamicChannels) {
        return { ...block, items: dynamicChannels };
      }
      if (block.kind === 'table' && block.title === 'Offices' && dynamicOffices) {
        return { ...block, ...dynamicOffices };
      }
      if (block.kind === 'faq' && dynamicFaq) {
        return { ...block, items: dynamicFaq };
      }
      return block;
    });
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
      <div className="pb-24">
        <StandardPage page={dynamicPage} />
        <div className="relative z-10 px-5">
          <ContactForm settings={settings} />
        </div>
      </div>
    </>
  );
}
