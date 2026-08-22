import { NextRequest, NextResponse } from 'next/server';
import { resolveGeo } from '@/lib/geo-server';
import { CURRENCIES } from '@/lib/currency';

export const dynamic = 'force-dynamic';

/**
 * Resolves the visitor's display currency from their IP/CDN geo headers.
 * Public (pricing is shown pre-login) and returns no PII — the caller's own IP
 * is never echoed back, only the derived country and currency.
 */
export async function GET(req: NextRequest) {
  const geo = await resolveGeo(req.headers);
  const def = CURRENCIES[geo.currency];

  return NextResponse.json(
    {
      country: geo.country,
      currency: geo.currency,
      symbol: def.symbol,
      rate: def.rate,
      source: geo.source,
    },
    {
      headers: {
        // Per-visitor result — cache on the client only, never shared.
        'Cache-Control': 'private, max-age=3600',
      },
    }
  );
}
