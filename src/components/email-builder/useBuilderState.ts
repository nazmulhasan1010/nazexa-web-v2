'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  EmailDesignV2,
  EmailSection,
  EmailColumn,
  EmailBlockV2,
  ColumnLayout,
  BlockType,
} from '@/lib/email/schema';
import {
  generateId,
  createDefaultSection,
  layoutToWidths,
} from '@/lib/email/schema';

// ─── Default Block Factories ──────────────────────────────────────────────────

export function createDefaultBlock(type: BlockType, settings: EmailDesignV2['settings']): EmailBlockV2 {
  const id = generateId();
  const base = { id, style: {} };
  switch (type) {
    case 'heading':
      return { ...base, type: 'heading', content: { text: 'Your Heading Here', level: 2 }, typography: { textAlign: 'left', fontSize: 24, fontWeight: '700', color: settings.textColor } };
    case 'subheading':
      return { ...base, type: 'subheading', content: { text: 'Your subheading goes here' }, typography: { textAlign: 'left', fontSize: 18, fontWeight: '600', color: settings.textColor } };
    case 'text':
      return { ...base, type: 'text', content: { text: 'Your text content goes here. You can use {{user.firstName}} and other variables.' }, typography: { textAlign: 'left', fontSize: 16, lineHeight: 1.6, color: settings.textColor } };
    case 'richtext':
      return { ...base, type: 'richtext', content: { html: '<p>Your <strong>rich text</strong> content goes here.</p>' }, typography: { fontSize: 16, lineHeight: 1.6, color: settings.textColor } };
    case 'quote':
      return { ...base, type: 'quote', content: { text: 'An inspiring quote or important message goes here.', attribution: 'Author Name' }, typography: { fontSize: 16, lineHeight: 1.6, color: settings.textColor } };
    case 'button':
      return {
        ...base, type: 'button',
        content: { text: 'Click Here', url: '#' },
        typography: { fontSize: 16, fontWeight: '500' },
        button: { backgroundColor: settings.primaryColor, textColor: '#ffffff', borderRadius: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, align: 'center' },
      };
    case 'button-group':
      return {
        ...base, type: 'button-group', align: 'center',
        buttons: [
          { id: generateId(), text: 'Primary', url: '#', backgroundColor: settings.primaryColor, textColor: '#ffffff', borderRadius: 6, variant: 'filled' },
          { id: generateId(), text: 'Secondary', url: '#', backgroundColor: settings.primaryColor, textColor: '#ffffff', borderRadius: 6, variant: 'outline' },
        ],
      };
    case 'image':
      return { ...base, type: 'image', content: { src: '', alt: '' }, image: { align: 'center' } };
    case 'logo':
      return { ...base, type: 'logo', content: { src: '', alt: 'Logo', link: '#' }, logo: { width: 120, align: 'center' } };
    case 'divider':
      return { ...base, type: 'divider', divider: { color: '#e4e4e7', height: 1, style: 'solid' } };
    case 'spacer':
      return { ...base, type: 'spacer', spacer: { height: 32 } };
    case 'social':
      return {
        ...base, type: 'social',
        links: [
          { id: generateId(), platform: 'facebook', url: '#', label: 'Facebook' },
          { id: generateId(), platform: 'instagram', url: '#', label: 'Instagram' },
          { id: generateId(), platform: 'x', url: '#', label: 'X' },
        ],
        social: { iconSize: 36, spacing: 8, align: 'center', shape: 'circle' },
      };
    case 'list':
      return { ...base, type: 'list', content: { items: ['First item', 'Second item', 'Third item'], ordered: false, bulletIcon: '✓' }, typography: { fontSize: 16, lineHeight: 1.6, color: settings.textColor } };
    case 'table':
      return {
        ...base, type: 'table',
        content: {
          hasHeader: true,
          rows: [
            { id: generateId(), cells: ['Column A', 'Column B', 'Column C'], isHeader: true },
            { id: generateId(), cells: ['Value 1', 'Value 2', 'Value 3'] },
            { id: generateId(), cells: ['Value 4', 'Value 5', 'Value 6'] },
          ],
        },
        table: { borderColor: '#e4e4e7', cellPadding: 10, headerBg: settings.primaryColor, headerColor: '#ffffff', stripedRows: true, align: 'left' },
      };
    case 'hero':
      return {
        ...base, type: 'hero',
        content: { backgroundColor: settings.primaryColor, overlayOpacity: 0.4, heading: 'Welcome to {{company.name}}', subheading: 'We\'re glad you\'re here', buttonText: 'Get Started', buttonUrl: '#', buttonColor: '#ffffff' },
        typography: { textAlign: 'center', color: '#ffffff' },
      };
    case 'announcement':
      return { ...base, type: 'announcement', content: { text: '🎉 Important announcement goes here', backgroundColor: '#fef3c7', textColor: '#92400e' }, typography: { fontSize: 15, fontWeight: '500' } };
    case 'coupon':
      return { ...base, type: 'coupon', content: { code: 'SAVE20', description: 'Use this code for 20% off your next purchase', expiresText: 'Expires December 31, 2026', backgroundColor: '#f0fdf4', borderColor: '#16a34a', codeColor: '#16a34a', textColor: '#166534' } };
    case 'testimonial':
      return { ...base, type: 'testimonial', content: { quote: 'This product has changed everything for us. Highly recommended!', author: 'Customer Name', role: 'CEO, Company', backgroundColor: '#f8fafc', textColor: '#1e293b' } };
    default:
      return { ...base, type: 'text', content: { text: '' }, typography: {} } as EmailBlockV2;
  }
}

