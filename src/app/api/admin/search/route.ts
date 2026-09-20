import { NextRequest, NextResponse } from 'next/server';
import { adminCmsSearch } from '@/lib/admin-search';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function GET(request: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    
    if (q.trim().length < 2) {
      return NextResponse.json({ groups: [] });
    }

    const groups = await adminCmsSearch({
      query: q,
      limit: 5
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Admin Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
