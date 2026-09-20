import { NextRequest, NextResponse } from 'next/server';
import { globalCmsSearch } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    
    if (q.trim().length < 2) {
      return NextResponse.json({ groups: [] });
    }

    const groups = await globalCmsSearch({
      query: q,
      limit: 5 // 5 results per group max for global search
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Public Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
