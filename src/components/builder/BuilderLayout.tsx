import React, { useState } from 'react';
import { TopToolbar } from './TopToolbar';
import { LeftSidebar } from './LeftSidebar';
import { RightInspector } from './RightInspector';
import { Canvas } from './Canvas';
import { useBuilderStore } from '@/lib/builder/store';
import { toast } from 'sonner';

export const BuilderLayout = ({ pageId }: { pageId: string }) => {
  const schema = useBuilderStore(s => s.schema);
  const mode = useBuilderStore(s => s.mode);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/builder/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftData: schema })
      });
      if (!res.ok) throw new Error('Failed to save draft');
      toast.success('Draft saved successfully');
    } catch (e) {
      toast.error('Error saving draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await handleSave(); // save draft first
      const res = await fetch(`/api/admin/builder/pages/${pageId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to publish');
      toast.success('Page published successfully');
    } catch (e) {
      toast.error('Error publishing page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <TopToolbar pageId={pageId} onSave={handleSave} onPublish={handlePublish} />
      <div className="flex-1 flex flex-row overflow-hidden">
        {mode === 'edit' && <LeftSidebar />}
        <Canvas />
        {mode === 'edit' && <RightInspector />}
      </div>
    </div>
  );
};
export default BuilderLayout;
