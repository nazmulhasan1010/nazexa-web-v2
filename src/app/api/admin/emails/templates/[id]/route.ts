import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { validateTemplateVariables } from '@/lib/email/renderer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const template = await db.systemEmailTemplate.findUnique({
    where: { id },
    include: { versions: { orderBy: { version: 'desc' } } }
  });

  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await req.json();

    // Validate variables
    if (data.contentHtml || data.subject) {
      const subjectValidation = validateTemplateVariables(data.subject || '');
      const htmlValidation = validateTemplateVariables(data.contentHtml || '');
      
      if (!subjectValidation.valid || !htmlValidation.valid) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: [...subjectValidation.errors, ...htmlValidation.errors] 
        }, { status: 400 });
      }
    }

    const template = await db.systemEmailTemplate.update({
      where: { id },
      data: {
        name: data.name,
        key: data.key,
        category: data.category,
        subject: data.subject,
        contentHtml: data.contentHtml,
        designJson: data.designJson,
        status: data.status,
        updatedBy: admin.user.id,
      }
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('[Update Template Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db.systemEmailTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
