import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  Boxes,
  Cloud,
  Code2,
  Cpu,
  Database,
  Gauge,
  Layers,
  LifeBuoy,
  Lightbulb,
  PenTool,
  Server,
  Smartphone,
} from 'lucide-react';

export type ServiceTone = 'brand-1' | 'brand-2' | 'brand-3';

export type Service = {
  slug: string;
  name: string;
  icon: LucideIcon;
  tone: ServiceTone;
  category: 'Build' | 'Design' | 'Platform' | 'Advisory';
  tagline: string;
  summary: string;
  overview: string[];
  audience: string[];
  deliverables: string[];
  capabilities: { title: string; body: string }[];
  stack: string[];
  outcomes: { value: string; label: string }[];
  faq: { title: string; body: string }[];
};

export const services: Service[] = [
  {
    slug: 'custom-software-development',
    name: 'Custom Software Development',
    icon: Code2,
    tone: 'brand-1',
    category: 'Build',
    tagline: 'Software built exactly around how your business works',
    summary:
      'End-to-end product engineering for internal platforms, customer portals and line-of-business systems that off-the-shelf tools cannot cover.',
    overview: [
      'We design and build bespoke software for organisations whose processes are too specific for generic products. That starts with a discovery phase where we map your workflows, data and constraints, and ends with a maintainable codebase your own team can own.',
      'Every engagement is delivered in short increments with working software at the end of each one, so you see progress continuously rather than at a single risky launch.',
    ],
    audience: [
      'Operations-heavy businesses',
      'Startups validating a new product',
      'Enterprises replacing legacy systems',
    ],
    deliverables: [
      'Discovery workshop and technical specification',
      'System architecture and data model',
      'Production application with automated tests',
      'CI/CD pipeline and environments',
      'Documentation, runbooks and handover training',
    ],
    capabilities: [
      {
        title: 'Domain-driven architecture',
        body: 'Modular services and clean boundaries so the system stays changeable years after launch.',
      },
      {
        title: 'Incremental delivery',
        body: 'Two-week increments with demos, so scope and budget stay under your control.',
      },
      {
        title: 'Automated quality gates',
        body: 'Unit, integration and end-to-end tests wired into every pull request.',
      },
      {
        title: 'Ownership handover',
        body: 'Readable code, architecture decision records and training for your in-house engineers.',
      },
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Laravel', 'PHP', 'Python', 'PostgreSQL', 'Docker'],
    outcomes: [
      { value: '6-10 wks', label: 'Typical time to first release' },
      { value: '100%', label: 'Source code ownership' },
      { value: '2 wks', label: 'Delivery increment length' },
    ],
    faq: [
      {
        title: 'Can you take over an existing codebase?',
        body: 'Yes. We start with a technical audit covering architecture, test coverage, dependencies and security, then agree a stabilisation plan before adding features.',
      },
      {
        title: 'How do you price projects?',
        body: 'Fixed-scope phases for well-defined work, and monthly team rates for ongoing product development. You always get a written estimate before work starts.',
      },
    ],
  },
  {
    slug: 'android-app-development',
    name: 'Android App Development',
    icon: Smartphone,
    tone: 'brand-2',
    category: 'Build',
    tagline: 'Fast, reliable Android apps that feel native on every device',
    summary:
      'Native and cross-platform Android applications with offline support, push notifications, secure storage and clean Play Store releases.',
    overview: [
      'We build Android applications that behave well on real hardware — low-end phones, patchy networks and long-running background work included. Architecture, offline behaviour and battery impact are designed in from the start.',
      'We handle the full lifecycle: prototype, build, internal testing tracks, Play Store submission and post-launch iteration based on crash and usage data.',
    ],
    audience: [
      'Consumer product teams',
      'Field operations and logistics',
      'Businesses extending a web platform to mobile',
    ],
    deliverables: [
      'Interactive prototype and UX flows',
      'Native Kotlin or cross-platform build',
      'Offline-first data sync layer',
      'Play Store listing, signing and release pipeline',
      'Crash reporting and analytics setup',
    ],
    capabilities: [
      {
        title: 'Offline-first sync',
        body: 'Local persistence with conflict-aware sync so the app keeps working without a connection.',
      },
      {
        title: 'Performance budgets',
        body: 'Startup time, frame rate and battery targets tracked on real low-end devices.',
      },
      {
        title: 'Secure by default',
        body: 'Encrypted storage, certificate pinning, biometric unlock and safe token handling.',
      },
      {
        title: 'Release automation',
        body: 'Signed builds pushed to internal, closed and production tracks from CI.',
      },
    ],
    stack: [
      'Kotlin',
      'Jetpack Compose',
      'React Native',
      'Flutter',
      'Firebase',
      'SQLite/Room',
      'Play Console',
    ],
    outcomes: [
      { value: '< 2s', label: 'Cold start target' },
      { value: 'API 24+', label: 'Device coverage' },
      { value: '99.5%', label: 'Crash-free session goal' },
    ],
    faq: [
      {
        title: 'Native or cross-platform?',
        body: 'We recommend Kotlin when the app is device-heavy, and React Native or Flutter when you need Android and iOS from one codebase. We advise based on your roadmap, not our preference.',
      },
      {
        title: 'Do you also publish the app?',
        body: 'Yes — store listing, assets, data-safety declarations, signing and phased rollout are part of the engagement.',
      },
    ],
  },
  {
    slug: 'web-development',
    name: 'Web Development',
    icon: AppWindow,
    tone: 'brand-1',
    category: 'Build',
    tagline: 'Web applications engineered for speed, scale and search',
    summary:
      'Modern web apps and dashboards built with React and TypeScript, server-rendered where it matters and measured against real performance budgets.',
    overview: [
      'We build web applications where interactivity, data density and performance all matter at once — admin consoles, customer portals, marketplaces and internal tooling.',
      'Rendering strategy is chosen per route: server rendering for content and SEO, client interactivity where users need it, and caching layers that keep pages fast under load.',
    ],
    audience: [
      'SaaS teams',
      'Marketplaces and portals',
      'Companies replacing spreadsheets with real tools',
    ],
    deliverables: [
      'Component library aligned to your brand',
      'Server-rendered, accessible application',
      'Role-based access and audit trails',
      'Performance and Core Web Vitals report',
      'Analytics, monitoring and error tracking',
    ],
    capabilities: [
      {
        title: 'Rendering strategy per route',
        body: 'SSR, static and client rendering combined so each page loads the fastest way available.',
      },
      {
        title: 'Accessible interfaces',
        body: 'Keyboard navigation, focus management and WCAG AA contrast checked during build, not after.',
      },
      {
        title: 'Real-time features',
        body: 'Presence, live updates and collaborative editing using websockets and optimistic UI.',
      },
      {
        title: 'Measured performance',
        body: 'Core Web Vitals budgets enforced in CI so regressions never reach production.',
      },
    ],
    stack: [
      'React',
      'TypeScript',
      'Next.js',
      'TanStack',
      'Tailwind CSS',
      'Vite',
      'Redis',
      'PostgreSQL',
    ],
    outcomes: [
      { value: '90+', label: 'Lighthouse performance target' },
      { value: 'WCAG AA', label: 'Accessibility baseline' },
      { value: '< 200ms', label: 'Median server response' },
    ],
    faq: [
      {
        title: 'Can you work with our design team?',
        body: 'Yes. We can build from your Figma files, or provide UI/UX design as part of the engagement.',
      },
      {
        title: 'Do you integrate with our existing APIs?',
        body: 'Routinely — REST, GraphQL, SOAP and legacy database-backed services included.',
      },
    ],
  },
  {
    slug: 'website-development',
    name: 'Website Development',
    icon: Layers,
    tone: 'brand-3',
    category: 'Build',
    tagline: 'Marketing sites that load fast and convert',
    summary:
      'Corporate websites, landing pages and content platforms with an editable CMS, technical SEO and analytics wired in from day one.',
    overview: [
      'A company website is a sales asset. We build sites that are fast on mobile networks, structured for search engines and easy for your marketing team to update without a developer.',
      'Every build includes semantic markup, structured data, sitemaps, metadata management and a content model your team can extend.',
    ],
    audience: ['Marketing teams', 'Agencies and studios', 'Companies rebranding or relaunching'],
    deliverables: [
      'Responsive design across desktop, tablet and mobile',
      'Headless CMS with role-based editing',
      'Technical SEO: metadata, schema, sitemap, robots',
      'Contact and lead capture with spam protection',
      'Analytics dashboards and conversion tracking',
    ],
    capabilities: [
      {
        title: 'Editor-friendly CMS',
        body: 'Structured content blocks your team can reorder and publish without touching code.',
      },
      {
        title: 'Technical SEO built in',
        body: 'Unique metadata per page, JSON-LD structured data, canonical URLs and clean sitemaps.',
      },
      {
        title: 'Conversion focus',
        body: 'Clear calls to action, fast forms and measurable funnels from first visit to enquiry.',
      },
      {
        title: 'Multi-language ready',
        body: 'Localised routes and content models when you sell across regions.',
      },
    ],
    stack: ['React', 'Tailwind CSS', 'Headless CMS', 'Cloudflare', 'Vercel', 'Schema.org', 'GA4'],
    outcomes: [
      { value: '< 1.5s', label: 'Largest contentful paint' },
      { value: '100%', label: 'Pages with unique metadata' },
      { value: '0', label: 'Developer edits for content changes' },
    ],
    faq: [
      {
        title: 'Can you migrate our existing content?',
        body: 'Yes, including redirect maps so existing search rankings and inbound links are preserved.',
      },
      {
        title: 'Who hosts the site?',
        body: 'We can host and maintain it, or deploy into your own cloud account with full access.',
      },
    ],
  },
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: PenTool,
    tone: 'brand-2',
    category: 'Design',
    tagline: 'Interfaces people understand the first time',
    summary:
      'Research, user flows, wireframes, high-fidelity UI and a reusable design system that stays consistent as the product grows.',
    overview: [
      'Good design reduces support load, training time and churn. We start with the jobs your users are trying to complete, then design the shortest credible path to each one.',
      'Deliverables are handoff-ready: tokens, components, states and interaction specs that translate directly into code.',
    ],
    audience: [
      'Products with usability complaints',
      'Teams without an in-house designer',
      'Companies standardising multiple apps',
    ],
    deliverables: [
      'User research summary and journey maps',
      'Wireframes and clickable prototype',
      'High-fidelity UI for every key screen',
      'Design system with tokens and components',
      'Accessibility and interaction specifications',
    ],
    capabilities: [
      {
        title: 'Product discovery',
        body: 'Interviews and task analysis that separate what users ask for from what they need.',
      },
      {
        title: 'Design systems',
        body: 'Colour, type, spacing and component tokens shared between design and code.',
      },
      {
        title: 'Prototyping',
        body: 'Clickable prototypes tested with real users before a line of production code is written.',
      },
      {
        title: 'Accessible visual design',
        body: 'Contrast, hit targets and motion preferences considered in every screen.',
      },
    ],
    stack: ['Figma', 'Design tokens', 'Storybook', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion'],
    outcomes: [
      { value: '1 system', label: 'Shared across every product surface' },
      { value: 'AA', label: 'Contrast compliance' },
      { value: 'Fewer', label: 'Support tickets after redesign' },
    ],
    faq: [
      {
        title: 'Do you do design without development?',
        body: 'Yes. Design-only engagements end with a full handover package your developers can build from.',
      },
      {
        title: 'Will it match our brand?',
        body: 'We work from your existing brand guidelines, or help define them if none exist.',
      },
    ],
  },
  {
    slug: 'saas-development',
    name: 'SaaS Development',
    icon: Boxes,
    tone: 'brand-1',
    category: 'Build',
    tagline: 'From idea to a multi-tenant product with paying customers',
    summary:
      'Multi-tenant architecture, subscription billing, onboarding, roles and usage metering — the parts every SaaS needs before it can sell.',
    overview: [
      'SaaS products fail on the plumbing as often as the idea: tenancy, billing, permissions, invitations and usage limits. We build that foundation properly so your team can focus on the differentiating features.',
      'We ship an MVP that real customers can pay for, then iterate with you on retention, expansion and operational tooling.',
    ],
    audience: [
      'Founders launching a product',
      'Agencies productising a service',
      'Enterprises spinning out internal tools',
    ],
    deliverables: [
      'Multi-tenant data model with isolation guarantees',
      'Subscription billing and plan-based limits',
      'Team invitations, roles and permissions',
      'Onboarding flow and admin console',
      'Usage metering and reporting',
    ],
    capabilities: [
      {
        title: 'Tenancy done right',
        body: "Row-level isolation and tested policies so one customer can never read another's data.",
      },
      {
        title: 'Billing integration',
        body: 'Plans, trials, proration, dunning and invoices via Stripe or Paddle.',
      },
      {
        title: 'Plan-based limits',
        body: 'Seats, projects and usage quotas enforced server-side and surfaced clearly in the UI.',
      },
      {
        title: 'Operational tooling',
        body: 'An internal admin console for support, impersonation and account recovery.',
      },
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Laravel', 'PostgreSQL', 'Stripe', 'Redis', 'Docker'],
    outcomes: [
      { value: '8-12 wks', label: 'Typical MVP timeline' },
      { value: 'Day 1', label: 'Billing ready at launch' },
      { value: 'RLS', label: 'Enforced tenant isolation' },
    ],
    faq: [
      {
        title: 'Can you help with pricing model design?',
        body: 'Yes — we model seat, usage and tiered pricing options and implement the one that fits your market.',
      },
      {
        title: 'What about compliance?',
        body: 'We build audit logging, data export and deletion flows that make SOC 2 and GDPR work far easier later.',
      },
    ],
  },
  {
    slug: 'api-backend-development',
    name: 'API & Backend Development',
    icon: Server,
    tone: 'brand-3',
    category: 'Platform',
    tagline: 'Backends that stay correct under load',
    summary:
      'REST and GraphQL APIs, background jobs, queues and event-driven services designed for throughput, observability and clean versioning.',
    overview: [
      'The backend is where correctness, security and cost live. We design APIs with explicit contracts, validated inputs, sane pagination and idempotent writes, then load-test them before launch.',
      'Asynchronous work — imports, notifications, reports, integrations — runs through durable queues with retries and dead-letter handling instead of blocking requests.',
    ],
    audience: [
      'Mobile and web teams needing a backend',
      'Companies exposing a public API',
      'Teams with slow or fragile services',
    ],
    deliverables: [
      'Documented, versioned API with typed contracts',
      'Authentication, authorisation and rate limiting',
      'Background jobs, queues and schedulers',
      'Load test results and capacity plan',
      'Logs, metrics and traces wired to your tooling',
    ],
    capabilities: [
      {
        title: 'Explicit API contracts',
        body: 'OpenAPI or GraphQL schemas generated from code, with typed clients for consumers.',
      },
      {
        title: 'Durable async work',
        body: 'Queues with retries, backoff and dead-letter queues so nothing is silently lost.',
      },
      {
        title: 'Security controls',
        body: 'Input validation, rate limiting, secret management and least-privilege service accounts.',
      },
      {
        title: 'Observability',
        body: 'Structured logs, metrics and distributed traces correlated by request ID.',
      },
    ],
    stack: [
      'Node.js',
      'Laravel',
      'Python',
      'GraphQL',
      'REST',
      'PostgreSQL',
      'Redis',
      'RabbitMQ',
      'OpenTelemetry',
    ],
    outcomes: [
      { value: 'p95', label: 'Latency targets agreed upfront' },
      { value: '100%', label: 'Endpoints documented and typed' },
      { value: 'Zero', label: 'Silent job failures' },
    ],
    faq: [
      {
        title: 'Can you improve an existing API?',
        body: 'Yes — profiling, query optimisation, caching and careful versioning without breaking current clients.',
      },
      {
        title: 'Do you support event-driven architectures?',
        body: 'We build both request/response and event-driven systems, and often a pragmatic mix of the two.',
      },
    ],
  },
  {
    slug: 'database-design-development',
    name: 'Database Design & Development',
    icon: Database,
    tone: 'brand-1',
    category: 'Platform',
    tagline: 'Data models that hold up as the product grows',
    summary:
      'Schema design, normalisation, indexing, migrations, query tuning and safe data migrations across MySQL, PostgreSQL and SQLite.',
    overview: [
      'Most performance problems are data-model problems. We design schemas with the right keys, constraints and indexes, and validate them against your actual query patterns rather than assumptions.',
      'This is the same discipline behind Nazexa DB Design, our visual database design product — you get the tooling and the expertise together.',
    ],
    audience: [
      'Teams with slow queries',
      'Projects starting a new schema',
      'Companies consolidating databases',
    ],
    deliverables: [
      'Entity relationship diagram and data dictionary',
      'Normalised schema with constraints and indexes',
      'Versioned migrations and rollback plan',
      'Query performance analysis and tuning',
      'Backup, restore and retention policy',
    ],
    capabilities: [
      {
        title: 'Visual modelling',
        body: 'ERDs produced in Nazexa DB Design and exported as SQL, JSON or diagrams your team can keep.',
      },
      {
        title: 'Index and query tuning',
        body: 'Execution plan analysis that turns table scans into index lookups.',
      },
      {
        title: 'Zero-downtime migrations',
        body: 'Expand-and-contract migration patterns so releases never require a maintenance window.',
      },
      {
        title: 'Integrity by constraint',
        body: 'Foreign keys, checks and unique constraints so bad data cannot be written in the first place.',
      },
    ],
    stack: [
      'PostgreSQL',
      'MySQL',
      'SQLite',
      'Nazexa DB Design',
      'Laravel migrations',
      'Prisma',
      'pgBouncer',
    ],
    outcomes: [
      { value: '10x', label: 'Common query speed-ups after tuning' },
      { value: '0 min', label: 'Downtime during migrations' },
      { value: 'Full', label: 'Documented data dictionary' },
    ],
    faq: [
      {
        title: 'Can you audit our current database?',
        body: 'Yes — a fixed-scope audit covering schema, indexes, slow queries, backups and growth projections.',
      },
      {
        title: 'Which databases do you support?',
        body: 'PostgreSQL, MySQL/MariaDB and SQLite primarily, plus Redis and search engines as supporting stores.',
      },
    ],
  },
  {
    slug: 'cloud-deployment',
    name: 'Cloud & Deployment Solutions',
    icon: Cloud,
    tone: 'brand-2',
    category: 'Platform',
    tagline: 'Infrastructure you can deploy to on a Friday',
    summary:
      'Cloud architecture, containers, CI/CD pipelines, infrastructure as code, monitoring and cost optimisation across AWS, Google Cloud and Cloudflare.',
    overview: [
      'We set up infrastructure that is reproducible, observable and cheap to run. Everything is defined as code, so environments can be recreated and reviewed like any other change.',
      'Deployments are automated, gated by tests and reversible, which is what makes frequent releases safe rather than stressful.',
    ],
    audience: [
      'Teams deploying manually',
      'Companies moving off legacy hosting',
      'Products with rising cloud bills',
    ],
    deliverables: [
      'Infrastructure as code for every environment',
      'Containerised builds and image registry',
      'CI/CD pipeline with automated rollback',
      'Monitoring, alerting and log aggregation',
      'Cost review with prioritised savings',
    ],
    capabilities: [
      {
        title: 'Infrastructure as code',
        body: 'Terraform-managed environments that are reviewable, repeatable and disposable.',
      },
      {
        title: 'Zero-downtime releases',
        body: 'Blue-green and rolling deploys with health checks and automatic rollback.',
      },
      {
        title: 'Monitoring and alerting',
        body: 'Dashboards and on-call alerts tied to symptoms users actually feel.',
      },
      {
        title: 'Cost engineering',
        body: 'Right-sizing, autoscaling and storage lifecycle rules that cut spend without risk.',
      },
    ],
    stack: [
      'AWS',
      'Google Cloud',
      'Cloudflare',
      'Docker',
      'Kubernetes',
      'Terraform',
      'GitHub Actions',
      'Grafana',
    ],
    outcomes: [
      { value: 'Minutes', label: 'From merge to production' },
      { value: '1 command', label: 'To recreate an environment' },
      { value: '20-40%', label: 'Typical cloud cost reduction' },
    ],
    faq: [
      {
        title: 'Do we have to change cloud providers?',
        body: 'No. We work in your existing account and only recommend a move when the numbers clearly justify it.',
      },
      {
        title: 'Can you handle ongoing operations?',
        body: 'Yes, via our maintenance and support retainer, including on-call coverage.',
      },
    ],
  },
  {
    slug: 'technology-consulting',
    name: 'Technology Consulting',
    icon: Lightbulb,
    tone: 'brand-3',
    category: 'Advisory',
    tagline: 'Straight answers about your architecture and roadmap',
    summary:
      'Technical audits, architecture reviews, technology selection, delivery process improvement and CTO-level advisory for teams at a crossroads.',
    overview: [
      'Sometimes the highest-value work is a clear decision. We review your architecture, codebase, delivery process and team structure, then give you a written assessment with options, trade-offs and costs.',
      'Advice is specific and actionable: what to fix first, what to leave alone, and what it will realistically take.',
    ],
    audience: [
      'Founders without a technical lead',
      'Teams choosing a stack',
      'Investors running technical due diligence',
    ],
    deliverables: [
      'Architecture and codebase assessment',
      'Risk register with severity and effort',
      'Technology selection recommendation',
      'Delivery process and team structure review',
      'Prioritised roadmap with cost estimates',
    ],
    capabilities: [
      {
        title: 'Technical due diligence',
        body: 'Independent review of code quality, scalability, security and key-person risk.',
      },
      {
        title: 'Architecture review',
        body: 'Where the current design will break, and the cheapest credible path to fix it.',
      },
      {
        title: 'Stack selection',
        body: "Recommendations based on your team's skills and hiring market, not fashion.",
      },
      {
        title: 'Fractional CTO',
        body: 'Ongoing senior technical leadership for a few days a month.',
      },
    ],
    stack: [
      'Architecture review',
      'Threat modelling',
      'DORA metrics',
      'Cost modelling',
      'Roadmapping',
    ],
    outcomes: [
      { value: '1-3 wks', label: 'Typical audit duration' },
      { value: 'Written', label: 'Report you can act on or share' },
      { value: 'Ranked', label: 'Risks by impact and effort' },
    ],
    faq: [
      {
        title: 'Will you recommend your own services?',
        body: 'The assessment is independent. Where a recommendation is something we can deliver, we say so explicitly and you are free to take it elsewhere.',
      },
      {
        title: 'Can you present to our board?',
        body: 'Yes — we produce both a technical report and a non-technical executive summary.',
      },
    ],
  },
  {
    slug: 'maintenance-support',
    name: 'Software Maintenance & Support',
    icon: LifeBuoy,
    tone: 'brand-1',
    category: 'Advisory',
    tagline: 'Someone accountable when something breaks',
    summary:
      'Ongoing maintenance retainers: bug fixes, dependency and security updates, performance monitoring, backups and defined response times.',
    overview: [
      'Software degrades without attention — dependencies age, certificates expire, data grows and third-party APIs change. A maintenance retainer keeps your system healthy and your team unblocked.',
      'Every retainer includes agreed response targets, a shared issue tracker and a monthly report on what changed and what needs attention next.',
    ],
    audience: [
      'Teams without in-house engineers',
      'Products in steady state',
      'Companies inheriting a legacy system',
    ],
    deliverables: [
      'Defined SLA and escalation path',
      'Security and dependency update cycle',
      'Uptime and performance monitoring',
      'Verified backups and restore drills',
      'Monthly health and activity report',
    ],
    capabilities: [
      {
        title: 'Defined response times',
        body: 'Severity-based targets so critical issues are picked up in minutes, not days.',
      },
      {
        title: 'Proactive updates',
        body: 'Patched dependencies and runtimes on a schedule, tested before they reach production.',
      },
      {
        title: 'Restore drills',
        body: 'Backups tested by actually restoring them, not just by checking a green tick.',
      },
      {
        title: 'Continuous small improvements',
        body: 'Retainer hours spent on the highest-value fixes each month.',
      },
    ],
    stack: [
      'Monitoring',
      'Sentry',
      'Dependabot',
      'Automated backups',
      'Uptime checks',
      'On-call rotation',
    ],
    outcomes: [
      { value: '15 min', label: 'Critical response target' },
      { value: 'Monthly', label: 'Security patch cycle' },
      { value: 'Tested', label: 'Backups, every quarter' },
    ],
    faq: [
      {
        title: 'Do you maintain software you did not build?',
        body: 'Yes, after a short onboarding audit so we understand the system before taking responsibility for it.',
      },
      {
        title: 'How are hours handled?',
        body: 'Retainers include a monthly allowance; unused hours roll over one month and overages are always approved in advance.',
      },
    ],
  },
  {
    slug: 'system-integration',
    name: 'System Integration',
    icon: Cpu,
    tone: 'brand-2',
    category: 'Platform',
    tagline: 'Make your tools talk to each other reliably',
    summary:
      'Connect ERPs, CRMs, payment providers, logistics platforms and legacy systems with resilient, monitored, idempotent integrations.',
    overview: [
      'Integrations fail quietly and cost real money. We build them with idempotent writes, retries, reconciliation jobs and alerting, so a failed sync is visible and recoverable instead of discovered a month later.',
      'Where an API does not exist, we build adapters over files, databases or legacy protocols and give you a clean interface on top.',
    ],
    audience: [
      'Businesses running many disconnected tools',
      'Retail and logistics operations',
      'Finance teams reconciling data by hand',
    ],
    deliverables: [
      'Integration map and data flow documentation',
      'Adapters and transformation layer',
      'Idempotent sync with retry and reconciliation',
      'Error alerting and replay tooling',
      'Cutover plan and validation report',
    ],
    capabilities: [
      {
        title: 'Idempotent syncing',
        body: 'Safe retries and deduplication so replays never create duplicate records.',
      },
      {
        title: 'Reconciliation jobs',
        body: 'Scheduled comparisons that surface drift between systems before finance does.',
      },
      {
        title: 'Legacy adapters',
        body: 'SFTP, CSV, SOAP and direct database sources wrapped behind a modern API.',
      },
      {
        title: 'Webhook infrastructure',
        body: 'Signed, retried and replayable webhooks in both directions.',
      },
    ],
    stack: [
      'REST',
      'GraphQL',
      'Webhooks',
      'SOAP',
      'SFTP/CSV',
      'Message queues',
      'Stripe',
      'ERP/CRM connectors',
    ],
    outcomes: [
      { value: '0', label: 'Duplicate records from retries' },
      { value: 'Daily', label: 'Automated reconciliation' },
      { value: 'Alerted', label: 'Every failed sync' },
    ],
    faq: [
      {
        title: 'Our vendor has no API — is that a blocker?',
        body: 'Rarely. Scheduled file exchange, database replication or screen-level automation can bridge most gaps safely.',
      },
      {
        title: 'How do you avoid data loss during cutover?',
        body: 'We run both systems in parallel with reconciliation until the numbers match, then switch.',
      },
    ],
  },
  {
    slug: 'performance-security',
    name: 'Performance, Security & QA',
    icon: Gauge,
    tone: 'brand-3',
    category: 'Advisory',
    tagline: 'Prove the system is fast, safe and correct',
    summary:
      'Load testing, profiling, security hardening, penetration-test remediation and automated QA pipelines that keep quality from slipping.',
    overview: [
      'We measure before we change. Profiling and load tests identify the actual bottleneck, and security reviews follow OWASP guidance rather than guesswork.',
      'Findings are turned into an automated test suite and CI gates, so the problem does not come back after the next release.',
    ],
    audience: [
      'Products preparing for a traffic spike',
      'Teams facing a security review',
      'Systems with recurring regressions',
    ],
    deliverables: [
      'Load test scenarios and capacity report',
      'Profiling results with ranked bottlenecks',
      'OWASP-aligned security review',
      'Automated regression and end-to-end suite',
      'CI quality gates and reporting',
    ],
    capabilities: [
      {
        title: 'Load and stress testing',
        body: 'Realistic traffic models that show where the system degrades and why.',
      },
      {
        title: 'Security hardening',
        body: 'Authentication, injection, access control and dependency risks reviewed and fixed.',
      },
      {
        title: 'Automated QA',
        body: 'End-to-end tests on critical journeys, running on every pull request.',
      },
      {
        title: 'Regression prevention',
        body: 'Performance and coverage budgets enforced in CI.',
      },
    ],
    stack: ['k6', 'Playwright', 'Vitest', 'OWASP ASVS', 'Lighthouse CI', 'Sentry', 'Grafana'],
    outcomes: [
      { value: 'Ranked', label: 'Bottlenecks by measured impact' },
      { value: 'OWASP', label: 'Review methodology' },
      { value: 'Every PR', label: 'Automated quality gates' },
    ],
    faq: [
      {
        title: 'Do you perform penetration testing?',
        body: 'We perform security reviews and remediate third-party pen-test findings; formal certified pen tests are run with a specialist partner.',
      },
      {
        title: 'Can you work alongside our QA team?',
        body: 'Yes — we frequently build the automation layer that an existing manual QA team then owns.',
      },
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
export const serviceSlugs = services.map((s) => s.slug);

export const engagementProcess = [
  {
    title: 'Discover',
    body: 'We map goals, users, constraints and existing systems, then write down what success means in measurable terms.',
  },
  {
    title: 'Define',
    body: 'Architecture, scope, milestones and a written estimate — so there are no surprises about cost or timeline.',
  },
  {
    title: 'Design',
    body: 'Flows, wireframes and interface design validated with real users before engineering starts.',
  },
  {
    title: 'Build',
    body: 'Two-week increments with working software, automated tests and a demo at the end of each one.',
  },
  {
    title: 'Launch',
    body: 'Staged rollout, monitoring, load validation and a rollback plan ready before go-live.',
  },
  {
    title: 'Support',
    body: 'Maintenance, iteration and knowledge transfer so your team can take ownership whenever you want.',
  },
];

export const techStack: { group: string; items: string[] }[] = [
  {
    group: 'Languages',
    items: ['TypeScript', 'JavaScript', 'PHP', 'Python', 'Kotlin', 'Go', 'SQL'],
  },
  {
    group: 'Frontend',
    items: ['React', 'Next.js', 'TanStack', 'Tailwind CSS', 'Vite', 'Jetpack Compose'],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'Laravel', 'Express', 'FastAPI', 'GraphQL', 'REST'],
  },
  {
    group: 'Data',
    items: ['PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Prisma', 'Nazexa DB Design'],
  },
  {
    group: 'Cloud & DevOps',
    items: [
      'AWS',
      'Google Cloud',
      'Cloudflare',
      'Docker',
      'Kubernetes',
      'Terraform',
      'GitHub Actions',
    ],
  },
  {
    group: 'Quality',
    items: ['Vitest', 'Playwright', 'k6', 'Sentry', 'OpenTelemetry', 'Grafana'],
  },
];

export const whyNazexa = [
  {
    title: 'Product-grade engineering',
    body: 'We build and run our own products, so client work gets the same standards we hold ourselves to.',
  },
  {
    title: 'Senior people only',
    body: 'The engineers in your discovery call are the engineers writing the code — no bait-and-switch staffing.',
  },
  {
    title: 'Transparent delivery',
    body: 'Shared boards, weekly demos and written estimates. You always know what is being built and what it costs.',
  },
  {
    title: 'Security and compliance first',
    body: 'Least privilege, encrypted data, audit trails and dependency hygiene as defaults, not extras.',
  },
  {
    title: 'Built to be maintained',
    body: 'Documented, tested, conventional code that another team could pick up tomorrow.',
  },
  {
    title: 'You own everything',
    body: 'Source code, infrastructure and accounts are yours from the first commit.',
  },
];

export const industriesServed = [
  {
    title: 'Fintech & payments',
    body: 'Ledgers, reconciliation, KYC flows and PCI-aware architecture.',
  },
  {
    title: 'Healthcare',
    body: 'Patient portals, scheduling and privacy-first data handling.',
  },
  {
    title: 'E-commerce & retail',
    body: 'Storefronts, inventory sync, order pipelines and peak-traffic readiness.',
  },
  {
    title: 'Logistics & field ops',
    body: 'Dispatch, tracking and offline-capable Android apps for teams on the move.',
  },
  {
    title: 'Education',
    body: 'Learning platforms, assessments and cohort management.',
  },
  {
    title: 'Real estate & services',
    body: 'Listings, CRM integration and lead capture that actually converts.',
  },
  {
    title: 'Manufacturing',
    body: 'Production dashboards, ERP integration and machine data pipelines.',
  },
  {
    title: 'Media & SaaS',
    body: 'Subscription products, content platforms and usage-based billing.',
  },
];
