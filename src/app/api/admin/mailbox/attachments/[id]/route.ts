import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { join } from 'path';
import { createReadStream, statSync } from 'fs';

// GET /api/admin/mailbox/attachments/[id] — Serve attachment securely
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const attachment = await db.mailAttachment.findUnique({
    where: { id },
    include: { message: { select: { accountId: true } } },
  });

  if (!attachment) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });

  const filePath = join(process.cwd(), '.data', 'mail-attachments', attachment.storageKey);

  try {
    const stat = statSync(filePath);
    const fileStream = createReadStream(filePath);

    // Stream file back as response
    const { ReadableStream } = await import('stream/web');
    const { Readable } = await import('stream');

    const readable = Readable.toWeb(fileStream) as ReadableStream;

    return new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': attachment.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
        'Content-Length': String(stat.size),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
  }
}
