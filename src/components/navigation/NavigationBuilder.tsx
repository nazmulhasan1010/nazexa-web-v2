'use client';

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Edit2, Eye, EyeOff, ChevronDown, ChevronRight, LayoutGrid, CheckCircle2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { SmartItemSelector, SelectedNavItem } from './SmartItemSelector';
import { IconPicker } from './IconPicker';
import { DynamicIcon } from '@/components/DynamicIcon';
import type { NavMenu, NavItemWithChildren } from '@/lib/navigation';
import { cn } from '@/lib/utils';

function SortableItem({ item, onEdit, onDelete, children, hasChildren }: { item: any, onEdit: () => void, onDelete: () => void, children?: React.ReactNode, hasChildren: boolean }) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("bg-card border rounded-xl mb-4 shadow-sm transition-all overflow-hidden", isDragging && "shadow-xl border-primary/50 ring-1 ring-primary/20")}>
      <div className={cn("flex items-center justify-between p-4", isOpen && hasChildren ? "border-b bg-muted/20" : "")}>
        <div className="flex items-center gap-4 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground p-1 -ml-1 rounded-md hover:bg-muted transition-colors">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            {item.icon ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DynamicIcon name={item.icon} className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <LayoutGrid className="h-4 w-4" />
              </div>
            )}
            <div>
              <div className="font-semibold flex items-center gap-2">
                {item.label}
                {!item.isVisible && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">Hidden</Badge>}
              </div>
              {item.url ? (
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{item.url}</div>
              ) : (
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Dropdown Menu</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {hasChildren && (
            <Badge variant="outline" className="mr-2 font-normal bg-background">
              {item.children.length} sub-items
            </Badge>
          )}
          
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
          
          {hasChildren && (
            <div className="w-px h-6 bg-border mx-1" />
          )}
          
          {hasChildren && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Accordion Content */}
      <div className={cn("grid transition-all duration-200 ease-in-out", isOpen && hasChildren ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="p-4 bg-muted/10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableChildItem({ item, onEdit, onDelete }: { item: any, onEdit: () => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("group flex flex-col justify-between p-3 rounded-xl bg-background border shadow-sm hover:shadow-md transition-all hover:border-border", isDragging && "shadow-xl border-primary/50 ring-1 ring-primary/20")}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground -ml-1 p-1 rounded-md hover:bg-muted transition-colors shrink-0">
            <GripVertical className="h-4 w-4" />
          </div>
          {item.icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <DynamicIcon name={item.icon} className="h-3.5 w-3.5" />
            </div>
          )}
          <div className="text-sm font-semibold truncate" title={item.label}>{item.label}</div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border p-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit} title="Edit">
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onDelete} title="Delete">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="pl-8 flex-1 flex flex-col justify-end">
        {item.description && <div className="text-xs text-muted-foreground line-clamp-2 mb-1.5" title={item.description}>{item.description}</div>}
        <div className="text-[10px] font-mono text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded w-fit truncate max-w-full" title={item.url}>{item.url}</div>
      </div>
    </div>
  );
}

