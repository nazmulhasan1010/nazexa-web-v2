import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdapter } from '@/lib/payments/adapters';
import { getGatewayDef } from '@/lib/payments/registry';
import { parseConfig, unsealConfig } from '@/lib/payments/secrets';
import { markTransactionPaid, recordWebhookEvent } from '@/lib/payments/orchestration';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ gateway: string }> },
) {
  const { gateway: gatewayCode } = await ctx.params;
  const adapter = getAdapter(gatewayCode);
  const def = getGatewayDef(gatewayCode);

  if (!adapter?.handleWebhook || !def) {
    return NextResponse.json({ error: 'Webhook not supported' }, { status: 404 });
  }

  const gatewayRow = await db.paymentGateway.findUnique({ where: { code: gatewayCode } });
  if (!gatewayRow || !gatewayRow.isEnabled) {
    return NextResponse.json({ error: 'Gateway disabled' }, { status: 503 });
  }

  const config = unsealConfig(def.fields, parseConfig(gatewayRow.config));

  let result;
  try {
    result = await adapter.handleWebhook(req, config);
  } catch (err) {
    console.error(`Webhook ${gatewayCode} error:`, err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  const recorded = await recordWebhookEvent({
    gateway: gatewayCode,
    eventId: result.eventId,
    eventType: result.eventType,
    transactionId: null,
    payload: { summary: result.rawPayloadSummary, error: result.error },
    processingStatus: result.ok ? 'RECEIVED' : 'FAILED',
    failureReason: result.error,
  });

  const { event, duplicate } = recorded;

  if (duplicate) {
    return new NextResponse(result.responseBody ?? 'OK', {
      status: result.httpStatus ?? 200,
    });
  }

  if (result.ok && result.paid) {
    const orFilters: Array<Record<string, string>> = [];
    if (result.transactionPublicId) orFilters.push({ publicId: result.transactionPublicId });
    if (result.gatewayOrderId) orFilters.push({ gatewayOrderId: result.gatewayOrderId });
    if (result.gatewayPaymentId) orFilters.push({ gatewayPaymentId: result.gatewayPaymentId });
    if (result.gatewayTransactionId) {
      orFilters.push({ gatewayTransactionId: result.gatewayTransactionId });
    }

    const txn =
      orFilters.length > 0
        ? await db.paymentTransaction.findFirst({ where: { OR: orFilters } })
        : null;

    if (txn) {
      await markTransactionPaid({
        transactionId: txn.id,
        gatewayTransactionId: result.gatewayTransactionId,
        gatewayOrderId: result.gatewayOrderId,
        gatewayPaymentId: result.gatewayPaymentId,
        verifiedAmount: result.amount,
        verifiedCurrency: result.currency,
        source: 'webhook',
      });

      if (event) {
        await db.paymentWebhookEvent.update({
          where: { id: event.id },
          data: {
            transactionId: txn.id,
            processingStatus: 'PROCESSED',
            processedAt: new Date(),
          },
        });
      }
    }
  } else if (event && result.ok) {
    await db.paymentWebhookEvent.update({
      where: { id: event.id },
      data: { processingStatus: 'PROCESSED', processedAt: new Date() },
    });
  }

  return new NextResponse(result.responseBody ?? 'OK', {
    status: result.httpStatus ?? (result.ok ? 200 : 400),
  });
}
