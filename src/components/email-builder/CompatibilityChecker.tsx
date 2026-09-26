'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { EmailDesignV2, EmailBlockV2 } from '@/lib/email/schema';
import { validateTemplateVariables } from '@/lib/email/renderer';
import { compileEmailHtmlV2 } from '@/lib/email/compiler-v2';

interface Warning {
  level: 'error' | 'warning' | 'info';
  message: string;
  blockId?: string;
}

function analyzeDesign(design: EmailDesignV2, subject: string): Warning[] {
  const warnings: Warning[] = [];
  const allBlocks: EmailBlockV2[] = design.sections.flatMap(s => s.columns.flatMap(c => c.blocks));

  // Subject line
  if (!subject || subject.trim().length < 3) {
    warnings.push({ level: 'error', message: 'Email subject is missing or too short.' });
  }

  // Variable validation on full HTML
  const html = compileEmailHtmlV2(design);
  const varCheck = validateTemplateVariables(html + subject);
  varCheck.errors.forEach(e => warnings.push({ level: 'error', message: e }));

  // Empty canvas
  if (allBlocks.length === 0) {
    warnings.push({ level: 'warning', message: 'The email body is empty. Add at least one block.' });
  }

  allBlocks.forEach(block => {
    const id = block.id;
    // Images without alt text
    if ((block.type === 'image' || block.type === 'logo') && !block.content.alt) {
      warnings.push({ level: 'warning', message: `An image block is missing alt text (accessibility).`, blockId: id });
    }
    // Images without src
    if (block.type === 'image' && !block.content.src) {
      warnings.push({ level: 'error', message: `An image block has no source URL.`, blockId: id });
    }
    // Buttons without URL
    if (block.type === 'button' && (!block.content.url || block.content.url === '#')) {
      warnings.push({ level: 'warning', message: `A button "${block.content.text}" has no destination URL.`, blockId: id });
    }
    // Empty text
    if (block.type === 'text' && !block.content.text?.trim()) {
      warnings.push({ level: 'info', message: 'A text block is empty.', blockId: id });
    }
    // Empty headings
    if (block.type === 'heading' && !block.content.text?.trim()) {
      warnings.push({ level: 'warning', message: 'A heading block has no text.', blockId: id });
    }
    // Logo without src
    if (block.type === 'logo' && !block.content.src) {
      warnings.push({ level: 'warning', message: 'A logo block has no image set.', blockId: id });
    }
    // Social without URLs
    if (block.type === 'social') {
      block.links.forEach(link => {
        if (!link.url || link.url === '#') {
          warnings.push({ level: 'warning', message: `Social icon "${link.platform}" has no URL.`, blockId: id });
        }
      });
    }
  });

  return warnings;
}

interface CompatibilityCheckerProps {
  design: EmailDesignV2;
  subject: string;
  onClose?: () => void;
}

export function CompatibilityChecker({ design, subject, onClose }: CompatibilityCheckerProps) {
  const warnings = useMemo(() => analyzeDesign(design, subject), [design, subject]);
  const errors = warnings.filter(w => w.level === 'error');
  const warningItems = warnings.filter(w => w.level === 'warning');
  const infoItems = warnings.filter(w => w.level === 'info');

  const icons = {
    error: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  };

  return (
    <div className="p-4 space-y-4">
      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">All checks passed! Ready to publish.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/50">
              {icons[w.level]}
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span className="text-red-500">{errors.length} error{errors.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span className="text-amber-500">{warningItems.length} warning{warningItems.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span className="text-blue-500">{infoItems.length} note{infoItems.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
