import { CONTENT_SCHEMA } from '@/lib/content-schema';
import { MODEL_REGISTRY, MODEL_KEYS } from '@/lib/cms-models/registry';

export type AdminIndexCategory =
  | 'Dashboard'
  | 'Content Library'
  | 'Site Content'
  | 'Pages & Data'
  | 'Theme & Styling'
  | 'Communication'
  | 'Users & Access'
  | 'Settings'
  | 'System';

export interface AdminIndexItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  category: AdminIndexCategory;
  route: string;
  icon: string; // string name for lucide icon
  action?: string; // 'navigate', 'create', etc.
  permissions?: string[];
}

const STATIC_ADMIN_ITEMS: AdminIndexItem[] = [
  {
    id: 'nav-overview',
    title: 'Overview Dashboard',
    description: 'Admin dashboard with analytics and quick stats',
    keywords: ['home', 'dashboard', 'stats', 'analytics', 'overview'],
    category: 'Dashboard',
    route: '/admin',
    icon: 'LayoutDashboard',
    action: 'navigate',
  },
  {
    id: 'nav-builder',
    title: 'Homepage Builder',
    description: 'Visual drag and drop builder for the main landing page',
    keywords: ['home', 'landing', 'builder', 'editor', 'visual', 'drag'],
    category: 'Dashboard',
    route: '/admin/builder',
    icon: 'Layers',
    action: 'navigate',
  },
  {
    id: 'nav-pages',
    title: 'Custom Pages',
    description: 'Manage custom generic pages',
    keywords: ['pages', 'custom', 'route', 'slug'],
    category: 'Pages & Data',
    route: '/admin/pages',
    icon: 'FileText',
    action: 'navigate',
  },
  {
    id: 'nav-applications',
    title: 'Applications',
    description: 'Manage OAuth apps and API keys',
    keywords: ['applications', 'oauth', 'api', 'keys', 'tokens'],
    category: 'System',
    route: '/admin/applications',
    icon: 'AppWindow',
    action: 'navigate',
  },
  {
    id: 'nav-subscribers',
    title: 'Subscribers',
    description: 'Manage system users and their subscriptions',
    keywords: ['users', 'subscribers', 'accounts', 'billing'],
    category: 'Users & Access',
    route: '/admin/subscribers',
    icon: 'Users',
    action: 'navigate',
  },
  {
    id: 'nav-mail-subscribers',
    title: 'Mail Subscribers',
    description: 'Manage email newsletter subscribers',
    keywords: ['email', 'newsletter', 'marketing', 'mail'],
    category: 'Communication',
    route: '/admin/mail-subscribers',
    icon: 'Mail',
    action: 'navigate',
  },
  {
    id: 'nav-theme-website',
    title: 'Website Theme',
    description: 'Customize public website colors, fonts, and branding',
    keywords: ['theme', 'colors', 'styling', 'branding', 'fonts', 'logo'],
    category: 'Theme & Styling',
    route: '/admin/theme',
    icon: 'Palette',
    action: 'navigate',
  },
  {
    id: 'nav-theme-admin',
    title: 'Admin Theme',
    description: 'Customize admin panel styling and dark mode',
    keywords: ['theme', 'admin', 'colors', 'dark mode'],
    category: 'Theme & Styling',
    route: '/admin/theme/admin',
    icon: 'Palette',
    action: 'navigate',
  },
  {
    id: 'nav-seo',
    title: 'SEO Settings',
    description: 'Manage global search engine optimization settings',
    keywords: ['seo', 'meta', 'tags', 'google', 'search engine', 'ranking'],
    category: 'Settings',
    route: '/admin/seo',
    icon: 'Search',
    action: 'navigate',
  },
  {
    id: 'nav-messages',
    title: 'Contact Messages',
    description: 'View and respond to contact form submissions',
    keywords: ['contact', 'messages', 'inbox', 'support', 'form'],
    category: 'Communication',
    route: '/admin/messages',
    icon: 'MessageSquare',
    action: 'navigate',
  },
  {
    id: 'nav-contact-settings',
    title: 'Contact Config',
    description: 'Configure contact form routing and settings',
    keywords: ['contact', 'settings', 'config', 'routing', 'emails'],
    category: 'Settings',
    route: '/admin/contact-settings',
    icon: 'PhoneCall',
    action: 'navigate',
  },
  {
    id: 'nav-ai',
    title: 'AI Management',
    description: 'Manage AI models, prompts, and tokens',
    keywords: ['ai', 'artificial intelligence', 'models', 'prompts', 'openai', 'llm'],
    category: 'System',
    route: '/admin/ai-management',
    icon: 'Bot',
    action: 'navigate',
  },
  {
    id: 'nav-payments',
    title: 'Payments',
    description: 'Manage transactions, invoices, and billing history',
    keywords: ['payments', 'transactions', 'invoices', 'billing', 'stripe', 'money'],
    category: 'Settings',
    route: '/admin/payments',
    icon: 'CreditCard',
    action: 'navigate',
  },
  {
    id: 'nav-team',
    title: 'Team & Roles',
    description: 'Manage admin users, roles, and permissions',
    keywords: ['team', 'roles', 'permissions', 'admins', 'staff', 'access'],
    category: 'Users & Access',
    route: '/admin/team',
    icon: 'Users',
    action: 'navigate',
  },
  {
    id: 'nav-security',
    title: 'Security',
    description: 'Manage security logs, audit trails, and policies',
    keywords: ['security', 'audit', 'logs', 'firewall', 'protection'],
    category: 'System',
    route: '/admin/security',
    icon: 'Shield',
    action: 'navigate',
  },
];

