import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Migrate the previously-hardcoded homepage/content arrays into the CMS.
// Idempotent: a collection is only seeded when it is currently empty.
const SEED = {
  stats: [
    { title: 'Projects delivered for clients', data: { value: '120+' } },
    { title: 'Service practices in-house', data: { value: '13' } },
    { title: 'Technologies we work with', data: { value: '40+' } },
    { title: 'Building software since 2019', data: { value: '9 yrs' } },
  ],
  customers: [
    {
      title: 'Northwind',
      data: {
        testimonial:
          'Nazexa replaced a decade-old internal system in four months. Their discovery phase alone was worth the engagement.',
        author: 'Priya Raman',
        author_role: 'VP Operations, Northwind',
      },
    },
    {
      title: 'Cobalt',
      data: {
        testimonial:
          'We got a senior engineer on the first call and a written plan in a week. Every demo landed on schedule.',
        author: 'Tomas Lindqvist',
        author_role: 'Founder, Cobalt',
      },
    },
    {
      title: 'Helio Health',
      data: {
        testimonial:
          'The Android app and the API behind it were delivered together, documented, and handed to our team cleanly.',
        author: 'Amara Okafor',
        author_role: 'CTO, Helio Health',
      },
    },
    { title: 'Vantage', data: {} },
    { title: 'Lumen Labs', data: {} },
    { title: 'Orbital', data: {} },
    { title: 'Ferrous', data: {} },
    { title: 'Kestrel', data: {} },
  ],
  faq: [
    {
      title: 'How do projects usually start?',
      body: 'With a short discovery call, followed by a written approach covering scope, architecture, milestones and a fixed estimate — normally within a week.',
    },
    {
      title: 'Who owns the code and infrastructure?',
      body: 'You do, from the first commit. Repositories, cloud accounts and credentials are in your name throughout.',
    },
    {
      title: 'Can you work with our existing team or codebase?',
      body: 'Yes. We regularly join in-house teams, take over legacy systems and run audits before recommending any rewrite.',
    },
    {
      title: 'What happens after launch?',
      body: 'We offer maintenance and support plans with monitoring, security updates and an agreed response time, plus knowledge transfer whenever you want to take over.',
    },
  ],
  blog: [
    {
      title: 'How we cut cold starts to 38ms',
      subtitle: 'A deep dive into snapshotting V8 isolates at the edge.',
      category: 'Engineering',
    },
    {
      title: 'Introducing branch-aware analytics',
      subtitle: 'Query your preview data with the same tools as production.',
      category: 'Product',
    },
    {
      title: 'Nazexa achieves ISO 27001',
      subtitle: 'Our third independent certification this year.',
      category: 'News',
    },
  ],
  news: [
    {
      title: 'Nazexa raises Series C',
      subtitle: 'Fresh funding to expand our AI and platform teams.',
      category: 'Company',
    },
    {
      title: 'New multi-region support goes GA',
      subtitle: 'Read replicas and failover in a single click.',
      category: 'Product',
    },
  ],
  announcement: [
    {
      title: 'Scheduled maintenance this weekend',
      body: 'Brief planned maintenance on Saturday 02:00–03:00 UTC. No downtime expected.',
      data: { priority: 'normal' },
    },
    {
      title: 'New status page is live',
      body: 'Track real-time platform health and subscribe to incident updates.',
      data: { priority: 'low' },
    },
  ],
};

async function main() {
  const summary = {};
  for (const [collection, rows] of Object.entries(SEED)) {
    const existing = await db.contentItem.count({ where: { collection } });
    if (existing > 0) {
      summary[collection] = `skipped (${existing} existing)`;
      continue;
    }
    await db.contentItem.createMany({
      data: rows.map((r, i) => ({
        collection,
        slug: (r.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
        position: i,
        published: true,
        title: r.title ?? null,
        subtitle: r.subtitle ?? null,
        body: r.body ?? null,
        category: r.category ?? null,
        data: JSON.stringify(r.data ?? {}),
      })),
    });
    summary[collection] = `seeded ${rows.length}`;
  }
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => {
    console.error('SEED ERROR', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
