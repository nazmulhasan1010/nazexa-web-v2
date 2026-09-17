import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const config = await db.securitySettings.findUnique({
      where: { id: 'global' },
    });

    if (!config) {
      return NextResponse.json({
        enabled: false,
        siteKey: null,
      }, { headers: corsHeaders });
    }

    return NextResponse.json({
      enabled: config.turnstileEnabled,
      siteKey: config.turnstileSiteKey,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Turnstile Config] API error:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500, headers: corsHeaders });
  }
}