const LIBRARY_KEYS = [
  'blog', 'announcement', 'video', 'gallery', 'document', 'faq',
  'products', 'services', 'solutions', 'industries', 'case-studies',
  'portfolio', 'news', 'integrations', 'events', 'team', 'customers',
  'partners', 'pricing', 'tutorials', 'community',
];

const SITE_KEYS = ['pillars', 'missionvision', 'technologies', 'values', 'stats', 'process'];

/**
 * Generates the complete Admin Search Index by combining static routes 
 * with dynamic CMS collections.
 */
export function getAdminSearchIndex(): AdminIndexItem[] {
  const items: AdminIndexItem[] = [...STATIC_ADMIN_ITEMS];

  // Add Content Library
  for (const key of LIBRARY_KEYS) {
    const schema = CONTENT_SCHEMA[key];
    const label = schema?.label || key;
    items.push({
      id: `lib-${key}`,
      title: `${label} Library`,
      description: schema?.description || `Manage ${label.toLowerCase()} entries`,
      keywords: [key, label.toLowerCase(), 'content', 'library', 'manage', 'create', 'edit'],
      category: 'Content Library',
      route: `/admin/content?collection=${key}`,
      icon: 'Library',
      action: 'navigate',
      permissions: ['/admin/content'],
    });
  }

  // Add Site Content
  for (const key of SITE_KEYS) {
    const schema = CONTENT_SCHEMA[key];
    const label = schema?.label || key;
    items.push({
      id: `site-${key}`,
      title: `${label} Content`,
      description: schema?.description || `Manage ${label.toLowerCase()} site blocks`,
      keywords: [key, label.toLowerCase(), 'site', 'content', 'manage', 'edit'],
      category: 'Site Content',
      route: `/admin/content/site?collection=${key}`,
      icon: 'BookOpen',
      action: 'navigate',
      permissions: ['/admin/content'],
    });
  }

  // Add Dedicated Models
  for (const key of MODEL_KEYS) {
    const model = MODEL_REGISTRY[key];
    if (model) {
      items.push({
        id: `model-${key}`,
        title: model.label,
        description: model.description || `Manage ${model.label.toLowerCase()}`,
        keywords: [key, model.singular.toLowerCase(), model.label.toLowerCase(), 'manage', 'data', 'database'],
        category: 'Pages & Data',
        route: `/admin/models/${key}`,
        icon: 'Boxes',
        action: 'navigate',
        permissions: [`/admin/models/${key}`],
      });
    }
  }

  return items;
}
