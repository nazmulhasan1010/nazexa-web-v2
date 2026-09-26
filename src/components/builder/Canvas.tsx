import React, { useState } from 'react';
import { useBuilderStore } from '@/lib/builder/store';
import { BuilderElement } from '@/lib/builder/types';
import { cn } from '@/lib/utils';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { getElementDefinition } from '@/lib/builder/elements';

const RenderElement = ({ element, isOverlay = false }: { element: BuilderElement, isOverlay?: boolean }) => {
  const { selectedId, selectElement, mode } = useBuilderStore();
  const isPreview = mode === 'preview';
  
  const isSelected = selectedId === element.id && !isPreview;
  const isRoot = element.id === 'root';
  
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: element.id,
    data: { element },
    disabled: isPreview
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: element.id,
    data: { element },
    disabled: isPreview
  });

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    selectElement(element.id);
  };

  const setRefs = (node: HTMLElement | null) => {
    if (isPreview) return;
    if (isRoot) {
      setDroppableRef(node);
    } else {
      setDraggableRef(node);
      setDroppableRef(node);
    }
  };

  const isEmpty = element.children.length === 0 && (!element.tailwindClasses || element.tailwindClasses.trim() === '');
  const definition = getElementDefinition(element.type);
  const isLayout = definition?.category === 'layout';
  const canHaveChildren = isLayout || element.type === 'Page' || element.type === 'Form';

  let content = null;
  if (element.type === 'Text' || element.type === 'Heading' || element.type === 'Badge' || element.type === 'Button') {
    const Tag = element.props.tag || (element.type === 'Heading' ? 'h2' : (element.type === 'Button' ? 'button' : 'span'));
    content = <Tag>{element.props.text}</Tag>;
  } else if (element.type === 'Image') {
    content = <img src={element.props.src} alt={element.props.alt} className="w-full h-full object-cover" />;
  } else if (element.type === 'DynamicContent') {
    content = <div className="p-4 bg-muted border border-dashed flex items-center justify-center text-muted-foreground">Dynamic Content Placeholder: {element.props.source || 'No source'}</div>;
  }

  return (
    <div
      ref={isPreview ? null : setRefs}
      className={cn(
        element.tailwindClasses,
        !isRoot && 'relative',
        isSelected && !isRoot && 'ring-2 ring-blue-500 ring-inset',
        isOver && !isPreview && canHaveChildren && 'ring-2 ring-green-500 ring-inset bg-green-50/10',
        isDragging && !isPreview && 'opacity-30',
        isEmpty && !isRoot && !isPreview && 'min-h-[50px] min-w-[50px] border border-dashed border-gray-300'
      )}
      onClick={handleClick}
      {...(!isRoot && !isOverlay && !isPreview ? attributes : {})}
      {...(!isRoot && !isOverlay && !isPreview ? listeners : {})}
    >
      {isSelected && !isRoot && !isOverlay && !isPreview && (
        <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-t-sm z-10 whitespace-nowrap flex items-center gap-2">
          <span>{element.type}</span>
        </div>
      )}
      
      {content}
      
      {element.children.map((child: any) => (
        <RenderElement key={child.id} element={child} />
      ))}
      
      {canHaveChildren && element.children.length === 0 && !content && !isPreview && (
        <div className="pointer-events-none text-muted-foreground opacity-30 flex items-center justify-center min-h-[30px]">
          Empty {element.type}
        </div>
      )}
    </div>
  );
};

export const Canvas = () => {
  const { schema, breakpoint, selectElement, moveElement, addTree } = useBuilderStore();
  const [activeElement, setActiveElement] = useState<BuilderElement | null>(null);

  const getBreakpointWidth = () => {
    switch (breakpoint) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      case 'desktop': return 'max-w-full';
      default: return 'max-w-full';
    }
  };

  const handleDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.element) {
      setActiveElement(e.active.data.current.element as BuilderElement);
    } else if (e.active.data.current?.isSidebarItem) {
       // dragging from sidebar
       setActiveElement(e.active.data.current.element as BuilderElement);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveElement(null);
    const { active, over } = e;
    
    if (!over) return;
    
    const activeId = String(active.id);
    const overId = String(over.id);
    
    if (activeId === overId) return;

    const overElement = over.data.current?.element as BuilderElement | undefined;
    if (!overElement) return;
    
    const definition = getElementDefinition(overElement.type);
    const canHaveChildren = definition?.category === 'layout' || overElement.type === 'Page' || overElement.type === 'Form' || overElement.type === 'root';
    
    let targetParentId = overId;
    let targetIndex = 0; // Append by default or insert at 0

    if (!canHaveChildren) {
      // If we drop on a non-layout element, we probably want to insert it after this element
      // But for simplicity in this quick implementation, we will just not allow dropping on it
      // or we find its parent. Finding parent requires a utility.
      // For now, let's only allow dropping on containers.
      return; 
    }

    if (active.data.current?.isSidebarItem) {
      // It's a new element from sidebar
      addTree(targetParentId, active.data.current.element);
    } else {
      // Existing element
      moveElement(activeId, targetParentId, targetIndex);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div 
        className="flex-1 bg-muted/30 overflow-auto flex justify-center p-4 md:p-8"
        onClick={() => selectElement(null)} 
      >
        <div 
          className={cn(
            "w-full bg-white shadow-sm ring-1 ring-border transition-all duration-300 ease-in-out",
            getBreakpointWidth(),
            schema.root.tailwindClasses || "min-h-screen"
          )}
          onClick={(e) => {
            e.stopPropagation();
            selectElement(schema.root.id);
          }}
        >
          <RenderElement element={schema.root} />
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeElement ? (
          <div className="opacity-80 scale-95 origin-top-left pointer-events-none">
             <RenderElement element={activeElement} isOverlay={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
