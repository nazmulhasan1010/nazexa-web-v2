import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { clientIpFromHeaders } from '@/lib/admin/audit';
import { initiatePayment, submitManualProof } from '@/lib/payments/orchestration';
import { getPayableGateway } from '@/lib/payments/server';

/**
 * User initiates payment on a selected gateway, or submits manual proof.
 *
 * { transactionId | publicId, gatewayId, action?: 'initiate' | 'submit_proof', details? }
 */
export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  if (!rateLimit(`pay-submit:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId : '';
    const gatewayId = typeof body.gatewayId === 'string' ? body.gatewayId : '';
    const action = body.action === 'submit_proof' ? 'submit_proof' : 'initiate';
    const details =
      body.details && typeof body.details === 'object' ? (body.details as Record<string, string>) : {};

    if (JSON.stringify(details).length > 5000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    if (action === 'submit_proof') {
      const result = await submitManualProof({
        transactionId,
        userId: user.id,
        details,
      });
      if ('error' in result && result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      const txn = result.transaction!;
      const autoApproved = Boolean('autoApproved' in result && result.autoApproved);
      return NextResponse.json({
        success: true,
        status: txn.status,
        autoApproved,
        paid: txn.status === 'PAID',
        transaction: {
          id: txn.id,
          publicId: txn.publicId,
          status: txn.status,
        },
      });
    }

    if (!gatewayId) {
      return NextResponse.json({ error: 'Missing gatewayId' }, { status: 400 });
    }

    const gateway = await getPayableGateway(gatewayId);
    if (!gateway) {
      return NextResponse.json({ error: 'Invalid gateway' }, { status: 400 });
    }

    const result = await initiatePayment({
      transactionId,
      gatewayId,
      userId: user.id,
    });

    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      status: result.transaction!.status,
      redirectUrl: result.redirectUrl ?? null,
      instructions: result.instructions ?? null,
      requiresManualProof: result.requiresManualProof ?? false,
      checkout: result.checkout,
      paid: false,
    });
  } catch (err) {
    console.error('Payment submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
