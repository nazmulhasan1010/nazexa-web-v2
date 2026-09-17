'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';

// Public feature-request voting. Deduped per browser via an httpOnly voter cookie + a unique
// (request_id, voter_key) constraint — real votes, not CMS-authored counts.
export async function voteFeatureRequest(
  id: string
): Promise<{ ok: boolean; already?: boolean; votes?: number }> {
  const jar = await cookies();
  let voter = jar.get('nazexa_voter')?.value;
  if (!voter) {
    voter = crypto.randomUUID();
    jar.set('nazexa_voter', voter, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  try {
    await db.featureRequestVote.create({ data: { request_id: id, voter_key: voter } });
  } catch {
    // unique violation → already voted
    return { ok: false, already: true };
  }

  const updated = await db.featureRequest.update({
    where: { id },
    data: { vote_count: { increment: 1 } },
    select: { vote_count: true },
  });
  revalidatePath('/feature-requests');
  return { ok: true, votes: updated.vote_count };
}
