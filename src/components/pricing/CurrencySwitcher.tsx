'use client';

import { Check, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface CurrencySwitcherProps {
  currency: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  onReset?: () => void;
  isDetecting?: boolean;
  isManual?: boolean;
  country?: string | null;
}

export function CurrencySwitcher({
  currency,
  onChange,
  onReset,
  isDetecting,
  isManual,
  country,
}: CurrencySwitcherProps) {
  const active = CURRENCIES[currency];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 tabular-nums">
          {isDetecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          <span className="font-medium">{active.code}</span>
          <span className="text-muted-foreground">{active.symbol}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          {isManual
            ? 'Currency set manually'
            : country
              ? `Detected from your location (${country})`
              : 'Display currency'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {CURRENCY_CODES.map((code) => {
          const def = CURRENCIES[code];
          const selected = code === currency;
          return (
            <DropdownMenuItem key={code} onSelect={() => onChange(code)} className="gap-2">
              <span className="text-muted-foreground w-4 text-center">{def.symbol}</span>
              <span className="flex-1">
                {def.label}
                <span className="text-muted-foreground ml-1.5 text-xs">{def.code}</span>
              </span>
              <Check className={cn('text-primary h-3.5 w-3.5', !selected && 'opacity-0')} />
            </DropdownMenuItem>
          );
        })}

        {isManual && onReset && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onReset} className="text-muted-foreground text-xs">
              Use my location instead
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
