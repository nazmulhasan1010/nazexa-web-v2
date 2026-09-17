'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from '@/components/ui/icon-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { CONTENT_SCHEMA, type FieldSchema } from '@/lib/content-schema';
import type { ContentItem } from '@/lib/cms';
import { cn } from '@/lib/utils';

export type ContentDraft = Partial<ContentItem> & { data?: Record<string, unknown> };

// Schema-driven editor for a single ContentItem. Shared by the Content Library list editor,
// the inline CollectionEditor, and the preview drawer. Field definitions come from CONTENT_SCHEMA.
export function ContentItemForm({
  collection,
  value,
  onChange,
}: {
  collection: string;
  value: ContentDraft;
  onChange: (next: ContentDraft) => void;
}) {
  const schema = CONTENT_SCHEMA[collection];
  if (!schema) {
    return <p className="text-muted-foreground text-sm">No editable schema for “{collection}”.</p>;
  }

  function fieldValue(field: FieldSchema): string {
    if (field.isData) return (value.data?.[field.name] as string) ?? '';
    return (value[field.name as keyof ContentDraft] as string) ?? '';
  }

  function setField(field: FieldSchema, val: string) {
    if (field.isData) {
      onChange({ ...value, data: { ...(value.data ?? {}), [field.name]: val } });
    } else {
      onChange({ ...value, [field.name]: val });
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {schema.fields.map((field) => {
        const v = fieldValue(field);
        const set = (val: string | null) => setField(field, val ?? '');
        return (
          <div key={field.name} className={cn('space-y-1.5', field.className)}>
            <Label className="text-xs">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                rows={3}
                value={v}
                onChange={(e) => set(e.target.value)}
                placeholder={field.placeholder}
              />
            ) : field.type === 'rich-text' ? (
              <RichTextEditor value={v} onChange={set} />
            ) : field.type === 'icon' ? (
              <IconPicker value={v} onChange={set} />
            ) : field.type === 'image' ? (
              <ImageUploader value={v} onChange={set} />
            ) : field.type === 'select' && field.options ? (
              <select
                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={v}
                onChange={(e) => set(e.target.value)}
              >
                <option value="" disabled>
                  Select option
                </option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={v}
                onChange={(e) => set(e.target.value)}
                placeholder={field.placeholder ?? (field.type === 'json' ? '{} or []' : '')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
