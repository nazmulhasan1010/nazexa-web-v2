import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutPanelLeft, Type, Image as ImageIcon, Box, Heading1, ListTree, Grid3x3, Tag, FileText, MinusSquare, Database, LayoutTemplate } from 'lucide-react';
import { ELEMENTS, ElementCategory } from '@/lib/builder/elements';
import { PRESETS } from '@/lib/builder/presets';
import { useDraggable } from '@dnd-kit/core';
import { contentRegistry } from '@/lib/builder/content-registry';

const getIcon = (name: string) => {
  switch (name) {
    case 'Layout': return LayoutPanelLeft;
    case 'Box': return Box;
    case 'Grid3X3': return Grid3x3;
    case 'Menu': return ListTree;
    case 'Type': return Type;
    case 'AlignLeft': return Type;
    case 'Tag': return Tag;
    case 'Image': return ImageIcon;
    case 'MousePointerClick': return LayoutPanelLeft;
    case 'FileText': return FileText;
    case 'MinusSquare': return MinusSquare;
    case 'Database': return Database;
    default: return Box;
  }
};

const DraggableItem = ({ id, label, icon: Icon, element }: { id: string, label: string, icon: any, element: any }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: { 
      isSidebarItem: true, 
      element 
    }
  });

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="outline"
      className="h-20 flex flex-col items-center justify-center space-y-2 cursor-grab active:cursor-grabbing"
    >
      <Icon className="h-6 w-6 text-muted-foreground" />
      <span className="text-xs">{label}</span>
    </Button>
  );
};

export const LeftSidebar = () => {
  const layoutElements = ELEMENTS.filter(e => e.category === 'layout');
  const typographyElements = ELEMENTS.filter(e => e.category === 'typography');
  const otherElements = ELEMENTS.filter(e => !['layout', 'typography'].includes(e.category));
  const contentSources = contentRegistry.getAll();

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full shrink-0">
      <Tabs defaultValue="elements" className="w-full h-full flex flex-col">
        <div className="px-2 py-2 border-b">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="elements" className="text-[10px] py-1.5 px-1">Elements</TabsTrigger>
            <TabsTrigger value="presets" className="text-[10px] py-1.5 px-1">Presets</TabsTrigger>
            <TabsTrigger value="content" className="text-[10px] py-1.5 px-1">Data</TabsTrigger>
            <TabsTrigger value="structure" className="text-[10px] py-1.5 px-1">Tree</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="elements" className="flex-1 overflow-y-auto p-4 m-0 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Layout</h3>
            <div className="grid grid-cols-3 gap-2">
              {layoutElements.map((el) => (
                <DraggableItem key={el.type} id={`new-${el.type}`} label={el.label} icon={getIcon(el.icon)} element={el.create()} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Typography</h3>
            <div className="grid grid-cols-3 gap-2">
              {typographyElements.map((el) => (
                <DraggableItem key={el.type} id={`new-${el.type}`} label={el.label} icon={getIcon(el.icon)} element={el.create()} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Media & Forms</h3>
            <div className="grid grid-cols-3 gap-2">
              {otherElements.map((el) => (
                <DraggableItem key={el.type} id={`new-${el.type}`} label={el.label} icon={getIcon(el.icon)} element={el.create()} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Layout Blocks</h3>
          <div className="space-y-3">
            {PRESETS.map((preset) => (
              <DraggableItem 
                key={preset.id} 
                id={`preset-${preset.id}`} 
                label={preset.name} 
                icon={LayoutTemplate} 
                element={preset.generate()} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
           <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dynamic Data Sources</h3>
           <p className="text-xs text-muted-foreground mb-4">Drag a source to the canvas to create a dynamic content block.</p>
           <div className="space-y-3">
             {contentSources.map((source) => (
                <DraggableItem 
                  key={source.key} 
                  id={`source-${source.key}`} 
                  label={source.label} 
                  icon={Database} 
                  element={{
                    type: 'DynamicContent',
                    props: { source: source.key, layout: 'grid', limit: 6 },
                    styles: {},
                    tailwindClasses: 'w-full py-8',
                    children: []
                  }} 
                />
             ))}
           </div>
        </TabsContent>
        
        <TabsContent value="structure" className="flex-1 overflow-y-auto p-4 m-0">
          <div className="flex flex-col h-full text-muted-foreground text-sm space-y-2">
            <p className="text-xs">Tree structure view (Implementation placeholder)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
