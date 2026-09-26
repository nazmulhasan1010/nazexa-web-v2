import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { publishAdminEvent } from '@/lib/socket';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        application: { select: { name: true } },
        category: { select: { name: true } },
        messages: {
          where: { internalNote: false }, // DO NOT EXPOSE INTERNAL NOTES
          include: { attachments: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error('Get public ticket error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
