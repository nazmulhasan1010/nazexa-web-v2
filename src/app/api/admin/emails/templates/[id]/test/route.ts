import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { renderTemplateString } from '@/lib/email/renderer';
import { sendEmail } from '@/lib/email';
import { EMAIL_VARIABLES } from '@/lib/email/variables';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { to } = await req.json();

    const template = await db.systemEmailTemplate.findUnique({ where: { id } });
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Generate mock context from example values in registry
    const mockContext: any = {};
    EMAIL_VARIABLES.forEach(v => {
      const parts = v.key.split('.');
      if (!mockContext[parts[0]]) mockContext[parts[0]] = {};
      if (parts.length === 2) {
        mockContext[parts[0]][parts[1]] = v.exampleValue;
      }
    });

    const subject = renderTemplateString(template.subject || 'Test Email', mockContext);
    const html = renderTemplateString(template.contentHtml || '', mockContext);

    const result = await sendEmail({ to, subject, html });

    if (result.sent) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: (result as any).reason || 'Failed to send' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Send Test Email Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
