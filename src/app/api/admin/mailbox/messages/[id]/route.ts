import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { fetchFullMessage } from '@/lib/mail/imap-client';

// GET /api/admin/mailbox/messages/[id] — Full message view
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const message = await db.mailMessage.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, email: true, displayName: true } },
      folder: { select: { name: true, type: true } },
      attachments: true,
    },
  });

  if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  // If body not yet loaded, fetch it from IMAP
  if (!message.bodyHtml && !message.bodyText) {
    try {
      const account = await db.mailAccount.findUnique({ where: { id: message.accountId } });
      if (account && message.folder) {
        const full = await fetchFullMessage(account, message.folder.name, message.uid);

        // Store attachments
        if (full.attachments.length > 0) {
          const { join } = await import('path');
          const { mkdir, writeFile } = await import('fs/promises');
          const attachDir = join(process.cwd(), '.data', 'mail-attachments');
          await mkdir(attachDir, { recursive: true });

          for (const att of full.attachments) {
            const storageKey = `${message.id}_${Date.now()}_${att.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            await writeFile(join(attachDir, storageKey), att.content);
            await db.mailAttachment.create({
              data: {
                messageId: message.id,
                fileName: att.fileName,
                mimeType: att.mimeType,
                fileSize: att.content.length,
                storageKey,
                cid: att.cid,
              },
            });
          }
        }

        // Update message with body and mark read
        const updated = await db.mailMessage.update({
          where: { id },
          data: {
            bodyHtml: full.bodyHtml || null,
            bodyText: full.bodyText || null,
            preview: full.preview || null,
            isRead: true,
            hasAttachment: full.attachments.length > 0,
          },
          include: {
            account: { select: { id: true, email: true, displayName: true } },
            folder: { select: { name: true, type: true } },
            attachments: true,
          },
        });
        return NextResponse.json({ message: updated });
      }
    } catch (err: any) {
      console.error('[mailbox] fetch body error:', err.message);
    }
  } else {
    // Mark as read if not already
    if (!message.isRead) {
      await db.mailMessage.update({ where: { id }, data: { isRead: true } });
    }
  }

  return NextResponse.json({ message });
}

// PATCH /api/admin/mailbox/messages/[id] — Update flags
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { isRead, isStarred, isImportant, folderType } = body;

  const updateData: any = {};
  if (isRead !== undefined) updateData.isRead = isRead;
  if (isStarred !== undefined) updateData.isStarred = isStarred;
  if (isImportant !== undefined) updateData.isImportant = isImportant;
  if (folderType !== undefined) updateData.folderType = folderType;

  const updated = await db.mailMessage.update({ where: { id }, data: updateData });
  return NextResponse.json({ message: updated });
}

// DELETE /api/admin/mailbox/messages/[id] — Move to trash or permanent delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const permanent = searchParams.get('permanent') === 'true';

  const message = await db.mailMessage.findUnique({ where: { id }, include: { attachments: true } });
  if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  if (permanent || message.folderType === 'trash') {
    // Physical deletion of attachments
    const { join } = await import('path');
    const { unlink } = await import('fs/promises');
    const attachDir = join(process.cwd(), '.data', 'mail-attachments');

    for (const att of message.attachments) {
      try { await unlink(join(attachDir, att.storageKey)); } catch { }
    }
    await db.mailMessage.delete({ where: { id } });

    await db.mailAuditLog.create({
      data: { actorId: admin.user.id, action: 'email_deleted', accountId: message.accountId, messageId: id, details: `Permanently deleted: ${message.subject}` },
    });
  } else {
    // Move to trash
    await db.mailMessage.update({ where: { id }, data: { folderType: 'trash' } });
  }

  return NextResponse.json({ success: true });
}
