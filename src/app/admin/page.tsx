'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import {
  FileText,
  Users,
  CreditCard,
  Mail,
  Activity,
  ArrowRight,
  Bot,
  Zap,
  DollarSign,
  Gauge,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { useRoles } from '@/hooks/useAuth';
import { ActivityHeatmap } from '@/components/admin/ActivityHeatmap';

export default AdminOverview;

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

const AI_PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  google: 'Google GenAI',
  custom: 'Custom',
};

function AdminOverview() {
  const { data: roles } = useRoles();
  const canEdit = roles?.some((r) => r === 'admin' || r === 'editor');

  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/overview');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data;
    },
  });

  const { data: aiStats } = useQuery({
    queryKey: ['ai-overview-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/ai-management/stats?period=7d');
      if (!res.ok) throw new Error('Failed to fetch AI stats');
      return res.json();
    },
  });

  const { data: providerStats } = useQuery({
    queryKey: ['ai-overview-providers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/ai-management/providers');
      if (!res.ok) throw new Error('Failed to fetch provider stats');
      return res.json();
    },
  });

  const cards = [
    {
      to: '/admin/subscribers',
      icon: Users,
      label: 'Total Central Users',
      value: overview?.totalUsers?.toLocaleString() || '-',
    },
    {
      to: '/admin/payments',
      icon: CreditCard,
      label: 'Total Revenue (All Time)',
      value: overview?.totalRevenue ? `$${overview.totalRevenue.toLocaleString()}` : '-',
    },
    {
      to: '/admin/subscribers',
      icon: Mail,
      label: 'Active Subscribers',
      value: overview?.activeSubscribers?.toLocaleString() || '-',
    },
    {
      to: '/admin/pages',
      icon: FileText,
      label: 'News Posts',
      value: overview?.newsPosts?.toLocaleString() || '-',
    },
  ] as const;

  const aiK = aiStats?.kpis;
  const aiCards = [
    {
      label: 'Requests Today',
      value: aiK ? aiK.requestsToday.toLocaleString() : '-',
      icon: Activity,
    },
    { label: 'Tokens Today', value: aiK ? formatCompact(aiK.tokensToday) : '-', icon: Zap },
    {
      label: 'Active Users Today',
      value: aiK ? (aiK.activeUsersToday ?? 0).toLocaleString() : '-',
      icon: Users,
    },
    { label: 'Total Cost', value: aiK ? formatCost(aiK.totalCost) : '-', icon: DollarSign },
  ] as const;
  const sparkData: { label: string; totalTokens: number }[] = aiStats?.timeSeries || [];
  const mostUsedProvider: string | null = aiK?.mostUsedProvider ?? null;
  type OverviewProvider = {
    provider: string;
    status: string;
    balance: number | null;
    remaining: number | null;
  };
  const providers: OverviewProvider[] = providerStats?.providers || [];

  return (
    <div>
      <h1 className="text-3xl font-semibold">Overview</h1>
      <p className="text-muted-foreground mt-2">
        Telemetry, metrics, and activity across the Nazexa platform.
      </p>

      {!canEdit && (
        <div className="border-destructive/40 bg-destructive/10 mt-6 rounded-lg border p-4 text-sm">
          Your account has no editor role yet, so saving is disabled. An admin needs to grant you
          the <span className="font-mono"> admin </span> or{' '}
          <span className="font-mono">editor</span> role.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.to} className="surface-card hover-lift group block p-5">
            <c.icon className="text-primary h-5 w-5" />
            <p className="text-muted-foreground mt-4 text-sm">{c.label}</p>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="text-2xl font-semibold">
                {isLoading ? <div className="bg-muted h-8 w-16 animate-pulse rounded" /> : c.value}
              </div>
              <ArrowRight className="text-muted-foreground h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>

      {/* AI usage snapshot */}
      <div className="surface-card mt-8 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Bot className="text-primary h-5 w-5" />
              AI Usage
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Token usage and request health over the last 7 days.
            </p>
          </div>
          <Link
            href="/admin/ai-management"
            className="text-primary inline-flex shrink-0 items-center gap-1 text-sm hover:underline"
          >
            View AI Analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aiCards.map((c) => (
            <div key={c.label} className="rounded-lg border p-4">
              <c.icon className="text-primary h-4 w-4" />
              <p className="text-muted-foreground mt-3 text-xs">{c.label}</p>
              <p className="mt-0.5 text-xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Most-used provider + live provider quota status */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Bot className="text-primary h-4 w-4" />
            <span className="text-muted-foreground">Most-used provider:</span>
            <span className="font-medium">
              {mostUsedProvider ? AI_PROVIDER_LABELS[mostUsedProvider] || mostUsedProvider : '—'}
            </span>
          </div>
          {providers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Gauge className="h-4 w-4" /> Quota:
              </span>
              {providers.map((p) => {
                const val =
                  p.remaining != null
                    ? `$${p.remaining.toFixed(2)}`
                    : p.balance != null
                      ? `$${p.balance.toFixed(2)}`
                      : p.status === 'ok'
                        ? 'Live'
                        : p.status === 'error'
                          ? 'Error'
                          : 'N/A';
                return (
                  <span key={p.provider} className="rounded-md border px-2 py-0.5 text-xs">
                    {AI_PROVIDER_LABELS[p.provider] || p.provider}:{' '}
                    <span className="font-medium">{val}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-muted-foreground mb-2 text-xs">Tokens · last 7 days</p>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="aiSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="totalTokens"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#aiSpark)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="surface-card mt-8 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="text-primary h-5 w-5" />
              User Activity
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Central SSO logins, signups, and platform activity over the last year.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-muted/50 h-30 w-full animate-pulse rounded-lg" />
        ) : (
          <ActivityHeatmap data={overview?.heatmapData || {}} />
        )}
      </div>
    </div>
  );
}
