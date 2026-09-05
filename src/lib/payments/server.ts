/**
 * Server-side payment helpers (gateway listing for checkout/admin).
 */

import { db } from '@/lib/db';
import {
  GATEWAYS,
  getGatewayDef,
  isGatewayConfigured,
  type GatewayConfig,
  type GatewayDef,
} from '@/lib/payments/registry';
import { parseConfig, publicConfig, unsealConfig } from '@/lib/payments/secrets';

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AvailableGateway {
  id: string;
  code: string;
  name: string;
  group: GatewayDef['group'];
  checkout: GatewayDef['checkout'];
  description: string;
  instructions: string | null;
  accent: string;
  details: GatewayConfig;
  submissionFields: GatewayDef['submissionFields'];
  currencies: string[];
  countries: string[];
  sortOrder: number;
  priority: number;
  environment: string;
  type: GatewayDef['type'];
}

export { parseConfig };

export async function getAvailableGateways(opts?: {
  currency?: string;
  product?: string;
  applicationClientId?: string;
}): Promise<AvailableGateway[]> {
  const rows = await db.paymentGateway.findMany({
    where: { isEnabled: true },
    orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
  });

  const available: AvailableGateway[] = [];
  for (const row of rows) {
    const def = getGatewayDef(row.code);
    if (!def) continue;

    const sealed = parseConfig(row.config);
    if (!isGatewayConfigured(row.code, sealed)) continue;

    if (opts?.currency) {
      const c = opts.currency.toUpperCase();
      const rowCurrencies = (row.supportedCurrencies || '')
        .split(',')
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean);
      const defCurrencies = def.currencies.map((x) => x.toUpperCase());
      const allowed = rowCurrencies.length ? rowCurrencies : defCurrencies;
      // Empty allow-list means any currency.
      if (allowed.length && !allowed.includes(c)) continue;
    }

    if (opts?.product && row.allowedProducts?.trim()) {
      if (!row.allowedProducts.split(',').map((p) => p.trim()).includes(opts.product)) continue;
    }
    if (opts?.applicationClientId && row.allowedApplications?.trim()) {
      if (
        !row.allowedApplications
          .split(',')
          .map((p) => p.trim())
          .includes(opts.applicationClientId)
      ) {
        continue;
      }
    }

    // Public details only — never unseal into client responses.
    available.push({
      id: row.id,
      code: row.code,
      name: row.displayName?.trim() || def.name,
      group: def.group,
      checkout: def.checkout,
      description: def.description,
      instructions: row.instructions?.trim() || null,
      accent: def.accent,
      details: publicConfig(def.fields, sealed),
      submissionFields: def.submissionFields,
      currencies: def.currencies,
      countries: def.countries,
      sortOrder: row.sortOrder,
      priority: row.priority,
      environment: row.environment,
      type: def.type,
    });
  }

  return available;
}

export async function hasAvailableGateway(opts?: {
  currency?: string;
  product?: string;
}): Promise<boolean> {
  const rows = await getAvailableGateways(opts);
  return rows.length > 0;
}

export async function getPayableGateway(id: string): Promise<AvailableGateway | null> {
  const all = await getAvailableGateways();
  return all.find((g) => g.id === id) ?? null;
}

/** Runtime credentials for adapters — server only. */
export async function getUnsealedGatewayConfig(gatewayId: string): Promise<{
  code: string;
  config: GatewayConfig;
  environment: string;
} | null> {
  const row = await db.paymentGateway.findUnique({ where: { id: gatewayId } });
  if (!row) return null;
  const def = getGatewayDef(row.code);
  if (!def) return null;
  return {
    code: row.code,
    config: unsealConfig(def.fields, parseConfig(row.config)),
    environment: row.environment,
  };
}

export async function syncGatewayRows(): Promise<void> {
  const existing = await db.paymentGateway.findMany({ select: { code: true } });
  const known = new Set(existing.map((r) => r.code));
  const missing = GATEWAYS.filter((g) => !known.has(g.code));
  if (missing.length === 0) return;

  await db.paymentGateway.createMany({
    data: missing.map((g) => ({
      code: g.code,
      displayName: g.name,
      type: g.checkout === 'manual' ? 'manual' : 'redirect',
      isEnabled: false,
      sortOrder: g.defaultSortOrder,
      priority: g.defaultSortOrder,
      supportsRefund: g.supportsRefund,
      supportsWebhook: g.supportsWebhook,
      supportsManualReview: g.supportsManualReview,
      supportedCurrencies: g.currencies.join(',') || null,
    })),
    skipDuplicates: true,
  });
}
