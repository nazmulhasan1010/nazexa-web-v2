import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';
import { clientIpFromHeaders, writeAuditLog } from '@/lib/admin/audit';
import { getGatewayDef } from '@/lib/payments/registry';
import { markTransactionPaid } from '@/lib/payments/orchestration';

const PAGE_SIZE = 20;

const LEGACY_STATUS_MAP: Record<string, string[]> = {
  pending: [
    'pending',
    'PENDING',
    'PENDING_REVIEW',
    'CREATED',
    'INITIATED',
    'REQUIRES_ACTION',
    'PROCESSING',
  ],
  approved: ['approved', 'PAID'],
  paid: ['PAID', 'approved'],
  rejected: ['rejected', 'FAILED'],
  cancelled: ['cancelled', 'CANCELLED', 'EXPIRED'],
  PENDING_REVIEW: ['PENDING_REVIEW', 'pending'],
  PAID: ['PAID', 'approved'],
  FAILED: ['FAILED', 'rejected'],
};

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') || '';
  const gateway = sp.get('gateway') || '';
  const product = sp.get('product') || '';
  const q = sp.get('q') || '';
  const page = Math.max(1, Number(sp.get('page') || 1));

  const where: Record<string, unknown> = {};
  if (status && status !== 'all') {
    const mapped = LEGACY_STATUS_MAP[status] || [status];
    where.status = { in: mapped };
  }
  if (gateway) where.payment_gateways = { code: gateway };
  if (product) where.product = product;
  if (q) {
    where.OR = [
      { publicId: { contains: q } },
      { reference: { contains: q } },
      { users: { email: { contains: q } } },
    ];
  }

  try {
    const [items, total, pendingCount] = await Promise.all([
      db.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          users: { select: { id: true, email: true, name: true } },
          payment_gateways: { select: { code: true, displayName: true } },
          manual_payment_proofs: { orderBy: { submittedAt: 'desc' }, take: 3 },
        },
      }),
      db.paymentTransaction.count({ where }),
      db.paymentTransaction.count({
        where: { status: { in: ['PENDING_REVIEW', 'pending'] } },
      }),
    ]);

    return NextResponse.json({
      items: items.map((r) => {
        const def = r.payment_gateways ? getGatewayDef(r.payment_gateways.code) : null;
        return {
          id: r.id,
          publicId: r.publicId,
          status: r.status,
          amount: r.amount.toString(),
          currency: r.currency,
          amountUsd: r.amountUsd.toString(),
          reference: r.reference,
          details: (r.details ?? {}) as Record<string, string>,
          detailLabels: Object.fromEntries(
            (def?.submissionFields ?? []).map((f) => [f.key, f.label])
          ),
          adminNote: r.adminNote,
          user: r.users,
          planName: r.plan,
          planSlug: r.planId || r.plan,
          product: r.product,
          gatewayCode: r.payment_gateways?.code || 'unknown',
          gatewayName:
            r.payment_gateways?.displayName ||
            def?.name ||
            r.payment_gateways?.code ||
            'Unknown Gateway',
          gatewayOrderId: r.gatewayOrderId,
          gatewayPaymentId: r.gatewayPaymentId,
          fulfillmentStatus: r.fulfillmentStatus,
          createdAt: r.createdAt.toISOString(),
          paidAt: r.paidAt?.toISOString() ?? null,
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
          proofs: r.manual_payment_proofs,
        };
      }),
      total,
      pendingCount,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (err) {
    console.error('Admin payment transactions list error:', err);
    return NextResponse.json({ error: 'Failed to list payment transactions' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user: admin, error } = await requireAdmin();
  if (error) return error;

  const ip = clientIpFromHeaders(req.headers);

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    const action =
      body.action === 'approve'
        ? 'approve'
        : body.action === 'reject'
          ? 'reject'
          : body.action === 'clarify'
            ? 'clarify'
            : '';
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '';

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Transaction id and action are required' },
        { status: 400 }
      );
    }

    const transaction = await db.paymentTransaction.findUnique({
      where: { id },
      include: { applications: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Payment transaction not found' }, { status: 404 });
    }

    const reviewable = ['PENDING_REVIEW', 'pending', 'REQUIRES_ACTION'];
    if (action !== 'clarify' && !reviewable.includes(transaction.status)) {
      return NextResponse.json(
        { error: `This transaction was already ${transaction.status}.` },
        { status: 409 }
      );
    }

    if (action === 'clarify') {
      await db.paymentTransaction.update({
        where: { id },
        data: {
          status: 'REQUIRES_ACTION',
          adminNote: note || 'Additional information requested',
          reviewedBy: admin!.id,
          reviewedAt: new Date(),
        },
      });
      await writeAuditLog({
        actorId: admin!.id,
        action: 'admin.payment_transaction.clarify',
        targetType: 'payment_transaction',
        targetId: id,
        details: { userId: transaction.userId },
        ip,
      });
      return NextResponse.json({ id, status: 'REQUIRES_ACTION' });
    }

    if (action === 'reject') {
      const updated = await db.paymentTransaction.update({
        where: { id },
        data: {
          status: 'FAILED',
          adminNote: note || null,
          reviewedBy: admin!.id,
          reviewedAt: new Date(),
          failureReason: note || 'Rejected by admin',
        },
      });

      await writeAuditLog({
        actorId: admin!.id,
        action: 'admin.payment_transaction.rejected',
        targetType: 'payment_transaction',
        targetId: id,
        details: { userId: transaction.userId, plan: transaction.plan },
        ip,
      });

      try {
        const { publishAdminEvent } = await import('@/lib/socket');
        await publishAdminEvent('payment.request.rejected', {
          paymentId: updated.id,
          publicId: updated.publicId,
          status: updated.status,
        });
      } catch (err) {
        console.error('[socket]', err);
      }

      return NextResponse.json({ id, status: 'FAILED' });
    }

    // Approve → PAID + fulfill once
    const claimed = await db.paymentTransaction.updateMany({
      where: { id, status: { in: reviewable } },
      data: {
        adminNote: note || null,
        reviewedBy: admin!.id,
        reviewedAt: new Date(),
      },
    });

    if (claimed.count === 0) {
      return NextResponse.json(
        { error: 'This request was reviewed by someone else. Reload to see its status.' },
        { status: 409 }
      );
    }

    const paid = await markTransactionPaid({
      transactionId: id,
      source: 'admin_approve',
    });

    await writeAuditLog({
      actorId: admin!.id,
      action: 'admin.payment_transaction.approved',
      targetType: 'payment_transaction',
      targetId: id,
      details: {
        userId: transaction.userId,
        plan: transaction.plan,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
      },
      ip,
    });

    try {
      const { publishAdminEvent } = await import('@/lib/socket');
      await publishAdminEvent('payment.request.approved', {
        paymentId: id,
        status: paid.transaction?.status ?? 'PAID',
      });
    } catch (err) {
      console.error('[socket]', err);
    }

    return NextResponse.json({
      id,
      status: paid.transaction?.status ?? 'PAID',
      alreadyPaid: paid.alreadyPaid ?? false,
    });
  } catch (err) {
    console.error('Admin payment transaction review error:', err);
    return NextResponse.json({ error: 'Failed to review payment transaction' }, { status: 500 });
  }
}
