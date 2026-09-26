import { unstable_cache } from 'next/cache';
import { db } from './db';
import { navGroups, footerColumns } from './site-content';

export type NavItemWithChildren = {
  id: string;
  label: string;
  url: string | null;
  source: string | null;
  sourceId: string | null;
  target: string;
  icon: string | null;
  description: string | null;
  order: number;
  isVisible: boolean;
  metadata: string | null;
  children: NavItemWithChildren[];
};

export type NavMenu = {
  id: string;
  type: string;
  status: string;
  items: NavItemWithChildren[];
  version: number;
};

export async function seedDefaultNavigation(type: 'header' | 'footer', status: 'draft' | 'published') {
  const menu = await db.navigationMenu.create({
    data: {
      type,
      status,
      version: 1,
    }
  });

  let currentOrder = 0;

  if (type === 'header') {
    for (const group of navGroups) {
      const parent = await db.navigationItem.create({
        data: {
          menuId: menu.id,
          label: group.label,
          order: currentOrder++,
        }
      });
      
      let childOrder = 0;
      for (const item of group.items) {
        await db.navigationItem.create({
          data: {
            menuId: menu.id,
            parentId: parent.id,
            label: item.title,
            url: item.to,
            description: item.description,
            order: childOrder++,
          }
        });
      }
    }
  } else if (type === 'footer') {
    for (const group of footerColumns) {
      const parent = await db.navigationItem.create({
        data: {
          menuId: menu.id,
          label: group.title,
          order: currentOrder++,
        }
      });
      
      let childOrder = 0;
      for (const item of group.links) {
        await db.navigationItem.create({
          data: {
            menuId: menu.id,
            parentId: parent.id,
            label: item.label,
            url: item.to,
            order: childOrder++,
          }
        });
      }
    }
  }

  return menu;
}

export async function getNavigationMenu(type: 'header' | 'footer', status: 'draft' | 'published'): Promise<NavMenu> {
  let menu = await db.navigationMenu.findFirst({
    where: { type, status },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: {
            orderBy: { order: 'asc' },
            include: {
              children: { orderBy: { order: 'asc' } } // 3 levels deep max usually
            }
          }
        }
      }
    }
  });

  if (!menu) {
    await seedDefaultNavigation(type, status);
    menu = await db.navigationMenu.findFirst({
      where: { type, status },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: { orderBy: { order: 'asc' } }
              }
            }
          }
        }
      }
    });
  }

  return menu as any as NavMenu;
}

export async function publishNavigationMenu(type: 'header' | 'footer') {
  // Read draft directly from DB
  const draft = await db.navigationMenu.findFirst({
    where: { type, status: 'draft' },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: {
            orderBy: { order: 'asc' },
            include: {
              children: { orderBy: { order: 'asc' } }
            }
          }
        }
      }
    }
  });

  if (!draft) throw new Error('Draft not found');

  let published = await db.navigationMenu.findFirst({ where: { type, status: 'published' } });
  
  if (published) {
    // FIX: Explicitly delete items first to avoid MySQL "Foreign key cascade delete exceeds limit" error
    await db.navigationItem.deleteMany({ where: { menuId: published.id } });
    // Update version
    published = await db.navigationMenu.update({
      where: { id: published.id },
      data: { version: draft.version + 1 }
    });
  } else {
    published = await db.navigationMenu.create({
      data: {
        type,
        status: 'published',
        version: draft.version + 1,
      }
    });
  }

  async function duplicateItems(items: NavItemWithChildren[], parentId: string | null) {
    for (const item of items) {
      const newItem = await db.navigationItem.create({
        data: {
          menuId: published!.id,
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
        await duplicateItems(item.children, newItem.id);
      }
    }
  }

  await duplicateItems(draft.items, null);
  return published;
}

