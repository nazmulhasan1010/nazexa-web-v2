import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return new NextResponse('Invalid or missing token', { status: 400 });
  }

  try {
    await db.subscriber.update({
      where: { id: token },
      data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
    });

    return new NextResponse(
      `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Unsubscribed Successfully</h2>
          <p>You have been removed from our mailing list and will no longer receive updates.</p>
          <a href="/">Return to Nazexa</a>
        </body>
      </html>
    `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    return new NextResponse('Invalid token or subscriber not found', { status: 404 });
  }
}
