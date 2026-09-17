// Declarative map of where each content collection is surfaced on the public site.
// Used by the Content Library to show a "Used by" panel and to warn before deleting
// content that is still referenced. Client-safe (no DB / server imports).

export type UsageRef = {
  label: string;
  href?: string;
  kind: 'page' | 'section';
};

// Static page/section references per collection (reflects how the code renders each collection).
export const PAGE_USAGE: Record<string, UsageRef[]> = {
  services: [{ label: 'Services page', href: '/services', kind: 'page' }],
  products: [
    { label: 'Products page', href: '/products', kind: 'page' },
    { label: 'Header · Pricing menu', kind: 'section' },
  ],
  solutions: [{ label: 'Solutions page', href: '/solutions', kind: 'page' }],
  industries: [{ label: 'Industries page', href: '/industries', kind: 'page' }],
  'case-studies': [{ label: 'Case Studies page', href: '/case-studies', kind: 'page' }],
  portfolio: [{ label: 'Portfolio page', href: '/portfolio', kind: 'page' }],
  pricing: [{ label: 'Pricing page', href: '/pricing', kind: 'page' }],
  faq: [{ label: 'FAQ page', href: '/faq', kind: 'page' }],
  team: [{ label: 'Team page', href: '/team', kind: 'page' }],
  partners: [{ label: 'Partners page', href: '/partners', kind: 'page' }],
  integrations: [{ label: 'Integrations page', href: '/integrations', kind: 'page' }],
  blog: [{ label: 'Blog', href: '/blog', kind: 'page' }],
  news: [{ label: 'News', href: '/news', kind: 'page' }],
  events: [{ label: 'Events', href: '/events', kind: 'page' }],
  announcement: [{ label: 'Announcements', href: '/announcements', kind: 'page' }],
  customers: [{ label: 'Homepage · logos & testimonials', href: '/', kind: 'section' }],
};

// Homepage section types (label) that render a given collection — mirrors SECTION_REGISTRY dataSource.
export const HOME_SECTIONS_FOR_COLLECTION: Record<string, { type: string; label: string }[]> = {
  pillars: [{ type: 'whatwedo', label: 'What we do' }],
  services: [
    { type: 'services', label: 'Services showcase' },
    { type: 'servicesfull', label: 'Services (detailed)' },
  ],
  missionvision: [{ type: 'mission', label: 'Mission & Vision' }],
  technologies: [{ type: 'technologies', label: 'Technologies' }],
  values: [{ type: 'why', label: 'Why Nazexa' }],
  stats: [
    { type: 'why', label: 'Why Nazexa' },
    { type: 'stats', label: 'Stats' },
  ],
  process: [{ type: 'process', label: 'Process' }],
  products: [{ type: 'ourproducts', label: 'Our products' }],
  customers: [
    { type: 'trusted', label: 'Trusted by' },
    { type: 'testimonials', label: 'Testimonials' },
  ],
  faq: [{ type: 'faq', label: 'FAQ' }],
};

/** Static (code-derived) usage for a collection — does not check whether homepage sections are live. */
export function getStaticUsage(collection: string): UsageRef[] {
  return PAGE_USAGE[collection] ?? [];
}
