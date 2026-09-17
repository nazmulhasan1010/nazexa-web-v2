'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from 'recharts';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bot,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  XCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useSocket } from '@/components/providers/SocketProvider';
import { cn } from '@/lib/utils';
import { ProviderStatsPanel } from '@/components/admin/ProviderStatsPanel';
import { AiUserAnalytics } from '@/components/admin/AiUserAnalytics';

// ── Shared types ────────────────────────────────────────────────────────────

type Period = 'today' | '7d' | '30d' | 'all';

type ProviderStat = {
  provider: string;
  requests: number;
  successRate: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  costSource: string | null;
  avgLatencyMs: number | null;
  lastRequestAt: string | null;
  model: string;
  status: string;
};

type Stats = {
  period: Period;
  kpis: {
    totalRequests: number;
    successRate: number;
    totalTokens: number;
    tokensToday: number;
    requestsToday: number;
    inputTokens: number;
    outputTokens: number;
    avgLatencyMs: number;
    totalCost: number;
    costSource: string | null;
  };
  providers: ProviderStat[];
  providerShare: { provider: string; tokens: number }[];
  timeSeries: {
    label: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    requests: number;
  }[];
};

type UsageEvent = {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number | null;
  costSource: string | null;
  latencyMs: number | null;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  google: 'Google GenAI',
  custom: 'Custom',
};

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9', '#a855f7'];

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  all: 'All Time',
};

function providerLabel(p: string): string {
  return PROVIDER_LABELS[p] || p;
}

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

// ══════════════════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════════════════

export default function AIManagementPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Management</h1>
        <p className="text-muted-foreground text-sm">
          Token usage, cost analytics, and provider configuration.
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="configuration">
          <ConfigurationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Analytics Tab
// ══════════════════════════════════════════════════════════════════════════════

