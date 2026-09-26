import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const items = await db.navigationItem.findMany({
      where: { sourceId: { not: null } }
    });

    const issues = [];
    let validCount = 0;

    for (const item of items) {
      if (item.source === 'content_library' && item.sourceId) {
        const content = await db.contentItem.findUnique({ where: { id: item.sourceId } });
        if (!content) {
          issues.push({ itemId: item.id, label: item.label, issue: 'Content deleted', severity: 'error' });
        } else if (!content.published) {
          issues.push({ itemId: item.id, label: item.label, issue: 'Content unpublished', severity: 'warning' });
        } else {
          validCount++;
        }
      } else if (item.source === 'page' && item.sourceId) {
        const page = await db.page.findUnique({ where: { id: item.sourceId } });
        if (!page) {
          issues.push({ itemId: item.id, label: item.label, issue: 'Page deleted', severity: 'error' });
        } else if (!page.published) {
          issues.push({ itemId: item.id, label: item.label, issue: 'Page unpublished', severity: 'warning' });
        } else {
          validCount++;
        }
      } else {
        validCount++;
      }
    }

    return NextResponse.json({
      validCount,
      issuesCount: issues.length,
      issues
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
