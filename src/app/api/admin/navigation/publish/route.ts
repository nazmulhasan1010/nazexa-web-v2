import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { publishNavigationMenu } from '@/lib/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type } = await req.json();
    if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 });

    const publishedMenu = await publishNavigationMenu(type);
    
    // Invalidate layout cache to force the public site to refetch the DB
    revalidatePath('/', 'layout');
    revalidateTag('navigation');
    
    return NextResponse.json(publishedMenu);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




