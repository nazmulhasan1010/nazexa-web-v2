'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ContributionDay = {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type ContributionMetric = keyof ContributionDay;

interface AiContributionHeatmapProps {
  /** date 'YYYY-MM-DD' (UTC) -> per-day metrics. Missing days render as level 0. */
  data: Record<string, Partial<ContributionDay>>;
  /** Number of days to render (defaults to 365 = 12 months). */
  windowDays?: number;
}

const METRICS: { key: ContributionMetric; label: string }[] = [
  { key: 'requests', label: 'Requests' },
  { key: 'totalTokens', label: 'Total Tokens' },
  { key: 'inputTokens', label: 'Input Tokens' },
  { key: 'outputTokens', label: 'Output Tokens' },
];

const EMPTY_DAY: ContributionDay = { requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 };

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function longDate(dateStr: string): string {
  // dateStr is a UTC day key — format in UTC to avoid an off-by-one shift.
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function AiContributionHeatmap({ data, windowDays = 365 }: AiContributionHeatmapProps) {
  const [metric, setMetric] = React.useState<ContributionMetric>('requests');

  // Build the day grid in UTC so keys align with the server's rollup dates.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const days: { dateStr: string; value: ContributionDay }[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const dateStr = d.toISOString().split('T')[0];
    const raw = data[dateStr];
    days.push({ dateStr, value: { ...EMPTY_DAY, ...(raw || {}) } });
  }

  // Group into 7-day columns.
  const weeks: (typeof days)[] = [];
  let currentWeek: typeof days = [];
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) weeks.push(currentWeek);

  const maxValue = Math.max(1, ...days.map((d) => d.value[metric]));

  // Levels 0-4, data-driven from the selected metric (spec §7).
  const levelClass = (value: number): string => {
    if (value <= 0) return 'bg-muted/30 dark:bg-muted/10';
    const ratio = value / maxValue;
    if (ratio < 0.25) return 'bg-primary/20';
    if (ratio < 0.5) return 'bg-primary/40';
    if (ratio < 0.75) return 'bg-primary/70';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Metric switcher (spec §8) */}
      <div className="flex flex-wrap items-center gap-1">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMetric(m.key)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs transition-colors',
              metric === m.key
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-2">
        <TooltipProvider delayDuration={100}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <Tooltip key={day.dateStr}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-3 w-3 rounded-[2px] transition-colors',
                        levelClass(day.value[metric])
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="text-xs">
                      <p className="mb-1 font-semibold">{longDate(day.dateStr)}</p>
                      <p>AI Requests: {day.value.requests.toLocaleString()}</p>
                      <p>Input Tokens: {day.value.inputTokens.toLocaleString()}</p>
                      <p>Output Tokens: {day.value.outputTokens.toLocaleString()}</p>
                      <p>Total Tokens: {day.value.totalTokens.toLocaleString()}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </TooltipProvider>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>Max/day: {fmt(maxValue)}</span>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="bg-muted/30 dark:bg-muted/10 h-3 w-3 rounded-[2px]" />
            <div className="bg-primary/20 h-3 w-3 rounded-[2px]" />
            <div className="bg-primary/40 h-3 w-3 rounded-[2px]" />
            <div className="bg-primary/70 h-3 w-3 rounded-[2px]" />
            <div className="bg-primary h-3 w-3 rounded-[2px]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
