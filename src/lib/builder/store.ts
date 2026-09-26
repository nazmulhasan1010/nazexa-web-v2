import { create } from 'zustand';
import { BuilderElement, Breakpoint, BuilderMode, PageSchema } from './types';
import { v4 as uuidv4 } from 'uuid';

interface BuilderState {
  // State
  mode: BuilderMode;
  breakpoint: Breakpoint;
  schema: PageSchema;
  selectedId: string | null;
  hoveredId: string | null;
  history: PageSchema[];
  historyIndex: number;
  
  // Actions
  setMode: (mode: BuilderMode) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setSchema: (schema: PageSchema) => void;
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;
  
  // Element Actions
  addElement: (parentId: string, element: Omit<BuilderElement, 'id'>, index?: number) => void;
  addTree: (parentId: string, element: BuilderElement, index?: number) => void;
  updateElement: (id: string, updates: Partial<BuilderElement>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, targetParentId: string, targetIndex: number) => void;
  duplicateElement: (id: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
}

const initialRoot: BuilderElement = {
  id: 'root',
  type: 'Page',
  props: {},
  styles: {},
  tailwindClasses: 'min-h-screen bg-background',
  children: []
};

// Deep clone helper
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useBuilderStore = create<BuilderState>()((set, get) => {
  const saveHistory = (newSchema: PageSchema) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(clone(newSchema));
    set({ history: newHistory, historyIndex: newHistory.length - 1, schema: newSchema });
  };

  const findElementAndParent = (
    root: BuilderElement, 
    id: string, 
    parent: BuilderElement | null = null,
    index: number = -1
  ): { element: BuilderElement; parent: BuilderElement | null; index: number } | null => {
    if (root.id === id) return { element: root, parent, index };
    for (let i = 0; i < root.children.length; i++) {
      const found = findElementAndParent(root.children[i], id, root, i);
      if (found) return found;
    }
    return null;
  };

  return {
    mode: 'edit',
    breakpoint: 'desktop',
    schema: { version: 1, root: clone(initialRoot) },
    selectedId: null,
    hoveredId: null,
    history: [{ version: 1, root: clone(initialRoot) }],
    historyIndex: 0,

    setMode: (mode) => set({ mode }),
    setBreakpoint: (breakpoint) => set({ breakpoint }),
    setSchema: (schema) => set({ schema, history: [clone(schema)], historyIndex: 0 }),
    selectElement: (selectedId) => set({ selectedId }),
    hoverElement: (hoveredId) => set({ hoveredId }),

    addElement: (parentId, element, index) => {
      const schema = clone(get().schema);
      const parentResult = findElementAndParent(schema.root, parentId);
      if (!parentResult) return;
      
      const newElement: BuilderElement = { ...element, id: uuidv4(), children: element.children || [] };
      if (index !== undefined) {
        parentResult.element.children.splice(index, 0, newElement);
      } else {
        parentResult.element.children.push(newElement);
      }
      saveHistory(schema);
    },

    addTree: (parentId, element, index) => {
      const schema = clone(get().schema);
      const parentResult = findElementAndParent(schema.root, parentId);
      if (!parentResult) return;
      
      if (index !== undefined) {
        parentResult.element.children.splice(index, 0, element);
      } else {
        parentResult.element.children.push(element);
      }
      saveHistory(schema);
    },

    duplicateElement: (id) => {
      if (id === 'root') return;
      const schema = clone(get().schema);
      const result = findElementAndParent(schema.root, id);
      if (!result || !result.parent) return;

      const regenerateIds = (el: BuilderElement): BuilderElement => {
        return {
          ...el,
          id: uuidv4(),
          children: el.children.map(regenerateIds)
        };
      };

      const cloned = regenerateIds(clone(result.element));
      result.parent.children.splice(result.index + 1, 0, cloned);
      saveHistory(schema);
    },

    updateElement: (id, updates) => {
      const schema = clone(get().schema);
      const result = findElementAndParent(schema.root, id);
      if (!result) return;
      
      Object.assign(result.element, updates);
      saveHistory(schema);
    },

    removeElement: (id) => {
      if (id === 'root') return; // Can't delete root
      const schema = clone(get().schema);
      const result = findElementAndParent(schema.root, id);
      if (!result || !result.parent) return;
      
      result.parent.children.splice(result.index, 1);
      set({ selectedId: null });
      saveHistory(schema);
    },

    moveElement: (id, targetParentId, targetIndex) => {
      if (id === 'root' || id === targetParentId) return;
      const schema = clone(get().schema);
      
      const sourceResult = findElementAndParent(schema.root, id);
      if (!sourceResult || !sourceResult.parent) return;
      
      // Remove from source
      const [element] = sourceResult.parent.children.splice(sourceResult.index, 1);
      
      // Find target parent
      const targetResult = findElementAndParent(schema.root, targetParentId);
      if (!targetResult) return; // Note: In a real app we need to handle if we moved it inside itself (invalid)
      
      targetResult.element.children.splice(targetIndex, 0, element);
      saveHistory(schema);
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        set({ historyIndex: historyIndex - 1, schema: clone(history[historyIndex - 1]) });
      }
    },
    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        set({ historyIndex: historyIndex + 1, schema: clone(history[historyIndex + 1]) });
      }
    }
  };
});

