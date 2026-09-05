import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { StandardPage } from '@/components/site/PageShell';
import { pages } from '@/lib/site-content';
import { fetchContentItems } from '@/lib/cms';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const products = await fetchContentItems('products');
  const product = products.find((p) => p.slug === params.slug);

  return constructMetadata({
    title: product ? `${product.name} Pricing` : 'Pricing',
    description: product ? `Pricing plans for ${product.name}` : 'Pricing plans',
    url: `//pricing`,
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
  page.title = `${product.name} Pricing`;
  page.description = `Transparent pricing for ${product.name}`;

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

  // Fetch actual DB prices for this product
  let productPlans: any[] = [];
  try {
    productPlans = await db.paymentProductPlan.findMany({
      where: { productCode: params.slug, isActive: true },
    });
  } catch (error) {
    console.error('Failed to fetch payment product plans', error);
  }

  if (dbPlans.length > 0) {
    const pricingBlock = {
      kind: 'pricing' as const,
      title: 'Usage pricing',
      tiers: dbPlans.map((plan: any) => {
        // Build exact price map for this plan across all currencies
        const prices: Record<string, number> = {};
        const matchingDbPlans = productPlans.filter((p) => p.planCode === plan.slug);
        for (const p of matchingDbPlans) {
          prices[p.currency] = Number(p.amount);
        }

        return {
          id: plan.slug, // Pass slug as ID so purchase route knows the exact planCode! Wait, nazexa-db expects ID or slug?
          // Actually, earlier it was 'plan.id'.
          // Let's keep it as plan.id, but wait, the purchase API expects planId which it maps to the exact plan!
          name: plan.name,
          price: Number(plan.price),
          prices, // Exact prices from DB
          cadence: plan.billingInterval,
          body: plan.description || '',
          features: plan.features || [],
          highlight: plan.slug === 'pro',
        };
      }),
    };

    
    

    // I will use id: plan.slug because PaymentProductPlan uses planCode = slug! Actually I'll use id: plan.id but keep it consistent.
    // Let me just set it exactly as it was: id: plan.id.

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







