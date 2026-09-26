import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { publishAdminEvent } from '@/lib/socket';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

      const ticket = await db.supportTicket.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true, image: true, status: true } },
          application: true,
          category: true,
          assignedTo: { select: { id: true, name: true, email: true } },
          tags: { include: { tag: true } },
          histories: { orderBy: { createdAt: 'desc' } },
          messages: {
            include: { attachments: true },
            orderBy: { createdAt: 'asc' }
          }
        }
      });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error('Get ticket error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const ticket = await db.supportTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const allowedUpdates = ['status', 'priority', 'assignedToId', 'categoryId', 'productId', 'resolution'];
    const updateData: any = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (body.status === 'COMPLETED' || body.status === 'RESOLVED' || body.status === 'CLOSED') {
      updateData.closedAt = new Date();
      updateData.completedAt = new Date();
      updateData.completedById = admin.user.id;
    } else if (body.status === 'SKIPPED') {
      updateData.closedAt = new Date();
      updateData.skippedAt = new Date();
      updateData.skippedById = admin.user.id;
    } else if (body.status) {
      updateData.closedAt = null;
    }

    const updatedTicket = await db.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { name: true } },
        application: true
      }
    });

    if (body.status && body.status !== ticket.status) {
      await db.supportTicketHistory.create({
        data: {
          ticketId: ticket.id,
          previousStatus: ticket.status,
          newStatus: body.status,
          changedBy: 'ADMIN',
          changedById: admin.user.id,
          note: body.resolution || null
        }
      });
    }

    // Notify via socket
    await publishAdminEvent('ticket.updated', {
      ticketId: updatedTicket.id,
      ticketNumber: updatedTicket.number,
      status: updatedTicket.status,
      updates: updateData
    }, undefined, ['admin:events', `user:${ticket.userId}`]);

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error: any) {
    console.error('Patch ticket error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          include: { attachments: true }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Delete all attachments from disk
    const uploadDir = join(process.cwd(), '.data', 'support-attachments');
    const attachments = ticket.messages.flatMap(m => m.attachments);
    
    for (const att of attachments) {
      if (att.storageKey) {
        try {
          await unlink(join(uploadDir, att.storageKey));
        } catch (e) {
          console.warn('Could not delete attachment file:', att.storageKey);
        }
      }
    }

    // Delete ticket (Cascades to messages and attachments)
    await db.supportTicket.delete({ where: { id } });

    // Broadcast deletion
    await publishAdminEvent('ticket.deleted', {
      ticketId: ticket.id
    }, undefined, ['admin:events', `user:${ticket.userId}`]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete ticket error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