// ─── History Stack ────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

// ─── Builder State Hook ───────────────────────────────────────────────────────

export type SelectionTarget = { sectionId: string; columnId?: string; blockId?: string } | null;

interface BuilderState {
  design: EmailDesignV2;
  selection: SelectionTarget;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isSaving: boolean;

  // Selection
  select: (target: SelectionTarget) => void;
  deselect: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Settings
  updateSettings: (updates: Partial<EmailDesignV2['settings']>) => void;

  // Sections
  addSection: (layout?: ColumnLayout) => void;
  updateSection: (sectionId: string, updates: Partial<EmailSection>) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: -1 | 1) => void;
  duplicateSection: (sectionId: string) => void;
  changeColumnLayout: (sectionId: string, layout: ColumnLayout) => void;

  // Blocks
  addBlock: (sectionId: string, columnId: string, type: BlockType) => void;
  updateBlock: (sectionId: string, columnId: string, blockId: string, updates: Partial<EmailBlockV2>) => void;
  deleteBlock: (sectionId: string, columnId: string, blockId: string) => void;
  moveBlock: (sectionId: string, columnId: string, blockId: string, direction: -1 | 1) => void;
  duplicateBlock: (sectionId: string, columnId: string, blockId: string) => void;

  // Columns
  updateColumn: (sectionId: string, columnId: string, updates: Partial<EmailColumn>) => void;

  // Full replace
  setDesign: (design: EmailDesignV2) => void;
  markSaved: () => void;
  setIsSaving: (v: boolean) => void;
}