function AnalyticsTab() {
  const { socket, isConnected } = useSocket();
  const [period, setPeriod] = useState<Period>('7d');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<UsageEvent[]>([]);
  const periodRef = useRef(period);
  periodRef.current = period;

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/ai-management/stats?period=${periodRef.current}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load stats');
      setStats(data);
    } catch (err: unknown) {
      toast.error('Failed to load AI analytics: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  }, []);

  // (Re)load stats whenever the period changes.
  useEffect(() => {
    setLoading(true);
    loadStats();
  }, [period, loadStats]);

  // Seed the live activity feed once.
  useEffect(() => {
    fetch('/api/admin/ai-management/history?limit=20')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.records)) setFeed(d.records);
      })
      .catch(() => {});
  }, []);

  // Real-time updates: prepend to the feed and refresh aggregates.
  useEffect(() => {
    if (!socket) return;
    const onUsage = (data: UsageEvent) => {
      setFeed((prev) => [data, ...prev.filter((f) => f.id !== data.id)].slice(0, 20));
      loadStats();
    };
    socket.on('ai.usage.recorded', onUsage);
    return () => {
      socket.off('ai.usage.recorded', onUsage);
    };
  }, [socket, loadStats]);

  if (loading && !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-[180px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  const k = stats?.kpis;

  const kpiCards = [
    { label: 'Total Requests', value: k ? k.totalRequests.toLocaleString() : '-', icon: Activity },
    { label: 'Success Rate', value: k ? `${k.successRate}%` : '-', icon: CheckCircle2 },
    { label: 'Total Tokens', value: k ? formatCompact(k.totalTokens) : '-', icon: Coins },
    { label: 'Tokens Today', value: k ? formatCompact(k.tokensToday) : '-', icon: Zap },
    { label: 'Input Tokens', value: k ? formatCompact(k.inputTokens) : '-', icon: ArrowUpFromLine },
    {
      label: 'Output Tokens',
      value: k ? formatCompact(k.outputTokens) : '-',
      icon: ArrowDownToLine,
    },
    { label: 'Avg Latency', value: k ? `${k.avgLatencyMs.toLocaleString()}ms` : '-', icon: Clock },
    {
      label: 'Total Cost',
      value: k ? formatCost(k.totalCost) : '-',
      icon: DollarSign,
      note: k?.costSource ? k.costSource : undefined,
    },
  ];

  const tokenChartConfig = {
    inputTokens: { label: 'Input', color: '#6366f1' },
    outputTokens: { label: 'Output', color: '#ec4899' },
  } satisfies ChartConfig;

  const requestChartConfig = {
    requests: { label: 'Requests', color: '#0ea5e9' },
  } satisfies ChartConfig;

  const shareChartConfig: ChartConfig = Object.fromEntries(
    (stats?.providerShare || []).map((p, i) => [
      p.provider,
      { label: providerLabel(p.provider), color: PIE_COLORS[i % PIE_COLORS.length] },
    ])
  );

  const hasTokenData = (stats?.timeSeries || []).some((d) => d.totalTokens > 0);
  const hasRequestData = (stats?.timeSeries || []).some((d) => d.requests > 0);
  const hasShareData = (stats?.providerShare || []).length > 0;

  return (
    <div className="space-y-6">
      {/* Header row: period filter + live indicator */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              isConnected ? 'animate-pulse bg-emerald-500' : 'bg-muted-foreground/40'
            )}
          />
          {isConnected ? 'Live' : 'Offline'}
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PERIOD_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <c.icon className="text-primary h-5 w-5" />
                {c.note && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {c.note}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-4 text-sm">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider cards — Nazexa DB usage (distinct from provider account stats) */}
      <div>
        <h2 className="mb-1 text-sm font-medium">Usage by Provider (Nazexa)</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Requests and tokens recorded through Nazexa — distinct from provider account balances
          below.
        </p>
        {(stats?.providers.length || 0) === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              No AI usage recorded for this period yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats?.providers.map((p) => (
              <Card key={p.provider}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bot className="text-primary h-4 w-4" />
                      {providerLabel(p.provider)}
                    </CardTitle>
                    <Badge variant={p.status === 'error' ? 'destructive' : 'default'}>
                      {p.status === 'error' ? 'Error' : 'Healthy'}
                    </Badge>
                  </div>
                  <CardDescription className="truncate font-mono text-xs">
                    {p.model}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests</span>
                    <span className="font-medium">{p.requests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">{formatCompact(p.totalTokens)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-medium">
                      {formatCost(p.cost)}
                      {p.costSource && (
                        <span className="text-muted-foreground ml-1 text-xs">({p.costSource})</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Latency</span>
                    <span className="font-medium">
                      {p.avgLatencyMs != null ? `${p.avgLatencyMs.toLocaleString()}ms` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Request</span>
                    <span className="font-medium">{timeAgo(p.lastRequestAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Provider Account Statistics — real data fetched server-side from each provider */}
      <ProviderStatsPanel />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Token Usage</CardTitle>
            <CardDescription>Input vs output tokens over time</CardDescription>
          </CardHeader>
          <CardContent>
            {hasTokenData ? (
              <ChartContainer config={tokenChartConfig} className="h-[240px] w-full">
                <AreaChart data={stats?.timeSeries} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <defs>
                    <linearGradient id="fillInput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-inputTokens)" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="var(--color-inputTokens)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-outputTokens)" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="var(--color-outputTokens)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="inputTokens"
                    type="monotone"
                    stackId="tokens"
                    stroke="var(--color-inputTokens)"
                    fill="url(#fillInput)"
                  />
                  <Area
                    dataKey="outputTokens"
                    type="monotone"
                    stackId="tokens"
                    stroke="var(--color-outputTokens)"
                    fill="url(#fillOutput)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests</CardTitle>
            <CardDescription>Request volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            {hasRequestData ? (
              <ChartContainer config={requestChartConfig} className="h-[240px] w-full">
                <BarChart data={stats?.timeSeries} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Provider Share</CardTitle>
            <CardDescription>Token distribution by provider</CardDescription>
          </CardHeader>
          <CardContent>
            {hasShareData ? (
              <ChartContainer config={shareChartConfig} className="h-[260px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="provider" />} />
                  <Pie
                    data={stats?.providerShare}
                    dataKey="tokens"
                    nameKey="provider"
                    innerRadius={60}
                    strokeWidth={2}
                  >
                    {stats?.providerShare.map((entry, i) => (
                      <Cell key={entry.provider} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="provider" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Activity</CardTitle>
          <CardDescription>Most recent AI requests, updating in real time</CardDescription>
        </CardHeader>
        <CardContent>
          {feed.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">No activity yet.</div>
          ) : (
            <div className="space-y-1.5">
              {feed.map((e) => (
                <div
                  key={e.id}
                  className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 rounded-md border p-3 text-sm duration-500"
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
                        <div className="text-destructive max-w-[420px] truncate text-xs">
                          {e.errorMessage || 'Failed'}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-xs">
                          {e.inputTokens.toLocaleString()} in · {e.outputTokens.toLocaleString()}{' '}
                          out · {e.totalTokens.toLocaleString()} total
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

      {/* Per-user AI analytics (spec §6-§9): selector + contribution heatmap */}
      <AiUserAnalytics />
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
      No data for this period.
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Configuration Tab (existing provider config UI)
// ══════════════════════════════════════════════════════════════════════════════

type AIConfig = {
  activeProvider: string;
  googleApiKey: string | null;
  googleModel: string | null;
};

type AIAgent = {
  id: string;
  name: string;
  baseUrl: string | null;
  model: string;
  apiKey: string | null;
  isActive: boolean;
};

function ConfigurationTab() {
  const [globalConfig, setGlobalConfig] = useState<AIConfig | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  const [agentForm, setAgentForm] = useState({
    name: '',
    baseUrl: '',
    model: '',
    apiKey: '',
  });

  const load = async () => {
    try {
      const res = await fetch('/api/admin/ai-management');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGlobalConfig(data.globalConfig);
      setAgents(data.agents);
    } catch (err: unknown) {
      toast.error('Failed to load AI config: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleProviderChange = async (provider: string) => {
    try {
      const res = await fetch('/api/admin/ai-management', {
        method: 'PUT',
        body: JSON.stringify({ activeProvider: provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGlobalConfig((prev) => (prev ? { ...prev, activeProvider: provider } : null));
      toast.success('Active AI provider updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const saveGoogleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/ai-management', {
        method: 'PUT',
        body: JSON.stringify({
          googleApiKey: (document.getElementById('google-api-key') as HTMLInputElement).value,
          googleModel: (document.getElementById('google-model') as HTMLInputElement).value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Google GenAI configuration saved');
      (document.getElementById('google-api-key') as HTMLInputElement).value = '';
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleAgentSave = async () => {
    try {
      const isNew = !editingAgent;
      const url = isNew
        ? '/api/admin/ai-management'
        : `/api/admin/ai-management/agent/${editingAgent.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        body: JSON.stringify(agentForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Agent ${isNew ? 'created' : 'updated'} successfully`);
      setIsAgentDialogOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const setActiveAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai-management/agent/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error('Failed to set active agent');
      toast.success('Active agent updated');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      const res = await fetch(`/api/admin/ai-management/agent/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete agent');
      toast.success('Agent deleted');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const openNewAgentDialog = () => {
    setEditingAgent(null);
    setAgentForm({ name: '', baseUrl: '', model: '', apiKey: '' });
    setIsAgentDialogOpen(true);
  };

  const openEditAgentDialog = (agent: AIAgent) => {
    setEditingAgent(agent);
    setAgentForm({
      name: agent.name,
      baseUrl: agent.baseUrl || '',
      model: agent.model,
      apiKey: agent.apiKey === '••••••••••••' ? '' : agent.apiKey || '',
    });
    setIsAgentDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active AI Provider</CardTitle>
          <CardDescription>Select which AI provider Nazexa-DB should use globally.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={globalConfig?.activeProvider || 'openai'}
            onValueChange={handleProviderChange}
            className="flex flex-col space-y-3"
          >
            <div className="bg-card flex items-center space-x-2 rounded-lg border p-4">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="flex-1 cursor-pointer">
                <div className="font-medium">OpenAI-Compatible</div>
                <div className="text-muted-foreground text-sm font-normal">
                  Use one of the configured OpenAI-compatible agents below
                </div>
              </Label>
              {globalConfig?.activeProvider === 'openai' && <Badge variant="default">Active</Badge>}
            </div>

            <div className="bg-card flex items-center space-x-2 rounded-lg border p-4">
              <RadioGroupItem value="google" id="google" />
              <Label htmlFor="google" className="flex-1 cursor-pointer">
                <div className="font-medium">Google GenAI</div>
                <div className="text-muted-foreground text-sm font-normal">
                  Use Google Gemini API
                </div>
              </Label>
              {globalConfig?.activeProvider === 'google' && <Badge variant="default">Active</Badge>}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Google GenAI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="google-config-form" onSubmit={saveGoogleConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-api-key">API Key</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  placeholder={globalConfig?.googleApiKey ? '••••••••••••' : 'Enter API Key'}
                />
                <p className="text-muted-foreground text-xs">Leave blank to keep current key</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-model">Model Name</Label>
                <Input
                  id="google-model"
                  defaultValue={globalConfig?.googleModel || 'gemini-1.5-pro'}
                  placeholder="gemini-1.5-pro"
                />
              </div>
              <Button type="submit">Save Google Config</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>OpenAI-Compatible Agents</CardTitle>
              <CardDescription>Manage your custom OpenAI-compatible endpoints</CardDescription>
            </div>
            <Button onClick={openNewAgentDialog} size="sm">
              Add Agent
            </Button>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No agents configured.</div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-muted-foreground text-xs">{agent.model}</div>
                        </TableCell>
                        <TableCell>
                          {agent.isActive ? (
                            <Badge variant="default">Active Agent</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="hover:bg-muted cursor-pointer"
                              onClick={() => setActiveAgent(agent.id)}
                            >
                              Set Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditAgentDialog(agent)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => deleteAgent(agent.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add AI Agent'}</DialogTitle>
            <DialogDescription>
              Configure connection details for an OpenAI-compatible agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name / Label</Label>
              <Input
                value={agentForm.name}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                placeholder="e.g. Primary AI"
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL (Optional)</Label>
              <Input
                value={agentForm.baseUrl}
                onChange={(e) => setAgentForm({ ...agentForm, baseUrl: e.target.value })}
                placeholder="https://openrouter.ai/api/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input
                value={agentForm.model}
                onChange={(e) => setAgentForm({ ...agentForm, model: e.target.value })}
                placeholder="e.g. gpt-4"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={agentForm.apiKey}
                onChange={(e) => setAgentForm({ ...agentForm, apiKey: e.target.value })}
                placeholder={editingAgent?.apiKey ? '•••••••••••• (Leave blank to keep)' : 'sk-...'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAgentSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
