'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit2, Code, Mail, Copy, CheckCircle2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { toast } from 'sonner';

export default function TemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    fetch(`/api/admin/emails/templates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.template) setTemplate(data.template);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const copyKey = () => {
    if (template) {
      navigator.clipboard.writeText(template.key);
      setCopied(true);
      toast.success('Template key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading preview...</div>;
  }

  if (!template) {
    return <div className="p-8 text-center text-red-500">Template not found.</div>;
  }

  const deviceWidth = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full space-y-0">
      {/* Topbar: Preview Controls & Actions */}
      <div className="bg-background flex shrink-0 items-center justify-between gap-4 border-b p-2 px-4 md:px-8">
        <div className="flex shrink-0 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center rounded-md border p-1">
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={device === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="hidden md:flex flex-col">
            <div className="text-sm font-bold flex items-center gap-2">
              {template.name}
              <Badge variant={template.status === 'published' ? 'default' : 'secondary'} className="h-5 px-1.5 text-[10px]">{template.status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Code className="w-3 h-3" /> <span>{template.key}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyKey} className="gap-2">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Key
          </Button>
          <Button size="sm" onClick={() => router.push(`/admin/emails/templates/${id}`)} className="gap-2">
            <Edit2 className="w-3.5 h-3.5" />
            Edit Builder
          </Button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="bg-muted/30 px-8 py-3 border-b flex flex-col sm:flex-row sm:items-center gap-4 text-sm shrink-0">
        <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 hidden sm:block" />
        <div className="flex-1 flex gap-6">
          <p><span className="font-semibold text-muted-foreground mr-1">Subject:</span> {template.subject || <span className="italic text-muted-foreground">No subject set</span>}</p>
          <p><span className="font-semibold text-muted-foreground mr-1">Category:</span> {template.category}</p>
        </div>
      </div>

      {/* Iframe Canvas */}
      <div className="bg-muted/10 flex flex-1 items-start justify-center overflow-auto p-4 sm:p-5">
        <div
          className="bg-background overflow-hidden rounded-md border shadow-lg transition-all duration-300 ease-out"
          style={{ width: deviceWidth, height: '100%', maxHeight: '800px' }}
        >
          <iframe 
            className="w-full h-full border-0 bg-white" 
            srcDoc={template.contentHtml ? 
              (template.contentHtml.includes('name="viewport"') ? template.contentHtml : template.contentHtml.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">')) 
              : '<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">No content available</div>'}
            sandbox="allow-same-origin"
            title="Email Preview"
          />
        </div>
      </div>
    </div>
  );
}
