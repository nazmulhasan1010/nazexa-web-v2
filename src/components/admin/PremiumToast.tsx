import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumToastProps {
  id: string | number;
  title: string;
  description: string;
  timeText?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PremiumToast({
  id,
  title,
  description,
  timeText = 'Just now',
  icon,
  action,
}: PremiumToastProps) {
  return (
    <div className="border-border/50 bg-card group relative flex w-full max-w-sm min-w-[320px] flex-col gap-2 overflow-hidden rounded-xl border p-4 shadow-xl shadow-black/5 backdrop-blur-md transition-all sm:w-96">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-1 pr-6">
            <h3 className="text-sm leading-none font-semibold tracking-tight">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between pl-[44px]">
        <span className="text-muted-foreground/60 text-xs font-medium">{timeText}</span>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              toast.dismiss(id);
            }}
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
          >
            {action.label} <span aria-hidden="true">&rarr;</span>
          </button>
        )}
      </div>

      <button
        onClick={() => toast.dismiss(id)}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-3 right-3 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:ring-2 focus:outline-none"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}
