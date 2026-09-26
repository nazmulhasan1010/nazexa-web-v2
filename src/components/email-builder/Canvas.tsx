'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { BlockPreview } from './BlockPreview';
import type { EmailDesignV2, EmailSection, EmailColumn, EmailBlockV2 } from '@/lib/email/schema';
import type { SelectionTarget } from './useBuilderState';
import {
  ArrowUp, ArrowDown, Trash2, Copy, GripVertical, Plus, Settings2,
  LayoutGrid,
} from 'lucide-react';

// ─── Sortable Block ───────────────────────────────────────────────────────────

interface SortableBlockProps {
  block: EmailBlockV2;
  index: number;
  total: number;
  sectionId: string;
  columnId: string;
  selected: boolean;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  settings: EmailDesignV2['settings'];
}

function SortableBlock({ block, index, total, sectionId, columnId, selected, onSelect, onMove, onDelete, onDuplicate, settings }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        ...style,
        touchAction: 'none'
      }}
      className={cn(
        "relative rounded-sm transition-all outline outline-2 outline-offset-[-2px]",
        selected ? "outline-primary z-10" : "outline-transparent hover:outline-border hover:z-10",
        isDragging && "opacity-50"
      )}
      onClick={e => { e.stopPropagation(); onSelect(); }}
    >
      {/* Block controls */}
      {selected && (
        <div className="absolute -top-7 right-0 z-10 flex items-center gap-0.5 bg-primary text-primary-foreground rounded-t-md px-1 py-0.5">
          <span className="text-[10px] font-medium px-1 opacity-75 capitalize">{block.type}</span>
          <div className="w-px h-3 bg-primary-foreground/30" />
          <button title="Move up" onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={index === 0} className="hover:bg-primary-foreground/20 p-0.5 rounded disabled:opacity-30">
            <ArrowUp className="h-3 w-3" />
          </button>
          <button title="Move down" onClick={e => { e.stopPropagation(); onMove(1); }} disabled={index === total - 1} className="hover:bg-primary-foreground/20 p-0.5 rounded disabled:opacity-30">
            <ArrowDown className="h-3 w-3" />
          </button>
          <button title="Duplicate" onClick={e => { e.stopPropagation(); onDuplicate(); }} className="hover:bg-primary-foreground/20 p-0.5 rounded">
            <Copy className="h-3 w-3" />
          </button>
          <button title="Delete" onClick={e => { e.stopPropagation(); onDelete(); }} className="hover:bg-red-500/80 p-0.5 rounded">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      <BlockPreview block={block} primaryColor={settings.primaryColor} textColor={settings.textColor} fontFamily={settings.fontFamily} />
    </div>
  );
}

// ─── Column Area ──────────────────────────────────────────────────────────────

interface ColumnAreaProps {
  column: EmailColumn;
  section: EmailSection;
  selection: SelectionTarget;
  onSelectBlock: (blockId: string) => void;
  onSelectColumn: () => void;
  onMoveBlock: (blockId: string, dir: -1 | 1) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onReorderBlocks: (blocks: EmailBlockV2[]) => void;
  settings: EmailDesignV2['settings'];
}

