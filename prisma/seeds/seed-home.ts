import { db } from './src/lib/db';

async function seed() {
  const count = await db.homeSection.count();
  if (count > 0) {
    console.log('Already seeded');
    return;
  }

  const sections = [
    { type: 'hero', title: '', subtitle: '', content: {} },
    { type: 'trusted', title: '', subtitle: '', content: {} },
    { type: 'whatwedo', title: '', subtitle: '', content: {} },
    { type: 'servicesfull', title: '', subtitle: '', content: {} },
    { type: 'mission', title: '', subtitle: '', content: {} },
    { type: 'technologies', title: '', subtitle: '', content: {} },
    { type: 'stats', title: '', subtitle: '', content: {} },
    { type: 'why', title: '', subtitle: '', content: {} },
    { type: 'process', title: '', subtitle: '', content: {} },
    { type: 'ourproducts', title: '', subtitle: '', content: {} },
    { type: 'testimonials', title: '', subtitle: '', content: {} },
    { type: 'faq', title: '', subtitle: '', content: {} },
    { type: 'clientcta', title: '', subtitle: '', content: {} },
  ];

  for (let i = 0; i < sections.length; i++) {
    await db.homeSection.create({
      data: {
        type: sections[i].type,
        position: i,
        visible: true,
        title: sections[i].title || null,
        subtitle: sections[i].subtitle || null,
        content: JSON.stringify(sections[i].content),
      },
    });
  }
  console.log('Seeded home sections');
}
seed().catch(console.error);