export function useBuilderState(initialDesign: EmailDesignV2): BuilderState {
  const [design, setDesignState] = useState<EmailDesignV2>(initialDesign);
  const [selection, setSelection] = useState<SelectionTarget>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // History
  const history = useRef<EmailDesignV2[]>([initialDesign]);
  const historyIndex = useRef(0);

  const pushHistory = useCallback((newDesign: EmailDesignV2) => {
    // Truncate future if we've undone
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(newDesign);
    if (history.current.length > MAX_HISTORY) {
      history.current.shift();
    } else {
      historyIndex.current++;
    }
    setDesignState(newDesign);
    setIsDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      setDesignState(history.current[historyIndex.current]);
      setIsDirty(true);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      setDesignState(history.current[historyIndex.current]);
      setIsDirty(true);
    }
  }, []);

  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const mapSection = (d: EmailDesignV2, sectionId: string, fn: (s: EmailSection) => EmailSection): EmailDesignV2 => ({
    ...d,
    sections: d.sections.map(s => s.id === sectionId ? fn(s) : s),
  });

  const mapColumn = (d: EmailDesignV2, sectionId: string, columnId: string, fn: (c: EmailColumn) => EmailColumn): EmailDesignV2 =>
    mapSection(d, sectionId, s => ({
      ...s,
      columns: s.columns.map(c => c.id === columnId ? fn(c) : c),
    }));

  // ─── Settings ─────────────────────────────────────────────────────────────

  const updateSettings = useCallback((updates: Partial<EmailDesignV2['settings']>) => {
    pushHistory({ ...design, settings: { ...design.settings, ...updates } });
  }, [design, pushHistory]);

  // ─── Sections ─────────────────────────────────────────────────────────────

  const addSection = useCallback((layout: ColumnLayout = '100') => {
    const section = createDefaultSection(layout);
    pushHistory({ ...design, sections: [...design.sections, section] });
    setSelection({ sectionId: section.id });
  }, [design, pushHistory]);

  const updateSection = useCallback((sectionId: string, updates: Partial<EmailSection>) => {
    pushHistory(mapSection(design, sectionId, s => ({ ...s, ...updates })));
  }, [design, pushHistory]);

  const deleteSection = useCallback((sectionId: string) => {
    pushHistory({ ...design, sections: design.sections.filter(s => s.id !== sectionId) });
    if ((selection as any)?.sectionId === sectionId) setSelection(null);
  }, [design, pushHistory, selection]);

  const moveSection = useCallback((sectionId: string, direction: -1 | 1) => {
    const idx = design.sections.findIndex(s => s.id === sectionId);
    if (idx < 0) return;
    const newSections = [...design.sections];
    const target = idx + direction;
    if (target < 0 || target >= newSections.length) return;
    [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
    pushHistory({ ...design, sections: newSections });
  }, [design, pushHistory]);

  const duplicateSection = useCallback((sectionId: string) => {
    const idx = design.sections.findIndex(s => s.id === sectionId);
    if (idx < 0) return;
    const clone: EmailSection = JSON.parse(JSON.stringify(design.sections[idx]));
    clone.id = generateId();
    clone.columns = clone.columns.map(c => ({ ...c, id: generateId(), blocks: c.blocks.map(b => ({ ...b, id: generateId() })) }));
    const newSections = [...design.sections];
    newSections.splice(idx + 1, 0, clone);
    pushHistory({ ...design, sections: newSections });
  }, [design, pushHistory]);

  const changeColumnLayout = useCallback((sectionId: string, layout: ColumnLayout) => {
    pushHistory(mapSection(design, sectionId, s => {
      const widths = layoutToWidths(layout);
      const newColumns: EmailColumn[] = widths.map((w, i) => ({
        id: s.columns[i]?.id || generateId(),
        width: w,
        blocks: s.columns[i]?.blocks || [],
        style: s.columns[i]?.style || {},
      }));
      return { ...s, layout, columns: newColumns };
    }));
  }, [design, pushHistory]);

  // ─── Blocks ───────────────────────────────────────────────────────────────

  const addBlock = useCallback((sectionId: string, columnId: string, type: BlockType) => {
    const newBlock = createDefaultBlock(type, design.settings);
    const newDesign = mapColumn(design, sectionId, columnId, c => ({
      ...c, blocks: [...c.blocks, newBlock],
    }));
    pushHistory(newDesign);
    setSelection({ sectionId, columnId, blockId: newBlock.id });
  }, [design, pushHistory]);

  const updateBlock = useCallback((sectionId: string, columnId: string, blockId: string, updates: Partial<EmailBlockV2>) => {
    const newDesign = mapColumn(design, sectionId, columnId, c => ({
      ...c,
      blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...updates } as EmailBlockV2 : b),
    }));
    pushHistory(newDesign);
  }, [design, pushHistory]);

  const deleteBlock = useCallback((sectionId: string, columnId: string, blockId: string) => {
    const newDesign = mapColumn(design, sectionId, columnId, c => ({
      ...c, blocks: c.blocks.filter(b => b.id !== blockId),
    }));
    pushHistory(newDesign);
    if ((selection as any)?.blockId === blockId) setSelection({ sectionId, columnId });
  }, [design, pushHistory, selection]);

  const moveBlock = useCallback((sectionId: string, columnId: string, blockId: string, direction: -1 | 1) => {
    const section = design.sections.find(s => s.id === sectionId);
    const column = section?.columns.find(c => c.id === columnId);
    if (!column) return;
    const idx = column.blocks.findIndex(b => b.id === blockId);
    const target = idx + direction;
    if (target < 0 || target >= column.blocks.length) return;
    const newBlocks = [...column.blocks];
    [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
    pushHistory(mapColumn(design, sectionId, columnId, c => ({ ...c, blocks: newBlocks })));
  }, [design, pushHistory]);

  const duplicateBlock = useCallback((sectionId: string, columnId: string, blockId: string) => {
    const section = design.sections.find(s => s.id === sectionId);
    const column = section?.columns.find(c => c.id === columnId);
    if (!column) return;
    const idx = column.blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const clone: EmailBlockV2 = JSON.parse(JSON.stringify(column.blocks[idx]));
    clone.id = generateId();
    const newBlocks = [...column.blocks];
    newBlocks.splice(idx + 1, 0, clone);
    pushHistory(mapColumn(design, sectionId, columnId, c => ({ ...c, blocks: newBlocks })));
  }, [design, pushHistory]);

  // ─── Columns ──────────────────────────────────────────────────────────────

  const updateColumn = useCallback((sectionId: string, columnId: string, updates: Partial<EmailColumn>) => {
    pushHistory(mapColumn(design, sectionId, columnId, c => ({ ...c, ...updates })));
  }, [design, pushHistory]);

  // ─── Misc ─────────────────────────────────────────────────────────────────

  const setDesign = useCallback((newDesign: EmailDesignV2) => {
    history.current = [newDesign];
    historyIndex.current = 0;
    setDesignState(newDesign);
    setIsDirty(false);
  }, []);

  const markSaved = useCallback(() => setIsDirty(false), []);
  const setIsSavingFn = useCallback((v: boolean) => setIsSaving(v), []);

  return {
    design,
    selection,
    canUndo,
    canRedo,
    isDirty,
    isSaving,
    select: setSelection,
    deselect: () => setSelection(null),
    undo,
    redo,
    updateSettings,
    addSection,
    updateSection,
    deleteSection,
    moveSection,
    duplicateSection,
    changeColumnLayout,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    updateColumn,
    setDesign,
    markSaved,
    setIsSaving: setIsSavingFn,
  };
}
