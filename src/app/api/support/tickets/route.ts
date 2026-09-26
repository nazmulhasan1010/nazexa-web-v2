import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { publishAdminEvent } from '@/lib/socket';
import { sendSupportEmail, buildSupportEmailData } from '@/lib/support-email';

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const where: any = { userId: user.id };
    if (status) where.status = status;
    if (productId) where.applicationId = productId;
    if (categoryId) where.categoryId = categoryId;

    const tickets = await db.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        application: true
      }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('List public tickets error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, body: descriptionText, productId, categoryId, priority = 'MEDIUM', attachments = [] } = body;

    // Use description from body (we used 'body' in the frontend request)
    const description = descriptionText || body.description;

    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    // 1. Create the ticket
    const ticket = await db.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        description,
        applicationId: productId,
        categoryId,
        priority,
        status: 'OPEN',
        messages: {
          create: {
            senderType: 'USER',
            senderId: user.id,
            body: description,
          }
        }
      },
      include: { user: true, application: true }
    });

    // If there are attachments, link them to the initial message
    if (attachments.length > 0) {
      const message = await db.supportMessage.findFirst({ where: { ticketId: ticket.id } });
      if (message) {
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
    }

    // Send confirmation email to user
    if (user.email) {
      await sendSupportEmail('TICKET_CREATED', user.email, buildSupportEmailData(ticket, user));
    }

    // 4. Notify admin via socket
    await publishAdminEvent(
      'ticket.created', 
      {
        ticketId: ticket.id,
        ticketNumber: ticket.number,
        userId: user.id
      },
      undefined,
      ['admin:events', `user:${user.id}`]
    );

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
