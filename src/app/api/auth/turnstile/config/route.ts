import { NextResponse } from 'next/server';
import { ConfigService } from '@/lib/config/service';

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
    const enabled = await ConfigService.getConfig<boolean>('captcha.turnstile.enabled', false);
    const siteKey = await ConfigService.getConfig<string>('captcha.turnstile.siteKey', '');

    return NextResponse.json({
      enabled,
      siteKey: siteKey || null,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Turnstile Config] API error:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500, headers: corsHeaders });
  }
}
