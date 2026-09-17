import type { ReactNode } from 'react';

import type { HomeSection } from '@/lib/cms';
import {
  BlogPreview,
  FaqPreview,
  FeatureGrid,
  FinalCta,
  Hero,
  PlatformOverview,
  Stats,
  TechStack,
  Testimonials,
  Timeline,
  TrustedBy,
} from '@/components/home/HomeSections';
import {
  ClientCta,
  MissionVision,
  OwnProducts,
  ProcessSection,
  ServicesSection,
  TechnologiesSection,
  WhatWeDo,
  WhyNazexaSection,
} from '@/components/home/CompanySections';
import { ServicesShowcase } from '@/components/services/ServicesIndex';

// A single field the Homepage Builder can edit for a section.
// `scope: 'top'` → the HomeSection column (title/subtitle); `scope: 'content'` → a key in the JSON content blob.
export type SectionEditableField = {
  name: string;
  label: string;
  kind: 'text' | 'textarea';
  scope: 'top' | 'content';
};

export type SectionGroup = 'hero' | 'company' | 'marketing' | 'cta';

export type SectionDef = {
  type: string;
  label: string;
  description: string;
  group: SectionGroup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  editableFields: SectionEditableField[];
  /** The content_items collection that supplies this section's repeatable data, if any. */
  dataSource?: string;
  /** Maps a stored section to the props its component expects. Defaults to {title, subtitle, content}. */
  propsFrom?: (section: HomeSection) => Record<string, unknown>;
};

const TITLE_SUBTITLE: SectionEditableField[] = [
  { name: 'title', label: 'Title', kind: 'text', scope: 'top' },
  { name: 'subtitle', label: 'Subtitle', kind: 'text', scope: 'top' },
];

const CTA_FIELDS: SectionEditableField[] = [
  { name: 'primaryCta', label: 'Primary CTA label', kind: 'text', scope: 'content' },
  { name: 'primaryHref', label: 'Primary CTA link', kind: 'text', scope: 'content' },
  { name: 'secondaryCta', label: 'Secondary CTA label', kind: 'text', scope: 'content' },
  { name: 'secondaryHref', label: 'Secondary CTA link', kind: 'text', scope: 'content' },
];

const passThrough = (s: HomeSection) => ({
  title: s.title,
  subtitle: s.subtitle,
  content: s.content,
});

/**
 * The one place that maps a homepage section `type` to its component, editable fields, and data source.
 * Consumed by the public homepage (`src/app/page.tsx`), the fallback layout, and the builder live preview.
 */
