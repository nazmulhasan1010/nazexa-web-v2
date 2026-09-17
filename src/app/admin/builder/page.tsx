'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Monitor,
  Plus,
  RotateCcw,
  Smartphone,
  Tablet,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { toast } from 'sonner';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  discardHomepageDraft,
  fetchHomeSections,
  fetchHomepageDraft,
  publishHomepage,
  saveHomepageDraft,
  type HomeSection,
} from '@/lib/cms';
import { SECTION_REGISTRY, SECTION_TYPES, sectionLabel } from '@/lib/home-sections';

export default BuilderPage;

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 834, mobile: 390 };

function newId() {
  return `new-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
}

function BuilderPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [baseline, setBaseline] = useState('[]');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [addOpen, setAddOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [leftWidth, setLeftWidth] = useState(440);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeReady = useRef(false);
  const sectionsRef = useRef<HomeSection[]>(sections);
  sectionsRef.current = sections;

  const dirty = useMemo(() => JSON.stringify(sections) !== baseline, [sections, baseline]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Load: prefer an existing draft, else the live homepage ──
  useEffect(() => {
    (async () => {
      try {
        const [live, draft] = await Promise.all([fetchHomeSections(), fetchHomepageDraft()]);
        const base = draft?.sections?.length ? draft.sections : (live ?? []);
        setSections(base);
        setBaseline(JSON.stringify(base));
        setHasDraft(Boolean(draft?.sections?.length));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Live preview sync (postMessage) ──
  const postToPreview = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'nazexa:preview', sections: sectionsRef.current },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string })?.type === 'nazexa:preview-ready') {
        iframeReady.current = true;
        postToPreview();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postToPreview]);

  useEffect(() => {
    if (iframeReady.current) postToPreview();
  }, [sections, postToPreview]);

  // ── Prevent accidental data loss ──
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // ── Mutations on the working draft ──
  function addSection(type: string) {
    const section: HomeSection = {
      id: newId(),
      type,
      position: sections.length,
      visible: true,
      title: null,
      subtitle: null,
      content: {},
    };
    setSections((prev) => [...prev, section]);
    setSelected(section.id);
    setAddOpen(false);
  }
  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }
  function toggleVisible(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }
  function patchTop(id: string, changes: Partial<HomeSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  }
  function patchContent(id: string, key: string, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s))
    );
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        return oldIndex < 0 || newIndex < 0 ? prev : arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // ── Persist ──
  async function saveDraft() {
    setSavingDraft(true);
    try {
      await saveHomepageDraft(sections);
      setBaseline(JSON.stringify(sections));
      setHasDraft(true);
      toast.success('Draft saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save draft');
    } finally {
      setSavingDraft(false);
    }
  }
  async function publish() {
    setPublishing(true);
    try {
      await publishHomepage(sections);
      const live = await fetchHomeSections();
      setSections(live ?? []);
      setBaseline(JSON.stringify(live ?? []));
      setHasDraft(false);
      toast.success('Published — the homepage is now live');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not publish');
    } finally {
      setPublishing(false);
    }
  }
  async function reset() {
    if (!confirm('Discard the current draft and restore the live homepage?')) return;
    try {
      await discardHomepageDraft();
      const live = await fetchHomeSections();
      setSections(live ?? []);
      setBaseline(JSON.stringify(live ?? []));
      setHasDraft(false);
      toast.success('Restored the live homepage');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not restore');
    }
  }

  // ── Split divider ──
  const dragging = useRef(false);
  function onDividerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onDividerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setLeftWidth((w) => Math.min(760, Math.max(320, w + e.movementX)));
  }
  function onDividerUp(e: React.PointerEvent) {
    dragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }

  const statusPill = dirty
    ? { label: 'Unsaved changes', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' }
    : hasDraft
      ? { label: 'Draft saved', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' }
      : { label: 'Published', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' };

  const deviceWidth = DEVICE_WIDTH[device];

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Homepage builder</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusPill.cls)}>
              {statusPill.label}
            </span>
            <span className="text-muted-foreground text-xs">
              Draft edits stay private until you publish.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted/50 mr-1 flex items-center rounded-md p-0.5">
            {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => {
              const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  aria-label={`${d} preview`}
                  className={cn(
                    'rounded p-1.5 transition-colors',
                    device === d
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={reset} disabled={publishing || savingDraft}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={savingDraft || publishing || !dirty}
          >
            {savingDraft ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <FaRegCircleCheck className="mr-1.5 h-4 w-4" />
            )}
            Save draft
          </Button>
          <Button
            size="sm"
            className="glow-ring"
            onClick={publish}
            disabled={publishing || savingDraft}
          >
            {publishing ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-1.5 h-4 w-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Split: editor | preview */}
      <div className="flex min-h-0 flex-1 gap-0">
        {/* Editor */}
        <div style={{ width: leftWidth }} className="flex min-h-0 shrink-0 flex-col">
          <div className="relative mb-3">
            <Button variant="outline" className="w-full" onClick={() => setAddOpen((o) => !o)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add section
            </Button>
            {addOpen && (
              <div className="bg-popover absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border p-1 shadow-lg">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addSection(type)}
                    className="hover:bg-accent flex w-full flex-col items-start rounded px-2 py-1.5 text-left"
                  >
                    <span className="text-sm font-medium">{sectionLabel(type)}</span>
                    <span className="text-muted-foreground text-xs">
                      {SECTION_REGISTRY[type]?.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <div className="border-border rounded-lg border border-dashed py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  No sections yet. Add one to get started.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        expanded={selected === section.id}
                        onToggleExpand={() =>
                          setSelected(selected === section.id ? null : section.id)
                        }
                        onToggleVisible={() => toggleVisible(section.id)}
                        onRemove={() => removeSection(section.id)}
                        onPatchTop={(c) => patchTop(section.id, c)}
                        onPatchContent={(k, v) => patchContent(section.id, k, v)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          onPointerDown={onDividerDown}
          onPointerMove={onDividerMove}
          onPointerUp={onDividerUp}
          className="group mx-1 flex w-2 shrink-0 cursor-col-resize items-center justify-center"
        >
          <div className="bg-border group-hover:bg-primary h-16 w-1 rounded-full transition-colors" />
        </div>

        {/* Preview */}
        <div className="bg-muted/30 flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border">
          <div className="text-muted-foreground flex items-center justify-between border-b px-3 py-1.5 text-xs">
            <span>Live preview</span>
            <span>{device === 'desktop' ? 'Responsive' : `${deviceWidth}px`}</span>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-auto p-3">
            <div
              className="h-full overflow-hidden rounded-md bg-white shadow-sm transition-all"
              style={{ width: deviceWidth ?? '100%', maxWidth: '100%' }}
            >
              <iframe
                ref={iframeRef}
                src="/preview/home"
                title="Homepage preview"
                className="h-full w-full border-0"
                onLoad={() => {
                  // If the child already announced readiness, this is a reload — resync.
                  if (iframeReady.current) postToPreview();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sortable section row ──
function SortableSection({
  section,
  expanded,
  onToggleExpand,
  onToggleVisible,
  onRemove,
  onPatchTop,
  onPatchContent,
}: {
  section: HomeSection;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  onPatchTop: (changes: Partial<HomeSection>) => void;
  onPatchContent: (key: string, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const def = SECTION_REGISTRY[section.type];
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'surface-card p-3 transition-opacity',
        isDragging && 'opacity-50',
        !section.visible && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 text-left"
          onClick={onToggleExpand}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <span className="font-medium">{def?.label ?? section.type}</span>
          {section.title && (
            <span className="text-muted-foreground ml-1 truncate text-sm">{section.title}</span>
          )}
        </button>
        {def?.dataSource && (
          <span
            className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]"
            title={`Content from “${def.dataSource}” collection`}
          >
            CMS
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleVisible}
          aria-label={section.visible ? 'Hide' : 'Show'}
        >
          {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
          onClick={onRemove}
          aria-label="Remove section"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && (
        <div className="border-border mt-3 grid gap-3 border-t pt-3">
          {(def?.editableFields ?? []).map((field) => {
            const value =
              field.scope === 'top'
                ? ((section[field.name as 'title' | 'subtitle'] as string | null) ?? '')
                : ((section.content[field.name] as string) ?? '');
            const onChange = (val: string) =>
              field.scope === 'top'
                ? onPatchTop({ [field.name]: val })
                : onPatchContent(field.name, val);
            return (
              <div key={`${field.scope}:${field.name}`} className="space-y-1.5">
                <Label className="text-xs">{field.label}</Label>
                {field.kind === 'textarea' ? (
                  <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
                ) : (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} />
                )}
              </div>
            );
          })}
          {def?.dataSource && (
            <p className="text-muted-foreground text-xs">
              Cards/items for this section come from the{' '}
              <span className="font-medium">“{def.dataSource}”</span> collection — edit them in the
              Content Library.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
