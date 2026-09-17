import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { getSocketPlatformConfig } from '@/lib/socket-config';

export async function GET(req: NextRequest) {
  return handleTokenIssue(req);
}

export async function POST(req: NextRequest) {
  return handleTokenIssue(req);
}

async function handleTokenIssue(_req: NextRequest) {
  let userId = '';
  let username = 'User';
  let userEmail: string | undefined = undefined;
  let userRole = 'USER';

  const adminSession = await getAdminSession();
  const admin = adminSession?.user;

  if (admin && admin.status !== 'suspended') {
    userId = admin.id;
    username = admin.name || 'Admin';
    userEmail = admin.email;
    userRole = 'ADMIN';
  } else {
    // In nazexa-web, maybe we only care about admins for the socket right now.
    // If you need users to connect too, you'd add user session checking here.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let config: ReturnType<typeof getSocketPlatformConfig>;
  try {
    config = getSocketPlatformConfig();
  } catch {
    return NextResponse.json({ error: 'Socket is not configured' }, { status: 503 });
  }

  try {
    const res = await fetch(`${config.socketUrl}/api/servers/${config.projectId}/client-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': config.secretKey,
      },
      body: JSON.stringify({
        secretKey: config.secretKey,
        userId,
        username,
        userEmail,
        ttlHours: 4,
      }),
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('[Socket Token API] Failed to issue client token from socket platform:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to issue socket token' },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      token: data.token,
      expiresAt: data.expiresAt,
      userId,
      role: userRole,
    });
  } catch (err: unknown) {
    console.error('[Socket Token API] Could not connect to socket server:', err);
    return NextResponse.json({ error: 'Socket server unavailable' }, { status: 503 });
  }
}
