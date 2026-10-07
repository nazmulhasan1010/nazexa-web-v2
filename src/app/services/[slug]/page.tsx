import { ServiceDetail } from '@/components/services/ServiceDetail';
import { serviceBySlug, type Service } from '@/lib/services';
import { fetchContentItemBySlug } from '@/lib/cms';
import { notFound } from 'next/navigation';
import { getIcon } from '@/lib/icons';
import { Layers } from 'lucide-react';

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const cmsItem = await fetchContentItemBySlug('services', slug);
  const staticService = serviceBySlug(slug);

  if (!cmsItem && !staticService) return notFound();

  // Map CMS JSON features to capabilities if available
  const features = Array.isArray(cmsItem?.data?.features) 
    ? cmsItem.data.features as {title: string; body: string}[] 
    : [];

  const mergedService: Service = {
    slug: cmsItem?.slug || staticService?.slug || slug,
    name: cmsItem?.title || staticService?.name || 'Service',
    icon: cmsItem?.icon ? getIcon(cmsItem.icon) : (staticService?.icon || Layers),
    tone: (cmsItem?.tone as Service['tone']) || staticService?.tone || 'brand-1',
    category: cmsItem?.category || staticService?.category || 'Service',
    tagline: cmsItem?.subtitle || staticService?.tagline || '',
    summary: cmsItem?.body || staticService?.summary || '',
    // Use static arrays as fallback, or empty if brand new
    overview: staticService?.overview || [],
    audience: staticService?.audience || [],
    deliverables: staticService?.deliverables || [],
    capabilities: features.length > 0 ? features : (staticService?.capabilities || []),
    stack: staticService?.stack || [],
    outcomes: staticService?.outcomes || [],
    faq: staticService?.faq || [],
  };

  return <ServiceDetail service={mergedService} />;
}
