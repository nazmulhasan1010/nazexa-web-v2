import React from 'react';
import { BuilderElement } from './types';
import { COMPONENT_REGISTRY } from './registry';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import Link from 'next/link';

interface RendererProps {
  element: BuilderElement;
  dynamicData?: Record<string, any>;
  isEditMode?: boolean;
}

export async function Renderer({ element, dynamicData = {}, isEditMode = false }: RendererProps) {
  // If it's a structural root page component but not in registry
  if (element.type === 'Page' || element.type === 'Section' || element.type === 'Container' || element.type === 'Grid' || element.type === 'Flex' || element.type === 'Form') {
    const Tag = element.type === 'Form' ? 'form' : 'div';
    return (
      <Tag className={cn(element.tailwindClasses)} {...(element.props || {})}>
        {await Promise.all(element.children.map(async (child) => (
          <Renderer key={child.id} element={child} dynamicData={dynamicData} isEditMode={isEditMode} />
        )))}
      </Tag>
    );
  }

  // Handle DynamicContent
  if (element.type === 'DynamicContent') {
    const { source, limit, layout } = element.props;
    let items: any[] = [];
    
    if (source === 'job_postings') {
      items = await db.jobPosting.findMany({
        where: { published: true },
        orderBy: { posted_at: 'desc' },
        take: limit || 6
      });
    } else if (source === 'content_items') {
      items = await db.contentItem.findMany({
        where: { published: true },
        orderBy: { created_at: 'desc' },
        take: limit || 6
      });
    } else if (source === 'resources') {
      items = await db.resource.findMany({
        where: { published: true },
        orderBy: { created_at: 'desc' },
        take: limit || 6
      });
    }
    
    if (layout === 'grid') {
      return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", element.tailwindClasses)}>
          {items.map(item => (
            <div key={item.id} className="flex flex-col border rounded-xl overflow-hidden shadow-sm bg-card text-card-foreground">
              {item.image_url && <img src={item.image_url} alt={item.title || ''} className="w-full h-48 object-cover" />}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold leading-tight mb-2">{item.title}</h3>
                {item.excerpt && <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.excerpt}</p>}
                {item.subtitle && <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.subtitle}</p>}
                <div className="mt-auto pt-4">
                  <Link href={`/${item.slug}`} className="text-sm font-medium text-primary hover:underline">
                    Read more →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (layout === 'list') {
      return (
        <div className={cn("space-y-4", element.tailwindClasses)}>
          {items.map(item => (
             <div key={item.id} className="flex flex-col sm:flex-row border rounded-xl overflow-hidden shadow-sm bg-card text-card-foreground">
               {item.image_url && <img src={item.image_url} alt={item.title || ''} className="w-full sm:w-48 h-48 sm:h-auto object-cover" />}
               <div className="p-6 flex flex-col flex-1">
                 <h3 className="text-xl font-semibold leading-tight mb-2">{item.title}</h3>
                 {(item.excerpt || item.subtitle) && <p className="text-muted-foreground text-sm mb-4">{(item.excerpt || item.subtitle)}</p>}
                 <div className="mt-auto pt-4">
                   <Link href={`/${item.slug}`} className="text-sm font-medium text-primary hover:underline">
                     View details →
                   </Link>
                 </div>
               </div>
             </div>
          ))}
        </div>
      );
    }
    
    // Default fallback
    return <div className="p-4 bg-muted border">Dynamic Content ({source}) loaded {items.length} items.</div>;
  }

  const registeredComponent = COMPONENT_REGISTRY[element.type];
  
  if (!registeredComponent) {
    // If not registered but we know basic types like Badge, Input
    if (element.type === 'Badge') {
      return <span className={cn(element.tailwindClasses)}>{element.props.text}</span>;
    }
    if (element.type === 'Input') {
      return <input type={element.props.type || 'text'} placeholder={element.props.placeholder} name={element.props.name} className={cn(element.tailwindClasses)} />;
    }
    if (isEditMode) return <div className="p-4 border border-red-500 text-red-500">Unknown component: {element.type}</div>;
    return null;
  }

  // Resolve bindings
  const resolvedProps = { ...element.props };
  if (element.bindings) {
    for (const [propName, bindingPath] of Object.entries(element.bindings)) {
      const value = bindingPath.split('.').reduce((acc, part) => acc && acc[part], dynamicData);
      if (value !== undefined) {
        resolvedProps[propName] = value;
      }
    }
  }

  // Render children
  const childrenNodes = await Promise.all(element.children.map(async (child) => (
    <Renderer key={child.id} element={child} dynamicData={dynamicData} isEditMode={isEditMode} />
  )));

  // Render the registered component
  return registeredComponent.render({ 
    ...resolvedProps, 
    className: cn(element.tailwindClasses) 
  }, childrenNodes);
}
