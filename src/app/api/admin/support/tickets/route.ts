import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const productId = searchParams.get('productId');
    const categoryId = searchParams.get('categoryId');
    const assignedToId = searchParams.get('assignedToId');
    const q = searchParams.get('q'); // Search query

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (productId) where.productId = productId;
    if (categoryId) where.categoryId = categoryId;
    
    if (assignedToId) {
      where.assignedToId = assignedToId === 'unassigned' ? null : assignedToId;
    }

    if (q) {
      where.OR = [
        { subject: { contains: q } },
        { description: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { email: { contains: q } } },
      ];
      
      // If q is a number, search by ticket number too
      const num = parseInt(q);
      if (!isNaN(num)) {
        where.OR.push({ number: num });
      }
    }

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, image: true } },
          application: true,
          category: { select: { name: true } },
          assignedTo: { select: { name: true, email: true } },
          tags: { include: { tag: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.supportTicket.count({ where })
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('List tickets error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
