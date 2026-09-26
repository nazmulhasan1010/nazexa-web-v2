import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Auth check
    const sessionUser = await getSession();
    const adminSession = sessionUser ? null : await getAdminSession();
    
    if (!sessionUser && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find attachment in DB
    const attachment = await db.supportAttachment.findUnique({
      where: { id },
      include: {
        message: {
          include: {
            ticket: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Security check: Only admins or the ticket owner can view it
    if (!adminSession && sessionUser?.id !== attachment.message.ticket.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filepath = join(process.cwd(), '.data', 'support-attachments', attachment.storageKey);
    
    try {
      const fileBuffer = await readFile(filepath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': attachment.mimeType,
          'Content-Disposition': `inline; filename="${attachment.fileName}"`,
          'Cache-Control': 'private, max-age=31536000, immutable',
        },
      });
    } catch (err) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

  } catch (error) {
    console.error('Attachment download error:', error);
    return NextResponse.json({ error: 'Failed to download attachment' }, { status: 500 });
  }
}