export const SECTION_REGISTRY: Record<string, SectionDef> = {
  hero: {
    type: 'hero',
    label: 'Hero',
    description: 'Top-of-page headline, intro copy, and primary calls to action.',
    group: 'hero',
    component: Hero,
    editableFields: [
      ...TITLE_SUBTITLE,
      { name: 'badge', label: 'Badge', kind: 'text', scope: 'content' },
      { name: 'body', label: 'Body copy', kind: 'textarea', scope: 'content' },
      { name: 'primaryCta', label: 'Primary CTA label', kind: 'text', scope: 'content' },
      { name: 'secondaryCta', label: 'Secondary CTA label', kind: 'text', scope: 'content' },
    ],
    propsFrom: (s) => ({
      title: s.title ?? undefined,
      subtitle: s.subtitle ?? undefined,
      badge: (s.content['badge'] as string) || undefined,
      body: (s.content['body'] as string) || undefined,
      primaryCta: (s.content['primaryCta'] as string) || undefined,
      secondaryCta: (s.content['secondaryCta'] as string) || undefined,
    }),
  },
  trusted: {
    type: 'trusted',
    label: 'Trusted by',
    description: 'Logo strip of clients / brands.',
    group: 'marketing',
    component: TrustedBy,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'customers',
    propsFrom: passThrough,
  },
  whatwedo: {
    type: 'whatwedo',
    label: 'What we do',
    description: 'Core capability pillars.',
    group: 'company',
    component: WhatWeDo,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'pillars',
    propsFrom: passThrough,
  },
  services: {
    type: 'services',
    label: 'Services showcase',
    description: 'Compact services grid.',
    group: 'company',
    component: ServicesShowcase,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'services',
    propsFrom: passThrough,
  },
  servicesfull: {
    type: 'servicesfull',
    label: 'Services (detailed)',
    description: 'Full services section with badge and CTA.',
    group: 'company',
    component: ServicesSection,
    editableFields: [
      ...TITLE_SUBTITLE,
      { name: 'badge', label: 'Badge', kind: 'text', scope: 'content' },
      ...CTA_FIELDS,
    ],
    dataSource: 'services',
    propsFrom: passThrough,
  },
  mission: {
    type: 'mission',
    label: 'Mission & Vision',
    description: 'Mission and vision statements.',
    group: 'company',
    component: MissionVision,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'missionvision',
    propsFrom: passThrough,
  },
  technologies: {
    type: 'technologies',
    label: 'Technologies',
    description: 'Technology stack grouped by category.',
    group: 'company',
    component: TechnologiesSection,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'technologies',
    propsFrom: passThrough,
  },
  why: {
    type: 'why',
    label: 'Why Nazexa',
    description: 'Value props and stat counters.',
    group: 'company',
    component: WhyNazexaSection,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'values',
    propsFrom: passThrough,
  },
  process: {
    type: 'process',
    label: 'Process',
    description: 'How we deliver — step-by-step.',
    group: 'company',
    component: ProcessSection,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'process',
    propsFrom: passThrough,
  },
  ourproducts: {
    type: 'ourproducts',
    label: 'Our products',
    description: 'Own product cards.',
    group: 'company',
    component: OwnProducts,
    editableFields: [
      ...TITLE_SUBTITLE,
      { name: 'badge', label: 'Badge', kind: 'text', scope: 'content' },
      ...CTA_FIELDS,
    ],
    dataSource: 'products',
    propsFrom: passThrough,
  },
  clientcta: {
    type: 'clientcta',
    label: 'Final CTA',
    description: 'Closing call-to-action band.',
    group: 'cta',
    component: ClientCta,
    editableFields: [
      ...TITLE_SUBTITLE,
      { name: 'note', label: 'Footer note', kind: 'text', scope: 'content' },
      ...CTA_FIELDS,
    ],
    propsFrom: passThrough,
  },
  features: {
    type: 'features',
    label: 'Feature grid',
    description: 'Platform feature grid.',
    group: 'marketing',
    component: FeatureGrid,
    editableFields: TITLE_SUBTITLE,
    propsFrom: passThrough,
  },
  platform: {
    type: 'platform',
    label: 'Platform overview',
    description: 'Control-plane overview diagram.',
    group: 'marketing',
    component: PlatformOverview,
    editableFields: TITLE_SUBTITLE,
    propsFrom: passThrough,
  },
  stats: {
    type: 'stats',
    label: 'Stats',
    description: 'Headline metrics band.',
    group: 'marketing',
    component: Stats,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'stats',
    propsFrom: passThrough,
  },
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Client quotes.',
    group: 'marketing',
    component: Testimonials,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'customers',
    propsFrom: passThrough,
  },
  timeline: {
    type: 'timeline',
    label: 'Timeline',
    description: 'Company milestones.',
    group: 'marketing',
    component: Timeline,
    editableFields: TITLE_SUBTITLE,
    propsFrom: passThrough,
  },
  techstack: {
    type: 'techstack',
    label: 'Tech stack',
    description: 'Technology chips.',
    group: 'marketing',
    component: TechStack,
    editableFields: TITLE_SUBTITLE,
    propsFrom: passThrough,
  },
  blog: {
    type: 'blog',
    label: 'Blog preview',
    description: 'Latest blog posts.',
    group: 'marketing',
    component: BlogPreview,
    editableFields: TITLE_SUBTITLE,
    propsFrom: passThrough,
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions.',
    group: 'marketing',
    component: FaqPreview,
    editableFields: TITLE_SUBTITLE,
    dataSource: 'faq',
    propsFrom: passThrough,
  },
  cta: {
    type: 'cta',
    label: 'Legacy CTA',
    description: 'Simple closing CTA.',
    group: 'cta',
    component: FinalCta,
    editableFields: TITLE_SUBTITLE,
    propsFrom: passThrough,
  },
};

export const SECTION_TYPES = Object.keys(SECTION_REGISTRY);

/** Default section order used to render the homepage when no rows exist in the DB. */
export const DEFAULT_SECTION_ORDER: string[] = [
  'hero',
  'trusted',
  'whatwedo',
  'servicesfull',
  'mission',
  'technologies',
  'stats',
  'why',
  'process',
  'ourproducts',
  'testimonials',
  'faq',
  'clientcta',
];

export function sectionLabel(type: string): string {
  return SECTION_REGISTRY[type]?.label ?? type;
}

/** Renders a single stored section via the registry. Returns null for unknown types. */
export function renderSection(section: HomeSection): ReactNode {
  const def = SECTION_REGISTRY[section.type];
  if (!def) return null;
  const Component = def.component;
  const props = def.propsFrom ? def.propsFrom(section) : passThrough(section);
  return <Component key={section.id} {...props} />;
}

/** Synthetic default sections (visible, empty content) for the no-DB fallback layout. */
export function defaultHomeSections(): HomeSection[] {
  return DEFAULT_SECTION_ORDER.map((type, position) => ({
    id: `default-${type}`,
    type,
    position,
    visible: true,
    title: null,
    subtitle: null,
    content: {},
  }));
}
