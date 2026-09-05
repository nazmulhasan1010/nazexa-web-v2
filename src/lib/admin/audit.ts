import { db } from '@/lib/db';
import { truncatePayload, sanitizeForStorage } from '@/lib/payments/secrets';

export function clientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || 'unknown';
}

export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  ip: string;
}) {
  const safe = sanitizeForStorage(params.details);
  try {
    await db.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: truncatePayload(JSON.stringify(safe ?? {})),
        ip: params.ip,
      },
    });
  } catch (err) {
    // Never fail the primary action because audit write failed.
    console.error('[Audit Log] persist failed', err);
    console.log('[Audit Log]', new Date().toISOString(), {
      ...params,
      details: safe,
    });
  }
}
