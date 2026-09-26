import React from 'react';
import { BuilderElement } from './types';
import { v4 as uuidv4 } from 'uuid';

export type ElementCategory = 'layout' | 'typography' | 'media' | 'form' | 'interactive';

export interface ElementDefinition {
  type: string;
  category: ElementCategory;
  label: string;
  icon: string; // lucide-react icon name as string for simplicity
  create: (overrides?: Partial<BuilderElement>) => Omit<BuilderElement, 'id'>;
  // This will be useful later for rendering specific components
}

export const ELEMENTS: ElementDefinition[] = [
  // Layout
  {
    type: 'Section',
    category: 'layout',
    label: 'Section',
    icon: 'Layout',
    create: () => ({
      type: 'Section',
      props: {},
      styles: {},
      tailwindClasses: 'w-full py-16 px-4 sm:px-6 lg:px-8',
      children: []
    })
  },
  {
    type: 'Container',
    category: 'layout',
    label: 'Container',
    icon: 'Box',
    create: () => ({
      type: 'Container',
      props: {},
      styles: {},
      tailwindClasses: 'max-w-7xl mx-auto w-full',
      children: []
    })
  },
  {
    type: 'Grid',
    category: 'layout',
    label: 'Grid',
    icon: 'Grid3X3',
    create: () => ({
      type: 'Grid',
      props: {},
      styles: {},
      tailwindClasses: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      children: []
    })
  },
  {
    type: 'Flex',
    category: 'layout',
    label: 'Flex',
    icon: 'Menu',
    create: () => ({
      type: 'Flex',
      props: {},
      styles: {},
      tailwindClasses: 'flex flex-col md:flex-row gap-4 items-center',
      children: []
    })
  },
  
  // Typography
  {
    type: 'Heading',
    category: 'typography',
    label: 'Heading',
    icon: 'Type',
    create: () => ({
      type: 'Heading',
      props: { text: 'New Heading', tag: 'h2' },
      styles: {},
      tailwindClasses: 'text-3xl font-bold tracking-tight text-foreground sm:text-4xl',
      children: []
    })
  },
  {
    type: 'Text',
    category: 'typography',
    label: 'Text',
    icon: 'AlignLeft',
    create: () => ({
      type: 'Text',
      props: { text: 'Enter your text here. This is a basic paragraph element.' },
      styles: {},
      tailwindClasses: 'text-base text-muted-foreground',
      children: []
    })
  },
  {
    type: 'Badge',
    category: 'typography',
    label: 'Badge',
    icon: 'Tag',
    create: () => ({
      type: 'Badge',
      props: { text: 'Badge' },
      styles: {},
      tailwindClasses: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary',
      children: []
    })
  },

  // Media
  {
    type: 'Image',
    category: 'media',
    label: 'Image',
    icon: 'Image',
    create: () => ({
      type: 'Image',
      props: { src: 'https://placehold.co/600x400', alt: 'Placeholder Image' },
      styles: {},
      tailwindClasses: 'w-full h-auto object-cover rounded-md',
      children: []
    })
  },
  {
    type: 'Button',
    category: 'interactive',
    label: 'Button',
    icon: 'MousePointerClick',
    create: () => ({
      type: 'Button',
      props: { text: 'Click Me', href: '#' },
      styles: {},
      tailwindClasses: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
      children: []
    })
  },

  // Form Elements
  {
    type: 'Form',
    category: 'form',
    label: 'Form',
    icon: 'FileText',
    create: () => ({
      type: 'Form',
      props: { action: '/api/submit' },
      styles: {},
      tailwindClasses: 'space-y-4 w-full max-w-md',
      children: []
    })
  },
  {
    type: 'Input',
    category: 'form',
    label: 'Input',
    icon: 'MinusSquare',
    create: () => ({
      type: 'Input',
      props: { type: 'text', placeholder: 'Enter text...', name: 'field' },
      styles: {},
      tailwindClasses: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      children: []
    })
  },

  // Dynamic Content (Crucial)
  {
    type: 'DynamicContent',
    category: 'interactive',
    label: 'Dynamic Content',
    icon: 'Database',
    create: () => ({
      type: 'DynamicContent',
      props: {
        source: '',
        layout: 'grid',
        limit: 3,
        mapping: {}
      },
      styles: {},
      tailwindClasses: 'w-full',
      children: []
    })
  }
];

export const getElementDefinition = (type: string) => {
  return ELEMENTS.find(e => e.type === type);
};
