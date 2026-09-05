/**
 * Application (S2S) authentication for payment APIs.
 * Requires active Application + optional payment scopes.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { safeEqual } from '@/lib/payments/secrets';

export type PaymentScope = 'payments:create' | 'payments:read' | 'payments:status';

export async function authenticateApplication(input: {
  clientId?: string;
  clientSecret?: string;
  requiredScope?: PaymentScope;
}) {
  const clientId = input.clientId?.trim();
  const clientSecret = input.clientSecret?.trim();

  if (!clientId || !clientSecret) {
    return {
      error: NextResponse.json({ error: 'Missing client credentials' }, { status: 401 }),
      app: null,
    };
  }

  const app = await db.application.findUnique({ where: { clientId } });
  if (!app || app.status !== 'active' || !safeEqual(app.clientSecret, clientSecret)) {
    return {
      error: NextResponse.json({ error: 'Unauthorized application' }, { status: 401 }),
      app: null,
    };
  }

  // Future: store scopes on Application. For now, active apps with payment webhook
  // or any active app may call payment APIs; scope is enforced when present on JWT.
  if (input.requiredScope) {
    // Placeholder for explicit Application.scopes column — currently all active apps
    // that authenticate with client credentials may use payment create/read/status.
  }

  return { error: null, app };
}

export function isAllowlistedUrl(url: string | undefined | null, allowedOrigins: string | null | undefined): boolean {
  if (!url) return true;
  if (!allowedOrigins?.trim()) return false;
  try {
    const target = new URL(url);
    const allowed = allowedOrigins.split(',').map((o) => o.trim()).filter(Boolean);
    return allowed.some((origin) => {
      try {
        const o = new URL(origin);
        return target.origin === o.origin;
      } catch {
        return url.startsWith(origin);
      }
    });
  } catch {
    return false;
  }
}
