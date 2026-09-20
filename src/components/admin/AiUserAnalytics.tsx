'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  DollarSign,
  XCircle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSocket } from '@/components/providers/SocketProvider';
import {
  AiContributionHeatmap,
  type ContributionDay,
} from '@/components/admin/AiContributionHeatmap';
import { UserSelect } from '@/components/admin/UserSelect';

// ── Types ─────────────────────────────────────────────────────────────────────
type Recent = {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number | null;
  latencyMs: number | null;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
};

type UserStats = {
  userId: string;
  user: { id: string; name: string | null; email: string | null; image: string | null } | null;
  windowDays: number;
  heatmap: Record<string, Partial<ContributionDay>>;
  totals: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
    avgLatencyMs: number | null;
  };
  mostUsedProvider: { provider: string; totalTokens: number; requests: number } | null;
  mostUsedModel: { model: string; totalTokens: number; requests: number } | null;
  recentActivity: Recent[];
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  google: 'Google GenAI',
  custom: 'Custom',
};
const providerLabel = (p: string) => PROVIDER_LABELS[p] || p;

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
function formatCost(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n === 0) return '$0.00';
  return `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
}
function timeAgo(iso: string | null): string {
  if (!iso) return '—';
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

export function AiUserAnalytics() {
  const { socket } = useSocket();
  const [userId, setUserId] = useState('all');
  const [label, setLabel] = useState('All Users');
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/ai-management/user-stats?userId=${encodeURIComponent(userIdRef.current)}&months=12`
      );
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      /* best-effort */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [userId, load]);

  // Live: refetch the currently-selected view when any AI request completes.
  useEffect(() => {
    if (!socket) return;
    const onUsage = () => load();
    socket.on('ai.usage.recorded', onUsage);
    return () => {
      socket.off('ai.usage.recorded', onUsage);
    };
  }, [socket, load]);

  const t = data?.totals;
  const kpis = [
    { label: 'Total Requests', value: t ? t.requests.toLocaleString() : '-', icon: Activity },
    { label: 'Total Tokens', value: t ? formatCompact(t.totalTokens) : '-', icon: Coins },
    { label: 'Input Tokens', value: t ? formatCompact(t.inputTokens) : '-', icon: ArrowUpFromLine },
    {
      label: 'Output Tokens',
      value: t ? formatCompact(t.outputTokens) : '-',
      icon: ArrowDownToLine,
    },
    { label: 'Estimated Cost', value: t ? formatCost(t.costUsd) : '-', icon: DollarSign },
    {
      label: 'Avg Latency',
      value: t ? (t.avgLatencyMs != null ? `${t.avgLatencyMs.toLocaleString()}ms` : '—') : '-',
      icon: Clock,
    },
    {
      label: 'Most-Used Provider',
      value: data?.mostUsedProvider ? providerLabel(data.mostUsedProvider.provider) : '—',
      icon: Bot,
    },
    {
      label: 'Most-Used Model',
      value: data?.mostUsedModel ? data.mostUsedModel.model : '—',
      icon: Cpu,
      mono: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">User AI Analytics</h2>
          <p className="text-muted-foreground text-xs">
            {userId === 'all' ? 'Aggregate AI usage across all users.' : data?.user?.email || label}
          </p>
        </div>
        <UserSelect
          value={userId}
          onChange={(id, lbl) => {
            setUserId(id);
            setLabel(lbl);
          }}
        />
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[96px] w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-4">
                  <c.icon className="text-primary h-4 w-4" />
                  <p className="text-muted-foreground mt-3 text-xs">{c.label}</p>
                  <p
                    className={`mt-0.5 truncate text-lg font-semibold ${c.mono ? 'font-mono text-sm' : ''}`}
                  >
                    {c.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Contribution</CardTitle>
              <CardDescription>
                Daily AI activity over the last 12 months{userId === 'all' ? ' (all users)' : ''}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AiContributionHeatmap
                data={data?.heatmap || {}}
                windowDays={data?.windowDays || 365}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent AI Activity</CardTitle>
              <CardDescription>
                {userId === 'all'
                  ? 'Latest requests across all users.'
                  : 'Latest requests for this user.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.recentActivity?.length ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  No activity yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {data.recentActivity.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {e.status === 'error' ? (
                          <XCircle className="text-destructive h-4 w-4 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium">
                            {providerLabel(e.provider)}
                            <span className="text-muted-foreground ml-2 font-mono text-xs">
                              {e.model}
                            </span>
                          </div>
                          {e.status === 'error' ? (
                            <div className="text-destructive max-w-[200px] sm:max-w-[420px] truncate text-xs">
                              {e.errorMessage || 'Unknown error'}
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-xs">
                              {e.inputTokens.toLocaleString()} in ·{' '}
                              {e.outputTokens.toLocaleString()} out ·{' '}
                              {e.totalTokens.toLocaleString()} total
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-medium">{formatCost(e.costUsd)}</div>
                        <div className="text-muted-foreground text-xs">
                          {e.latencyMs != null ? `${e.latencyMs}ms · ` : ''}
                          {timeAgo(e.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
