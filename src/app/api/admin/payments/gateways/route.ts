import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';
import { clientIpFromHeaders, writeAuditLog } from '@/lib/admin/audit';
import { getGatewayDef, SECRET_MASK, type GatewayConfig } from '@/lib/payments/registry';
import { maskedConfig, parseConfig } from '@/lib/payments/secrets';
import { prepareGatewayConfigForSave } from '@/lib/payments/orchestration';
import { getAdapter } from '@/lib/payments/adapters';
import { syncGatewayRows } from '@/lib/payments/server';
import { missingRequiredFields } from '@/lib/payments/registry';
import type { PaymentEnvironment } from '@/lib/payments/types';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await syncGatewayRows();

    const rows = await db.paymentGateway.findMany({
      orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json(
      rows
        .filter((row) => getGatewayDef(row.code) !== undefined)
        .map((row) => {
          const def = getGatewayDef(row.code)!;
          const config = parseConfig(row.config);
          const missingFields = missingRequiredFields(row.code, config);
          return {
            id: row.id,
            code: row.code,
            name: row.displayName?.trim() || def?.name || row.code,
            displayName: row.displayName,
            group: def?.group ?? 'bank',
            checkout: def?.checkout ?? 'manual',
            type: def?.type ?? row.type,
            description: def?.description ?? '',
            instructions: row.instructions,
            isEnabled: row.isEnabled,
            sortOrder: row.sortOrder,
            priority: row.priority,
            environment: row.environment,
            supportedCurrencies: row.supportedCurrencies,
            accent: def?.accent ?? 'text-muted-foreground',
            fields: def?.fields ?? [],
            submissionFields: def?.submissionFields ?? [],
            config: def ? maskedConfig(def.fields, config) : {},
            missingFields,
            isConfigured: missingFields.length === 0,
            supportsRefund: row.supportsRefund,
            supportsWebhook: row.supportsWebhook,
            supportsManualReview: row.supportsManualReview,
            lastTestAt: row.lastTestAt?.toISOString() ?? null,
            lastTestStatus: row.lastTestStatus,
            lastTestMessage: row.lastTestMessage,
          };
        })
    );
  } catch (err) {
    console.error('Admin gateways list error:', err);
    return NextResponse.json({ error: 'Failed to list gateways' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user: admin, error } = await requireAdmin();
  if (error) return error;

  const ip = clientIpFromHeaders(req.headers);

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: 'Gateway id is required' }, { status: 400 });
    }

    // Test connection action
    if (body.action === 'test') {
      const row = await db.paymentGateway.findUnique({ where: { id } });
      if (!row) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
      const def = getGatewayDef(row.code);
      const adapter = getAdapter(row.code);
      if (!def || !adapter?.testConnection) {
        const msg =
          'Configuration format validated. Live credential verification requires a test transaction.';
        await db.paymentGateway.update({
          where: { id },
          data: {
            lastTestAt: new Date(),
            lastTestStatus: 'format_only',
            lastTestMessage: msg,
          },
        });
        return NextResponse.json({ ok: true, liveVerified: false, message: msg });
      }
      const { unsealConfig } = await import('@/lib/payments/secrets');
      const config = unsealConfig(def.fields, parseConfig(row.config));
      const env = (
        row.environment === 'production' ? 'production' : 'sandbox'
      ) as PaymentEnvironment;
      const result = await adapter.testConnection(config, env);
      await db.paymentGateway.update({
        where: { id },
        data: {
          lastTestAt: new Date(),
          lastTestStatus: result.ok ? (result.liveVerified ? 'ok' : 'format_ok') : 'failed',
          lastTestMessage: result.message.slice(0, 2000),
        },
      });
      return NextResponse.json(result);
    }

    const row = await db.paymentGateway.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
    }

    const def = getGatewayDef(row.code);
    if (!def) {
      return NextResponse.json({ error: 'Unknown gateway code' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};

    if (typeof body.displayName === 'string') {
      data.displayName = body.displayName.trim().slice(0, 100) || null;
    }
    if (typeof body.instructions === 'string') {
      data.instructions = body.instructions.trim().slice(0, 2000) || null;
    }
    if (typeof body.priority === 'number' && Number.isFinite(body.priority)) {
      data.priority = Math.max(0, Math.min(10_000, Math.floor(body.priority)));
    }
    if (body.environment === 'sandbox' || body.environment === 'production') {
      data.environment = body.environment;
    }
    if (typeof body.supportedCurrencies === 'string') {
      data.supportedCurrencies = body.supportedCurrencies.trim().slice(0, 200) || null;
    }

    let config: GatewayConfig | undefined;
    if (body.config && typeof body.config === 'object') {
      config = prepareGatewayConfigForSave(
        def.fields,
        parseConfig(body.config),
        parseConfig(row.config),
        SECRET_MASK
      );
      data.config = config;
    }

    const isEnabledNext = typeof body.isEnabled === 'boolean' ? body.isEnabled : row.isEnabled;
    const finalConfig = config ?? parseConfig(row.config);
    const missing = missingRequiredFields(row.code, finalConfig);

    if (isEnabledNext) {
      if (missing.length > 0) {
        if (typeof body.isEnabled === 'boolean') {
          return NextResponse.json(
            { error: `Complete required fields first: ${missing.join(', ')}` },
            { status: 422 }
          );
        } else {
          // They saved an invalid config while the gateway was already enabled. Auto-disable it.
          data.isEnabled = false;
        }
      } else if (typeof body.isEnabled === 'boolean') {
        data.isEnabled = body.isEnabled;
      }
    } else if (typeof body.isEnabled === 'boolean') {
      data.isEnabled = false;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const updated = await db.paymentGateway.update({ where: { id }, data });

    await writeAuditLog({
      actorId: admin!.id,
      action: 'admin.payment_gateway.updated',
      targetType: 'payment_gateway',
      targetId: id,
      details: {
        code: row.code,
        enabled: updated.isEnabled,
        configKeys: config ? Object.keys(config) : undefined,
      },
      ip,
    });

    return NextResponse.json({ id: updated.id, isEnabled: updated.isEnabled });
  } catch (err) {
    console.error('Admin gateway patch error:', err);
    return NextResponse.json({ error: 'Failed to update gateway' }, { status: 500 });
  }
}
