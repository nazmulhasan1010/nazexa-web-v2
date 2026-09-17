'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
  data: Record<string, number>; // YYYY-MM-DD -> count
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Generate last 364 days (52 weeks * 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { date: Date; dateStr: string; count: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: d,
      dateStr,
      count: data[dateStr] || 0,
    });
  }

  // Group into weeks
  const weeks: (typeof days)[] = [];
  let currentWeek: typeof days = [];

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const maxCount = Math.max(...Object.values(data), 1);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-muted/30 dark:bg-muted/10';
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-primary/20';
    if (ratio < 0.5) return 'bg-primary/40';
    if (ratio < 0.75) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  return (
    <div className="flex flex-col gap-2">
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
                        getColorClass(day.count)
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      <span className="font-semibold">{day.count}</span> events on {day.dateStr}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </TooltipProvider>
      </div>
      <div className="text-muted-foreground flex items-center justify-end gap-2 text-xs">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="bg-muted/30 dark:bg-muted/10 h-3 w-3 rounded-[2px]" />
          <div className="bg-primary/20 h-3 w-3 rounded-[2px]" />
          <div className="bg-primary/40 h-3 w-3 rounded-[2px]" />
          <div className="bg-primary/60 h-3 w-3 rounded-[2px]" />
          <div className="bg-primary/90 h-3 w-3 rounded-[2px]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
