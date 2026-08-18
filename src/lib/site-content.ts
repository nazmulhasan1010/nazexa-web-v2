import { pageOverrides } from "./page-blocks";

export type NavGroup = {
  label: string;
  items: { title: string; to: string; description: string }[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Product",
    items: [
      {
        title: "Products",
        to: "/products",
        description: "The full Nazexa platform suite",
      },
      {
        title: "Nazexa DB Design",
        to: "/db-design",
        description: "Visual ERD & database designer",
      },
      {
        title: "Nazexa DEV Tools",
        to: "/dev-tools",
        description: "JSON, API, JWT & SQL toolkit",
      },
      {
        title: "Integrations",
        to: "/integrations",
        description: "150+ tools that plug straight in",
      },
      {
        title: "Changelog",
        to: "/changelog",
        description: "Shipped this week",
      },
      {
        title: "Roadmap",
        to: "/roadmap",
        description: "What we're building next",
      },
      {
        title: "Download Center",
        to: "/download-center",
        description: "CLI, SDKs and desktop apps",
      },
    ],
  },
  {
    label: "Solutions",
    items: [
      {
        title: "Solutions",
        to: "/solutions",
        description: "Outcomes by team and stage",
      },
      {
        title: "All Services",
        to: "/services",
        description: "13 delivery practices for client projects",
      },
      {
        title: "Custom Software",
        to: "/services/custom-software-development",
        description: "Bespoke platforms and internal systems",
      },
      {
        title: "Android Apps",
        to: "/services/android-app-development",
        description: "Native and cross-platform mobile",
      },
      {
        title: "Web & Websites",
        to: "/services/web-development",
        description: "Web apps, portals and marketing sites",
      },
      {
        title: "Cloud & DevOps",
        to: "/services/cloud-deployment",
        description: "Infrastructure, CI/CD and monitoring",
      },
      {
        title: "Tech Consulting",
        to: "/services/technology-consulting",
        description: "Audits, architecture and advisory",
      },
      {
        title: "Industries",
        to: "/industries",
        description: "Fintech, health, commerce and more",
      },
      {
        title: "Case Studies",
        to: "/case-studies",
        description: "Measured customer outcomes",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        title: "Documentation",
        to: "/documentation",
        description: "Guides and concepts",
      },
      {
        title: "API Documentation",
        to: "/api-documentation",
        description: "REST, GraphQL and webhooks",
      },
      {
        title: "Tutorials",
        to: "/tutorials",
        description: "Build something in 20 minutes",
      },
      {
        title: "Developer Blog",
        to: "/developer-blog",
        description: "Engineering deep dives",
      },
      {
        title: "Community",
        to: "/community",
        description: "20k builders, one Discord",
      },
      {
        title: "Status Page",
        to: "/status",
        description: "Live uptime and incidents",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        title: "Resources",
        to: "/resources",
        description: "Reports, templates, playbooks",
      },
      {
        title: "Learning Center",
        to: "/learning-center",
        description: "Structured learning paths",
      },
      {
        title: "Company Blog",
        to: "/blog",
        description: "Product and company stories",
      },
      { title: "News", to: "/news", description: "Press and announcements" },
      {
        title: "Events",
        to: "/events",
        description: "Conferences and meetups",
      },
      { title: "Support", to: "/support", description: "Get help fast" },
    ],
  },
  {
    label: "Company",
    items: [
      { title: "About", to: "/about", description: "Why Nazexa exists" },
      {
        title: "Team",
        to: "/team",
        description: "The people behind the platform",
      },
      { title: "Careers", to: "/careers", description: "Open roles worldwide" },
      {
        title: "Customers",
        to: "/customers",
        description: "Teams shipping on Nazexa",
      },
      {
        title: "Partners",
        to: "/partners",
        description: "Build and resell with us",
      },
      {
        title: "Press Kit",
        to: "/press-kit",
        description: "Logos, brand and boilerplate",
      },
    ],
  },
];

