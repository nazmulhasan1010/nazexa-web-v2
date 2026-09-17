'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ModelEditor, type ModelRecord } from '@/components/admin/models/ModelEditor';
import { PreviewDrawer } from '@/components/admin/PreviewDrawer';
import { getModelConfig } from '@/lib/cms-models/registry';
import {
  bulkModel,
  createModel,
  deleteModel,
  duplicateModel,
  getModel,
  listModel,
  reorderModel,
  setModelStatus,
  updateModel,
} from '@/lib/cms-models/actions';

type StatusFilter = 'all' | 'published' | 'draft';
type SortKey = 'position' | 'updated' | 'created' | 'title';
const PAGE_SIZE = 20;

export function ModelListView({ modelKey, backHref }: { modelKey: string; backHref: string }) {
  const config = getModelConfig(modelKey);
  const [rows, setRows] = useState<ModelRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('position');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const [editing, setEditing] = useState<{ record: ModelRecord; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null);

  const reload = useCallback(async () => {
    if (!config) return;
    const res = await listModel(modelKey, {
      q,
      status,
      sort,
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    setRows(res.items as ModelRecord[]);
    setTotal(res.total);
  }, [config, modelKey, q, status, sort, page]);

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [reload]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [q, status, sort, modelKey]);

  if (!config) return <p className="text-muted-foreground">Unknown model “{modelKey}”.</p>;
  const titleField = config.titleField;
  const statusField = config.statusField;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id as string));

  function toggle(id: string) {
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function openNew() {
    setEditing({ record: {}, isNew: true });
  }
  async function openEdit(id: string) {
    const record = await getModel(modelKey, id);
    if (record) setEditing({ record: record as ModelRecord, isNew: false });
  }

  async function save() {
    if (!editing) return;
    // client-side required validation
    const missing = config!.fields.find((f) => f.required && !editing.record[f.name]);
    if (missing) {
      toast.error(`${missing.label} is required`);
      return;
    }
    setSaving(true);
    try {
      if (editing.isNew) {
        await createModel(modelKey, editing.record);
        toast.success('Created');
      } else {
        await updateModel(modelKey, editing.record.id as string, editing.record);
        toast.success('Saved');
      }
      setEditing(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function act(fn: () => Promise<unknown>, msg?: string) {
    setBusy(true);
    try {
      await fn();
      if (msg) toast.success(msg);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function bulk(action: 'publish' | 'unpublish' | 'delete') {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (action === 'delete' && !confirm(`Delete ${ids.length} item(s)?`)) return;
    await act(() => bulkModel(modelKey, ids, action), 'Done');
    setSelected(new Set());
  }

  async function moveRow(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setRows(next);
    await act(() =>
      reorderModel(
        modelKey,
        next.map((r) => r.id as string)
      )
    );
  }

  function previewRecord(record: ModelRecord) {
    const slug = config!.slugField ? (record[config!.slugField] as string) : '';
    const src = modelKey === 'jobs' && slug ? `/careers/${slug}` : (config!.publicPath ?? '/');
    setPreview({ src, title: (record[titleField] as string) || 'Preview' });
  }

  return (
    <div>
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Pages &amp; Data
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{config.label}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
        </div>
        <div className="flex gap-2">
          {config.publicPath && (
            <Button variant="outline" asChild>
              <a href={config.publicPath} target="_blank" rel="noreferrer">
                <Eye className="mr-1.5 h-4 w-4" /> View page
              </a>
            </Button>
          )}
          <Button className="glow-ring" onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> New {config.singular}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="pl-8"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="position">Manual order</option>
          <option value="updated">Recently updated</option>
          <option value="created">Recently created</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="bg-muted/50 mt-3 flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm">
          <span className="ml-1 font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          {statusField && (
            <>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => bulk('publish')}>
                Publish
              </Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => bulk('unpublish')}>
                Unpublish
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            className="text-destructive hover:text-destructive"
            onClick={() => bulk('delete')}
          >
            Delete
          </Button>
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="border-border rounded-lg border border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm">No items yet.</p>
            <Button variant="link" onClick={openNew}>
              Create the first one
            </Button>
          </div>
        ) : (
          <>
            <div className="text-muted-foreground mb-2 flex items-center gap-3 px-3 text-xs">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() =>
                  setSelected((p) => {
                    const n = new Set(p);
                    if (allSelected) rows.forEach((r) => n.delete(r.id as string));
                    else rows.forEach((r) => n.add(r.id as string));
                    return n;
                  })
                }
                aria-label="Select all"
              />
              <span>Select all</span>
            </div>
            <div className="space-y-2">
              {rows.map((r, rowIndex) => {
                const id = r.id as string;
                const published = statusField ? !!r[statusField] : true;
                return (
                  <div
                    key={id}
                    className={cn(
                      'surface-card flex items-center gap-3 p-3',
                      !published && 'opacity-70'
                    )}
                  >
                    <Checkbox
                      checked={selected.has(id)}
                      onCheckedChange={() => toggle(id)}
                      aria-label="Select"
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => openEdit(id)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">
                          {(r[titleField] as string) || 'Untitled'}
                        </span>
                        {statusField && (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                              published
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {published ? 'Published' : 'Draft'}
                          </span>
                        )}
                        {config.listColumns.slice(1).map((c) =>
                          r[c.name] ? (
                            <span key={c.name} className="text-muted-foreground text-xs">
                              {c.label}: {String(r[c.name])}
                            </span>
                          ) : null
                        )}
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {config.orderField && sort === 'position' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Move up"
                            disabled={busy || rowIndex === 0}
                            onClick={() => moveRow(rowIndex, -1)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Move down"
                            disabled={busy || rowIndex === rows.length - 1}
                            onClick={() => moveRow(rowIndex, 1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {config.publicPath && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Preview"
                          onClick={() => previewRecord(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Edit"
                        onClick={() => openEdit(id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {statusField && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={published ? 'Unpublish' : 'Publish'}
                          disabled={busy}
                          onClick={() => act(() => setModelStatus(modelKey, id, !published))}
                        >
                          {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Duplicate"
                        disabled={busy}
                        onClick={() => act(() => duplicateModel(modelKey, id), 'Duplicated')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        title="Delete"
                        disabled={busy}
                        onClick={() => {
                          if (confirm('Delete this item?'))
                            act(() => deleteModel(modelKey, id), 'Deleted');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {page + 1} of {pageCount} · {total} items
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.isNew ? `New ${config.singular}` : `Edit ${config.singular}`}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <ModelEditor
                config={config}
                value={editing.record}
                onChange={(next) => setEditing((e) => (e ? { ...e, record: next } : e))}
              />
              <DialogFooter className="gap-2">
                <div className="flex-1" />
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PreviewDrawer
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        title={preview?.title ?? 'Preview'}
        src={preview?.src ?? ''}
      />
    </div>
  );
}
