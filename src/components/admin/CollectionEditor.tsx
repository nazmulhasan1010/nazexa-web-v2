'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  Eye,
  EyeOff,
  Library,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveContentItems, type ContentItem } from '@/lib/cms';
import { CONTENT_SCHEMA } from '@/lib/content-schema';
import { adminContentQuery } from '@/lib/queries';
import { IconPicker } from '@/components/ui/icon-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';

type Draft = ContentItem & { _new?: boolean; _deleted?: boolean };

interface CollectionEditorProps {
  collection: string;
  backHref: string;
  backLabel: string;
}

export function CollectionEditor({ collection, backHref, backLabel }: CollectionEditorProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(adminContentQuery(collection));
  const [items, setItems] = useState<Draft[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setItems((prev) => {
        const newItems = prev.filter((i) => i._new && i.collection === collection);
        return [...(data as Draft[]), ...newItems];
      });
    }
  }, [data, collection]);

  const save = useMutation({
    mutationFn: async (rows: Draft[]) => {
      await saveContentItems(rows);
    },
    onSuccess: () => {
      toast.success('Content saved');
      void queryClient.invalidateQueries({ queryKey: ['content_items'] });
      void queryClient.invalidateQueries({ queryKey: ['content_items_admin', collection] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });

  function addItem() {
    const id = `new-${crypto.randomUUID()}`;
    setItems((prev) => [
      ...prev,
      { id, collection, slug: '', position: prev.length, published: true, _new: true } as Draft,
    ]);
    setOpen(id);
  }

  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[nextIdx]] = [next[nextIdx]!, next[idx]!];
      return next.map((item, i) => ({ ...item, position: i }));
    });
  }

  const schema = CONTENT_SCHEMA[collection];

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{schema?.label ?? collection}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{schema?.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addItem}>
            <Plus className="mr-1.5 h-4 w-4" /> Add entry
          </Button>
          <Button
            className="glow-ring"
            onClick={() => save.mutate(items)}
            disabled={save.isPending}
          >
            {save.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <FaRegCircleCheck className="mr-1.5 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {items
              .filter((i) => !i._deleted && i.collection === collection)
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((item, index, arr) => (
                <div
                  key={item.id}
                  className={cn('surface-card p-4', !item.published && 'opacity-60')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onClick={() => setOpen(open === item.id ? null : item.id)}
                    >
                      <span className="font-medium">{item.title || 'Untitled'}</span>
                      {item.subtitle && (
                        <span className="text-muted-foreground ml-2 text-sm">{item.subtitle}</span>
                      )}
                      {item._new && (
                        <span className="bg-primary/10 text-primary ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          New
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => move(item.id, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => move(item.id, 1)}
                        disabled={index === arr.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, published: !i.published } : i
                            )
                          )
                        }
                      >
                        {item.published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        onClick={() => {
                          if (confirm('Delete this item?')) {
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, _deleted: true } : i))
                            );
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {open === item.id && (
                    <div className="border-border mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                      {schema?.fields.map((field) => {
                        const value = field.isData
                          ? ((item.data?.[field.name] as string) ?? '')
                          : ((item[field.name as keyof typeof item] as string) ?? '');

                        const setter = (val: string) =>
                          setItems((prev) =>
                            prev.map((i) => {
                              if (i.id !== item.id) return i;
                              if (field.isData) {
                                return { ...i, data: { ...(i.data || {}), [field.name]: val } };
                              }
                              return { ...i, [field.name]: val };
                            })
                          );

                        if (field.type === 'textarea') {
                          return (
                            <div key={field.name} className={cn('space-y-1.5', field.className)}>
                              <Label>{field.label}</Label>
                              <Textarea
                                rows={3}
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                              />
                            </div>
                          );
                        }
                        if (field.type === 'rich-text') {
                          return (
                            <div key={field.name} className={cn('space-y-1.5', field.className)}>
                              <Label>{field.label}</Label>
                              <RichTextEditor value={value} onChange={setter} />
                            </div>
                          );
                        }
                        if (field.type === 'icon') {
                          return (
                            <div key={field.name} className={cn('space-y-1.5', field.className)}>
                              <Label>{field.label}</Label>
                              <IconPicker value={value} onChange={setter} />
                            </div>
                          );
                        }
                        if (field.type === 'image') {
                          return (
                            <div key={field.name} className={cn('space-y-1.5', field.className)}>
                              <Label>{field.label}</Label>
                              <ImageUploader value={value} onChange={setter} />
                            </div>
                          );
                        }
                        if (field.type === 'select' && field.options) {
                          return (
                            <div key={field.name} className={cn('space-y-1.5', field.className)}>
                              <Label>{field.label}</Label>
                              <select
                                className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                value={value}
                                onChange={(e) => setter(e.target.value)}
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
                            </div>
                          );
                        }
                        return (
                          <div key={field.name} className={cn('space-y-1.5', field.className)}>
                            <Label>{field.label}</Label>
                            <Input
                              value={value}
                              onChange={(e) => setter(e.target.value)}
                              placeholder={field.type === 'json' ? '{} or []' : ''}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

            {items.filter((i) => !i._deleted && i.collection === collection).length === 0 && (
              <div className="border-border rounded-lg border border-dashed py-12 text-center">
                <Library className="text-muted-foreground mx-auto h-8 w-8 opacity-20" />
                <p className="text-muted-foreground mt-2 text-sm">No items in this collection</p>
                <Button variant="link" onClick={addItem}>
                  Create the first one
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
