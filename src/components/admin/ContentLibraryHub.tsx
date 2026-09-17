'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Eye, Library, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { CONTENT_SCHEMA } from '@/lib/content-schema';
import {
  fetchContentLibraryIndex,
  searchContent,
  type ContentLibraryEntry,
  type ContentSearchRow,
} from '@/lib/cms';
import { PreviewDrawer } from '@/components/admin/PreviewDrawer';
import { cn } from '@/lib/utils';

function shortDate(iso?: string | null): string {
  if (!iso) return 'never';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ContentLibraryHub({
  collections,
  title,
  description,
  basePath,
}: {
  collections: string[];
  title: string;
  description: string;
  basePath: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState<ContentLibraryEntry[]>([]);
  const [recent, setRecent] = useState<ContentSearchRow[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ContentSearchRow[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    fetchContentLibraryIndex()
      .then(setIndex)
      .catch(() => setIndex([]));
    searchContent({ sort: 'updated', limit: 6 })
      .then((r) => setRecent(r.items))
      .catch(() => setRecent([]));
  }, []);

  // Debounced global search
  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      searchContent({ q, limit: 25, sort: 'updated' })
        .then((r) => setResults(r.items))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const indexMap = useMemo(() => new Map(index.map((e) => [e.collection, e])), [index]);
  const labelFor = (c: string) => CONTENT_SCHEMA[c]?.label ?? c;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {/* Global search */}
      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all content by title, subtitle or body…"
          className="pl-9"
        />
      </div>

      {/* Search results */}
      {results !== null ? (
        <div className="mt-6">
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">
            {searching
              ? 'Searching…'
              : `${results.length} result${results.length === 1 ? '' : 's'}`}
          </h2>
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.id} className="surface-card flex items-center gap-3 p-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => router.push(`${basePath}?collection=${r.collection}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.title || 'Untitled'}</span>
                    <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                      {labelFor(r.collection)}
                    </span>
                    {!r.published && (
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] uppercase">
                        Draft
                      </span>
                    )}
                  </div>
                  {r.subtitle && (
                    <p className="text-muted-foreground truncate text-sm">{r.subtitle}</p>
                  )}
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground rounded-md p-1.5"
                  title="Preview"
                  onClick={() =>
                    setPreview({
                      src: `/preview/${r.collection}/${r.id}`,
                      title: r.title || 'Preview',
                    })
                  }
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!searching && results.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No content matches “{q}”.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Recently updated */}
          {recent.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                <Clock className="text-muted-foreground h-4 w-4" /> Recently updated
              </h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <Link
                    key={r.id}
                    href={`${basePath}?collection=${r.collection}`}
                    className="surface-card hover-lift flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{r.title || 'Untitled'}</span>
                    <span className="text-muted-foreground text-xs">
                      · {labelFor(r.collection)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Content-type cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((key) => {
              const schema = CONTENT_SCHEMA[key];
              if (!schema) return null;
              const entry = indexMap.get(key);
              return (
                <Link
                  key={key}
                  href={`${basePath}?collection=${key}`}
                  className="surface-card hover-lift group flex flex-col gap-3 p-5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Library className="text-primary h-5 w-5" />
                    </div>
                    <span className="text-muted-foreground group-hover:text-primary text-xs transition-colors">
                      Manage →
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{schema.label}</h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {schema.description}
                    </p>
                  </div>
                  <div className="text-muted-foreground mt-auto flex items-center gap-3 text-xs">
                    <span
                      className={cn('font-medium', (entry?.total ?? 0) > 0 && 'text-foreground')}
                    >
                      {entry?.total ?? 0} item{(entry?.total ?? 0) === 1 ? '' : 's'}
                    </span>
                    {entry && entry.total > 0 && <span>· {entry.published} published</span>}
                    {entry?.lastUpdated && <span>· {shortDate(entry.lastUpdated)}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <PreviewDrawer
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        title={preview?.title ?? 'Preview'}
        src={preview?.src ?? ''}
      />
    </div>
  );
}
