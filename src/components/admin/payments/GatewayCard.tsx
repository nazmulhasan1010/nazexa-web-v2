'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Settings2,
  Smartphone,
  Landmark,
} from 'lucide-react';
import { adminApi, type AdminGateway } from '@/lib/admin/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const GROUP_LABELS: Record<AdminGateway['group'], string> = {
  bd_wallet: 'Mobile Wallet · BD',
  bd_aggregator: 'Aggregator · BD',
  international: 'International',
  bank: 'Bank',
};

interface GatewayCardProps {
  gateway: AdminGateway;
  onToggle: (next: boolean) => void;
  onSaved: () => void;
}

export function GatewayCard({ gateway, onToggle, onSaved }: GatewayCardProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>(() => ({ ...gateway.config }));
  const [displayName, setDisplayName] = useState(gateway.displayName ?? '');
  const [instructions, setInstructions] = useState(gateway.instructions ?? '');

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateGateway({
        id: gateway.id,
        displayName,
        instructions,
        config,
      });
      toast.success(`${gateway.name} settings saved`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setSaving(true);
    try {
      const result = await adminApi.testGateway(gateway.id);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-border/60 rounded-lg border">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold uppercase',
              gateway.accent
            )}
          >
            {gateway.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{gateway.name}</h2>
              <Badge variant="outline" className="text-[10px]">
                {GROUP_LABELS[gateway.group]}
              </Badge>
              {gateway.isEnabled ? (
                <Badge className="gap-1 text-[10px]">
                  <Check className="size-3" />
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Disabled
                </Badge>
              )}
              {!gateway.isConfigured && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 text-[10px] text-amber-600"
                >
                  <AlertCircle className="size-3" />
                  Needs setup
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{gateway.description}</p>
            {!gateway.isConfigured && gateway.missingFields.length > 0 && (
              <p className="mt-1 text-xs text-amber-600">
                Missing: {gateway.missingFields.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            className="gap-1.5"
          >
            <Settings2 className="size-3.5" />
            Configure
            <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
          </Button>
          <Switch
            checked={gateway.isEnabled}
            onCheckedChange={onToggle}
            // Enabling an unconfigured gateway is refused server-side; keeping
            // the switch active lets the click explain why.
            aria-label={`${gateway.isEnabled ? 'Disable' : 'Enable'} ${gateway.name}`}
          />
        </div>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="sr-only">Toggle configuration</CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-border/60 space-y-4 border-t p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Display name</Label>
                <Input
                  value={displayName}
                  placeholder={gateway.name}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            {gateway.code === 'custom_payment' ? (
              <div className="divide-border/50 border-border/60 bg-card mt-6 divide-y overflow-hidden rounded-xl border shadow-sm">
                {['bkash', 'nagad', 'bank'].map((prefix) => {
                  const isBkash = prefix === 'bkash';
                  const isNagad = prefix === 'nagad';
                  const isBank = prefix === 'bank';
                  const title = isBkash ? 'bKash' : isNagad ? 'Nagad' : 'Bank Transfer';
                  const description = isBkash
                    ? 'Accept payments via bKash mobile banking'
                    : isNagad
                      ? 'Accept payments via Nagad mobile banking'
                      : 'Accept direct bank and wire transfers';
                  const enabledKey = `${prefix}Enabled`;
                  const isEnabled = config[enabledKey] === 'true';

                  return (
                    <div key={prefix} className="group flex flex-col transition-colors">
                      <div className="hover:bg-muted/30 flex items-center justify-between p-5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors',
                              isBkash && isEnabled
                                ? 'border-[#e2136e]/20 bg-[#e2136e]/10 text-[#e2136e]'
                                : isNagad && isEnabled
                                  ? 'border-[#f37021]/20 bg-[#f37021]/10 text-[#f37021]'
                                  : isBank && isEnabled
                                    ? 'border-blue-600/20 bg-blue-600/10 text-blue-600'
                                    : 'bg-muted/50 border-border/50 text-muted-foreground'
                            )}
                          >
                            {isBank ? (
                              <Landmark className="h-5 w-5" />
                            ) : (
                              <Smartphone className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-foreground text-sm font-semibold tracking-tight">
                              {title}
                            </h3>
                            <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isEnabled && (
                            <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase sm:inline-flex dark:text-emerald-500">
                              Active
                            </span>
                          )}
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(c) =>
                              setConfig((prev) => ({ ...prev, [enabledKey]: c ? 'true' : 'false' }))
                            }
                            aria-label={`Enable ${title}`}
                          />
                        </div>
                      </div>

                      {isEnabled && (
                        <div className="p-5 pt-0">
                          <div className="border-border/50 bg-muted/20 rounded-xl border p-5 shadow-inner">
                            <h4 className="text-muted-foreground mb-5 flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase">
                              {title} Configuration
                              <div className="bg-border/50 h-px flex-1"></div>
                            </h4>
                            <div className="grid gap-6 sm:grid-cols-2">
                              {gateway.fields
                                .filter((f) => f.key.startsWith(prefix) && f.key !== enabledKey)
                                .map((field) => (
                                  <div
                                    key={field.key}
                                    className={cn(
                                      'space-y-2',
                                      field.type === 'textarea' && 'sm:col-span-2'
                                    )}
                                  >
                                    <Label
                                      htmlFor={`${gateway.id}-${field.key}`}
                                      className="text-foreground/90 flex items-center gap-1 text-sm font-medium"
                                    >
                                      {field.label
                                        .replace(`${title} - `, '')
                                        .replace(`${title} `, '')}
                                      {field.required && (
                                        <span className="text-destructive">*</span>
                                      )}
                                    </Label>
                                    {field.type === 'textarea' ? (
                                      <Textarea
                                        id={`${gateway.id}-${field.key}`}
                                        placeholder={field.placeholder}
                                        value={config[field.key] ?? ''}
                                        onChange={(e) =>
                                          setConfig((c) => ({ ...c, [field.key]: e.target.value }))
                                        }
                                        className="bg-background/50 focus-visible:ring-primary/20 min-h-[100px] resize-y"
                                      />
                                    ) : (
                                      <Input
                                        id={`${gateway.id}-${field.key}`}
                                        type="text"
                                        placeholder={field.placeholder}
                                        value={config[field.key] ?? ''}
                                        onChange={(e) =>
                                          setConfig((c) => ({ ...c, [field.key]: e.target.value }))
                                        }
                                        className="bg-background/50 focus-visible:ring-primary/20 h-10"
                                      />
                                    )}
                                    {field.help && (
                                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                                        {field.help}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {gateway.fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={`${gateway.id}-${field.key}`}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                      {field.secret && (
                        <span className="text-muted-foreground ml-1.5 text-[10px]">secret</span>
                      )}
                    </Label>

                    {field.type === 'select' ? (
                      <Select
                        value={config[field.key] ?? ''}
                        onValueChange={(v) => setConfig((c) => ({ ...c, [field.key]: v }))}
                      >
                        <SelectTrigger id={`${gateway.id}-${field.key}`}>
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={`${gateway.id}-${field.key}`}
                        type={field.secret ? 'password' : field.type === 'email' ? 'email' : 'text'}
                        placeholder={field.placeholder}
                        value={config[field.key] ?? ''}
                        onChange={(e) => setConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                      />
                    )}

                    {field.help && (
                      <p className="text-muted-foreground text-[11px]">{field.help}</p>
                    )}
                    {field.public && (
                      <p className="text-muted-foreground text-[11px]">
                        Shown to users on the payment page.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Instructions for users</Label>
              <Textarea
                rows={3}
                value={instructions}
                placeholder="e.g. Send money to the number above, then submit the TrxID."
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => void test()} disabled={saving}>
                Test connection
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save settings'
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
