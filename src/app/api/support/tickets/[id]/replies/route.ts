import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { publishAdminEvent } from '@/lib/socket';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { text, attachments = [] } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Create message
    const message = await db.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: 'USER',
        senderId: user.id,
        body: text,
        internalNote: false, // Users cannot create internal notes
      }
    });

    // 2. Link attachments
    if (attachments.length > 0) {
      for (const att of attachments) {
        await db.supportAttachment.create({
          data: {
            messageId: message.id,
            fileName: att.fileName,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
            storageKey: att.storageKey,
          }
        });
      }
    }

    const shouldReopen = ['WAITING_FOR_USER', 'RESOLVED', 'CLOSED', 'COMPLETED', 'SKIPPED', 'UNSOLVED'].includes(ticket.status);
    const newStatus = shouldReopen ? 'OPEN' : ticket.status;

    // 3. Update ticket status
    const updatedTicket = await db.supportTicket.update({
      where: { id: ticket.id },
      data: {
        lastReplyAt: new Date(),
        status: newStatus,
        closedAt: null
      }
    });

    if (shouldReopen && newStatus !== ticket.status) {
      await db.supportTicketHistory.create({
        data: {
          ticketId: ticket.id,
          previousStatus: ticket.status,
          newStatus: newStatus,
          changedBy: 'USER',
          changedById: user.id,
          note: 'Reopened by user reply'
        }
      });
      // Emit ticket.updated to refresh admin lists
      await publishAdminEvent('ticket.updated', {
        ticketId: updatedTicket.id,
        ticketNumber: updatedTicket.number,
        status: updatedTicket.status
      });
    }

    const populatedMessage = await db.supportMessage.findUnique({
      where: { id: message.id },
      include: { attachments: true }
    });

    // 4. Notify admins and user via socket
    await publishAdminEvent(
      'ticket.reply_created', 
      {
        ticketId: ticket.id,
        ticketNumber: ticket.number,
        messageId: message.id,
        senderType: 'USER',
        message: populatedMessage
      },
      undefined,
      ['admin:events', `user:${ticket.userId}`]
    );

    return NextResponse.json({ message: populatedMessage, ticket: updatedTicket });
  } catch (error: any) {
    console.error('Post public reply error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
