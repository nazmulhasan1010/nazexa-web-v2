'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { compileEmailHtmlV2 } from '@/lib/email/compiler-v2';
import type { EmailDesignV2, BlockType } from '@/lib/email/schema';
import { useBuilderState } from './useBuilderState';
import { BlockLibrarySidebar } from './BlockLibrarySidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PreviewModal } from './PreviewModal';
import { CompatibilityChecker } from './CompatibilityChecker';
import { TestEmailModal } from './TestEmailModal';
import {
  Undo2, Redo2, Save, Send, AlertTriangle, ArrowLeft, Loader2,
} from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  key: string;
  subject: string;
  category: string;
  status: string;
  version: number;
}

interface BuilderShellProps {
  templateId: string;
  initialTemplate: TemplateData;
  initialDesign: EmailDesignV2;
}

export function BuilderShell({ templateId, initialTemplate, initialDesign }: BuilderShellProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateData>(initialTemplate);
  const [checkOpen, setCheckOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const state = useBuilderState(initialDesign);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); state.undo(); }
      if (ctrl && e.key === 'z' && e.shiftKey) { e.preventDefault(); state.redo(); }
      if (ctrl && e.key === 's') { e.preventDefault(); save(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Autosave
  useEffect(() => {
    if (!state.isDirty) return;
    setSaveStatus('unsaved');
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      save(false, true); // silent autosave
    }, 3000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [state.design, state.isDirty]);

  const save = useCallback(async (isPublish = false, silent = false) => {
    setSaveStatus('saving');
    try {
      const html = compileEmailHtmlV2(state.design);
      const body = {
        ...template,
        contentHtml: html,
        designJson: JSON.stringify(state.design),
        status: isPublish ? 'published' : 'draft',
      };

      const res = await fetch(`/api/admin/emails/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error || 'Validation failed');
      }

      if (isPublish) {
        await fetch(`/api/admin/emails/templates/${templateId}/publish`, { method: 'POST' });
        toast.success('Template published!');
        setTemplate(t => ({ ...t, status: 'published' }));
      } else if (!silent) {
        toast.success('Draft saved');
      }

      state.markSaved();
      setSaveStatus('saved');
    } catch (err: any) {
      setSaveStatus('unsaved');
      if (!silent) toast.error(err.message || 'Failed to save');
    }
  }, [state, template, templateId]);


  const sendTest = async (email: string) => {
    try {
      const res = await fetch('/api/admin/mailbox/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: 'default',
          to: [email],
          subject: `[TEST] ${template.subject || template.name}`,
          html: compileEmailHtmlV2(state.design),
          text: 'Test email from builder',
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      toast.success('Test email sent');
    } catch (err) {
      toast.error('Failed to send test email');
    }
  };

  // Resolve selected section/column for the block library
  const activeSectionId = state.selection?.sectionId || null;
  const activeColumnId = state.selection?.columnId || null;

  const handleAddBlock = (type: BlockType) => {
    if (!activeSectionId || !activeColumnId) return;
    state.addBlock(activeSectionId, activeColumnId, type);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-background shrink-0 min-h-[56px] h-auto">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/emails/templates')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Templates
        </Button>

        <div className="h-5 w-px bg-border" />

        {/* Template name */}
        <Input
          value={template.name}
          onChange={e => setTemplate(t => ({ ...t, name: e.target.value }))}
          className="h-7 text-sm font-medium border-0 shadow-none focus-visible:ring-0 px-1 w-48"
        />
        <Input
          value={template.subject}
          onChange={e => setTemplate(t => ({ ...t, subject: e.target.value }))}
          className="h-7 text-xs border-0 shadow-none focus-visible:ring-0 px-1 w-64 text-muted-foreground"
          placeholder="Email subject..."
        />

        <Badge variant={template.status === 'published' ? 'default' : 'secondary'} className="text-xs">
          {template.status}
        </Badge>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Save status */}
          <span className="text-xs text-muted-foreground">
            {saveStatus === 'saving' && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving...</span>}
            {saveStatus === 'unsaved' && 'Unsaved changes'}
            {saveStatus === 'saved' && 'Saved'}
          </span>

          <div className="h-4 w-px bg-border" />

          {/* Undo/Redo */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={state.undo} disabled={!state.canUndo} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={state.redo} disabled={!state.canRedo} title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Compatibility check */}
          <Popover open={checkOpen} onOpenChange={setCheckOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />Check
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b font-medium text-sm">Pre-publish Check</div>
              <CompatibilityChecker design={state.design} subject={template.subject} />
            </PopoverContent>
          </Popover>

          {/* Preview */}
          <PreviewModal design={state.design} />

          {/* Test email */}
          <TestEmailModal onSendTest={sendTest}>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Send className="h-3.5 w-3.5 mr-1" />Test
            </Button>
          </TestEmailModal>

          {/* Save Draft */}
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => save(false)}>
            <Save className="h-3.5 w-3.5 mr-1" />Save Draft
          </Button>

          {/* Publish */}
          <Button size="sm" className="h-7 text-xs" onClick={() => save(true)}>
            Publish
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
        {/* Left: block library */}
        <BlockLibrarySidebar
          onAddBlock={handleAddBlock}
          activeSectionId={activeSectionId}
          activeColumnId={activeColumnId}
        />

        {/* Center: canvas */}
        <Canvas
          design={state.design}
          selection={state.selection}
          onSelect={state.select}
          onDeselect={state.deselect}
          onMoveSection={state.moveSection}
          onDeleteSection={state.deleteSection}
          onDuplicateSection={state.duplicateSection}
          onAddSection={() => state.addSection('100')}
          onMoveBlock={state.moveBlock}
          onDeleteBlock={state.deleteBlock}
          onDuplicateBlock={state.duplicateBlock}
          onUpdateColumn={state.updateColumn}
        />

        {/* Right: properties */}
        <PropertiesPanel
          selection={state.selection}
          design={state.design}
          onUpdateSettings={state.updateSettings}
          onUpdateBlock={state.updateBlock}
          onUpdateSection={state.updateSection}
          onUpdateColumn={state.updateColumn}
          onChangeLayout={state.changeColumnLayout}
        />
      </div>
    </div>
  );
}
