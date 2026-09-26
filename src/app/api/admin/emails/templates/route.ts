import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const templates = await db.systemEmailTemplate.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('[GET Templates Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    
    // Validate uniqueness of key
    const existing = await db.systemEmailTemplate.findUnique({ where: { key: data.key } });
    if (existing) {
      return NextResponse.json({ error: 'Template key already exists' }, { status: 400 });
    }

    const template = await db.systemEmailTemplate.create({
      data: {
        name: data.name,
        key: data.key,
        category: data.category || 'System',
        subject: data.subject || '',
        contentHtml: data.contentHtml || '',
        designJson: data.designJson || '{}',
        status: 'draft',
        createdBy: admin.user.id,
        updatedBy: admin.user.id,
      }
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('[Create Template Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
