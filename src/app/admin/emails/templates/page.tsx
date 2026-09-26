'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Edit2, Plus, Clock, FileText, CheckCircle2, ChevronRight, LayoutTemplate } from 'lucide-react';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/emails/templates')
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Server returned ' + res.status }));
          throw new Error(err.error || 'Failed to fetch templates');
        }
        return res.json();
      })
      .then(data => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load templates:', error);
        setLoading(false);
      });
  }, []);

  const createTemplate = async () => {
    const res = await fetch('/api/admin/emails/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Template',
        key: `template.${Date.now()}`,
      })
    });
    if (res.ok) {
      const { template } = await res.json();
      router.push(`/admin/emails/templates/${template.id}`);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-border/40">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">Manage and design your system-wide email layouts and notifications.</p>
        </div>
        <Button onClick={createTemplate} className="w-full sm:w-auto shadow-sm gap-2">
          <Plus className="w-4 h-4" /> Create New
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse shadow-sm h-64 border-border/50"></Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 shadow-none bg-muted/20">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <LayoutTemplate className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">No Templates Found</h2>
          <p className="text-muted-foreground max-w-md mt-2 mb-6">You haven't created any email templates yet. Start building your automated communication system now.</p>
          <Button onClick={createTemplate} size="lg"><Plus className="w-4 h-4 mr-2"/> Create First Template</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="group relative flex flex-col h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
              
              <CardHeader className="pb-3 flex-none relative z-30 bg-card border-b border-border/10">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <CardTitle className="text-xl truncate" title={tpl.name}>{tpl.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5" />
                      <code className="text-xs font-mono">{tpl.key}</code>
                    </CardDescription>
                  </div>
                  <Badge 
                    className="shadow-sm shrink-0" 
                    variant={tpl.status === 'published' ? 'default' : 'secondary'}
                  >
                    {tpl.status === 'published' ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Draft</span>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow relative z-30 bg-card">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject Line</span>
                    <p className="text-sm font-medium line-clamp-2">
                      {tpl.subject ? `"${tpl.subject}"` : <span className="text-muted-foreground italic">No subject defined</span>}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t bg-muted/10 gap-3 justify-between relative z-30 flex-wrap">
                <div className="text-xs text-muted-foreground font-medium w-full mb-1">
                  {tpl.category} • v{tpl.version}
                </div>
                <div className="flex gap-2 w-full">
                  <Button variant="default" size="sm" className="flex-1 shadow-sm h-8" onClick={() => router.push(`/admin/emails/templates/${tpl.id}/preview`)}>
                    Use / Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 shadow-sm group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors" onClick={() => router.push(`/admin/emails/templates/${tpl.id}`)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
