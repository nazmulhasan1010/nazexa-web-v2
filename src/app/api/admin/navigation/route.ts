import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { getNavigationMenu, publishNavigationMenu, seedDefaultNavigation } from '@/lib/navigation';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get('type') as 'header' | 'footer';
  const status = url.searchParams.get('status') as 'draft' | 'published';

  if (!type || !status) return NextResponse.json({ error: 'Missing type or status' }, { status: 400 });

  try {
    const menu = await getNavigationMenu(type, status);
    return NextResponse.json(menu);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { type, items } = body; // items is a nested array of NavItemWithChildren
    
    // Find draft menu
    const menu = await getNavigationMenu(type, 'draft');
    
    // To cleanly update, we can delete all existing items for this draft and recreate them
    await db.navigationItem.deleteMany({ where: { menuId: menu.id } });

    async function insertItems(itemsToInsert: any[], parentId: string | null) {
      let order = 0;
      for (const item of itemsToInsert) {
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

    await insertItems(items, null);
    revalidateTag('navigation');
    
    const updated = await getNavigationMenu(type, 'draft');
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



