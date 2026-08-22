import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { createEventPayload } from '@/lib/events';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, userId, currentPassword, newPassword } = body;

    if (!client_id || !client_secret || !userId || !newPassword) {
      return NextResponse.json(
        {
          error: 'client_id, client_secret, userId, and newPassword are required',
        },
        { status: 400 }
      );
    }

    // Authenticate the client
    const app = await db.application.findUnique({
      where: { clientId: client_id },
    });

    if (!app || app.clientSecret !== client_secret) {
      return NextResponse.json({ error: 'Unauthorized client' }, { status: 401 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password if user has one
    if (user.password_hash) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      const isValid = await verifyPassword(currentPassword, user.password_hash);
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword },
      });

      await tx.userEvent.create({
        data: createEventPayload(user.id, 'PASSWORD_CHANGED', {}),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('sync-password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
