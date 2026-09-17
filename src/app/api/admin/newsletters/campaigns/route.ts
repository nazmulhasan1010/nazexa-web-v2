import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { createCustomCampaign } from '@/lib/newsletters/service';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subject, html } = await req.json();
    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and html content are required' }, { status: 400 });
    }

    const campaign = await createCustomCampaign(subject, html);

    return NextResponse.json({ success: true, campaign });
  } catch (err: any) {
    console.error('[CreateCampaign]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
