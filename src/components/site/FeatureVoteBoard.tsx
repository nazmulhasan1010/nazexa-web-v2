'use client';

import { useState } from 'react';
import { ChevronUp } from 'lucide-react';

import { Section } from '@/components/site/PageShell';
import { voteFeatureRequest } from '@/lib/cms-models/feature-requests';
import { cn } from '@/lib/utils';

type Req = {
  id: string;
  title: string;
  body: string | null;
  status: string;
  category: string | null;
  vote_count: number;
};

export function FeatureVoteBoard({ requests }: { requests: Req[] }) {
  const [items, setItems] = useState(requests);
  const [voting, setVoting] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  async function vote(id: string) {
    setVoting(id);
    try {
      const res = await voteFeatureRequest(id);
      if (res.ok && typeof res.votes === 'number') {
        setItems((prev) => prev.map((r) => (r.id === id ? { ...r, vote_count: res.votes! } : r)));
      }
      setVoted((s) => new Set(s).add(id));
    } finally {
      setVoting(null);
    }
  }

  if (!items.length) return null;

  return (
    <Section title="Most requested">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => {
          const hasVoted = voted.has(r.id);
          return (
            <div key={r.id} className="surface-card flex items-start gap-4 p-5">
              <button
                type="button"
                onClick={() => vote(r.id)}
                disabled={voting === r.id || hasVoted}
                aria-label={`Upvote ${r.title}`}
                className={cn(
                  'flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-sm transition-colors',
                  hasVoted ? 'border-primary text-primary bg-primary/5' : 'hover:border-primary'
                )}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="font-semibold">{r.vote_count}</span>
              </button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] uppercase">
                    {r.status}
                  </span>
                  {r.category ? (
                    <span className="text-muted-foreground text-xs">{r.category}</span>
                  ) : null}
                </div>
                {r.body ? <p className="text-muted-foreground mt-1 text-sm">{r.body}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
