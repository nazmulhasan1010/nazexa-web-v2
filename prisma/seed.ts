import { PrismaClient } from '@prisma/client';
import { defs, genericFaq } from '@/lib/site-content';
import { pageOverrides } from '@/lib/page-blocks';
import { products } from '@/lib/products';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing content items
  await prisma.contentItem.deleteMany();

  let positionOffset = 0;
  const insertItems = async (items: any[]) => {
    for (const item of items) {
      await prisma.contentItem.create({
        data: {
          ...item,
          published: true,
          position: positionOffset++,
          slug:
            item.slug ||
            item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
            `item-${positionOffset}`,
        },
      });
    }
  };

  // 2. Map `defs` to collections (solutions, industries, case-studies, portfolio, etc.)
  const defsToSeed = ['solutions', 'industries', 'case-studies', 'portfolio'];
  for (const pageSlug of defsToSeed) {
    const pageDef = defs.find((d) => d[0] === pageSlug);
    if (!pageDef) continue;

    const features = pageDef[4]; // The [title, body] array
    const mappedItems = features.map(([title, body]) => {
      let finalTitle = title;
      let finalSubtitle = body;

      // Special logic for case studies which are formatted "Client: Outcome"
      if (pageSlug === 'case-studies' && title.includes(':')) {
        const parts = title.split(':');
        finalSubtitle = parts[0].trim(); // Client
        finalTitle = parts[1].trim(); // Headline
      }

      return {
        collection: pageSlug,
        title: finalTitle,
        subtitle: finalSubtitle,
        body: pageSlug === 'case-studies' ? `<p>${body}</p>` : undefined,
      };
    });

    await insertItems(mappedItems);
  }

  // 3. Map pageOverrides (products, services, team, customers, pricing, integrations)

  // Products
  const productsBlock = pageOverrides['products']?.blocks.find(
    (b) => b.kind === 'cards' && b.title === 'The product suite'
  ) as any;
  if (productsBlock) {
    await insertItems(
      productsBlock.items.map((item: any) => ({
        collection: 'products',
        title: item.title,
        subtitle: item.tag,
        body: `<p>${item.body}</p>`,
      }))
    );
  }

  // Also seed dbDesign and devTools from products.ts
  await insertItems(
    products.map((p) => ({
      collection: 'products',
      title: p.name,
      subtitle: p.tagline,
      slug: p.slug,
      body: `<p>${p.description}</p><ul>${p.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`,
      link_url: p.to,
      link_label: p.cta,
      tone: p.tone,
    }))
  );

  // Services
  const servicesBlock = pageOverrides['services']?.blocks.find((b) => b.kind === 'cards') as any;
  if (servicesBlock) {
    await insertItems(
      servicesBlock.items.map((item: any) => ({
        collection: 'services',
        title: item.title,
        subtitle: item.body,
      }))
    );
  }

  // Team
  const teamBlock = pageOverrides['team']?.blocks.find((b) => b.kind === 'people') as any;
  if (teamBlock) {
    await insertItems(
      teamBlock.items.map((item: any) => ({
        collection: 'team',
        title: item.name,
        subtitle: item.role,
        category: item.focus || 'Engineering',
        data: JSON.stringify({ location: item.location || 'Remote' }),
      }))
    );
  }

  // Customers (Cards)
  const customersBlock = pageOverrides['customers']?.blocks.find((b) => b.kind === 'cards') as any;
  if (customersBlock) {
    await insertItems(
      customersBlock.items.map((item: any) => ({
        collection: 'customers',
        title: item.title,
        data: JSON.stringify({
          testimonial: item.body,
          author: item.title,
          author_role: item.tag,
        }),
      }))
    );
  }

  // Integrations (Table -> Cards)
  const integrationsBlock = pageOverrides['integrations']?.blocks.find(
    (b) => b.kind === 'table'
  ) as any;
  if (integrationsBlock) {
    await insertItems(
      integrationsBlock.rows.map((row: any) => ({
        collection: 'integrations',
        title: row[1], // name of integrations
        subtitle: row[2], // setup
        category: row[0], // category
      }))
    );
  }

  // Pricing
  const pricingBlock = pageOverrides['pricing']?.blocks.find((b) => b.kind === 'pricing') as any;
  if (pricingBlock) {
    await insertItems(
      pricingBlock.tiers.map((item: any) => ({
        collection: 'pricing',
        title: item.name,
        subtitle: item.price + (item.cadence ? ` / ${item.cadence}` : ''),
        body: `<p>${item.body}</p>`,
        data: JSON.stringify({ features: item.features }),
      }))
    );
  }

  // 4. FAQ
  // Generic FAQ from defs
  const genericFaqItems = genericFaq.map(([q, a]) => ({
    collection: 'faq',
    title: q,
    body: `<p>${a}</p>`,
    category: 'General',
  }));
  await insertItems(genericFaqItems);

  // Trust FAQ from pageOverrides
  const trustFaqBlock = pageOverrides['security']?.blocks.find(
    (b) => b.kind === 'faq' && b.title === 'Frequently asked'
  ) as any;
  if (trustFaqBlock) {
    await insertItems(
      trustFaqBlock.items.map((item: any) => ({
        collection: 'faq',
        title: item.title,
        body: `<p>${item.body}</p>`,
        category: 'Trust & Security',
      }))
    );
  }

  // Adding the trustFaq that was in page-blocks directly
  await insertItems([
    {
      collection: 'faq',
      title: 'Where is our data stored?',
      body: '<p>Choose from 19 regions across North America, Europe, Asia-Pacific and South America. Data residency is enforced at the control-plane level, so replicas never leave the region you pick.</p>',
      category: 'Infrastructure',
    },
    {
      collection: 'faq',
      title: 'How are backups handled?',
      body: '<p>Continuous WAL archiving with point-in-time recovery to any second in the last 35 days, plus daily encrypted snapshots retained for 12 months on Enterprise.</p>',
      category: 'Infrastructure',
    },
    {
      collection: 'faq',
      title: 'Can we bring our own keys?',
      body: '<p>Yes. Customer-managed encryption keys via AWS KMS, GCP KMS or Azure Key Vault, with automatic re-wrapping on rotation.</p>',
      category: 'Security',
    },
  ]);

  // Seed ContactSettings
  await prisma.contactSettings.deleteMany();
  await prisma.contactSettings.create({
    data: {
      title: "Let's talk about your project",
      subtitle:
        'Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.',
      phone: '+1 (555) 000-0000',
      email: 'hello@nazexa.com',
      address: '123 Tech Avenue, NY 10001',
    },
  });

  // 5. Seed Applications for SSO
  await prisma.application.upsert({
    where: { clientId: 'nazexa-db-design' },
    create: {
      clientId: 'nazexa-db-design',
      clientSecret: 'secret-db-design-123',
      name: 'Nazexa DB Design',
      redirectUris: 'http://localhost:3001/api/auth/sso/callback',
      allowedOrigins: 'http://localhost:3001',
    },
    update: {
      clientSecret: 'secret-db-design-123',
      redirectUris: 'http://localhost:3001/api/auth/sso/callback',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
