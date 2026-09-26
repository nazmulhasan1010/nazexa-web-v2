import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [categories, applications] = await Promise.all([
      db.supportCategory.findMany({ 
        where: { active: true },
        orderBy: { name: 'asc' } 
      }),
      db.application.findMany({ 
        where: { status: 'active' },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, clientId: true }
      })
    ]);

    // Send applications as 'products' for the frontend dropdown
    return NextResponse.json({
      categories,
      products: applications
    });
  } catch (error: any) {
    console.error('Failed to fetch support config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