export const footerColumns: {
  title: string;
  links: { label: string; to: string }[];
}[] = [
  {
    title: "Platform",
    links: [
      { label: "Products", to: "/products" },
      { label: "Nazexa DB Design", to: "/db-design" },
      { label: "Nazexa DEV Tools", to: "/dev-tools" },
      { label: "Solutions", to: "/solutions" },
      { label: "Integrations", to: "/integrations" },
      { label: "Pricing", to: "/pricing" },
      { label: "Roadmap", to: "/roadmap" },
      { label: "Changelog", to: "/changelog" },
      { label: "Release Notes", to: "/release-notes" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", to: "/documentation" },
      { label: "API Reference", to: "/api-documentation" },
      { label: "Tutorials", to: "/tutorials" },
      { label: "Developer Blog", to: "/developer-blog" },
      { label: "Community", to: "/community" },
      { label: "Feature Requests", to: "/feature-requests" },
      { label: "Download Center", to: "/download-center" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Team", to: "/team" },
      { label: "Careers", to: "/careers" },
      { label: "Customers", to: "/customers" },
      { label: "Partners", to: "/partners" },
      { label: "News", to: "/news" },
      { label: "Press Kit", to: "/press-kit" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Services", to: "/services" },
      { label: "UI/UX Design", to: "/services/ui-ux-design" },
      { label: "SaaS Development", to: "/services/saas-development" },
      { label: "Case Studies", to: "/case-studies" },
      { label: "Portfolio", to: "/portfolio" },
      { label: "Blog", to: "/blog" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", to: "/security" },
      { label: "Status", to: "/status" },
      { label: "Support", to: "/support" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export type PageBlock =
  | {
      kind: "features";
      title: string;
      items: { title: string; body: string }[];
    }
  | {
      kind: "list";
      title: string;
      items: { title: string; body: string; meta?: string }[];
    }
  | {
      kind: "stats";
      title: string;
      items: { value: number; suffix?: string; label: string }[];
    }
  | { kind: "faq"; title: string; items: { title: string; body: string }[] }
  | {
      kind: "prose";
      title: string;
      paragraphs: string[];
      aside?: { title: string; items: string[] };
    }
  | { kind: "steps"; title: string; items: { title: string; body: string }[] }
  | {
      kind: "timeline";
      title: string;
      items: { date: string; title: string; body: string; tag?: string }[];
    }
  | { kind: "table"; title: string; columns: string[]; rows: string[][] }
  | {
      kind: "quotes";
      title: string;
      items: { quote: string; name: string; role: string }[];
    }
  | {
      kind: "people";
      title: string;
      items: {
        name: string;
        role: string;
        location?: string;
        focus?: string;
      }[];
    }
  | {
      kind: "cards";
      title: string;
      items: { title: string; body: string; meta?: string; tag?: string }[];
    }
  | {
      kind: "checklist";
      title: string;
      columns: { title: string; items: string[] }[];
    }
  | {
      kind: "code";
      title: string;
      body?: string;
      language: string;
      code: string;
    }
  | {
      kind: "pricing";
      title: string;
      tiers: {
        name: string;
        price: string;
        cadence?: string;
        body: string;
        features: string[];
        highlight?: boolean;
      }[];
    }
  | {
      kind: "channels";
      title: string;
      items: { title: string; body: string; action: string }[];
    }
  | {
      kind: "legal";
      title: string;
      sections: { heading: string; body: string }[];
    }
  | { kind: "cta"; title: string; body: string };

export type PageTone = "brand-1" | "brand-2" | "brand-3";
export type HeroVariant = "center" | "split" | "editorial" | "minimal";

export type PageContent = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: PageTone;
  heroVariant?: HeroVariant;
  intro?: string;
  meta?: { label: string; value: string }[];
  blocks: PageBlock[];
};

const f = (title: string, body: string) => ({ title, body });

function standard(
  slug: string,
  eyebrow: string,
  title: string,
  description: string,
  features: [string, string][],
  list: { title: string; body: string; meta?: string }[],
  faq: [string, string][],
): PageContent {
  return {
    slug,
    eyebrow,
    title,
    description,
    blocks: [
      {
        kind: "features",
        title: "What you get",
        items: features.map(([t, b]) => f(t, b)),
      },
      { kind: "list", title: "Highlights", items: list },
      {
        kind: "stats",
        title: "By the numbers",
        items: [
          { value: 99.99, suffix: "%", label: "Platform uptime" },
          { value: 14000, suffix: "+", label: "Engineering teams" },
          { value: 42, suffix: "ms", label: "Median edge latency" },
          { value: 150, suffix: "+", label: "Native integrations" },
        ],
      },
      {
        kind: "faq",
        title: "Frequently asked",
        items: faq.map(([t, b]) => f(t, b)),
      },
      {
        kind: "cta",
        title: "Ready when you are",
        body: "Start free, invite your team, and ship to production the same afternoon.",
      },
    ],
  };
}

export const genericFaq: [string, string][] = [
  [
    "How quickly can we get started?",
    "Most teams are in production within a week using our starter templates and migration tooling.",
  ],
  [
    "Do you offer enterprise agreements?",
    "Yes — custom SLAs, dedicated regions, SSO/SCIM, and named support engineers.",
  ],
  [
    "Can we self-host?",
    "Enterprise plans include a self-managed distribution with the same control plane APIs.",
  ],
  [
    "What does support look like?",
    "24/7 coverage with a 15-minute P1 response target on Enterprise.",
  ],
];

export const genericList = [
  {
    title: "Built for scale",
    body: "Multi-region by default with automatic failover and zero-downtime deploys.",
    meta: "Infrastructure",
  },
  {
    title: "Designed for developers",
    body: "Typed SDKs, local emulators, and preview environments on every pull request.",
    meta: "DX",
  },
  {
    title: "Governed by design",
    body: "Granular roles, audit trails, and policy-as-code baked into the platform.",
    meta: "Governance",
  },
];

export const defs: [string, string, string, string, [string, string][]][] = [
  [
    "about",
    "Company",
    "We build the platform we always wanted",
    "Nazexa started in a two-person garage office and now powers products used by millions every day.",
    [
      [
        "Our mission",
        "Remove the undifferentiated work between an idea and a shipped product.",
      ],
      [
        "Our principles",
        "Craft over noise, speed with safety, and radical clarity in everything we build.",
      ],
      [
        "Our people",
        "180 engineers, designers and operators across 24 countries.",
      ],
    ],
  ],
  [
    "products",
    "Platform",
    "One platform, every layer of your product",
    "Databases, edge compute, auth, AI and observability that work together out of the box.",
    [
      [
        "Nazexa Core",
        "Managed Postgres, edge functions and object storage under one API.",
      ],
      [
        "Nazexa AI",
        "Embeddings, agents and evaluation pipelines with usage-based billing.",
      ],
      [
        "Nazexa Insight",
        "Product analytics, tracing and alerting with no extra agents.",
      ],
    ],
  ],
  [
    "product-details",
    "Product",
    "Nazexa Core in detail",
    "A closer look at the runtime, storage engine and developer workflow behind Nazexa Core.",
    [
      [
        "Live preview",
        "Branch your database, preview it, then merge with a single command.",
      ],
      [
        "Interactive screenshots",
        "Explore the console, schema designer and query profiler.",
      ],
      ["Downloads", "CLI, Docker images and signed release artifacts."],
    ],
  ],
  [
    "services",
    "Services",
    "Expert teams, delivered",
    "Architecture reviews, migrations and embedded engineering pods that move with your roadmap.",
    [
      [
        "Platform engineering",
        "We design and operate your internal developer platform.",
      ],
      [
        "Migration services",
        "Move off legacy infrastructure with zero downtime.",
      ],
      [
        "Enablement",
        "Workshops and pairing that leave your team faster than we found it.",
      ],
    ],
  ],
  [
    "service-details",
    "Services",
    "Platform engineering retainer",
    "A senior pod embedded with your team for a fixed monthly rate.",
    [
      [
        "Discovery",
        "Two-week audit of your current architecture and delivery flow.",
      ],
      ["Delivery", "Shipping increments every sprint against agreed outcomes."],
      ["Handover", "Documentation, runbooks and training before we step back."],
    ],
  ],
  [
    "solutions",
    "Solutions",
    "Solutions mapped to outcomes",
    "Whether you are launching, scaling or consolidating, there is a paved road for it.",
    [
      ["Startups", "Ship your MVP in days with generous free tiers."],
      [
        "Scale-ups",
        "Multi-region, compliance-ready infrastructure without a platform team.",
      ],
      ["Enterprise", "Governance, procurement and support your board expects."],
    ],
  ],
  [
    "industries",
    "Industries",
    "Built for regulated, demanding industries",
    "Fintech, healthcare, commerce, logistics, media and public sector teams run on Nazexa.",
    [
      ["Fintech", "PCI-aligned controls and immutable audit logs."],
      ["Healthcare", "HIPAA-ready infrastructure with signed BAAs."],
      ["Commerce", "Edge caching and global reads for peak traffic events."],
    ],
  ],
  [
    "case-studies",
    "Proof",
    "Case studies",
    "Real teams, real numbers, verified outcomes.",
    [
      [
        "Northwind: 8x faster releases",
        "Consolidated five services onto Nazexa Core and cut deploy time to 90 seconds.",
      ],
      [
        "Helio Health: 62% cost reduction",
        "Replaced self-managed clusters with managed edge compute.",
      ],
      [
        "Vantage Retail: Black Friday at 0 incidents",
        "Handled 40k requests per second with no manual scaling.",
      ],
    ],
  ],
  [
    "portfolio",
    "Work",
    "Selected work",
    "A sample of the products our teams have designed, built and scaled.",
    [
      [
        "Design systems",
        "Component libraries adopted by 300+ internal engineers.",
      ],
      ["Data platforms", "Petabyte-scale pipelines with sub-second freshness."],
      ["AI products", "Retrieval systems serving millions of queries monthly."],
    ],
  ],
  [
    "documentation",
    "Developers",
    "Documentation",
    "Concepts, guides and references for every part of the platform.",
    [
      ["Quickstarts", "From zero to deployed in under ten minutes."],
      ["Guides", "Auth, storage, jobs, migrations and observability."],
      ["Concepts", "How the runtime, scheduler and replication actually work."],
    ],
  ],
  [
    "api-documentation",
    "Developers",
    "API reference",
    "REST, GraphQL, realtime and webhooks — fully typed and versioned.",
    [
      [
        "REST",
        "Predictable resources, cursor pagination and idempotency keys.",
      ],
      ["GraphQL", "Schema-first with persisted queries and depth limits."],
      ["Webhooks", "Signed payloads with automatic retries and replay."],
    ],
  ],
  [
    "changelog",
    "Product",
    "Changelog",
    "Everything we shipped, in reverse chronological order.",
    [
      [
        "Weekly releases",
        "New capabilities every Thursday, backwards compatible by default.",
      ],
      [
        "Deprecation policy",
        "12 months notice with automated migration guidance.",
      ],
      ["Preview flags", "Opt into early features per project."],
    ],
  ],
  [
    "roadmap",
    "Product",
    "Roadmap",
    "What we are exploring, building and rolling out next.",
    [
      ["Now", "Multi-region writes and branch-aware analytics."],
      ["Next", "Native workflow orchestration and policy simulation."],
      ["Later", "On-device inference and offline-first sync."],
    ],
  ],
  [
    "pricing",
    "Pricing",
    "Pricing that scales with you",
    "Start free. Pay for what you use. Predictable at every stage.",
    [
      ["Free", "Everything you need to build and launch a side project."],
      [
        "Team",
        "Usage-based pricing with spend caps, SSO and preview environments.",
      ],
      ["Enterprise", "Custom contracts, dedicated regions and 24/7 support."],
    ],
  ],
  [
    "resources",
    "Resources",
    "Resources",
    "Reports, templates, playbooks and reference architectures.",
    [
      ["Reference architectures", "Battle-tested blueprints you can copy."],
      ["Templates", "Production-ready starters for common product shapes."],
      ["Reports", "Annual State of Platform Engineering research."],
    ],
  ],
  [
    "learning-center",
    "Learning",
    "Learning Center",
    "Structured paths that take you from first deploy to production expert.",
    [
      ["Foundations", "Core concepts in six short modules."],
      ["Advanced", "Performance, cost and reliability engineering."],
      ["Certification", "Prove your expertise with the Nazexa credential."],
    ],
  ],
  [
    "tutorials",
    "Learning",
    "Tutorials",
    "Short, focused builds you can finish in a single sitting.",
    [
      ["Build a SaaS starter", "Auth, billing and a dashboard in 20 minutes."],
      ["Add semantic search", "Embeddings and hybrid retrieval end to end."],
      ["Ship a realtime app", "Presence, cursors and conflict resolution."],
    ],
  ],
  [
    "developer-blog",
    "Engineering",
    "Developer blog",
    "How we build Nazexa — architecture, trade-offs and postmortems.",
    [
      ["Deep dives", "Storage internals, scheduling and consensus."],
      ["Postmortems", "What broke, why, and what we changed."],
      [
        "Benchmarks",
        "Reproducible performance work with published methodology.",
      ],
    ],
  ],
  [
    "blog",
    "Company",
    "Company blog",
    "Product launches, culture and the thinking behind our decisions.",
    [
      ["Launches", "What shipped and why it matters."],
      ["Culture", "How a remote-first team of 180 operates."],
      ["Perspectives", "Where we think developer tooling is heading."],
    ],
  ],
  [
    "news",
    "Newsroom",
    "News",
    "Announcements, funding, partnerships and coverage.",
    [
      ["Announcements", "Official statements from the company."],
      ["Coverage", "Nazexa in the press."],
      ["Media contact", "Reach our comms team directly."],
    ],
  ],
  [
    "press-kit",
    "Newsroom",
    "Press kit",
    "Logos, brand guidance, executive bios and company boilerplate.",
    [
      ["Logos", "SVG and PNG marks in light and dark variants."],
      ["Brand", "Colour, typography and clear-space rules."],
      ["Boilerplate", "Approved company description for publication."],
    ],
  ],
  [
    "careers",
    "Careers",
    "Build the platform, and your craft",
    "Remote-first roles across engineering, design, product and go-to-market.",
    [
      ["How we hire", "Four focused conversations, no take-home marathons."],
      [
        "Benefits",
        "Equity, generous leave, hardware budget and learning stipend.",
      ],
      ["Life at Nazexa", "Async by default, deep work protected."],
    ],
  ],
  [
    "team",
    "Company",
    "The team",
    "Engineers, designers and operators who have shipped at global scale.",
    [
      ["Leadership", "Founders and functional leads."],
      [
        "Engineering",
        "Distributed systems, developer experience and security.",
      ],
      ["Advisors", "Operators who have built category-defining companies."],
    ],
  ],
  [
    "contact",
    "Contact",
    "Talk to us",
    "Sales, support, partnerships or press — we route your message to a human.",
    [
      ["Sales", "Scoping, pricing and procurement."],
      ["Support", "Technical help for existing customers."],
      ["Partnerships", "Build, resell or co-market with Nazexa."],
    ],
  ],
  [
    "faq",
    "Help",
    "Frequently asked questions",
    "Answers to the questions we hear most from evaluating teams.",
    [
      ["Billing", "Usage, invoices, credits and spend caps."],
      ["Security", "Certifications, data residency and encryption."],
      ["Migration", "Moving from your current stack."],
    ],
  ],
  [
    "community",
    "Community",
    "Community",
    "20,000 builders sharing patterns, plugins and war stories.",
    [
      ["Discord", "Real-time help from the team and community."],
      ["Forums", "Longer-form discussion and searchable answers."],
      ["Champions", "Recognition programme for top contributors."],
    ],
  ],
  [
    "events",
    "Community",
    "Events",
    "Conferences, workshops, meetups and livestreams.",
    [
      ["Nazexa Conf", "Our annual product and engineering conference."],
      ["Workshops", "Hands-on sessions with our solution architects."],
      ["Meetups", "Community-run gatherings in 30 cities."],
    ],
  ],
  [
    "partners",
    "Partners",
    "Partners",
    "Agencies, technology vendors and cloud providers building with us.",
    [
      ["Solution partners", "Certified agencies that deliver on Nazexa."],
      ["Technology partners", "Deep integrations with the tools you use."],
      ["Become a partner", "Apply to the programme in minutes."],
    ],
  ],
  [
    "customers",
    "Customers",
    "Customers",
    "From seed-stage startups to Fortune 100 platform teams.",
    [
      ["Logos", "Teams that trust Nazexa in production."],
      ["Stories", "How they migrated, and what changed."],
      ["Advisory board", "Customers who shape our roadmap."],
    ],
  ],
  [
    "integrations",
    "Platform",
    "Integrations",
    "150+ integrations across CI, observability, identity and data.",
    [
      ["CI/CD", "GitHub, GitLab and Buildkite pipelines."],
      ["Observability", "Traces and metrics into your existing stack."],
      ["Identity", "SAML, OIDC and SCIM provisioning."],
    ],
  ],
  [
    "download-center",
    "Developers",
    "Download center",
    "CLI binaries, SDKs, desktop apps and signed artifacts.",
    [
      ["CLI", "macOS, Linux and Windows builds."],
      ["SDKs", "TypeScript, Go, Python, Rust and Java."],
      ["Checksums", "Signed releases with published provenance."],
    ],
  ],
  [
    "security",
    "Trust",
    "Security",
    "SOC 2 Type II, ISO 27001 and encryption everywhere by default.",
    [
      ["Certifications", "Independently audited annually."],
      [
        "Data protection",
        "Encrypted at rest and in transit with customer-managed keys.",
      ],
      ["Responsible disclosure", "A funded bug bounty with fast triage."],
    ],
  ],
  [
    "privacy",
    "Legal",
    "Privacy policy",
    "How we collect, use and protect personal data.",
    [
      [
        "Data we collect",
        "Only what is needed to run and improve the service.",
      ],
      ["Your rights", "Access, export and deletion on request."],
      ["Sub-processors", "A published, versioned list."],
    ],
  ],
  [
    "terms",
    "Legal",
    "Terms of service",
    "The agreement that governs use of Nazexa products.",
    [
      ["Your account", "Responsibilities and acceptable use."],
      ["Service levels", "Availability commitments and remedies."],
      ["Changes", "How and when these terms may be updated."],
    ],
  ],
  [
    "cookie-policy",
    "Legal",
    "Cookie policy",
    "What we store in your browser, and how to control it.",
    [
      ["Essential", "Required for authentication and security."],
      ["Analytics", "Aggregate usage measurement, opt-out anytime."],
      ["Preferences", "Manage your choices in one place."],
    ],
  ],
  [
    "support",
    "Help",
    "Support",
    "Documentation, community and human help when you need it.",
    [
      ["Help center", "Searchable answers to common problems."],
      ["Ticketing", "Track issues with clear SLAs."],
      ["Premium support", "Named engineers and private channels."],
    ],
  ],
  [
    "status",
    "Trust",
    "Status",
    "Live availability across every region and service.",
    [
      ["Current status", "All systems operational."],
      ["Incident history", "Full timelines and root cause analysis."],
      ["Subscribe", "Email, SMS, RSS and webhook notifications."],
    ],
  ],
  [
    "feature-requests",
    "Product",
    "Feature requests",
    "Tell us what to build next — and see what others are asking for.",
    [
      ["Submit", "Describe the problem, not just the feature."],
      ["Vote", "Signal what matters to your team."],
      ["Track", "Follow requests from idea to release."],
    ],
  ],
  [
    "release-notes",
    "Product",
    "Release notes",
    "Versioned notes for every stable release.",
    [
      ["Stable", "Production-ready releases with migration notes."],
      ["Beta", "Opt-in features under active development."],
      ["Security releases", "Patches with severity and remediation steps."],
    ],
  ],
];

export const pages: Record<string, PageContent> = Object.fromEntries(
  defs.map(([slug, eyebrow, title, description, features]) => {
    const base = standard(
      slug,
      eyebrow,
      title,
      description,
      features,
      genericList,
      genericFaq,
    );
    const override = pageOverrides[slug];
    return [slug, override ? { ...base, ...override } : base];
  }),
);

export const pageSlugs = defs.map(([slug]) => slug);
