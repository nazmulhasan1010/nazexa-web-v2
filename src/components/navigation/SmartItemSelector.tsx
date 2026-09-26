'use client';

import { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, FileText, ChevronRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export type SelectedNavItem = {
  label: string;
  url: string;
  source: string | null;
  sourceId: string | null;
};

interface SmartItemSelectorProps {
  onSelect: (item: SelectedNavItem) => void;
  onCancel: () => void;
}

export function SmartItemSelector({ onSelect, onCancel }: SmartItemSelectorProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Custom link state
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/navigation/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel || !customUrl) return;
    onSelect({
      label: customLabel,
      url: customUrl,
      source: 'custom',
      sourceId: null
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, posts, documents..."
            className="pl-9"
            autoFocus
          />
        </div>
        
        {loading && <div className="text-sm text-muted-foreground text-center py-4">Searching...</div>}
        
        {!loading && query && results.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">No results found.</div>
        )}

        {!loading && results.length > 0 && (
          <div className="border rounded-md divide-y max-h-[250px] overflow-y-auto">
            {results.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect({
                  label: item.label,
                  url: item.url,
                  source: item.source,
                  sourceId: item.sourceId
                })}
                className="w-full flex items-center justify-between p-3 hover:bg-muted text-left transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded-full">
                    {item.category || item.source}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or add custom link</span>
        </div>
      </div>

      <form onSubmit={handleCustomSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input 
              value={customLabel} 
              onChange={(e) => setCustomLabel(e.target.value)} 
              placeholder="e.g. My Website" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input 
              value={customUrl} 
              onChange={(e) => setCustomUrl(e.target.value)} 
              placeholder="https://..." 
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={!customLabel || !customUrl}>Add Custom Link</Button>
        </div>
      </form>
    </div>
  );
}