export function NavigationBuilder({ type }: { type: 'header' | 'footer' }) {
  const [menu, setMenu] = useState<NavMenu | null>(null);
  const [originalMenu, setOriginalMenu] = useState<NavMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/admin/navigation?type=${type}&status=draft`);
        const data = await res.json();
        setMenu(data);
        setOriginalMenu(JSON.parse(JSON.stringify(data)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [type]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading navigation...</div>;
  if (!menu) return <div className="p-8 text-center text-destructive">Failed to load navigation</div>;

  const items = menu.items || [];

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isTopLevel = items.some((i: any) => i.id === active.id);
    
    if (isTopLevel) {
      const oldIndex = items.findIndex((i: any) => i.id === active.id);
      const newIndex = items.findIndex((i: any) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        setMenu({ ...menu, items: newItems });
        setHasChanges(true);
      }
    } else {
      const parent = items.find((p: any) => p.children?.some((c: any) => c.id === active.id));
      if (parent) {
        const children = [...(parent.children || [])];
        const oldIndex = children.findIndex((c: any) => c.id === active.id);
        const newIndex = children.findIndex((c: any) => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const [removed] = children.splice(oldIndex, 1);
          children.splice(newIndex, 0, removed);
          const newItems = items.map((i: any) => i.id === parent.id ? { ...i, children } : i);
          setMenu({ ...menu, items: newItems });
          setHasChanges(true);
        }
      }
    }
  };

  const handleAdd = (parent: string | null = null) => {
    setEditingParentId(parent);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
  };

  const saveEdit = (updatedItem: any) => {
    const newItems = [...items];
    const isTop = newItems.some((i) => i.id === updatedItem.id);
    if (isTop) {
      const idx = newItems.findIndex((i) => i.id === updatedItem.id);
      newItems[idx] = { ...newItems[idx], ...updatedItem };
    } else {
      const parent = newItems.find((p) => p.children?.some((c: any) => c.id === updatedItem.id));
      if (parent) {
        const idx = parent.children.findIndex((c: any) => c.id === updatedItem.id);
        parent.children[idx] = { ...parent.children[idx], ...updatedItem };
      }
    }
    setMenu({ ...menu, items: newItems });
    setHasChanges(true);
    setEditingItem(null);
  };

  const handleSelect = (selected: SelectedNavItem) => {
    const newItem: NavItemWithChildren = {
      id: `new-${Date.now()}`,
      label: selected.label,
      url: selected.url,
      source: selected.source,
      sourceId: selected.sourceId,
      target: '_self',
      icon: null,
      description: null,
      order: 0,
      isVisible: true,
      metadata: null,
      children: []
    };

    const newItems = [...items];
    if (editingParentId) {
      const parentIndex = newItems.findIndex(i => i.id === editingParentId);
      if (parentIndex !== -1) {
        newItems[parentIndex].children = [...(newItems[parentIndex].children || []), newItem];
      }
    } else {
      newItems.push(newItem);
    }

    setMenu({ ...menu, items: newItems });
    setHasChanges(true);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, parentId: string | null) => {
    let newItems = [...items];
    if (parentId) {
      const parentIndex = newItems.findIndex(i => i.id === parentId);
      if (parentIndex !== -1) {
        newItems[parentIndex].children = newItems[parentIndex].children.filter(c => c.id !== id);
      }
    } else {
      newItems = newItems.filter(i => i.id !== id);
    }
    setMenu({ ...menu, items: newItems });
    setHasChanges(true);
  };

  const publishChanges = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/navigation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, items: menu.items })
      });

      await fetch(`/api/admin/navigation/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      setSaving(false);
      setHasChanges(false);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 py-4 mb-8 -mx-6 px-6 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Navigation Builder</h1>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                Editing <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0">{type}</Badge> menu
                {hasChanges && <span className="flex items-center text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />Unsaved Changes</span>}</div>
            </div>
            
            <div className="hidden md:block h-10 w-px bg-border"></div>
            
            <Tabs value={type} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="header" asChild>
                  <Link href="/admin/navigation/header" className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Header
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="footer" asChild>
                  <Link href="/admin/navigation/footer" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Footer
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-3">
            <Tabs value={type} className="md:hidden">
              <TabsList>
                <TabsTrigger value="header" asChild>
                  <Link href="/admin/navigation/header"><LayoutGrid className="w-4 h-4" /></Link>
                </TabsTrigger>
                <TabsTrigger value="footer" asChild>
                  <Link href="/admin/navigation/footer"><Layers className="w-4 h-4" /></Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={() => window.open('/', '_blank')} className="shadow-sm bg-background">
              Preview
            </Button>
            <Button onClick={publishChanges} disabled={saving || !hasChanges} className="shadow-sm glow-ring">
              {saving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {items.map((item: any) => (
                <SortableItem 
                  key={item.id} 
                  item={item} 
                  onEdit={() => handleEdit(item)} 
                  onDelete={() => handleDelete(item.id, null)}
                  hasChildren={item.children && item.children.length > 0}
                >
                  {item.children && item.children.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <SortableContext items={item.children.map((c: any) => c.id)} strategy={rectSortingStrategy}>
                        {item.children.map((child: any) => (
                          <SortableChildItem key={child.id} item={child} onEdit={() => handleEdit(child)} onDelete={() => handleDelete(child.id, item.id)} />
                        ))}
                      </SortableContext>
                      
                      {/* Add Submenu Button */}
                      <button 
                        onClick={() => handleAdd(item.id)}
                        className="group flex flex-col items-center justify-center gap-2 min-h-[90px] rounded-xl border-2 border-dashed border-border/50 bg-background/50 hover:bg-muted hover:border-primary/30 transition-all text-muted-foreground hover:text-primary"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                          <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium">Add Submenu</span>
                      </button>
                    </div>
                  )}
                  
                  {(!item.children || item.children.length === 0) && (
                     <div className="flex justify-center p-4">
                        <Button variant="outline" size="sm" onClick={() => handleAdd(item.id)} className="shadow-sm">
                          <Plus className="h-3 w-3 mr-2" /> Convert to Dropdown (Add Submenu)
                        </Button>
                     </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button onClick={() => handleAdd(null)} className="mt-8 w-full py-6 border-dashed border-2 hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm bg-card" variant="outline">
          <Plus className="h-5 w-5 mr-2" /> Add Top-Level Menu
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Navigation Item</DialogTitle>
          </DialogHeader>
          <SmartItemSelector onSelect={handleSelect} onCancel={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Navigation Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input 
                  value={editingItem.label} 
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input 
                  value={editingItem.url || ''} 
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input 
                  value={editingItem.description || ''} 
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker 
                  value={editingItem.icon} 
                  onChange={(icon) => setEditingItem({ ...editingItem, icon })} 
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label className="cursor-pointer" htmlFor="isVisible">Visible to users</Label>
                <Button 
                  id="isVisible"
                  variant="outline" 
                  size="sm" 
                  className={editingItem.isVisible ? 'text-primary border-primary/20 bg-primary/5' : 'text-muted-foreground'}
                  onClick={() => setEditingItem({ ...editingItem, isVisible: !editingItem.isVisible })}
                >
                  {editingItem.isVisible ? <><Eye className="h-4 w-4 mr-2" /> Visible</> : <><EyeOff className="h-4 w-4 mr-2" /> Hidden</>}
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={() => saveEdit(editingItem)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


