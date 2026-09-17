import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';
import { getGlobalAIProviderConfig } from '@/lib/ai-config';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const globalConfig = await getGlobalAIProviderConfig();
    const agents = await prisma.aiAgent.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      globalConfig: {
        activeProvider: globalConfig.activeProvider,
        googleApiKey: globalConfig.googleApiKey ? '            ' : null,
        googleModel: globalConfig.googleModel,
      },
      agents: agents.map((agent: { apiKey: string | null; [key: string]: unknown }) => ({
        ...agent,
        apiKey: agent.apiKey ? '            ' : null,
      })),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    const updateData: Record<string, string | boolean> = {};
    if (body.activeProvider !== undefined) updateData.activeProvider = body.activeProvider;
    if (body.googleApiKey && body.googleApiKey !== '            ') {
      updateData.googleApiKey = body.googleApiKey;
    }
    if (body.googleModel !== undefined) updateData.googleModel = body.googleModel;

    const updated = await prisma.aiProviderConfig.update({
      where: { id: 'global' },
      data: updateData,
    });

    return NextResponse.json({ success: true, activeProvider: updated.activeProvider });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();

    // If setting to active, we must deactivate others
    if (body.isActive) {
      await prisma.aiAgent.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const agent = await prisma.aiAgent.create({
      data: {
        name: body.name,
        baseUrl: body.baseUrl || null,
        model: body.model,
        apiKey: body.apiKey,
        isActive: body.isActive || false,
      },
    });

    return NextResponse.json(agent);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
