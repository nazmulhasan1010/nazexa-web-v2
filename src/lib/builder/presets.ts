import { BuilderElement } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface PresetBlock {
  id: string;
  name: string;
  category: 'hero' | 'features' | 'cta' | 'footer' | 'content';
  generate: () => BuilderElement;
}

export const PRESETS: PresetBlock[] = [
  {
    id: 'hero-1',
    name: 'Simple Hero',
    category: 'hero',
    generate: () => ({
      id: uuidv4(),
      type: 'Section',
      props: {},
      styles: {},
      tailwindClasses: 'w-full py-24 px-6 lg:px-8 bg-background text-center flex flex-col items-center justify-center',
      children: [
        {
          id: uuidv4(),
          type: 'Badge',
          props: { text: 'New Feature' },
          styles: {},
          tailwindClasses: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-primary/10 text-primary mb-6',
          children: []
        },
        {
          id: uuidv4(),
          type: 'Heading',
          props: { text: 'Build faster with our tools', tag: 'h1' },
          styles: {},
          tailwindClasses: 'text-4xl font-bold tracking-tight text-foreground sm:text-6xl max-w-2xl mx-auto',
          children: []
        },
        {
          id: uuidv4(),
          type: 'Text',
          props: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.' },
          styles: {},
          tailwindClasses: 'mt-6 text-lg leading-8 text-muted-foreground max-w-xl mx-auto',
          children: []
        },
        {
          id: uuidv4(),
          type: 'Flex',
          props: {},
          styles: {},
          tailwindClasses: 'mt-10 flex items-center justify-center gap-x-6',
          children: [
            {
              id: uuidv4(),
              type: 'Button',
              props: { text: 'Get Started', href: '#' },
              styles: {},
              tailwindClasses: 'rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              children: []
            },
            {
              id: uuidv4(),
              type: 'Button',
              props: { text: 'Learn more →', href: '#' },
              styles: {},
              tailwindClasses: 'text-sm font-semibold leading-6 text-foreground bg-transparent hover:bg-transparent',
              children: []
            }
          ]
        }
      ]
    })
  },
  {
    id: 'features-grid',
    name: 'Features Grid',
    category: 'features',
    generate: () => ({
      id: uuidv4(),
      type: 'Section',
      props: {},
      styles: {},
      tailwindClasses: 'w-full py-24 sm:py-32 bg-muted/30',
      children: [
        {
          id: uuidv4(),
          type: 'Container',
          props: {},
          styles: {},
          tailwindClasses: 'mx-auto max-w-7xl px-6 lg:px-8',
          children: [
            {
              id: uuidv4(),
              type: 'Grid',
              props: {},
              styles: {},
              tailwindClasses: 'grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16',
              children: Array.from({ length: 3 }).map((_, i) => ({
                id: uuidv4(),
                type: 'Flex',
                props: {},
                styles: {},
                tailwindClasses: 'flex flex-col gap-4 bg-background p-6 rounded-2xl shadow-sm ring-1 ring-border',
                children: [
                  {
                    id: uuidv4(),
                    type: 'Heading',
                    props: { text: `Feature ${i + 1}`, tag: 'h3' },
                    styles: {},
                    tailwindClasses: 'text-lg font-semibold leading-8 text-foreground',
                    children: []
                  },
                  {
                    id: uuidv4(),
                    type: 'Text',
                    props: { text: 'Non quo aperiam repellendus quas est est. Eos aut dolore aut ut.' },
                    styles: {},
                    tailwindClasses: 'text-base leading-7 text-muted-foreground',
                    children: []
                  }
                ]
              }))
            }
          ]
        }
      ]
    })
  }
];
