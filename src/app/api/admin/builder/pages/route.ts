import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pages = await db.page.findMany({
    orderBy: { updated_at: 'desc' }
  });

  return NextResponse.json(pages);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, slug } = await req.json();

  const emptySchema = {
    version: 1,
    root: {
      id: 'root',
      type: 'Page',
      props: {},
      styles: {},
      tailwindClasses: 'min-h-screen bg-background',
      children: []
    }
  };

  const page = await db.page.create({
    data: {
      title,
      slug,
      draftData: JSON.stringify(emptySchema),
      publishedData: null,
      version: 1
    }
  });

  return NextResponse.json(page);
}
