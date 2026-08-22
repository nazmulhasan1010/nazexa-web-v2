import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const products = await fetchContentItems('products');
  const product = products.find((p) => p.slug === params.slug);

  return constructMetadata({
    title: product ? `${product.title} Pricing` : 'Pricing',
    description: product ? `Pricing plans for ${product.title}` : 'Pricing plans',
    url: `/${params.slug}/pricing`,
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const products = await fetchContentItems('products');
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    return notFound();
  }

  const basePage = pages['pricing'] || {
    title: 'Pricing',
    description: 'Transparent pricing',
    blocks: [],
  };

  const page = { ...basePage };
  page.title = `${product.title} Pricing`;
  page.description = `Transparent pricing for ${product.title}`;

  let dbPlans: any[] = [];
  try {
    const dbApiUrl = process.env.NEXT_PUBLIC_NAZEXA_DB_URL || 'http://localhost:8000';
    const res = await fetch(`${dbApiUrl}/api/plans`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    if (json.success) {
      dbPlans = json.data.plans;
    }
  } catch (error) {
    console.error('Failed to fetch plans', error);
  }

  if (dbPlans.length > 0) {
    const pricingBlock = {
      kind: 'pricing' as const,
      title: 'Usage pricing',
      tiers: dbPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        cadence: plan.billingInterval,
        body: plan.description || '',
        features: plan.features || [],
        highlight: plan.slug === 'pro',
      })),
    };

    page.blocks = [pricingBlock, ...page.blocks.filter((b: any) => b.kind !== 'pricing')];
  } else {
    // Fallback or empty state if API is unavailable
    page.blocks = page.blocks.filter((b: any) => b.kind !== 'pricing');
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
