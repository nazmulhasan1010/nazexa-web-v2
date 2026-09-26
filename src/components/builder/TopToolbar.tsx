import React from 'react';
import { useBuilderStore } from '@/lib/builder/store';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Monitor, Tablet, Smartphone, Eye, PenTool, Save } from 'lucide-react';

export const TopToolbar = ({ pageId, onSave, onPublish }: { pageId: string, onSave: () => void, onPublish: () => void }) => {
  const {
    undo,
    redo,
    historyIndex,
    history,
    breakpoint,
    setBreakpoint,
    mode,
    setMode
  } = useBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2 border rounded-md p-1">
        <Button
          variant={breakpoint === 'desktop' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setBreakpoint('desktop')}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={breakpoint === 'tablet' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setBreakpoint('tablet')}
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={breakpoint === 'mobile' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setBreakpoint('mobile')}
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
        >
          {mode === 'edit' ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          ) : (
            <>
              <PenTool className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
        <Button size="sm" onClick={onSave} variant="outline" className="mr-2"><Save className="h-4 w-4 mr-2" /> Save Draft</Button><Button size="sm" onClick={onPublish}>
          <Save className="h-4 w-4 mr-2" />
          Publish
        </Button>
      </div>
    </div>
  );
};

