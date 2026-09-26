import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const menu = await db.navigationMenu.findFirst({ where: { type: 'header', status: 'draft' } });
  const items = await db.navigationItem.findMany({ where: { menuId: menu.id, parentId: null }, orderBy: { order: 'asc' }, include: { children: true } });
  
  await db.navigationItem.deleteMany({ where: { menuId: menu.id } });
  
  const reversed = [...items].reverse();
  
  async function insertItems(itemsToInsert: any[], parentId: string | null) {
    let order = 0;
    for (const item of itemsToInsert) {
      console.log('Inserting', item.label);
      const newItem = await db.navigationItem.create({
        data: {
          menuId: menu.id,
          parentId,
          label: item.label,
          url: item.url,
          source: item.source,
          sourceId: item.sourceId,
          target: item.target,
          icon: item.icon,
          description: item.description,
          order: order++,
          isVisible: item.isVisible ?? true,
          metadata: item.metadata,
        }
      });
      if (item.children && item.children.length > 0) {
        await insertItems(item.children, newItem.id);
      }
    }
  }

  try {
    await insertItems(reversed, null);
    console.log('SUCCESS');
  } catch (e) {
    console.error('ERROR:', e);
  }
}
run().finally(() => db.$disconnect());
