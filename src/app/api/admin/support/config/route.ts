import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [categories, applications, tags, templates, agents] = await Promise.all([
      db.supportCategory.findMany({ orderBy: { name: 'asc' } }),
      db.application.findMany({ orderBy: { name: 'asc' } }),
      db.supportTag.findMany({ orderBy: { name: 'asc' } }),
      db.supportEmailTemplate.findMany({ orderBy: { name: 'asc' } }),
      db.adminUser.findMany({
        where: { status: 'active' },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return NextResponse.json({
      categories,
      products: applications,
      tags,
      templates,
      agents
    });
  } catch (error: any) {
    console.error('Get support config error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'create_category') {
      const { name, description } = body;
      const category = await db.supportCategory.create({
        data: { name, description }
      });
      return NextResponse.json({ category });
    }
    
    if (action === 'create_template') {
      const { name, subject, body: templateBody } = body;
      const template = await db.supportEmailTemplate.create({
        data: { name, subject, body: templateBody }
      });
      return NextResponse.json({ template });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Support config POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
