import React from 'react';
import { BuilderElement } from './types';

// Default components that the registry provides
export const COMPONENT_REGISTRY: Record<string, {
  name: string;
  defaultTailwind: string;
  defaultProps: Record<string, any>;
  render: (props: any, children: React.ReactNode) => React.ReactNode;
}> = {
  Container: {
    name: 'Container',
    defaultTailwind: 'flex flex-col p-4',
    defaultProps: {},
    render: (props, children) => React.createElement('div', props, children)
  },
  Heading: {
    name: 'Heading',
    defaultTailwind: 'text-4xl font-bold tracking-tight text-foreground',
    defaultProps: { tag: 'h2', text: 'Heading Text' },
    render: ({ tag, text, ...rest }, children) => {
      const Tag = (tag as any) || 'h2';
      return React.createElement(Tag, rest, text);
    }
  },
  Text: {
    name: 'Text',
    defaultTailwind: 'text-base text-muted-foreground leading-relaxed',
    defaultProps: { text: 'Add your text here.' },
    render: ({ text, ...rest }, children) => React.createElement('p', rest, text)
  },
  Button: {
    name: 'Button',
    defaultTailwind: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4',
    defaultProps: { text: 'Click Me' },
    render: ({ text, ...rest }, children) => React.createElement('button', rest, text)
  },
  Image: {
    name: 'Image',
    defaultTailwind: 'w-full h-auto rounded-lg object-cover',
    defaultProps: { src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809', alt: 'Placeholder' },
    render: ({ src, alt, ...rest }, children) => React.createElement('img', { src, alt, ...rest })
  }
};
