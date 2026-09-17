// Config-driven admin for the dedicated CMS models. One entry per Prisma model; the generic
// list view, tabbed editor, and server actions all read from this registry. Keep `delegate`
// in sync with the Prisma client delegate name.

export type ModelFieldType =
  | 'text'
  | 'textarea'
  | 'rich-text'
  | 'image'
  | 'select'
  | 'number'
  | 'date'
  | 'boolean'
  | 'slug'
  | 'json';

export type ModelField = {
  name: string;
  label: string;
  type: ModelFieldType;
  tab: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  help?: string;
  colSpan?: 1 | 2;
};

export type ModelConfig = {
  key: string; // route key, e.g. 'jobs'
  delegate: string; // prisma delegate, e.g. 'jobPosting'
  label: string; // plural, e.g. 'Job Postings'
  singular: string;
  description: string;
  tabs: string[];
  fields: ModelField[];
  listColumns: { name: string; label: string }[];
  titleField: string;
  slugField?: string;
  statusField?: string; // boolean published flag
  orderField?: string; // integer ordering
  featuredField?: string;
  defaultSort?: 'position' | 'created' | 'updated' | 'title';
  publicPath?: string; // public page for the "view" preview action
};

const PUBLISHING = (opts?: { featured?: boolean }): ModelField[] => [
  { name: 'published', label: 'Published', type: 'boolean', tab: 'Publishing' },
  ...(opts?.featured
    ? [{ name: 'featured', label: 'Featured', type: 'boolean' as const, tab: 'Publishing' }]
    : []),
  {
    name: 'position',
    label: 'Order',
    type: 'number',
    tab: 'Publishing',
    help: 'Lower shows first',
  },
];

