import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const template = await db.systemEmailTemplate.findUnique({ where: { id } });
    
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newVersion = template.version + 1;

    // Use a transaction to update the template and create the version snapshot
    const [updatedTemplate, versionSnapshot] = await db.$transaction([
      db.systemEmailTemplate.update({
        where: { id },
        data: {
          status: 'published',
          version: newVersion,
          updatedBy: admin.user.id,
        }
      }),
      db.systemEmailTemplateVersion.create({
        data: {
          templateId: id,
          version: newVersion,
          subject: template.subject,
          contentHtml: template.contentHtml,
          designJson: template.designJson,
          createdBy: admin.user.id,
        }
      })
    ]);

    return NextResponse.json({ template: updatedTemplate, version: versionSnapshot });
  } catch (error) {
    console.error('[Publish Template Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
