const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function duplicateItems(items, parentId, newMenuId) {
  for (const item of items) {
    console.log('Duplicating', item.label);
    const newItem = await db.navigationItem.create({
      data: {
        menuId: newMenuId,
        parentId,
        label: item.label,
        url: item.url,
        source: item.source,
        sourceId: item.sourceId,
        target: item.target,
        icon: item.icon,
        description: item.description,
        order: item.order,
        isVisible: item.isVisible,
        metadata: item.metadata,
      }
    });
    if (item.children && item.children.length > 0) {
      await duplicateItems(item.children, newItem.id, newMenuId);
    }
  }
}

async function run() {
  const draft = await db.navigationMenu.findFirst({
    where: { type: 'header', status: 'draft' },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: {
            orderBy: { order: 'asc' },
            include: { children: { orderBy: { order: 'asc' } } }
          }
        }
      }
    }
  });

  const newMenu = await db.navigationMenu.create({
    data: {
      type: 'header',
      status: 'published',
      version: draft.version + 1,
    }
  });

  try {
    await duplicateItems(draft.items, null, newMenu.id);
    console.log('SUCCESS');
  } catch(e) {
    console.error('ERROR:', e);
  }
}
run().finally(() => db.$disconnect());
