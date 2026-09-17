import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/require-admin';
import { readProviderStats, refreshProviderStats } from '@/lib/ai/provider-stats';

export const dynamic = 'force-dynamic';

/** Cached snapshots — loads instantly on page open (spec §11 step 1). */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const providers = await readProviderStats();
    return NextResponse.json({ providers, generatedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}

/** Live refresh — each provider synced independently (spec §2 / §11 step 2). */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const providers = await refreshProviderStats();
    return NextResponse.json({ providers, generatedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
