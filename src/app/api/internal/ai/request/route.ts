import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processAiJob } from '@/lib/ai/queue';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const INTERNAL_SECRET = process.env.NAZEXA_INTERNAL_SECRET || 'nazexa-internal-api-key-safe';

  if (!authHeader || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { prompt, context, appId, userId } = body;

    if (!prompt || !appId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Enqueue job
    const job = await db.aIJob.create({
      data: {
        appId,
        userId,
        prompt,
        context,
        status: 'pending',
      },
    });

    // 2. We'll implement a simple synchronous HTTP poll wrapper over our async queue.
    // In a real huge-scale system, the client would receive the jobId and poll via a separate endpoint.
    // But since Nazexa-DB currently expects a synchronous answer, we'll wait here up to 45s.
    // We kick off the processing immediately without awaiting it.
    processAiJob(job.id).catch(err => console.error("Background job error:", err));

    let attempts = 0;
    while (attempts < 45) {
      // Poll DB every 1s
      await new Promise(resolve => setTimeout(resolve, 1000));
      const currentJob = await db.aIJob.findUnique({ where: { id: job.id } });
      
      if (!currentJob) {
        return NextResponse.json({ error: 'Job vanished' }, { status: 500 });
      }

      if (currentJob.status === 'completed') {
        return NextResponse.json({
          response: currentJob.response,
          provider: currentJob.provider,
          modelUsed: currentJob.modelUsed,
          jobId: job.id
        });
      }

      if (currentJob.status === 'failed') {
        return NextResponse.json({ error: currentJob.error || 'AI processing failed' }, { status: 500 });
      }

      attempts++;
    }

    return NextResponse.json({ error: 'Timeout waiting for AI response' }, { status: 504 });

  } catch (error: any) {
    console.error('AI Request Endpoint Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
