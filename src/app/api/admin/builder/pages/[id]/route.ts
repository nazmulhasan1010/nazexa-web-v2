import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';
import { revalidatePath } from 'next/cache';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const page = await db.page.findUnique({ where: { id: params.id } });
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(page);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { draftData, title, slug, seo_title, seo_description } = body;

  const page = await db.page.update({
    where: { id: params.id },
    data: {
      ...(draftData && { draftData: JSON.stringify(draftData) }),
      ...(title && { title }),
      ...(slug && { slug }),
      ...(seo_title !== undefined && { seo_title }),
      ...(seo_description !== undefined && { seo_description })
    }
  });

  return NextResponse.json(page);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // This is the PUBLISH endpoint
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const page = await db.page.findUnique({ where: { id: params.id } });
  if (!page || !page.draftData) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updatedPage = await db.page.update({
    where: { id: params.id },
    data: {
      publishedData: page.draftData,
      published: true,
      version: page.version + 1,
      revisions: {
        create: {
          version: page.version,
          schema: page.draftData,
          createdBy: session.user.id
        }
      }
    }
  });

  revalidatePath(`/${updatedPage.slug}`);

  return NextResponse.json(updatedPage);
}

