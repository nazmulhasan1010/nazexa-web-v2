import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { publishAdminEvent } from '@/lib/socket';
import { sendSupportEmail, buildSupportEmailData } from '@/lib/support-email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { text, internalNote, attachments = [] } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: { user: true, application: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 1. Create the message
    const message = await db.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: 'ADMIN',
        senderId: admin.user.id,
        body: text,
        internalNote: !!internalNote,
      }
    });

    // 2. Link attachments if any
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

    const populatedMessage = await db.supportMessage.findUnique({
      where: { id: message.id },
      include: { attachments: true }
    });

    // 3. Update ticket lastReplyAt and status
    const updateData: any = {
      lastReplyAt: new Date()
    };
    
    if (!internalNote && ticket.status === 'OPEN') {
      updateData.status = 'WAITING_FOR_USER';
    }

    const updatedTicket = await db.supportTicket.update({
      where: { id: ticket.id },
      data: updateData
    });

    if (updateData.status && updateData.status !== ticket.status) {
      await db.supportTicketHistory.create({
        data: {
          ticketId: ticket.id,
          previousStatus: ticket.status,
          newStatus: updateData.status,
          changedBy: 'ADMIN',
          changedById: admin.user.id,
          note: 'Status changed automatically by admin reply'
        }
      });
      
      // Broadcast ticket update for badges/lists
      await publishAdminEvent('ticket.updated', {
        ticketId: updatedTicket.id,
        ticketNumber: updatedTicket.number,
        status: updatedTicket.status
      }, undefined, ['admin:events', `user:${ticket.userId}`]);
    }

    // 4. Send Email to user (only if not internal note)
    if (!internalNote && ticket.user.email) {
      const emailData: any = buildSupportEmailData(updatedTicket, ticket.user, admin.user);
      emailData.agent.reply = text; // include the actual reply in template vars
      await sendSupportEmail('TICKET_REPLY', ticket.user.email, emailData);
    }

    // 5. Notify via socket
    await publishAdminEvent(
      'ticket.reply_created', 
      {
        ticketId: ticket.id,
        ticketNumber: ticket.number,
        messageId: message.id,
        senderType: 'ADMIN',
        internalNote: !!internalNote,
        message: populatedMessage
      },
      undefined,
      ['admin:events', `user:${ticket.userId}`]
    );

    return NextResponse.json({ message: populatedMessage, ticket: updatedTicket });
  } catch (error: any) {
    console.error('Post message error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
