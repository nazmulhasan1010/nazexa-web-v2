import { seedDefaultNavigation } from './src/lib/navigation';

async function main() {
  console.log('Seeding header draft');
  await seedDefaultNavigation('header', 'draft');
  console.log('Seeding header published');
  await seedDefaultNavigation('header', 'published');
  
  console.log('Seeding footer draft');
  await seedDefaultNavigation('footer', 'draft');
  console.log('Seeding footer published');
  await seedDefaultNavigation('footer', 'published');
}
main().catch(console.error);