const SEO: ModelField[] = [
  { name: 'seo_title', label: 'SEO title', type: 'text', tab: 'SEO', colSpan: 2 },
  { name: 'seo_description', label: 'SEO description', type: 'textarea', tab: 'SEO', colSpan: 2 },
];

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  jobs: {
    key: 'jobs',
    delegate: 'jobPosting',
    label: 'Job Postings',
    singular: 'Job posting',
    description: 'Open roles shown on the Careers page and its detail routes.',
    tabs: ['General', 'Content', 'CTA', 'SEO', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/careers',
    listColumns: [
      { name: 'title', label: 'Role' },
      { name: 'department', label: 'Team' },
      { name: 'level', label: 'Level' },
    ],
    fields: [
      { name: 'title', label: 'Role', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      { name: 'department', label: 'Team / Department', type: 'text', tab: 'General' },
      { name: 'location', label: 'Location', type: 'text', tab: 'General' },
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        tab: 'General',
        options: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal', 'Lead', 'Director'].map((v) => ({
          label: v,
          value: v,
        })),
      },
      {
        name: 'employment_type',
        label: 'Employment type',
        type: 'select',
        tab: 'General',
        options: ['Full-time', 'Part-time', 'Contract', 'Internship'].map((v) => ({
          label: v,
          value: v,
        })),
      },
      { name: 'remote', label: 'Remote', type: 'boolean', tab: 'General' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', tab: 'Content', colSpan: 2 },
      { name: 'body', label: 'Description', type: 'rich-text', tab: 'Content', colSpan: 2 },
      {
        name: 'responsibilities',
        label: 'Responsibilities',
        type: 'json',
        tab: 'Content',
        colSpan: 2,
        help: 'JSON array of strings',
      },
      {
        name: 'requirements',
        label: 'Requirements',
        type: 'json',
        tab: 'Content',
        colSpan: 2,
        help: 'JSON array of strings',
      },
      { name: 'apply_url', label: 'Apply URL', type: 'text', tab: 'CTA', colSpan: 2 },
      { name: 'salary_band', label: 'Salary band', type: 'text', tab: 'CTA' },
      ...SEO,
      ...PUBLISHING({ featured: true }),
      { name: 'posted_at', label: 'Posted date', type: 'date', tab: 'Publishing' },
      { name: 'closes_at', label: 'Closes date', type: 'date', tab: 'Publishing' },
    ],
  },

  resources: {
    key: 'resources',
    delegate: 'resource',
    label: 'Resources',
    singular: 'Resource',
    description: 'Reports, templates, playbooks, architectures and guides on the Resources page.',
    tabs: ['General', 'Content', 'Media', 'SEO', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/resources',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'type', label: 'Type' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        tab: 'General',
        required: true,
        options: ['Report', 'Architecture', 'Template', 'Playbook', 'Calculator', 'Guide'].map(
          (v) => ({ label: v, value: v })
        ),
      },
      {
        name: 'format',
        label: 'Format',
        type: 'text',
        tab: 'General',
        placeholder: 'PDF · 48 pages',
      },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', tab: 'Content', colSpan: 2 },
      { name: 'body', label: 'Body', type: 'rich-text', tab: 'Content', colSpan: 2 },
      { name: 'image_url', label: 'Cover image', type: 'image', tab: 'Media', colSpan: 2 },
      { name: 'file_url', label: 'Download / file URL', type: 'text', tab: 'Media' },
      { name: 'external_url', label: 'External URL', type: 'text', tab: 'Media' },
      { name: 'gated', label: 'Requires email (gated)', type: 'boolean', tab: 'Media' },
      ...SEO,
      ...PUBLISHING({ featured: true }),
    ],
  },

  'press-assets': {
    key: 'press-assets',
    delegate: 'pressAsset',
    label: 'Press Assets',
    singular: 'Press asset',
    description: 'Downloadable brand assets on the Press Kit page.',
    tabs: ['General', 'Media', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/press-kit',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'type', label: 'Type' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        tab: 'General',
        options: ['Logo', 'Colour', 'Product', 'People', 'Boilerplate'].map((v) => ({
          label: v,
          value: v,
        })),
      },
      { name: 'description', label: 'Description', type: 'textarea', tab: 'General', colSpan: 2 },
      { name: 'image_url', label: 'Preview image', type: 'image', tab: 'Media', colSpan: 2 },
      { name: 'file_url', label: 'Download URL', type: 'text', tab: 'Media' },
      {
        name: 'formats',
        label: 'Formats',
        type: 'text',
        tab: 'Media',
        placeholder: 'SVG · PNG · EPS',
      },
      ...PUBLISHING(),
    ],
  },

  milestones: {
    key: 'milestones',
    delegate: 'companyMilestone',
    label: 'Company Milestones',
    singular: 'Milestone',
    description: 'Timeline entries on the About page.',
    tabs: ['General', 'Publishing'],
    titleField: 'title',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/about',
    listColumns: [
      { name: 'date', label: 'Date' },
      { name: 'title', label: 'Title' },
    ],
    fields: [
      {
        name: 'date',
        label: 'Date label',
        type: 'text',
        tab: 'General',
        required: true,
        placeholder: '2018',
      },
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'body', label: 'Body', type: 'textarea', tab: 'General', colSpan: 2 },
      { name: 'tag', label: 'Tag', type: 'text', tab: 'General' },
      ...PUBLISHING(),
    ],
  },

  'learning-paths': {
    key: 'learning-paths',
    delegate: 'learningPath',
    label: 'Learning Paths',
    singular: 'Learning path',
    description: 'Structured learning tracks on the Learning Center page.',
    tabs: ['General', 'Content', 'Items', 'Media', 'SEO', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/learning-center',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'level', label: 'Level' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        tab: 'General',
        options: ['Beginner', 'Intermediate', 'Advanced'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'duration_label',
        label: 'Duration',
        type: 'text',
        tab: 'General',
        placeholder: '3 h',
      },
      { name: 'module_count', label: 'Module count', type: 'number', tab: 'General' },
      { name: 'summary', label: 'Summary', type: 'textarea', tab: 'Content', colSpan: 2 },
      {
        name: 'modules',
        label: 'Modules',
        type: 'json',
        tab: 'Items',
        colSpan: 2,
        help: 'JSON array [{title,videoUrl,durationLabel,body}]',
      },
      { name: 'image_url', label: 'Cover image', type: 'image', tab: 'Media', colSpan: 2 },
      ...SEO,
      ...PUBLISHING({ featured: true }),
    ],
  },

  certifications: {
    key: 'certifications',
    delegate: 'certification',
    label: 'Certifications',
    singular: 'Certification',
    description: 'Credentials in the Learning Center certification table.',
    tabs: ['General', 'Publishing'],
    titleField: 'name',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/learning-center',
    listColumns: [
      { name: 'name', label: 'Credential' },
      { name: 'validity', label: 'Validity' },
    ],
    fields: [
      {
        name: 'name',
        label: 'Credential',
        type: 'text',
        tab: 'General',
        required: true,
        colSpan: 2,
      },
      { name: 'requirements', label: 'Requirements', type: 'textarea', tab: 'General', colSpan: 2 },
      { name: 'validity', label: 'Validity', type: 'text', tab: 'General' },
      ...PUBLISHING(),
    ],
  },

  releases: {
    key: 'releases',
    delegate: 'release',
    label: 'Releases',
    singular: 'Release',
    description: 'Powers the Changelog and Release Notes pages.',
    tabs: ['General', 'Content', 'SEO', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/changelog',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'version', label: 'Version' },
      { name: 'type', label: 'Type' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      { name: 'version', label: 'Version', type: 'text', tab: 'General', placeholder: 'v4.2.1' },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        tab: 'General',
        options: [
          'Feature',
          'Improvement',
          'Performance',
          'Deprecation',
          'Security',
          'Minor',
          'Patch',
        ].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'channel',
        label: 'Channel',
        type: 'select',
        tab: 'General',
        options: ['stable', 'beta', 'security'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'status',
        label: 'Support status',
        type: 'select',
        tab: 'General',
        options: ['Current', 'Supported', 'Maintenance'].map((v) => ({ label: v, value: v })),
      },
      { name: 'body', label: 'Notes', type: 'rich-text', tab: 'Content', colSpan: 2 },
      {
        name: 'migration_notes',
        label: 'Migration notes',
        type: 'textarea',
        tab: 'Content',
        colSpan: 2,
      },
      ...SEO,
      ...PUBLISHING({ featured: true }),
      { name: 'released_at', label: 'Released date', type: 'date', tab: 'Publishing' },
      { name: 'security_until', label: 'Security fixes until', type: 'date', tab: 'Publishing' },
    ],
  },

  downloads: {
    key: 'downloads',
    delegate: 'downloadArtifact',
    label: 'Download Artifacts',
    singular: 'Artifact',
    description: 'CLI binaries, SDKs and desktop apps on the Download Center page.',
    tabs: ['General', 'Files', 'Publishing'],
    titleField: 'name',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/download-center',
    listColumns: [
      { name: 'name', label: 'Name' },
      { name: 'kind', label: 'Kind' },
      { name: 'platform', label: 'Platform' },
      { name: 'version', label: 'Version' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', tab: 'General', required: true, colSpan: 2 },
      {
        name: 'kind',
        label: 'Kind',
        type: 'select',
        tab: 'General',
        options: ['CLI', 'SDK', 'Desktop', 'Docker'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'platform',
        label: 'Platform',
        type: 'select',
        tab: 'General',
        options: ['macOS', 'Linux', 'Windows', 'Docker'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'architecture',
        label: 'Architecture',
        type: 'text',
        tab: 'General',
        placeholder: 'arm64 / x86_64',
      },
      { name: 'language', label: 'Language (SDKs)', type: 'text', tab: 'General' },
      { name: 'package_name', label: 'Package name', type: 'text', tab: 'General' },
      { name: 'version', label: 'Version', type: 'text', tab: 'General' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        tab: 'General',
        options: ['Stable', 'Maintenance', 'Community'].map((v) => ({ label: v, value: v })),
      },
      { name: 'file_url', label: 'File URL', type: 'text', tab: 'Files', colSpan: 2 },
      { name: 'file_size', label: 'File size', type: 'text', tab: 'Files' },
      { name: 'signature_url', label: 'Signature URL', type: 'text', tab: 'Files' },
      { name: 'checksum', label: 'Checksum', type: 'textarea', tab: 'Files', colSpan: 2 },
      ...PUBLISHING(),
    ],
  },

  roadmap: {
    key: 'roadmap',
    delegate: 'roadmapItem',
    label: 'Roadmap Items',
    singular: 'Roadmap item',
    description: 'Now / Next / Later items on the Roadmap page.',
    tabs: ['General', 'Content', 'SEO', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/roadmap',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'phase', label: 'Phase' },
      { name: 'tag', label: 'Tag' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      {
        name: 'phase',
        label: 'Phase',
        type: 'select',
        tab: 'General',
        options: [
          { label: 'Now', value: 'now' },
          { label: 'Next', value: 'next' },
          { label: 'Later', value: 'later' },
        ],
      },
      {
        name: 'tag',
        label: 'Tag',
        type: 'select',
        tab: 'General',
        options: ['In rollout', 'Beta', 'Planned', 'Research', 'Shipped'].map((v) => ({
          label: v,
          value: v,
        })),
      },
      {
        name: 'target_label',
        label: 'Target',
        type: 'text',
        tab: 'General',
        placeholder: 'Q3 2026',
      },
      { name: 'body', label: 'Description', type: 'textarea', tab: 'Content', colSpan: 2 },
      ...SEO,
      ...PUBLISHING({ featured: true }),
    ],
  },

  docs: {
    key: 'docs',
    delegate: 'docArticle',
    label: 'Documentation',
    singular: 'Doc article',
    description: 'Guides and concept articles on the Documentation page.',
    tabs: ['General', 'Content', 'SEO', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/documentation',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'area', label: 'Area' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      {
        name: 'area',
        label: 'Area',
        type: 'select',
        tab: 'General',
        options: ['Getting started', 'Database', 'Runtime', 'Storage', 'Observability'].map(
          (v) => ({ label: v, value: v })
        ),
      },
      {
        name: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        tab: 'General',
        options: ['Beginner', 'Intermediate', 'Advanced'].map((v) => ({ label: v, value: v })),
      },
      { name: 'version', label: 'Version', type: 'text', tab: 'General' },
      { name: 'reading_minutes', label: 'Reading minutes', type: 'number', tab: 'General' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', tab: 'Content', colSpan: 2 },
      { name: 'body', label: 'Body', type: 'rich-text', tab: 'Content', colSpan: 2 },
      ...SEO,
      ...PUBLISHING({ featured: true }),
    ],
  },

  'api-endpoints': {
    key: 'api-endpoints',
    delegate: 'apiEndpoint',
    label: 'API Endpoints',
    singular: 'Endpoint',
    description: 'Endpoints shown in the API reference.',
    tabs: ['General', 'Examples', 'Publishing'],
    titleField: 'path',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/api-documentation',
    listColumns: [
      { name: 'method', label: 'Method' },
      { name: 'path', label: 'Path' },
      { name: 'api_group', label: 'Group' },
    ],
    fields: [
      {
        name: 'path',
        label: 'Path',
        type: 'text',
        tab: 'General',
        required: true,
        colSpan: 2,
        placeholder: '/v4/projects',
      },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        tab: 'General',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((v) => ({ label: v, value: v })),
      },
      { name: 'api_group', label: 'Group', type: 'text', tab: 'General' },
      { name: 'version', label: 'Version', type: 'text', tab: 'General' },
      { name: 'summary', label: 'Purpose', type: 'textarea', tab: 'General', colSpan: 2 },
      { name: 'description', label: 'Description', type: 'rich-text', tab: 'Examples', colSpan: 2 },
      {
        name: 'request_example',
        label: 'Request example',
        type: 'json',
        tab: 'Examples',
        colSpan: 2,
      },
      {
        name: 'response_example',
        label: 'Response example',
        type: 'json',
        tab: 'Examples',
        colSpan: 2,
      },
      ...PUBLISHING(),
    ],
  },

  'api-errors': {
    key: 'api-errors',
    delegate: 'apiErrorCode',
    label: 'API Error Codes',
    singular: 'Error code',
    description: 'Error codes table in the API reference.',
    tabs: ['General', 'Publishing'],
    titleField: 'code',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/api-documentation',
    listColumns: [
      { name: 'status', label: 'Status' },
      { name: 'code', label: 'Code' },
    ],
    fields: [
      { name: 'code', label: 'Code', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'status', label: 'HTTP status', type: 'number', tab: 'General' },
      { name: 'meaning', label: 'Meaning', type: 'textarea', tab: 'General', colSpan: 2 },
      ...PUBLISHING(),
    ],
  },

  'status-components': {
    key: 'status-components',
    delegate: 'statusComponent',
    label: 'Status Components',
    singular: 'Component',
    description:
      'Services shown on the Status page. Live health can be fed by a real monitor (STATUS_API_URL) — these values are the fallback.',
    tabs: ['General', 'Publishing'],
    titleField: 'name',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/status',
    listColumns: [
      { name: 'name', label: 'Service' },
      { name: 'current_status', label: 'Status' },
    ],
    fields: [
      { name: 'name', label: 'Service', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'component_group', label: 'Group', type: 'text', tab: 'General' },
      {
        name: 'current_status',
        label: 'Current status',
        type: 'select',
        tab: 'General',
        options: ['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'].map(
          (v) => ({ label: v, value: v })
        ),
      },
      {
        name: 'uptime_90d',
        label: '90-day uptime',
        type: 'text',
        tab: 'General',
        placeholder: '99.99%',
      },
      {
        name: 'p50_latency_ms',
        label: 'p50 latency',
        type: 'text',
        tab: 'General',
        placeholder: '42 ms',
      },
      ...PUBLISHING(),
    ],
  },

  incidents: {
    key: 'incidents',
    delegate: 'incident',
    label: 'Incidents',
    singular: 'Incident',
    description: 'Incident post-mortems on the Status page (authored content).',
    tabs: ['General', 'Content', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    publicPath: '/status',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'status', label: 'Status' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      {
        name: 'severity',
        label: 'Severity',
        type: 'select',
        tab: 'General',
        options: ['minor', 'major', 'critical', 'maintenance'].map((v) => ({ label: v, value: v })),
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        tab: 'General',
        options: ['investigating', 'identified', 'monitoring', 'resolved', 'maintenance'].map(
          (v) => ({ label: v, value: v })
        ),
      },
      { name: 'started_at', label: 'Started', type: 'date', tab: 'General' },
      { name: 'resolved_at', label: 'Resolved', type: 'date', tab: 'General' },
      { name: 'body', label: 'Post-mortem', type: 'rich-text', tab: 'Content', colSpan: 2 },
      {
        name: 'updates',
        label: 'Updates',
        type: 'json',
        tab: 'Content',
        colSpan: 2,
        help: 'JSON array [{date,status,body}]',
      },
      ...PUBLISHING(),
    ],
  },

  'feature-requests': {
    key: 'feature-requests',
    delegate: 'featureRequest',
    label: 'Feature Requests',
    singular: 'Feature request',
    description: 'The public feature-request board (votes are collected from visitors).',
    tabs: ['General', 'Publishing'],
    titleField: 'title',
    slugField: 'slug',
    statusField: 'published',
    orderField: 'position',
    featuredField: 'featured',
    publicPath: '/feature-requests',
    listColumns: [
      { name: 'title', label: 'Title' },
      { name: 'status', label: 'Status' },
      { name: 'vote_count', label: 'Votes' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', tab: 'General', required: true, colSpan: 2 },
      { name: 'slug', label: 'Slug', type: 'slug', tab: 'General', required: true },
      { name: 'category', label: 'Category', type: 'text', tab: 'General' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        tab: 'General',
        options: ['Under review', 'Planned', 'In progress', 'Shipped', 'Not planned'].map((v) => ({
          label: v,
          value: v,
        })),
      },
      { name: 'vote_count', label: 'Votes', type: 'number', tab: 'General' },
      { name: 'body', label: 'Description', type: 'textarea', tab: 'General', colSpan: 2 },
      ...PUBLISHING({ featured: true }),
    ],
  },
};

export const MODEL_KEYS = Object.keys(MODEL_REGISTRY);

export function getModelConfig(key: string): ModelConfig | undefined {
  return MODEL_REGISTRY[key];
}
