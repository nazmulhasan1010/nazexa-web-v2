import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getSession } from '@/lib/auth.server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    
    if (body.isActive) {
      await prisma.aiagent.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const updateData: Record<string, string | boolean> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.baseUrl !== undefined) updateData.baseUrl = body.baseUrl;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.apiKey && body.apiKey !== '••••••••••••') {
      updateData.apiKey = body.apiKey;
    }

    const agent = await prisma.aiagent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(agent);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.aiagent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
