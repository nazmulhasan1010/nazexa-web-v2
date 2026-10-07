import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const menus = await db.navigationMenu.findMany({ where: { type: 'header' } });
  
  for (const menu of menus) {
    // Check if Pricing already exists
    const existing = await db.navigationItem.findFirst({
      where: { menuId: menu.id, label: 'Pricing' }
    });
    
    if (!existing) {
      // Find highest order
      const maxItem = await db.navigationItem.findFirst({
        where: { menuId: menu.id, parentId: null },
        orderBy: { order: 'desc' }
      });
      const nextOrder = maxItem ? maxItem.order + 1 : 0;
      
      const pricing = await db.navigationItem.create({
        data: {
          menuId: menu.id,
          label: 'Pricing',
          order: nextOrder,
        }
      });
      
      // We can also fetch the products to create default child links, but the user can add them via builder.
      // Actually, it's better to add the child links so it perfectly replaces the hardcoded one!
      
      const products = await db.contentItem.findMany({
        where: { collection: 'products', published: true },
        orderBy: { position: 'asc' },
      });
      
      let childOrder = 0;
      for (const p of products) {
        const data = JSON.parse(p.data || '{}');
        await db.navigationItem.create({
          data: {
            menuId: menu.id,
            parentId: pricing.id,
            label: p.title + ' Pricing',
            url: '/' + p.slug + '/pricing',
            description: 'View pricing plans for ' + p.title,
            icon: 'CreditCard',
            order: childOrder++,
          }
        });
      }
      
      // All Pricing
      await db.navigationItem.create({
        data: {
          menuId: menu.id,
          parentId: pricing.id,
          label: 'All Pricing',
          url: '/pricing',
          description: 'Compare all plans side-by-side',
          icon: 'Compass',
          order: childOrder++,
        }
      });
      
      console.log('Added Pricing to menu:', menu.status);
    }
  }
}

run().finally(() => db.$disconnect());
