'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/ui/image-uploader';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import type { ModelConfig, ModelField } from '@/lib/cms-models/registry';

export type ModelRecord = Record<string, unknown>;

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: ModelField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const str = (value ?? '') as string;

  if (field.type === 'boolean') {
    return (
      <div className={cn('flex items-center gap-2', field.colSpan === 2 && 'sm:col-span-2')}>
        <Switch checked={!!value} onCheckedChange={(c) => onChange(!!c)} id={field.name} />
        <Label htmlFor={field.name} className="text-sm">
          {field.label}
        </Label>
      </div>
    );
  }

  const control = (() => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            rows={3}
            value={str}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'json':
        return (
          <Textarea
            rows={4}
            className="font-mono text-xs"
            value={str}
            placeholder={field.placeholder ?? '[] or {}'}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'rich-text':
        return <RichTextEditor value={str} onChange={(v) => onChange(v ?? '')} />;
      case 'image':
        return <ImageUploader value={str} onChange={(v) => onChange(v ?? '')} />;
      case 'number':
        return <Input type="number" value={str} onChange={(e) => onChange(e.target.value)} />;
      case 'date':
        return (
          <Input
            type="date"
            value={str ? String(str).slice(0, 10) : ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'select':
        return (
          <select
            className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={str}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select…</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            value={str}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  })();

  return (
    <div className={cn('space-y-1.5', field.colSpan === 2 && 'sm:col-span-2')}>
      <Label className="text-xs">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      {control}
      {field.help && <p className="text-muted-foreground text-[11px]">{field.help}</p>}
    </div>
  );
}

// Premium tabbed editor for a dedicated CMS model, driven by its registry config.
export function ModelEditor({
  config,
  value,
  onChange,
}: {
  config: ModelConfig;
  value: ModelRecord;
  onChange: (next: ModelRecord) => void;
}) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });

  return (
    <Tabs defaultValue={config.tabs[0]} className="w-full">
      <TabsList className="flex-wrap">
        {config.tabs.map((t) => (
          <TabsTrigger key={t} value={t}>
            {t}
          </TabsTrigger>
        ))}
      </TabsList>
      {config.tabs.map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {config.fields
              .filter((f) => f.tab === tab)
              .map((f) => (
                <FieldControl
                  key={f.name}
                  field={f}
                  value={value[f.name]}
                  onChange={(v) => set(f.name, v)}
                />
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