function ColumnArea({ column, section, selection, onSelectBlock, onSelectColumn, onMoveBlock, onDeleteBlock, onDuplicateBlock, onReorderBlocks, settings }: ColumnAreaProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = column.blocks.findIndex(b => b.id === active.id);
      const newIdx = column.blocks.findIndex(b => b.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        onReorderBlocks(arrayMove(column.blocks, oldIdx, newIdx));
      }
    }
  };

  const activeBlock = activeId ? column.blocks.find(b => b.id === activeId) : null;

  return (
    <div
      className="flex-1 min-h-[60px] relative"
      style={{ flex: `0 0 ${column.width}`, width: column.width }}
      onClick={e => { e.stopPropagation(); onSelectColumn(); }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={column.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[40px] space-y-0.5 p-0.5">
            {column.blocks.length === 0 && (
              <div className="h-12 flex items-center justify-center text-[11px] text-muted-foreground border-2 border-dashed border-border rounded-md">
                Drop blocks here
              </div>
            )}
            {column.blocks.map((block, i) => !block.hidden && (
              <SortableBlock
                key={block.id}
                block={block}
                index={i}
                total={column.blocks.length}
                sectionId={section.id}
                columnId={column.id}
                selected={selection?.blockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onMove={dir => onMoveBlock(block.id, dir)}
                onDelete={() => onDeleteBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                settings={settings}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeBlock && (
            <div className="opacity-80 shadow-xl rounded border-2 border-primary bg-white">
              <BlockPreview block={activeBlock} primaryColor={settings.primaryColor} textColor={settings.textColor} fontFamily={settings.fontFamily} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ─── Section Row ──────────────────────────────────────────────────────────────

interface SectionRowProps {
  section: EmailSection;
  index: number;
  total: number;
  selection: SelectionTarget;
  settings: EmailDesignV2['settings'];
  onSelectSection: () => void;
  onSelectColumn: (columnId: string) => void;
  onSelectBlock: (columnId: string, blockId: string) => void;
  onMoveSection: (dir: -1 | 1) => void;
  onDeleteSection: () => void;
  onDuplicateSection: () => void;
  onMoveBlock: (columnId: string, blockId: string, dir: -1 | 1) => void;
  onDeleteBlock: (columnId: string, blockId: string) => void;
  onDuplicateBlock: (columnId: string, blockId: string) => void;
  onUpdateColumn: (columnId: string, updates: any) => void;
}

function SectionRow({ section, index, total, selection, settings, onSelectSection, onSelectColumn, onSelectBlock, onMoveSection, onDeleteSection, onDuplicateSection, onMoveBlock, onDeleteBlock, onDuplicateBlock, onUpdateColumn }: SectionRowProps) {
  const isSelected = selection?.sectionId === section.id && !selection?.blockId;
  const s = section.style;
  const sectionBg = s.backgroundColor || 'transparent';

  return (
    <div
      className={`relative group/section border-2 rounded transition-all mb-1 ${isSelected ? 'border-primary' : 'border-transparent hover:border-border'}`}
      style={{ backgroundColor: sectionBg }}
      onClick={e => { e.stopPropagation(); onSelectSection(); }}
    >
      {/* Section controls */}
      <div className={`absolute -top-7 left-0 z-10 flex items-center gap-0.5 bg-secondary text-secondary-foreground rounded-t-md px-1 py-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100'}`}>
        <span className="text-[10px] font-medium px-1 opacity-75">Section</span>
        <div className="w-px h-3 bg-secondary-foreground/30" />
        <button title="Move up" onClick={e => { e.stopPropagation(); onMoveSection(-1); }} disabled={index === 0} className="hover:bg-secondary-foreground/20 p-0.5 rounded disabled:opacity-30">
          <ArrowUp className="h-3 w-3" />
        </button>
        <button title="Move down" onClick={e => { e.stopPropagation(); onMoveSection(1); }} disabled={index === total - 1} className="hover:bg-secondary-foreground/20 p-0.5 rounded disabled:opacity-30">
          <ArrowDown className="h-3 w-3" />
        </button>
        <button title="Duplicate section" onClick={e => { e.stopPropagation(); onDuplicateSection(); }} className="hover:bg-secondary-foreground/20 p-0.5 rounded">
          <Copy className="h-3 w-3" />
        </button>
        <button title="Section settings" onClick={e => { e.stopPropagation(); onSelectSection(); }} className="hover:bg-secondary-foreground/20 p-0.5 rounded">
          <Settings2 className="h-3 w-3" />
        </button>
        <button title="Delete section" onClick={e => { e.stopPropagation(); onDeleteSection(); }} className="hover:bg-red-500/80 text-red-500 hover:text-white p-0.5 rounded">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Columns */}
      <div className="flex gap-0.5 p-1" style={{ paddingTop: s.paddingTop, paddingBottom: s.paddingBottom, paddingLeft: s.paddingLeft, paddingRight: s.paddingRight }}>
        {section.columns.map(column => (
          <ColumnArea
            key={column.id}
            column={column}
            section={section}
            selection={selection}
            onSelectBlock={blockId => onSelectBlock(column.id, blockId)}
            onSelectColumn={() => onSelectColumn(column.id)}
            onMoveBlock={(blockId, dir) => onMoveBlock(column.id, blockId, dir)}
            onDeleteBlock={blockId => onDeleteBlock(column.id, blockId)}
            onDuplicateBlock={blockId => onDuplicateBlock(column.id, blockId)}
            onReorderBlocks={newBlocks => onUpdateColumn(column.id, { blocks: newBlocks })}
            settings={settings}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Canvas ──────────────────────────────────────────────────────────────

interface CanvasProps {
  design: EmailDesignV2;
  selection: SelectionTarget;
  onSelect: (target: SelectionTarget) => void;
  onDeselect: () => void;
  onMoveSection: (sectionId: string, dir: -1 | 1) => void;
  onDeleteSection: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onAddSection: () => void;
  onMoveBlock: (sectionId: string, columnId: string, blockId: string, dir: -1 | 1) => void;
  onDeleteBlock: (sectionId: string, columnId: string, blockId: string) => void;
  onDuplicateBlock: (sectionId: string, columnId: string, blockId: string) => void;
  onUpdateColumn: (sectionId: string, columnId: string, updates: any) => void;
}

export function Canvas({
  design, selection, onSelect, onDeselect,
  onMoveSection, onDeleteSection, onDuplicateSection, onAddSection,
  onMoveBlock, onDeleteBlock, onDuplicateBlock, onUpdateColumn,
}: CanvasProps) {
  const { settings, sections } = design;

  return (
    <div
      className="flex-1 overflow-y-auto flex justify-center"
      style={{ backgroundColor: '#e5e7eb' }}
      onClick={e => { if (e.target === e.currentTarget) onDeselect(); }}
    >
      <div className="py-8 w-full flex justify-center">
        <div
          style={{ width: settings.width, maxWidth: '100%', backgroundColor: settings.containerColor }}
          className="shadow-lg rounded-lg overflow-visible relative"
        >
          {/* Sections */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            {sections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <LayoutGrid className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Start building your email</p>
                <p className="text-xs mt-1">Click "Add Section" to get started</p>
              </div>
            )}
            {sections.map((section, i) => (
              <SectionRow
                key={section.id}
                section={section}
                index={i}
                total={sections.length}
                selection={selection}
                settings={settings}
                onSelectSection={() => onSelect({ sectionId: section.id })}
                onSelectColumn={columnId => onSelect({ sectionId: section.id, columnId })}
                onSelectBlock={(columnId, blockId) => onSelect({ sectionId: section.id, columnId, blockId })}
                onMoveSection={dir => onMoveSection(section.id, dir)}
                onDeleteSection={() => onDeleteSection(section.id)}
                onDuplicateSection={() => onDuplicateSection(section.id)}
                onMoveBlock={(columnId, blockId, dir) => onMoveBlock(section.id, columnId, blockId, dir)}
                onDeleteBlock={(columnId, blockId) => onDeleteBlock(section.id, columnId, blockId)}
                onDuplicateBlock={(columnId, blockId) => onDuplicateBlock(section.id, columnId, blockId)}
                onUpdateColumn={(columnId, updates) => onUpdateColumn(section.id, columnId, updates)}
              />
            ))}
          </div>

          {/* Add Section */}
          <div className="flex justify-center py-4">
            <Button variant="outline" size="sm" onClick={onAddSection} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />Add Section
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
