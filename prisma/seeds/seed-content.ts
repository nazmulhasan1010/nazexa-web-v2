import { db } from './src/lib/db';
import crypto from 'crypto';

async function seedMissingContent() {
  const collections = {
    pillars: [
      {
        title: 'Custom Software Engineering',
        subtitle: 'We build scalable, robust applications tailored to your exact business needs.',
        icon: 'Code',
        data: { visual: 'build' },
      },
      {
        title: 'Cloud Infrastructure',
        subtitle: 'Secure, high-availability architecture deployed across major cloud providers.',
        icon: 'Cloud',
        data: { visual: 'cloud' },
      },
      {
        title: 'Design & Architecture',
        subtitle: 'User-centric design paired with systems built for long-term maintainability.',
        icon: 'PenTool',
        data: { visual: 'design' },
      },
    ],
    missionvision: [
      {
        title: 'Our Mission',
        subtitle: 'Building the foundation for modern digital products',
        body: 'Nazexa exists to elevate the standard of software engineering. We partner with ambitious teams to deliver solutions that are not only functional, but exceptionally reliable and elegantly designed.',
      },
      {
        title: 'Our Vision',
        subtitle: 'To be the most trusted engineering partner globally',
        body: 'We envision a world where complex technical challenges are met with clarity, transparency, and unparalleled expertise. We aim to be the first choice for companies tackling hard problems.',
      },
    ],
    technologies: [
      {
        title: 'Languages',
        category: 'Core',
        data: { icons: ['TypeScript', 'Go', 'Rust'] },
      },
      {
        title: 'Databases',
        category: 'Data',
        data: { icons: ['PostgreSQL', 'MongoDB', 'Redis'] },
      },
      {
        title: 'Cloud & Infrastructure',
        category: 'Hosting',
        data: { icons: ['AWS', 'GCP', 'Vercel'] },
      },
    ],
    values: [
      {
        title: 'Velocity with Quality',
        body: 'We believe that shipping fast does not mean cutting corners. Rigorous engineering allows us to move quickly.',
      },
      {
        title: 'Radical Transparency',
        body: 'No black boxes. We communicate openly about technical debt, architectural trade-offs, and project timelines.',
      },
      {
        title: 'Long-term Thinking',
        body: 'We build systems designed to scale and endure, not just pass the immediate sprint requirements.',
      },
    ],
    stats: [
      { title: 'Global Clients', data: { value: '150+' } },
      { title: 'Projects Delivered', data: { value: '300+' } },
      { title: 'Engineering Uptime', data: { value: '99.99%' } },
      { title: 'Years of Excellence', data: { value: '10+' } },
    ],
    process: [
      {
        title: '1. Discovery & Scoping',
        subtitle: 'Understanding the problem',
        body: 'We dive deep into your business requirements to ensure we are solving the right problem before writing a single line of code.',
      },
      {
        title: '2. Architecture Design',
        subtitle: 'Planning the foundation',
        body: 'Our senior engineers map out the data models, cloud infrastructure, and API contracts required to support your scale.',
      },
      {
        title: '3. Agile Engineering',
        subtitle: 'Building iteratively',
        body: 'We deliver working software in continuous cycles, ensuring you always have visibility and can pivot when necessary.',
      },
      {
        title: '4. Launch & Support',
        subtitle: 'Going live',
        body: 'We manage the deployment, monitor the systems, and provide ongoing support to ensure everything runs smoothly.',
      },
    ],
  };

  for (const [collection, items] of Object.entries(collections)) {
    const existing = await db.contentItem.count({ where: { collection } });
    if (existing === 0) {
      console.log('Seeding ' + collection + '...');
      let pos = 0;
      for (const item of items) {
        await db.contentItem.create({
          data: {
            id: crypto.randomUUID(),
            collection,
            published: true,
            title: item.title || null,
            subtitle: item.subtitle || null,
            body: item.body || null,
            icon: item.icon || null,
            category: item.category || null,
            data: JSON.stringify(item.data || {}),
            slug:
              (item.title || crypto.randomUUID()).toLowerCase().replace(/[^a-z0-9]+/g, '-') +
              '-' +
              crypto.randomUUID().slice(0, 4),
            position: pos++,
          },
        });
      }
    } else {
      console.log('Collection ' + collection + ' already has ' + existing + ' items. Skipping.');
    }
  }

  console.log('Done!');
}

seedMissingContent().catch(console.error);
