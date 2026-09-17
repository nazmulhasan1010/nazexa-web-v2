'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Library,
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
import {
  bulkContentAction,
  createContentItem,
  deleteContentItem,
  duplicateContentItem,
  fetchAdminContentItems,
  getContentUsage,
  setContentStatus,
  updateContentItem,
  type ContentItem,
} from '@/lib/cms';
import { CONTENT_SCHEMA } from '@/lib/content-schema';
import { ContentItemForm, type ContentDraft } from '@/components/admin/ContentItemForm';
import { PreviewDrawer } from '@/components/admin/PreviewDrawer';

type StatusFilter = 'all' | 'published' | 'draft';
type SortKey = 'updated' | 'created' | 'title' | 'position';
const PAGE_SIZE = 20;

function shortDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ContentLibraryView({
  collection,
  backHref,
}: {
  collection: string;
  backHref: string;
}) {
  const schema = CONTENT_SCHEMA[collection];
  const [rows, setRows] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('position');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [editing, setEditing] = useState<{ draft: ContentDraft; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ src: string; title: string; live?: ContentItem } | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const data = await fetchAdminContentItems(collection);
    setRows(data);
  }, [collection]);

  useEffect(() => {
    setLoading(true);
    setSelected(new Set());
    setPage(0);
    reload().finally(() => setLoading(false));
  }, [reload]);

  // ── Derived: filter + sort ──
  const filtered = useMemo(() => {
    let out = rows;
    if (status !== 'all')
      out = out.filter((r) => (status === 'published' ? r.published : !r.published));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter(
        (r) =>
          (r.title || '').toLowerCase().includes(needle) ||
          (r.subtitle || '').toLowerCase().includes(needle)
      );
    }
    const sorted = [...out];
    sorted.sort((a, b) => {
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sort === 'created') return (b.created_at || '').localeCompare(a.created_at || '');
      if (sort === 'updated') return (b.updated_at || '').localeCompare(a.updated_at || '');
      return (a.position ?? 0) - (b.position ?? 0);
    });
    return sorted;
  }, [rows, status, q, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  // ── Actions ──
  function openNew() {
    setEditing({
      draft: { collection, slug: '', published: false, data: {} },
      isNew: true,
    });
  }
  function openEdit(item: ContentItem) {
    setEditing({ draft: { ...item, data: { ...item.data } }, isNew: false });
  }

  async function saveEditing() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.isNew) {
        await createContentItem(collection, editing.draft);
        toast.success('Created');
      } else if (editing.draft.id) {
        await updateContentItem(editing.draft.id, editing.draft);
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

  async function togglePublish(item: ContentItem) {
    setBusy(true);
    try {
      await setContentStatus(item.id, !item.published);
      await reload();
    } catch {
      toast.error('Could not update status');
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(item: ContentItem) {
    setBusy(true);
    try {
      await duplicateContentItem(item.id);
      toast.success('Duplicated');
      await reload();
    } catch {
      toast.error('Could not duplicate');
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ContentItem) {
    const usage = await getContentUsage(collection).catch(() => []);
    const warn =
      usage.length > 0
        ? `“${item.title || 'This item'}” — its collection is used in:\n\n${usage
            .map((u) => `• ${u.label}`)
            .join('\n')}\n\nDelete anyway?`
        : `Delete “${item.title || 'this item'}”?`;
    if (!confirm(warn)) return;
    setBusy(true);
    try {
      await deleteContentItem(item.id);
      toast.success('Deleted');
      await reload();
    } catch {
      toast.error('Could not delete');
    } finally {
      setBusy(false);
    }
  }

  async function runBulk(action: 'publish' | 'unpublish' | 'delete') {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (action === 'delete') {
      const usage = await getContentUsage(collection).catch(() => []);
      const warn =
        usage.length > 0
          ? `Delete ${ids.length} item(s)? This collection is used in:\n\n${usage.map((u) => `• ${u.label}`).join('\n')}`
          : `Delete ${ids.length} item(s)?`;
      if (!confirm(warn)) return;
    }
    setBusy(true);
    try {
      await bulkContentAction(ids, action);
      toast.success(
        `${action === 'delete' ? 'Deleted' : action === 'publish' ? 'Published' : 'Unpublished'} ${ids.length}`
      );
      setSelected(new Set());
      await reload();
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setBusy(false);
    }
  }

  function openPreview(item: ContentItem, live?: ContentItem) {
    setPreview({
      src: `/preview/${collection}/${item.id}`,
      title: item.title || 'Preview',
      live,
    });
  }

  return (
    <div>
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Content Library
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{schema?.label ?? collection}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{schema?.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`${backHref}?collection=${collection}&mode=reorder`}>
              <ArrowUpDown className="mr-1.5 h-4 w-4" /> Reorder
            </Link>
          </Button>
          <Button className="glow-ring" onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> New {schema?.label ?? 'item'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search title or subtitle…"
            className="pl-8"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(0);
          }}
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

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bg-muted/50 mt-3 flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm">
          <span className="ml-1 font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" disabled={busy} onClick={() => runBulk('publish')}>
            <Eye className="mr-1.5 h-4 w-4" /> Publish
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => runBulk('unpublish')}>
            <EyeOff className="mr-1.5 h-4 w-4" /> Unpublish
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            className="text-destructive hover:text-destructive"
            onClick={() => runBulk('delete')}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      )}

      {/* List */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-border rounded-lg border border-dashed py-12 text-center">
            <Library className="text-muted-foreground mx-auto h-8 w-8 opacity-20" />
            <p className="text-muted-foreground mt-2 text-sm">
              {rows.length === 0 ? 'No items in this collection' : 'No items match your filters'}
            </p>
            {rows.length === 0 && (
              <Button variant="link" onClick={openNew}>
                Create the first one
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="text-muted-foreground mb-2 flex items-center gap-3 px-3 text-xs">
              <Checkbox
                checked={allOnPageSelected}
                onCheckedChange={toggleSelectPage}
                aria-label="Select page"
              />
              <span>Select all on page</span>
            </div>
            <div className="space-y-2">
              {pageRows.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'surface-card flex items-center gap-3 p-3',
                    !item.published && 'opacity-70'
                  )}
                >
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                    aria-label="Select item"
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => openEdit(item)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{item.title || 'Untitled'}</span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                          item.published
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-muted-foreground truncate text-sm">{item.subtitle}</p>
                    )}
                  </button>
                  <span className="text-muted-foreground hidden shrink-0 text-xs sm:block">
                    {shortDate(item.updated_at)}
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Preview"
                      onClick={() => openPreview(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Edit"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={item.published ? 'Unpublish' : 'Publish'}
                      disabled={busy}
                      onClick={() => togglePublish(item)}
                    >
                      {item.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Duplicate"
                      disabled={busy}
                      onClick={() => duplicate(item)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      title="Delete"
                      disabled={busy}
                      onClick={() => remove(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {page + 1} of {pageCount} · {filtered.length} items
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

      {/* Editor dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.isNew
                ? `New ${schema?.label ?? 'item'}`
                : `Edit ${schema?.label ?? 'item'}`}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <div className="flex items-center gap-2 pb-2">
                <Checkbox
                  id="published"
                  checked={!!editing.draft.published}
                  onCheckedChange={(c) =>
                    setEditing((e) => (e ? { ...e, draft: { ...e.draft, published: !!c } } : e))
                  }
                />
                <label htmlFor="published" className="text-sm">
                  Published
                </label>
              </div>
              <ContentItemForm
                collection={collection}
                value={editing.draft}
                onChange={(next) => setEditing((e) => (e ? { ...e, draft: next } : e))}
              />
              <DialogFooter className="gap-2">
                {!editing.isNew && editing.draft.id && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      openPreview(
                        { ...(editing.draft as ContentItem) },
                        editing.draft as ContentItem
                      )
                    }
                  >
                    <Eye className="mr-1.5 h-4 w-4" /> Preview
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEditing} disabled={saving}>
                  {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview drawer */}
      <PreviewDrawer
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        title={preview?.title ?? 'Preview'}
        src={preview?.src ?? ''}
        liveItem={preview?.live}
      />
    </div>
  );
}
