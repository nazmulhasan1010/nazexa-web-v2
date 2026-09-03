import { NextRequest, NextResponse } from 'next/server';
import { getActiveAIConfig } from '@/lib/ai-config';

const INTERNAL_SECRET = process.env.NAZEXA_INTERNAL_SECRET || 'nazexa-internal-api-key-safe';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getActiveAIConfig();
    return NextResponse.json(config);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
