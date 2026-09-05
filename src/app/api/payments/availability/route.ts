import { NextRequest, NextResponse } from 'next/server';
import { hasAvailableGateway, getAvailableGateways } from '@/lib/payments/server';

export async function GET(req: NextRequest) {
  const currency = req.nextUrl.searchParams.get('currency') || undefined;
  const product = req.nextUrl.searchParams.get('product') || undefined;
  const available = await hasAvailableGateway();
  const gateways = available
    ? (await getAvailableGateways({ currency, product })).map((g) => ({
        code: g.code,
        name: g.name,
        checkout: g.checkout,
        currencies: g.currencies,
      }))
    : [];

  return NextResponse.json({ available, gateways });
}
