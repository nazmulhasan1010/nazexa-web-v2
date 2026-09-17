'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Gauge, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Client mirror of NormalizedProviderStat ───────────────────────────────────
type RateLimitAxis = { limit: number | null; remaining: number | null; reset: string | null };
type ProviderRateLimits = {
  requests?: RateLimitAxis;
  tokens?: RateLimitAxis;
  retryAfter?: number | null;
};

export type ProviderStat = {
  provider: string;
  status: 'ok' | 'error' | 'unavailable';
  balance: number | null;
  usage: number | null;
  quota: number | null;
  remaining: number | null;
  requests: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  rateLimits: ProviderRateLimits | null;
  extra: Record<string, unknown> | null;
  error: string | null;
  syncedAt: string | null;
  headersAt: string | null;
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  google: 'Google GenAI',
  custom: 'Custom',
};
const providerLabel = (p: string) => PROVIDER_LABELS[p] || p;

function credits(n: number | null | undefined): string {
  if (n == null) return 'Unlimited';
  return `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'just now';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

const Unavailable = () => <span className="text-muted-foreground font-normal">Unavailable</span>;

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function ProviderCard({ p }: { p: ProviderStat }) {
  const extra = p.extra || {};
  const isFreeTier = extra.isFreeTier === true;
  const hasAccount = p.usage != null || p.balance != null || p.quota != null;
  const rl = p.rateLimits;
  const syncedLabel = p.syncedAt || p.headersAt;

  const statusBadge =
    p.status === 'error' ? (
      <Badge variant="destructive">Error</Badge>
    ) : p.status === 'ok' ? (
      <Badge variant="default">Live</Badge>
    ) : (
      <Badge variant="outline">Unavailable</Badge>
    );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="text-primary h-4 w-4" />
            {providerLabel(p.provider)}
          </CardTitle>
          {statusBadge}
        </div>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <Gauge className="h-3.5 w-3.5" /> Account statistics · synced {timeAgo(syncedLabel)}
          {isFreeTier && (
            <Badge variant="outline" className="ml-1 text-[10px]">
              Free tier
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {p.status === 'error' && (
          <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md p-2 text-xs">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">{p.error || 'Failed to reach provider'}</span>
          </div>
        )}

        {/* Account-level (OpenRouter) */}
        <Row label="Balance / Remaining">
          {hasAccount ? credits(p.remaining ?? p.balance) : <Unavailable />}
        </Row>
        <Row label="Credit Limit">{hasAccount ? credits(p.quota) : <Unavailable />}</Row>
        <Row label="Usage (total)">{p.usage != null ? credits(p.usage) : <Unavailable />}</Row>
        {p.usage != null && (
          <>
            <Row label="Usage · today">{credits(num(extra.usageDaily))}</Row>
            <Row label="Usage · this month">{credits(num(extra.usageMonthly))}</Row>
          </>
        )}

        {/* Rate limits (OpenAI / Groq headers) */}
        <div className="my-1 border-t" />
        <Row label="Requests limit">
          {rl?.requests ? (
            `${rl.requests.remaining ?? '?'} / ${rl.requests.limit ?? '?'} left`
          ) : (
            <Unavailable />
          )}
        </Row>
        <Row label="Tokens limit">
          {rl?.tokens ? (
            `${rl.tokens.remaining ?? '?'} / ${rl.tokens.limit ?? '?'} left`
          ) : (
            <Unavailable />
          )}
        </Row>
        {p.headersAt && (
          <p className="text-muted-foreground text-[11px]">
            Rate limits as of last request ({timeAgo(p.headersAt)}).
          </p>
        )}
        {typeof extra.note === 'string' && (
          <p className="text-muted-foreground text-[11px]">{extra.note}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ProviderStatsPanel() {
  const [providers, setProviders] = useState<ProviderStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const didAutoRefresh = useRef(false);

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/ai-management/providers', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refresh failed');
      setProviders(data.providers || []);
      setLastSyncedAt(data.generatedAt || null);
    } catch (err) {
      toast.error('Provider refresh failed: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setSyncing(false);
    }
  }, []);

  // Load cached snapshots instantly, then request a fresh sync once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/ai-management/providers');
        const data = await res.json();
        if (!cancelled && res.ok) {
          setProviders(data.providers || []);
          setLastSyncedAt(data.generatedAt || null);
        }
      } catch {
        /* cached read is best-effort */
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!didAutoRefresh.current) {
        didAutoRefresh.current = true;
        refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Provider Account Statistics</h2>
          <p className="text-muted-foreground text-xs">
            Live from each provider · updated {timeAgo(lastSyncedAt)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={syncing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
          {syncing ? 'Syncing…' : 'Refresh Provider Statistics'}
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            Loading provider statistics…
          </CardContent>
        </Card>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No providers configured. Add one under the Configuration tab.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p.provider} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
