import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function run() {
  const published = await db.navigationMenu.findFirst({ where: { type: 'header', status: 'published' } });
  if (published) {
    console.log('Deleting items...');
    await db.navigationItem.deleteMany({ where: { menuId: published.id } });
    console.log('Deleted items successfully!');
  }
}
run().finally(() => db.$disconnect());
