import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getSession } from '@/lib/auth.server';
import { getGlobalAIProviderConfig } from '@/lib/ai-config';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const globalConfig = await getGlobalAIProviderConfig();
    const agents = await prisma.aiagent.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      globalConfig: {
        activeProvider: globalConfig.activeProvider,
        googleApiKey: globalConfig.googleApiKey ? '••••••••••••' : null,
        googleModel: globalConfig.googleModel,
      },
      agents: agents.map((agent: { apiKey: string | null; [key: string]: unknown }) => ({
        ...agent,
        apiKey: agent.apiKey ? '••••••••••••' : null,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    const updateData: Record<string, string | boolean> = {};
    if (body.activeProvider !== undefined) updateData.activeProvider = body.activeProvider;
    if (body.googleApiKey && body.googleApiKey !== '••••••••••••') {
       updateData.googleApiKey = body.googleApiKey;
    }
    if (body.googleModel !== undefined) updateData.googleModel = body.googleModel;

    const updated = await prisma.aiproviderconfig.update({
      where: { id: 'global' },
      data: updateData,
    });

    return NextResponse.json({ success: true, activeProvider: updated.activeProvider });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    // If setting to active, we must deactivate others
    if (body.isActive) {
      await prisma.aiagent.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const agent = await prisma.aiagent.create({
      data: {
        name: body.name,
        baseUrl: body.baseUrl || null,
        model: body.model,
        apiKey: body.apiKey,
        isActive: body.isActive || false,
      },
    });

    return NextResponse.json(agent);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
