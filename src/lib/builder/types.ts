export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface BuilderElement {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: Partial<Record<Breakpoint, Record<string, any>>>;
  tailwindClasses: string;
  bindings?: Record<string, string>;
  children: BuilderElement[];
  name?: string;
  hidden?: boolean;
}

export interface PageSchema {
  version: number;
  root: BuilderElement;
}

export type BuilderMode = 'edit' | 'preview';
