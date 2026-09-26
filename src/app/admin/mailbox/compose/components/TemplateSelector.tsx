'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, LayoutTemplate } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EmailTemplateBrief {
  id: string;
  name: string;
  key: string;
  category: string;
  subject: string;
  description: string | null;
  status: string;
}

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplateBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  useEffect(() => {
    if (open && templates.length === 0) {
      setLoading(true);
      fetch('/api/admin/emails/templates')
        .then(res => res.json())
        .then(data => {
          // Only show published templates
          const published = (data.templates || []).filter((t: any) => t.status === 'published');
          setTemplates(published);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, templates.length]);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.key.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shrink-0">
          <LayoutTemplate className="h-4 w-4" />
          Use Email Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Select Email Template</DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b bg-muted/30 shrink-0 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-9 bg-background"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1">
            {categories.map(c => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="rounded-full px-4"
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading templates...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No templates found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setOpen(false);
                    onSelect(t.id);
                  }}
                  className="flex flex-col text-left p-4 border rounded-xl hover:border-primary hover:shadow-md transition-all bg-card"
                >
                  <div className="flex justify-between items-start w-full mb-2">
                    <span className="font-semibold text-base text-foreground line-clamp-1">{t.name}</span>
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold shrink-0">
                      {t.category}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mb-3">{t.key}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-auto">
                    {t.description || t.subject}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
