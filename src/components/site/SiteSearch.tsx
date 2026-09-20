'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { Search, FileText, Package, Briefcase, FileCode, Users, BookOpen, Layout, Loader2, Compass, History, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SearchGroup } from '@/lib/search';
import { useSiteSearchHistory } from '@/hooks/useSiteSearchHistory';

export const openSiteSearch = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('nazexa:open-search'));
};

export function SiteSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { history, addHistory, clearHistory } = useSiteSearchHistory();

  useEffect(() => {
    const handleOpen = () => onOpenChange(true);
    window.addEventListener('nazexa:open-search', handleOpen);
    return () => window.removeEventListener('nazexa:open-search', handleOpen);
  }, [onOpenChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const { data, isLoading } = useQuery({
    queryKey: ['site-search', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return { groups: [] as SearchGroup[] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json() as Promise<{ groups: SearchGroup[] }>;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000,
  });

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'menu': return <Compass className="h-4 w-4 text-emerald-500" />;
      case 'submenu': return <Layout className="h-4 w-4 text-emerald-500" />;
      case 'product': case 'products': return <Package className="h-4 w-4 text-primary" />;
      case 'docarticle': case 'documentation': return <FileCode className="h-4 w-4 text-cyan-500" />;
      case 'job': case 'jobs': return <Briefcase className="h-4 w-4 text-orange-500" />;
      case 'resource': case 'resources': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'page': case 'pages': return <Layout className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleSelect = useCallback((url: string, title: string, type: string, id: string) => {
    addHistory({ id, title, url, type });
    onOpenChange(false);
    setTimeout(() => {
      router.push(url);
    }, 150);
  }, [router, onOpenChange, addHistory]);

  // Clean up body overflow when closed
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Also clear search when closed to reset state
      setTimeout(() => setQuery(''), 200); 
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm p-4 pt-[10vh] sm:p-6 sm:pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <Command
        className="mx-auto flex max-w-2xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl ring-1 ring-black/5"
        shouldFilter={false}
        loop
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search Nazexa..."
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 rounded-full p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
          <div className="hidden items-center gap-1 sm:flex ml-2">
            <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">ESC</kbd>
          </div>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
          {debouncedQuery.length < 2 && history.length > 0 && (
            <Command.Group 
              heading={
                <div className="flex items-center justify-between">
                  <span>Recent Searches</span>
                  <button onClick={clearHistory} className="text-xs hover:text-primary transition-colors">Clear</button>
                </div>
              }
              className="text-muted-foreground [&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:py-1.5 [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-semibold"
            >
              {history.map((item) => (
                <Command.Item
                  key={`hist-${item.id}`}
                  value={`hist-${item.id}`}
                  onSelect={() => handleSelect(item.url, item.title, item.type, item.id)}
                  className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3 text-sm transition-colors outline-none"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 border shadow-sm">
                    <History className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">{item.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{item.url}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {debouncedQuery.length < 2 && history.length === 0 && (
            <div className="py-14 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Search className="h-8 w-8 text-muted-foreground/30" />
              <p>Type at least 2 characters to search...</p>
            </div>
          )}

          {debouncedQuery.length >= 2 && !isLoading && data?.groups?.length === 0 && (
            <Command.Empty className="py-14 text-center text-sm text-muted-foreground">
              No results found for &quot;{debouncedQuery}&quot;.
            </Command.Empty>
          )}

          {data?.groups?.map((group) => (
            <Command.Group 
              key={group.group} 
              heading={group.group}
              className="text-muted-foreground [&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:py-1.5 [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-semibold"
            >
              {group.items.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  onSelect={() => handleSelect(item.url, item.title, item.type, item.id)}
                  className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3 text-sm transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground outline-none"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 border shadow-sm">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">{item.title}</span>
                    {item.excerpt && (
                      <span className="truncate text-xs text-muted-foreground">{item.excerpt}</span>
                    )}
                  </div>
                  {item.isDraft && (
                    <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      Draft
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>

        <div className="flex flex-wrap items-center bg-muted/30 border-t px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            Search powered by Nazexa
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1.5 font-mono text-[10px] shadow-sm">↑</kbd>
              <kbd className="rounded border bg-background px-1.5 font-mono text-[10px] shadow-sm">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1.5 font-mono text-[10px] shadow-sm">↵</kbd>
              <span>to select</span>
            </div>
          </div>
        </div>
      </Command>
    </div>
  );
}
