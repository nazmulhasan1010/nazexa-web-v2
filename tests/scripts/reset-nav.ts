import { db } from './src/lib/db';
import { seedDefaultNavigation } from './src/lib/navigation';
async function resetNav() {
  await seedDefaultNavigation('header', 'published');
  await seedDefaultNavigation('footer', 'published');
  console.log('Navigation seeded');
}
resetNav();
