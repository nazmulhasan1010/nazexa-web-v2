import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAppUrlsAction } from '@/lib/app-urls.actions';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookiesStr = request.headers.get('cookie') || '';
    const nazexaSessionMatch = cookiesStr.match(/(?:^|[;,]\s*)nazexa_session=([^;,\s]+)/);
    const nazexaSession = nazexaSessionMatch ? decodeURIComponent(nazexaSessionMatch[1]) : null;

    if (!nazexaSession) {
      return NextResponse.json({ error: 'Unauthorized. No valid session.' }, { status: 401 });
    }

    const urls = await getAppUrlsAction();
    const dbApiUrl = urls['nazexa-db'];

    // Pass along pagination params
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const response = await fetch(`${dbApiUrl}/api/account/purchases?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Pass the session cookie directly so Nazexa DB can authenticate the user
        Cookie: `nazexa_session=${encodeURIComponent(nazexaSession)}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch purchases from Nazexa DB' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Nazexa DB purchases proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
