'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { compileEmailHtmlV2 } from '@/lib/email/compiler-v2';
import { renderTemplateString } from '@/lib/email/renderer';
import { EMAIL_VARIABLES } from '@/lib/email/variables';
import type { EmailDesignV2 } from '@/lib/email/schema';
import { Eye, Monitor, Tablet, Smartphone } from 'lucide-react';

type Viewport = 'desktop' | 'tablet' | 'mobile';
const WIDTHS: Record<Viewport, number> = { desktop: 600, tablet: 480, mobile: 375 };

// Build mock context from example values
const MOCK_CONTEXT = EMAIL_VARIABLES.reduce((acc, v) => {
  const parts = v.key.split('.');
  if (parts.length === 1) acc[parts[0]] = v.exampleValue;
  else {
    if (!acc[parts[0]]) acc[parts[0]] = {};
    acc[parts[0]][parts[1]] = v.exampleValue;
  }
  return acc;
}, {} as Record<string, any>);

interface PreviewModalProps {
  design: EmailDesignV2;
}

export function PreviewModal({ design }: PreviewModalProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [open, setOpen] = useState(false);

  // Compile HTML with mock variables when opened
  const rawHtml = compileEmailHtmlV2(design);
  const previewHtml = renderTemplateString(rawHtml, MOCK_CONTEXT);

  const iframeWidth = WIDTHS[viewport];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Preview</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0">
          <DialogTitle className="text-sm font-semibold">Email Preview</DialogTitle>
          <div className="flex items-center gap-1 border rounded-md p-0.5">
            <Button
              variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewport('desktop')}
            >
              <Monitor className="h-3.5 w-3.5 mr-1" />Desktop
            </Button>
            <Button
              variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewport('tablet')}
            >
              <Tablet className="h-3.5 w-3.5 mr-1" />Tablet
            </Button>
            <Button
              variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewport('mobile')}
            >
              <Smartphone className="h-3.5 w-3.5 mr-1" />Mobile
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-zinc-100 flex items-start justify-center p-8">
          <div
            style={{ width: iframeWidth, transition: 'width 0.2s ease', maxWidth: '100%' }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <iframe
              srcDoc={previewHtml}
              style={{ width: '100%', minHeight: 600, border: 'none', display: 'block' }}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
        <div className="shrink-0 px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
          Preview uses sample variable values. Actual emails will use real recipient data.
        </div>
      </DialogContent>
    </Dialog>
  );
}
