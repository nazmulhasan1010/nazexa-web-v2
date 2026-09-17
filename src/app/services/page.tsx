import { constructMetadata } from '@/lib/seo';
import { ServicesIndex } from '@/components/services/ServicesIndex';
import { fetchContentItems } from '@/lib/cms';
import { pages } from '@/lib/site-content';

const basePage = pages['services'];

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/services',
});

export default async function Page() {
  const cmsServices = await fetchContentItems('services');
  return <ServicesIndex cmsServices={cmsServices} />;
}
