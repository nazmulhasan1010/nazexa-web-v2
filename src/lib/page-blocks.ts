import type { HeroVariant, PageBlock, PageTone } from "./site-content";

export type PageOverride = {
  tone?: PageTone;
  heroVariant?: HeroVariant;
  intro?: string;
  meta?: { label: string; value: string }[];
  blocks: PageBlock[];
};

const trustFaq: PageBlock = {
  kind: "faq",
  title: "Frequently asked",
  items: [
    {
      title: "Where is our data stored?",
      body: "Choose from 19 regions across North America, Europe, Asia-Pacific and South America. Data residency is enforced at the control-plane level, so replicas never leave the region you pick.",
    },
    {
      title: "How are backups handled?",
      body: "Continuous WAL archiving with point-in-time recovery to any second in the last 35 days, plus daily encrypted snapshots retained for 12 months on Enterprise.",
    },
    {
      title: "Can we bring our own keys?",
      body: "Yes. Customer-managed encryption keys via AWS KMS, GCP KMS or Azure Key Vault, with automatic re-wrapping on rotation.",
    },
    {
      title: "What is the incident process?",
      body: "Paging within 60 seconds of detection, a public status update within 15 minutes, and a written root-cause analysis within five business days.",
    },
  ],
};

export const pageOverrides: Record<string, PageOverride> = {
  about: {
    tone: "brand-2",
    heroVariant: "editorial",
    intro:
      "Nazexa is a software company with two sides: we build our own developer products, and we build software for clients who need a technology partner they can trust.",
    meta: [
      { label: "Founded", value: "2018, Amsterdam" },
      { label: "Team", value: "180 people, 24 countries" },
      { label: "Products", value: "DB Design, DEV Tools" },
      { label: "Services", value: "13 delivery practices" },
    ],
    blocks: [
      {
        kind: "prose",
        title: "Who we are",
        paragraphs: [
          "Nazexa is a software product and services company. We build Nazexa DB Design, a visual database design platform, and Nazexa DEV Tools, a workspace of everyday developer utilities. Those products are made by the same engineers who deliver client work, which is why our client projects are held to product standards.",
          "On the services side we design and build custom software, Android applications, websites and web platforms, SaaS products, APIs, databases and cloud infrastructure — and we stay on afterwards to maintain what we shipped.",
          "We are deliberately senior and deliberately small per project. The people in your first call are the people writing the code, and everything we deliver — source, infrastructure, documentation — belongs to you.",
        ],
        aside: {
          title: "What we optimise for",
          items: [
            "Time from idea to production",
            "Predictable cost and scope",
            "Security and data integrity",
            "Code your team can maintain",
          ],
        },
      },
      {
        kind: "cards",
        title: "Mission and vision",
        items: [
          {
            title: "Our mission",
            tag: "Mission",
            body: "Turn business ideas into reliable, scalable software — removing the distance between what a team imagines and what its customers can actually use.",
          },
          {
            title: "Our vision",
            tag: "Vision",
            body: "To be the technology partner organisations trust from first prototype to platform scale, known for engineering that stays fast, secure and maintainable for years.",
          },
          {
            title: "Our promise",
            tag: "Values",
            body: "Honest estimates, transparent delivery, senior engineers only, and full ownership of every line of code and every cloud account we touch.",
          },
        ],
      },
      {
        kind: "features",
        title: "What we do",
        items: [
          {
            title: "Products",
            body: "Nazexa DB Design and Nazexa DEV Tools — tools we use daily, made available to every developer.",
          },
          {
            title: "Client engineering",
            body: "Custom software, Android apps, web platforms, SaaS, APIs, databases, cloud and integrations.",
          },
          {
            title: "Advisory and support",
            body: "Technology consulting, architecture reviews, QA, security hardening and long-term maintenance retainers.",
          },
        ],
      },
      {
        kind: "timeline",
        title: "How we got here",
        items: [
          {
            date: "2018",
            title: "Two people, one thesis",
            body: "Nazexa starts as a managed Postgres branching tool used by 40 beta teams.",
            tag: "Origin",
          },
          {
            date: "2020",
            title: "Edge runtime launches",
            body: "Functions deploy to 34 regions in under 10 seconds; the platform passes 1,000 customers.",
            tag: "Platform",
          },
          {
            date: "2022",
            title: "Enterprise readiness",
            body: "SOC 2 Type II, ISO 27001, SSO/SCIM and self-managed distribution ship in the same year.",
            tag: "Trust",
          },
          {
            date: "2024",
            title: "Nazexa AI",
            body: "Embeddings, retrieval and evaluation pipelines join the platform with usage-based billing.",
            tag: "Product",
          },
          {
            date: "2026",
            title: "14,000 teams",
            body: "Multi-region writes enter general availability and the platform crosses 4B daily requests.",
            tag: "Today",
          },
        ],
      },
      {
        kind: "checklist",
        title: "How we work",
        columns: [
          {
            title: "Craft over noise",
            items: [
              "Ship fewer things, finish them",
              "Design reviews before code reviews",
              "No dark patterns, ever",
              "Docs written before launch",
            ],
          },
          {
            title: "Speed with safety",
            items: [
              "Every change behind a flag",
              "Progressive rollouts by default",
              "Blameless postmortems, published",
              "On-call is a team sport",
            ],
          },
          {
            title: "Radical clarity",
            items: [
              "Written proposals, async decisions",
              "Public roadmap and changelog",
              "Transparent pricing with spend caps",
              "Customers see incident timelines",
            ],
          },
        ],
      },
      {
        kind: "stats",
        title: "Nazexa in numbers",
        items: [
          { value: 14000, suffix: "+", label: "Teams in production" },
          { value: 4.1, suffix: "B", label: "Daily platform requests" },
          { value: 24, label: "Countries with teammates" },
          { value: 99.99, suffix: "%", label: "Trailing 12-month uptime" },
        ],
      },
      {
        kind: "cta",
        title: "Come build with us",
        body: "Read the engineering blog, browse open roles, or start on the free tier in under two minutes.",
      },
    ],
  },

  products: {
    tone: "brand-1",
    heroVariant: "split",
    intro:
      "Three products, one control plane. Adopt them individually or run your entire stack on the suite.",
    meta: [
      { label: "Products", value: "Core, AI, Insight" },
      { label: "Regions", value: "19 worldwide" },
      { label: "SDKs", value: "TypeScript, Go, Python, Rust, Java" },
    ],
    blocks: [
      {
        kind: "cards",
        title: "The product suite",
        items: [
          {
            tag: "Core",
            title: "Nazexa Core",
            body: "Managed Postgres with instant branching, an edge function runtime, object storage, queues and cron — all behind one typed API and one permission model.",
            meta: "From $0 / month",
          },
          {
            tag: "AI",
            title: "Nazexa AI",
            body: "Embeddings, hybrid retrieval, agent orchestration and offline evaluation with per-token billing and no separate vector database to operate.",
            meta: "Usage-based",
          },
          {
            tag: "Insight",
            title: "Nazexa Insight",
            body: "Product analytics, distributed tracing, logs and alerting collected by the runtime itself — no agents, no sampling surprises, no extra sidecars.",
            meta: "Included on Team",
          },
        ],
      },
      {
        kind: "table",
        title: "Capability matrix",
        columns: ["Capability", "Core", "AI", "Insight"],
        rows: [
          ["Managed Postgres 16 + branching", "Included", "Reads", "Reads"],
          ["Edge functions (34 PoPs)", "Included", "Included", "—"],
          ["Object storage + signed URLs", "Included", "—", "—"],
          ["Vector search & hybrid retrieval", "Extension", "Native", "—"],
          ["Tracing, logs, metrics", "Basic", "Basic", "Full"],
          ["Point-in-time recovery", "35 days", "35 days", "—"],
          [
            "Self-managed distribution",
            "Enterprise",
            "Enterprise",
            "Enterprise",
          ],
        ],
      },
      {
        kind: "features",
        title: "Shared platform guarantees",
        items: [
          {
            title: "One permission model",
            body: "Row-level policies, service roles and audit trails apply identically across database, storage and functions.",
          },
          {
            title: "Branch everything",
            body: "A branch clones schema, data, storage buckets and secrets, then tears itself down when the PR closes.",
          },
          {
            title: "Typed end to end",
            body: "Schema changes regenerate SDK types automatically, so a bad migration fails your build, not production.",
          },
        ],
      },
      {
        kind: "quotes",
        title: "What builders say",
        items: [
          {
            quote:
              "We deleted four vendors and a 3,000-line Terraform module in the first month.",
            name: "Priya Raman",
            role: "Head of Platform, Northwind",
          },
          {
            quote:
              "Branching a database with production-shaped data changed how our whole team reviews work.",
            name: "Tomas Lund",
            role: "Staff Engineer, Helio Health",
          },
        ],
      },
      {
        kind: "cta",
        title: "See the platform in action",
        body: "Spin up a project on the free tier, or book a 30-minute architecture walkthrough with a solutions engineer.",
      },
    ],
  },

  "product-details": {
    tone: "brand-1",
    heroVariant: "split",
    intro:
      "A closer look at the storage engine, runtime and developer workflow behind Nazexa Core.",
    meta: [
      { label: "Engine", value: "Postgres 16" },
      { label: "Cold start", value: "11 ms median" },
      { label: "Branch create", value: "< 2 s at 500 GB" },
    ],
    blocks: [
      {
        kind: "prose",
        title: "Architecture in one page",
        paragraphs: [
          "Core separates storage from compute. Pages live in a replicated log-structured store spread across three availability zones; compute nodes are stateless and can be resized, paused or cloned without touching data.",
          "Because storage is copy-on-write, a branch is a metadata operation. Creating a 500 GB branch costs a couple of seconds and only bills for pages you actually modify.",
          "The edge runtime executes V8 isolates in 34 points of presence, with automatic read routing to the nearest replica and strong reads pinned to the primary when you ask for them.",
        ],
        aside: {
          title: "Numbers we publish",
          items: [
            "11 ms median cold start",
            "42 ms p50 edge latency",
            "1.8 s branch create at 500 GB",
            "35-day point-in-time recovery",
          ],
        },
      },
      {
        kind: "code",
        title: "The workflow, end to end",
        body: "Branch, migrate, preview and merge — the same commands locally and in CI.",
        language: "bash",
        code: `nz branch create pr-482 --from main
nz db migrate --branch pr-482
nz deploy --branch pr-482 --preview

# preview URL is posted back to the pull request
nz branch merge pr-482 --into main --strategy migrate`,
      },
      {
        kind: "steps",
        title: "From clone to production",
        items: [
          {
            title: "1. Model your schema",
            body: "Write migrations in SQL or use the visual designer; both produce the same versioned migration files in your repo.",
          },
          {
            title: "2. Preview with real shapes",
            body: "Every pull request gets a branch seeded with anonymised production data and its own deploy URL.",
          },
          {
            title: "3. Roll out progressively",
            body: "Ship behind flags, watch traces in Insight, and roll back to any second within the recovery window.",
          },
        ],
      },
      {
        kind: "table",
        title: "Limits and defaults",
        columns: ["Resource", "Free", "Team", "Enterprise"],
        rows: [
          ["Database storage", "1 GB", "Pay as you go", "Unlimited"],
          ["Concurrent branches", "3", "50", "Custom"],
          ["Function invocations", "1M / mo", "Pay as you go", "Committed"],
          ["Point-in-time recovery", "1 day", "35 days", "365 days"],
          ["Regions per project", "1", "5", "All 19"],
        ],
      },
      {
        kind: "cta",
        title: "Try the workflow yourself",
        body: "Install the CLI, run one command, and have a branch with a preview URL in under two minutes.",
      },
    ],
  },

  services: {
    tone: "brand-3",
    heroVariant: "editorial",
    intro:
      "Senior engineers who have run platforms at scale, embedded with your team for as long as you need them.",
    meta: [
      { label: "Engagements", value: "Audit, pod, migration" },
      { label: "Start", value: "Typically within 2 weeks" },
      { label: "Delivery", value: "Fixed monthly rate" },
    ],
    blocks: [
      {
        kind: "cards",
        title: "Ways to work with us",
        items: [
          {
            tag: "2 weeks",
            title: "Architecture audit",
            body: "A written review of your architecture, delivery flow and cost profile, with a prioritised remediation plan you own.",
            meta: "From $18k",
          },
          {
            tag: "Ongoing",
            title: "Embedded pod",
            body: "Two to four senior engineers working inside your sprints on platform, migration or reliability outcomes.",
            meta: "From $54k / month",
          },
          {
            tag: "Fixed scope",
            title: "Migration programme",
            body: "Cutover planning, dual-write orchestration and rollback rehearsal for moving off legacy infrastructure.",
            meta: "Quoted per project",
          },
          {
            tag: "Continuous",
            title: "Enablement",
            body: "Workshops, pairing weeks and internal documentation so your team keeps the velocity after we leave.",
            meta: "From $9k",
          },
        ],
      },
      {
        kind: "steps",
        title: "How an engagement runs",
        items: [
          {
            title: "Discovery",
            body: "Two weeks of interviews, code reading and telemetry review. You get a written findings document, not a slide deck.",
          },
          {
            title: "Delivery",
            body: "Increments shipped every sprint against outcomes agreed up front, with a public burn-up your leadership can read.",
          },
          {
            title: "Handover",
            body: "Runbooks, architecture decision records and a training week before we step back to advisory.",
          },
        ],
      },
      {
        kind: "stats",
        title: "Outcomes we have delivered",
        items: [
          { value: 62, suffix: "%", label: "Median infra cost reduction" },
          { value: 8, suffix: "x", label: "Faster release cadence" },
          { value: 0, label: "Cutover incidents in 2025" },
          { value: 31, label: "Programmes delivered" },
        ],
      },
      {
        kind: "quotes",
        title: "Client feedback",
        items: [
          {
            quote:
              "They found $400k of annual waste in the first fortnight and then helped us go and get it.",
            name: "Dana Oyelaran",
            role: "VP Engineering, Vantage Retail",
          },
          {
            quote:
              "The handover was the best part — our team can operate all of it without them.",
            name: "Marc Fischer",
            role: "CTO, Lumen Logistics",
          },
        ],
      },
      {
        kind: "cta",
        title: "Scope an engagement",
        body: "Tell us the outcome you need and we will come back with a plan, a team and a price within a week.",
      },
    ],
  },

  "service-details": {
    tone: "brand-3",
    heroVariant: "split",
    intro:
      "A senior pod embedded with your team for a fixed monthly rate — the details, deliverables and terms.",
    meta: [
      { label: "Pod size", value: "2–4 engineers" },
      { label: "Minimum term", value: "3 months" },
      { label: "Rate", value: "From $54k / month" },
    ],
    blocks: [
      {
        kind: "table",
        title: "What is included",
        columns: ["Area", "Included", "Cadence"],
        rows: [
          [
            "Platform engineering",
            "Internal developer platform design and operation",
            "Continuous",
          ],
          [
            "Reliability",
            "SLO definition, on-call design, incident review facilitation",
            "Weekly",
          ],
          [
            "Cost engineering",
            "Spend attribution, right-sizing, commitment planning",
            "Monthly",
          ],
          [
            "Security posture",
            "Threat modelling, policy-as-code, access review",
            "Quarterly",
          ],
          ["Enablement", "Pairing, workshops, documentation", "Every sprint"],
        ],
      },
      {
        kind: "steps",
        title: "The first 90 days",
        items: [
          {
            title: "Days 1–14 — Audit",
            body: "Access, telemetry review, interviews with ten engineers, and a written baseline of delivery and reliability metrics.",
          },
          {
            title: "Days 15–60 — Build",
            body: "Two-week increments against the top three outcomes, with production changes shipping from week three.",
          },
          {
            title: "Days 61–90 — Transfer",
            body: "Runbooks, ADRs and a training week; your engineers lead the last two increments while we advise.",
          },
        ],
      },
      {
        kind: "checklist",
        title: "Deliverables you keep",
        columns: [
          {
            title: "Documents",
            items: [
              "Architecture decision records",
              "Runbooks for every new system",
              "SLO and error budget policy",
              "Cost model and forecast",
            ],
          },
          {
            title: "Code",
            items: [
              "All code in your repositories",
              "Infrastructure as code modules",
              "CI pipelines and preview environments",
              "Load and chaos test suites",
            ],
          },
          {
            title: "Capability",
            items: [
              "Two training weeks",
              "Recorded internal sessions",
              "Pairing rotation with your team",
              "90 days of advisory after handover",
            ],
          },
        ],
      },
      {
        kind: "faq",
        title: "Engagement questions",
        items: [
          {
            title: "Who owns the IP?",
            body: "You do. Everything we write lands in your repositories under your licence from day one.",
          },
          {
            title: "Can we pause or resize the pod?",
            body: "Yes, with 30 days notice after the initial three-month term. Pods scale between two and four engineers.",
          },
          {
            title: "Do you work in our time zone?",
            body: "Pods overlap at least four hours with your core working hours, and we staff from EU, UK and US East.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Request a pod",
        body: "Share your roadmap and constraints; we will propose a team shape and start date.",
      },
    ],
  },

  solutions: {
    tone: "brand-2",
    heroVariant: "center",
    intro:
      "Paved roads for the three moments that matter: launching, scaling and consolidating.",
    blocks: [
      {
        kind: "cards",
        title: "By stage",
        items: [
          {
            tag: "Launch",
            title: "Startups",
            body: "Free tier that carries a real product, starter templates with auth and billing wired, and a single afternoon from repo to production URL.",
            meta: "0–20 engineers",
          },
          {
            tag: "Scale",
            title: "Scale-ups",
            body: "Multi-region reads, spend caps, preview environments per pull request and SOC 2 evidence you can hand to your first enterprise buyer.",
            meta: "20–200 engineers",
          },
          {
            tag: "Consolidate",
            title: "Enterprise",
            body: "Self-managed distribution, dedicated regions, SSO/SCIM, procurement support and named engineers on a 15-minute P1 target.",
            meta: "200+ engineers",
          },
        ],
      },
      {
        kind: "list",
        title: "By problem",
        items: [
          {
            meta: "Too many vendors",
            title: "Consolidate the stack",
            body: "Replace separate database, auth, storage, queue and analytics vendors with one control plane and one bill.",
          },
          {
            meta: "Slow releases",
            title: "Shorten the loop",
            body: "Preview environments with production-shaped data cut review cycles from days to hours.",
          },
          {
            meta: "Unpredictable cost",
            title: "Regain cost control",
            body: "Per-branch and per-endpoint spend attribution with hard caps that fail closed rather than surprise you.",
          },
          {
            meta: "Compliance pressure",
            title: "Pass the security review",
            body: "Prebuilt evidence packs, data residency controls and audit exports that satisfy most questionnaires in a day.",
          },
        ],
      },
      {
        kind: "quotes",
        title: "Outcomes, in their words",
        items: [
          {
            quote:
              "Two platform engineers now support 140 product engineers. That ratio was impossible before.",
            name: "Sofia Marchetti",
            role: "Director of Engineering, Aperture",
          },
          {
            quote:
              "We passed a bank's security review in nine days using the evidence pack.",
            name: "Ken Abara",
            role: "Head of Security, Payward",
          },
        ],
      },
      {
        kind: "stats",
        title: "Median results after six months",
        items: [
          { value: 71, suffix: "%", label: "Faster lead time to production" },
          { value: 4, label: "Vendors retired" },
          { value: 62, suffix: "%", label: "Lower infrastructure spend" },
          { value: 99.99, suffix: "%", label: "Availability maintained" },
        ],
      },
      {
        kind: "cta",
        title: "Find your paved road",
        body: "Tell us your stage and constraints and we will point you at the reference architecture that fits.",
      },
    ],
  },

  industries: {
    tone: "brand-2",
    heroVariant: "editorial",
    intro:
      "Regulated industries have specific controls. These are the ones we have already built, audited and documented.",
    blocks: [
      {
        kind: "cards",
        title: "Industry coverage",
        items: [
          {
            tag: "Fintech",
            title: "Payments and banking",
            body: "PCI-aligned network controls, immutable audit logs, per-tenant encryption keys and transaction-safe idempotency primitives.",
            meta: "1,900 teams",
          },
          {
            tag: "Health",
            title: "Healthcare and life sciences",
            body: "HIPAA-ready infrastructure with signed BAAs, PHI field-level encryption and 7-year audit retention.",
            meta: "620 teams",
          },
          {
            tag: "Commerce",
            title: "Retail and marketplaces",
            body: "Edge caching, global read replicas and burst autoscaling validated at 40k requests per second.",
            meta: "3,400 teams",
          },
          {
            tag: "Public",
            title: "Government and education",
            body: "Data residency guarantees, VPAT accessibility documentation and procurement via standard framework agreements.",
            meta: "210 organisations",
          },
          {
            tag: "Media",
            title: "Media and entertainment",
            body: "Signed asset delivery, per-title analytics and live event scaling with pre-warmed capacity.",
            meta: "480 teams",
          },
          {
            tag: "Logistics",
            title: "Logistics and mobility",
            body: "Geospatial indexing, realtime presence and offline-tolerant sync for field devices.",
            meta: "390 teams",
          },
        ],
      },
      {
        kind: "table",
        title: "Controls by industry",
        columns: ["Control", "Fintech", "Healthcare", "Public sector"],
        rows: [
          ["Data residency pinning", "Required", "Required", "Required"],
          ["Customer-managed keys", "Available", "Available", "Available"],
          ["Immutable audit log export", "Included", "Included", "Included"],
          ["Signed BAA / DPA", "DPA", "BAA + DPA", "DPA + addendum"],
          ["Retention window", "10 years", "7 years", "Custom"],
        ],
      },
      {
        kind: "quotes",
        title: "Regulated teams on Nazexa",
        items: [
          {
            quote:
              "Our auditors accepted the evidence pack without a single follow-up request.",
            name: "Elena Kovač",
            role: "CISO, Meridian Bank",
          },
        ],
      },
      trustFaq,
      {
        kind: "cta",
        title: "Talk to an industry specialist",
        body: "We will map your regulatory requirements to platform controls and share the relevant evidence pack.",
      },
    ],
  },

  "case-studies": {
    tone: "brand-1",
    heroVariant: "editorial",
    intro:
      "Verified outcomes with published methodology — every number below was reviewed with the customer before publication.",
    blocks: [
      {
        kind: "cards",
        title: "Featured studies",
        items: [
          {
            tag: "Logistics",
            title: "Northwind — 8× faster releases",
            body: "Consolidated five services onto Core, replaced a bespoke deploy pipeline and cut median deploy time from 12 minutes to 90 seconds across 140 engineers.",
            meta: "Read: 6 min",
          },
          {
            tag: "Healthcare",
            title: "Helio Health — 62% cost reduction",
            body: "Retired three self-managed Kubernetes clusters, moved to managed edge compute and reduced annual infrastructure spend by $1.1M with no headcount change.",
            meta: "Read: 8 min",
          },
          {
            tag: "Retail",
            title: "Vantage Retail — zero-incident Black Friday",
            body: "Sustained 40,200 requests per second for six hours with automatic scaling, no manual intervention and a p99 of 118 ms.",
            meta: "Read: 5 min",
          },
          {
            tag: "Fintech",
            title: "Payward — security review in 9 days",
            body: "Used the compliance evidence pack and residency controls to clear a tier-one bank's vendor review a month ahead of schedule.",
            meta: "Read: 4 min",
          },
        ],
      },
      {
        kind: "table",
        title: "Results at a glance",
        columns: ["Customer", "Before", "After", "Window"],
        rows: [
          ["Northwind", "12 min deploys", "90 s deploys", "4 months"],
          ["Helio Health", "$1.8M / year", "$0.7M / year", "6 months"],
          [
            "Vantage Retail",
            "3 peak incidents",
            "0 peak incidents",
            "1 season",
          ],
          ["Payward", "6-week reviews", "9-day review", "1 quarter"],
        ],
      },
      {
        kind: "steps",
        title: "How we measure",
        items: [
          {
            title: "Baseline",
            body: "We capture 90 days of pre-migration telemetry and finance data before any change lands.",
          },
          {
            title: "Instrument",
            body: "The same metrics are collected after cutover, from the customer's own tooling — not ours.",
          },
          {
            title: "Verify",
            body: "Every figure is confirmed in writing by the customer's engineering and finance leads before we publish.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Want a study like this?",
        body: "We will model the expected outcome for your workload using your current telemetry, free of charge.",
      },
    ],
  },

  portfolio: {
    tone: "brand-3",
    heroVariant: "editorial",
    intro:
      "Selected engineering and design work from our services teams, shared with client permission.",
    blocks: [
      {
        kind: "cards",
        title: "Selected work",
        items: [
          {
            tag: "Design systems",
            title: "Aperture Design System",
            body: "94 components, dual-theme tokens and automated visual regression, adopted by 300+ internal engineers across nine products.",
            meta: "2025 · 7 months",
          },
          {
            tag: "Data",
            title: "Lumen Freight Data Platform",
            body: "Petabyte-scale ingestion with sub-second freshness, backfill tooling and a lineage graph that finance and ops both trust.",
            meta: "2025 · 11 months",
          },
          {
            tag: "AI",
            title: "Helio Clinical Retrieval",
            body: "Hybrid retrieval over 40M clinical documents with citation enforcement and an offline evaluation harness run on every model change.",
            meta: "2026 · 5 months",
          },
          {
            tag: "Migration",
            title: "Payward Core Migration",
            body: "Dual-write cutover of a ledger handling 900 transactions per second, with rehearsed rollback and zero customer-visible downtime.",
            meta: "2024 · 9 months",
          },
        ],
      },
      {
        kind: "list",
        title: "Disciplines we bring",
        items: [
          {
            meta: "Architecture",
            title: "Systems design",
            body: "Event modelling, consistency choices and capacity planning documented as decision records you can revisit.",
          },
          {
            meta: "Interface",
            title: "Product design",
            body: "Design systems, prototypes and accessibility work validated against WCAG 2.2 AA.",
          },
          {
            meta: "Delivery",
            title: "Engineering practice",
            body: "Trunk-based development, preview environments, and test strategies proportionate to the risk.",
          },
        ],
      },
      {
        kind: "stats",
        title: "Portfolio at a glance",
        items: [
          { value: 31, label: "Programmes delivered" },
          { value: 9, label: "Industries served" },
          { value: 4.9, label: "Average client rating" },
          { value: 87, suffix: "%", label: "Clients who re-engage" },
        ],
      },
      {
        kind: "cta",
        title: "See more work",
        body: "Longer write-ups with architecture diagrams are available under NDA on request.",
      },
    ],
  },

  documentation: {
    tone: "brand-1",
    heroVariant: "minimal",
    intro:
      "Concepts, guides and references for every part of the platform — searchable, versioned and open source.",
    meta: [
      { label: "Version", value: "v4.2 (current)" },
      { label: "Updated", value: "Every Thursday" },
      { label: "Source", value: "Open on GitHub" },
    ],
    blocks: [
      {
        kind: "cards",
        title: "Start here",
        items: [
          {
            tag: "5 min",
            title: "Quickstart",
            body: "Create a project, run a migration and deploy your first edge function from the CLI.",
            meta: "Beginner",
          },
          {
            tag: "15 min",
            title: "Data modelling guide",
            body: "Schemas, row-level policies, indexes and the migration workflow explained with worked examples.",
            meta: "Beginner",
          },
          {
            tag: "20 min",
            title: "Auth and sessions",
            body: "Email, OAuth, SSO and service tokens, plus how claims flow into row-level policies.",
            meta: "Intermediate",
          },
          {
            tag: "30 min",
            title: "Production checklist",
            body: "Backups, alerts, spend caps, rate limits and rollout strategy before you open the doors.",
            meta: "Advanced",
          },
        ],
      },
      {
        kind: "code",
        title: "Your first function",
        body: "Deployed to 34 regions with a single command.",
        language: "typescript",
        code: `import { defineFunction, sql } from "@nazexa/core";

export default defineFunction(async ({ request, db }) => {
  const { rows } = await db.query(sql\`
    select id, title from posts
    where published = true
    order by created_at desc limit 10
  \`);
  return Response.json(rows);
});`,
      },
      {
        kind: "list",
        title: "Browse by area",
        items: [
          {
            meta: "Database",
            title: "Postgres, branching and migrations",
            body: "Schema design, extensions, connection pooling, replicas and point-in-time recovery.",
          },
          {
            meta: "Runtime",
            title: "Edge functions and jobs",
            body: "Routing, streaming responses, cron schedules, queues and background workers.",
          },
          {
            meta: "Storage",
            title: "Objects and signed access",
            body: "Buckets, transformations, resumable uploads and per-object policies.",
          },
          {
            meta: "Observability",
            title: "Traces, logs and alerts",
            body: "Instrumentation defaults, custom spans, log retention and alert routing.",
          },
        ],
      },
      {
        kind: "faq",
        title: "Docs questions",
        items: [
          {
            title: "Are older versions available?",
            body: "Yes — every minor version back to v2.0 stays published with a banner pointing to the current release.",
          },
          {
            title: "Can I contribute?",
            body: "The documentation lives in a public repository; pull requests are reviewed within two working days.",
          },
          {
            title: "Is there an offline copy?",
            body: "Download the full docs as a single Markdown bundle or an LLM-friendly text file from the download center.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Prefer to learn by building?",
        body: "The tutorials section has focused builds you can finish in a single sitting.",
      },
    ],
  },

  "api-documentation": {
    tone: "brand-1",
    heroVariant: "minimal",
    intro:
      "REST, GraphQL, realtime and webhooks — versioned, typed and covered by a 12-month deprecation policy.",
    meta: [
      { label: "Base URL", value: "https://api.nazexa.com/v4" },
      { label: "Auth", value: "Bearer tokens, OIDC" },
      { label: "Rate limit", value: "1,000 req/min default" },
    ],
    blocks: [
      {
        kind: "code",
        title: "Authenticated request",
        body: "Every endpoint accepts an idempotency key and returns a request ID you can quote to support.",
        language: "bash",
        code: `curl https://api.nazexa.com/v4/projects/prj_8fa2/branches \\
  -H "Authorization: Bearer $NAZEXA_TOKEN" \\
  -H "Idempotency-Key: 5c1f-branch-create" \\
  -d '{"name":"pr-482","from":"main"}'

# 201 Created
# x-request-id: req_01JBQ8Z3M4
# { "id": "brn_2f91", "status": "ready", "created_at": "2026-08-08T10:12:44Z" }`,
      },
      {
        kind: "table",
        title: "Core endpoints",
        columns: ["Method", "Path", "Purpose"],
        rows: [
          ["GET", "/v4/projects", "List projects visible to the token"],
          [
            "POST",
            "/v4/projects/:id/branches",
            "Create a branch from a source branch",
          ],
          [
            "POST",
            "/v4/projects/:id/deployments",
            "Deploy functions to one or more regions",
          ],
          [
            "GET",
            "/v4/projects/:id/metrics",
            "Query latency, error and spend series",
          ],
          ["POST", "/v4/webhooks", "Register a signed webhook endpoint"],
          ["DELETE", "/v4/branches/:id", "Tear down a branch and its storage"],
        ],
      },
      {
        kind: "features",
        title: "Protocol guarantees",
        items: [
          {
            title: "Idempotency",
            body: "Any mutating call accepts an Idempotency-Key and replays the original response for 24 hours.",
          },
          {
            title: "Cursor pagination",
            body: "Stable cursors survive inserts and deletions; offsets are never used for large collections.",
          },
          {
            title: "Signed webhooks",
            body: "HMAC-SHA256 signatures, five automatic retries with exponential backoff and 30-day replay from the dashboard.",
          },
        ],
      },
      {
        kind: "table",
        title: "Error codes",
        columns: ["Status", "Code", "Meaning"],
        rows: [
          [
            "400",
            "invalid_request",
            "Payload failed schema validation; see the errors array",
          ],
          ["401", "unauthenticated", "Missing, expired or revoked token"],
          [
            "403",
            "insufficient_scope",
            "Token lacks the required scope for this resource",
          ],
          [
            "409",
            "conflict",
            "Resource changed since your last read; retry with a fresh ETag",
          ],
          ["429", "rate_limited", "Back off using the Retry-After header"],
          [
            "503",
            "region_unavailable",
            "Retry against another region; the call is safe to repeat",
          ],
        ],
      },
      {
        kind: "cta",
        title: "Generate a token",
        body: "Create a scoped API token in the dashboard, or explore the schema in the interactive API playground.",
      },
    ],
  },

  changelog: {
    tone: "brand-2",
    heroVariant: "minimal",
    intro:
      "Everything we shipped, newest first. Backwards compatible unless explicitly marked.",
    blocks: [
      {
        kind: "timeline",
        title: "Recent releases",
        items: [
          {
            date: "8 Aug 2026",
            title: "Multi-region writes generally available",
            body: "Write to the nearest region with automatic conflict resolution on last-writer-wins or custom merge functions. Available on Team and Enterprise.",
            tag: "Feature",
          },
          {
            date: "1 Aug 2026",
            title: "Branch-aware analytics",
            body: "Insight now segments traces and spend by branch, so preview environments no longer pollute production dashboards.",
            tag: "Improvement",
          },
          {
            date: "24 Jul 2026",
            title: "Faster cold starts",
            body: "Edge isolate boot time drops from 19 ms to 11 ms median after a scheduler rewrite. No action required.",
            tag: "Performance",
          },
          {
            date: "17 Jul 2026",
            title: "Spend caps fail closed",
            body: "Projects can now hard-stop at a budget instead of throttling. Opt in per project under Settings → Billing.",
            tag: "Feature",
          },
          {
            date: "10 Jul 2026",
            title: "Deprecation: v3 REST API",
            body: "The v3 API is deprecated with a 12-month sunset on 10 July 2027. An automated migration codemod is available.",
            tag: "Deprecation",
          },
          {
            date: "3 Jul 2026",
            title: "SCIM group nesting",
            body: "Nested directory groups now map to Nazexa roles, including inherited membership.",
            tag: "Improvement",
          },
        ],
      },
      {
        kind: "checklist",
        title: "How we release",
        columns: [
          {
            title: "Cadence",
            items: [
              "Stable release every Thursday",
              "Security patches out of band",
              "Preview flags per project",
              "No breaking change without 12 months notice",
            ],
          },
          {
            title: "Safety",
            items: [
              "Progressive rollout across regions",
              "Automatic rollback on SLO burn",
              "Change log entry before rollout completes",
              "Migration codemods for breaking APIs",
            ],
          },
        ],
      },
      {
        kind: "cta",
        title: "Never miss a release",
        body: "Subscribe by RSS, email or webhook, or follow the release notes page for versioned detail.",
      },
    ],
  },

  roadmap: {
    tone: "brand-2",
    heroVariant: "center",
    intro:
      "What we are rolling out, building and exploring. Dates are intentions, not contracts.",
    blocks: [
      {
        kind: "cards",
        title: "Now — shipping this quarter",
        items: [
          {
            tag: "In rollout",
            title: "Multi-region writes",
            body: "Regional write acceptance with configurable conflict resolution; currently at 60% of Team projects.",
            meta: "Q3 2026",
          },
          {
            tag: "Beta",
            title: "Branch-aware cost attribution",
            body: "Per-branch spend with automatic alerts when a preview environment costs more than production.",
            meta: "Q3 2026",
          },
          {
            tag: "Beta",
            title: "Policy simulation",
            body: "Dry-run row-level policy changes against real query traffic before you apply them.",
            meta: "Q3 2026",
          },
        ],
      },
      {
        kind: "cards",
        title: "Next — designed, not yet built",
        items: [
          {
            tag: "Planned",
            title: "Native workflow orchestration",
            body: "Durable, resumable workflows with typed steps and built-in retries, replacing external orchestrators.",
            meta: "Q4 2026",
          },
          {
            tag: "Planned",
            title: "Query plan advisor",
            body: "Automatic index suggestions with measured impact estimates from your own workload.",
            meta: "Q4 2026",
          },
          {
            tag: "Planned",
            title: "Fine-grained audit search",
            body: "Full-text search across audit events with saved investigations and export.",
            meta: "Q1 2027",
          },
        ],
      },
      {
        kind: "cards",
        title: "Later — under exploration",
        items: [
          {
            tag: "Research",
            title: "On-device inference",
            body: "Run small models at the edge or on the client with shared weights and cached embeddings.",
            meta: "2027",
          },
          {
            tag: "Research",
            title: "Offline-first sync",
            body: "Conflict-free replicated documents with server-side reconciliation for field applications.",
            meta: "2027",
          },
        ],
      },
      {
        kind: "faq",
        title: "Roadmap questions",
        items: [
          {
            title: "Can we influence priority?",
            body: "Yes. Feature requests are triaged weekly and customer demand is the single largest input into sequencing.",
          },
          {
            title: "Do you commit to dates?",
            body: "Only in enterprise contracts. Public roadmap dates are our current best estimate and can move.",
          },
          {
            title: "How do we join a beta?",
            body: "Enable the preview flag per project in settings, or ask your account team for early access.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Tell us what to build",
        body: "Post a request, describe the problem behind it, and watch it move through the pipeline.",
      },
    ],
  },

  pricing: {
    tone: "brand-1",
    heroVariant: "center",
    intro:
      "Start free. Pay only for what you use. Hard spend caps so a bad loop never becomes a bad invoice.",
    blocks: [
      {
        kind: "pricing",
        title: "Plans",
        tiers: [
          {
            name: "Free",
            price: "$0",
            cadence: "forever",
            body: "For side projects, prototypes and learning.",
            features: [
              "1 GB database storage",
              "1M function invocations / month",
              "3 concurrent branches",
              "1-day point-in-time recovery",
              "Community support",
            ],
          },
          {
            name: "Team",
            price: "$25",
            cadence: "per member / month + usage",
            body: "For teams shipping production products.",
            highlight: true,
            features: [
              "Usage-based storage and compute",
              "50 concurrent branches",
              "35-day point-in-time recovery",
              "Preview environments per pull request",
              "SSO, spend caps and audit logs",
              "Email support, 8-hour response",
            ],
          },
          {
            name: "Enterprise",
            price: "Custom",
            body: "For regulated and large-scale platforms.",
            features: [
              "Dedicated and self-managed regions",
              "365-day point-in-time recovery",
              "SCIM provisioning and custom roles",
              "99.99% SLA with financial remedies",
              "Named support engineers, 15-min P1",
              "Procurement, DPA, BAA and security review support",
            ],
          },
        ],
      },
      {
        kind: "table",
        title: "Usage pricing",
        columns: ["Resource", "Included (Team)", "Overage"],
        rows: [
          ["Database storage", "10 GB", "$0.18 / GB / month"],
          ["Function invocations", "5M / month", "$0.35 / million"],
          ["Egress", "100 GB", "$0.06 / GB"],
          ["Object storage", "50 GB", "$0.021 / GB / month"],
          ["Vector operations", "1M", "$0.12 / million"],
        ],
      },
      {
        kind: "features",
        title: "How we keep bills predictable",
        items: [
          {
            title: "Hard spend caps",
            body: "Set a monthly ceiling per project. Choose whether to throttle or fail closed when you reach it.",
          },
          {
            title: "Per-branch attribution",
            body: "See exactly which branch, endpoint or team consumed spend, before the invoice arrives.",
          },
          {
            title: "No surprise egress",
            body: "Internal traffic between Nazexa services is never billed as egress.",
          },
        ],
      },
      {
        kind: "faq",
        title: "Billing questions",
        items: [
          {
            title: "What happens if we exceed the cap?",
            body: "By default we throttle and alert. If you choose fail-closed, writes are rejected with a clear error rather than billed.",
          },
          {
            title: "Do you offer annual commitments?",
            body: "Yes — committed use discounts start at 15% for annual prepayment on Team and are negotiated on Enterprise.",
          },
          {
            title: "Are there startup credits?",
            body: "Eligible early-stage companies get $25,000 in credits valid for 12 months through partner accelerators.",
          },
          {
            title: "Can we get an invoice instead of card billing?",
            body: "Invoicing with net-30 terms is available on Team above $2,000 per month and on all Enterprise contracts.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Model your bill",
        body: "Send us a month of your current usage and we will produce a line-by-line comparison.",
      },
    ],
  },

  resources: {
    tone: "brand-3",
    heroVariant: "editorial",
    intro:
      "Reports, reference architectures, templates and playbooks — all free, most with source code.",
    blocks: [
      {
        kind: "cards",
        title: "Latest resources",
        items: [
          {
            tag: "Report",
            title: "State of Platform Engineering 2026",
            body: "Survey of 3,400 engineering leaders on team topology, tooling spend and delivery metrics, with the raw dataset published.",
            meta: "PDF · 48 pages",
          },
          {
            tag: "Architecture",
            title: "Multi-tenant SaaS reference",
            body: "Schema, isolation model, noisy-neighbour controls and cost attribution for a per-tenant-row architecture.",
            meta: "Diagram + repo",
          },
          {
            tag: "Template",
            title: "Production SaaS starter",
            body: "Auth, billing, teams, roles, audit log and a working admin dashboard, deployable in one command.",
            meta: "TypeScript",
          },
          {
            tag: "Playbook",
            title: "Zero-downtime migration playbook",
            body: "Dual-write sequencing, verification queries, rollback rehearsal and a communication template.",
            meta: "Checklist",
          },
          {
            tag: "Calculator",
            title: "Infrastructure cost model",
            body: "Spreadsheet that converts your current bill into a Nazexa estimate, with assumptions documented.",
            meta: "XLSX",
          },
          {
            tag: "Guide",
            title: "Security questionnaire pack",
            body: "Prewritten answers to the 140 questions we see most, plus the evidence to attach.",
            meta: "DOCX + PDF",
          },
        ],
      },
      {
        kind: "list",
        title: "Reference architectures",
        items: [
          {
            meta: "B2B SaaS",
            title: "Tenant isolation with row-level policies",
            body: "One database, per-tenant policies, and a tested path to dedicated databases for your largest accounts.",
          },
          {
            meta: "AI product",
            title: "Retrieval-augmented generation",
            body: "Chunking strategy, hybrid search, citation enforcement and an evaluation harness for every model change.",
          },
          {
            meta: "Marketplace",
            title: "Global reads, regional writes",
            body: "Read replicas at the edge with write routing and a consistency model your product team can reason about.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Get new resources first",
        body: "Subscribe and we will send each new report or architecture the week it is published — no more than monthly.",
      },
    ],
  },

  "learning-center": {
    tone: "brand-3",
    heroVariant: "split",
    intro:
      "Structured paths from first deploy to production expert, with hands-on labs and a certification at the end.",
    meta: [
      { label: "Paths", value: "3 tracks, 24 modules" },
      { label: "Format", value: "Video + labs" },
      { label: "Cost", value: "Free" },
    ],
    blocks: [
      {
        kind: "cards",
        title: "Learning paths",
        items: [
          {
            tag: "6 modules · 3 h",
            title: "Foundations",
            body: "Projects, schemas, migrations, functions and deployments. Ends with a deployed application you own.",
            meta: "Beginner",
          },
          {
            tag: "10 modules · 7 h",
            title: "Production engineering",
            body: "Observability, SLOs, capacity planning, cost control and incident response on the platform.",
            meta: "Intermediate",
          },
          {
            tag: "8 modules · 6 h",
            title: "Data and AI",
            body: "Modelling, indexing strategy, hybrid retrieval, evaluation and safe rollout of model changes.",
            meta: "Advanced",
          },
        ],
      },
      {
        kind: "steps",
        title: "How each module works",
        items: [
          {
            title: "Watch",
            body: "A 6–10 minute video with the transcript, diagrams and code linked below it.",
          },
          {
            title: "Build",
            body: "A browser-based lab with a real project — no local setup, and it is yours to keep afterwards.",
          },
          {
            title: "Check",
            body: "An automated review of your work with feedback on the specific thing you got wrong.",
          },
        ],
      },
      {
        kind: "table",
        title: "Certification",
        columns: ["Credential", "Requirements", "Validity"],
        rows: [
          [
            "Nazexa Certified Developer",
            "Foundations path + 60-minute practical exam",
            "2 years",
          ],
          [
            "Nazexa Certified Architect",
            "Production path + case study submission",
            "2 years",
          ],
          [
            "Nazexa AI Specialist",
            "Data & AI path + evaluation project",
            "2 years",
          ],
        ],
      },
      {
        kind: "cta",
        title: "Start the Foundations path",
        body: "Three hours, no cost, and you finish with a deployed project and a credential to show for it.",
      },
    ],
  },

  tutorials: {
    tone: "brand-1",
    heroVariant: "minimal",
    intro:
      "Short, focused builds you can finish in one sitting. Every tutorial has a working repository.",
    blocks: [
      {
        kind: "cards",
        title: "Popular tutorials",
        items: [
          {
            tag: "20 min",
            title: "Build a SaaS starter",
            body: "Auth, Stripe billing, team invitations and a dashboard, wired end to end with typed queries.",
            meta: "TypeScript · Beginner",
          },
          {
            tag: "25 min",
            title: "Add semantic search",
            body: "Chunk documents, generate embeddings, run hybrid search and rank with reciprocal rank fusion.",
            meta: "Python · Intermediate",
          },
          {
            tag: "30 min",
            title: "Ship a realtime app",
            body: "Presence, live cursors and conflict resolution over a single websocket channel.",
            meta: "TypeScript · Intermediate",
          },
          {
            tag: "15 min",
            title: "Background jobs and cron",
            body: "Queues, retries with backoff, dead-letter handling and scheduled maintenance tasks.",
            meta: "Go · Beginner",
          },
          {
            tag: "35 min",
            title: "Multi-tenant row-level security",
            body: "Model tenants, write policies, and prove isolation with an automated test suite.",
            meta: "SQL · Advanced",
          },
          {
            tag: "20 min",
            title: "Preview environments in CI",
            body: "Create a branch per pull request, seed anonymised data and post the URL back to GitHub.",
            meta: "YAML · Intermediate",
          },
        ],
      },
      {
        kind: "code",
        title: "A taste: semantic search in nine lines",
        language: "typescript",
        code: `const embedding = await ai.embed({ model: "nz-embed-3", input: query });

const { rows } = await db.query(sql\`
  select id, title, 1 - (embedding <=> \${embedding}) as score
  from documents
  where tenant_id = \${tenantId}
  order by embedding <=> \${embedding}
  limit 10
\`);`,
      },
      {
        kind: "cta",
        title: "Request a tutorial",
        body: "Tell us what you are trying to build and we will add it to the queue — most requests ship within a month.",
      },
    ],
  },

  "developer-blog": {
    tone: "brand-2",
    heroVariant: "editorial",
    intro:
      "How we build Nazexa: architecture, trade-offs, benchmarks and the postmortems we would rather not have written.",
    blocks: [
      {
        kind: "cards",
        title: "Recent posts",
        items: [
          {
            tag: "Deep dive",
            title: "Rewriting the isolate scheduler",
            body: "How we cut cold starts from 19 ms to 11 ms by changing when we pre-warm rather than how much we pre-warm.",
            meta: "8 Aug 2026 · 14 min",
          },
          {
            tag: "Postmortem",
            title: "The 41-minute EU-West degradation",
            body: "A metadata cache stampede, why our circuit breaker did not fire, and the three changes we shipped afterwards.",
            meta: "22 Jul 2026 · 11 min",
          },
          {
            tag: "Benchmark",
            title: "Copy-on-write branching at 500 GB",
            body: "Reproducible methodology, published harness, and an honest look at where our numbers get worse.",
            meta: "9 Jul 2026 · 9 min",
          },
          {
            tag: "Deep dive",
            title: "Consistency without ceremony",
            body: "How multi-region writes pick a conflict strategy, and why we refused to make it the default.",
            meta: "27 Jun 2026 · 16 min",
          },
        ],
      },
      {
        kind: "prose",
        title: "Our writing rules",
        paragraphs: [
          "We publish the methodology alongside every benchmark, including the hardware, the dataset and the harness, so anyone can reproduce or refute the result.",
          "Postmortems name the failure, not the person. They include the timeline, the customer impact in real units, and the specific changes with links to the pull requests that made them.",
        ],
        aside: {
          title: "Subscribe",
          items: [
            "RSS feed",
            "Monthly digest email",
            "Talks and recordings",
            "Open-source benchmark harness",
          ],
        },
      },
      {
        kind: "cta",
        title: "Read the archive",
        body: "Four years of engineering writing, all of it free and none of it gated behind a form.",
      },
    ],
  },

  blog: {
    tone: "brand-2",
    heroVariant: "editorial",
    intro: "Product launches, company decisions and the thinking behind them.",
    blocks: [
      {
        kind: "cards",
        title: "Latest stories",
        items: [
          {
            tag: "Launch",
            title: "Multi-region writes are generally available",
            body: "What changes for latency-sensitive products, how conflict resolution works, and who should not turn it on.",
            meta: "8 Aug 2026",
          },
          {
            tag: "Company",
            title: "Why we published our pricing model",
            body: "The full cost breakdown behind our margins, and why transparency turned out to be a sales advantage.",
            meta: "30 Jul 2026",
          },
          {
            tag: "Culture",
            title: "How 180 people stay async",
            body: "Written proposals, four meeting-free days and the decision log that replaced our status meetings.",
            meta: "18 Jul 2026",
          },
          {
            tag: "Perspective",
            title: "The consolidation decade",
            body: "Why we think the number of vendors in a typical stack halves by 2030, and what that means for buyers.",
            meta: "2 Jul 2026",
          },
        ],
      },
      {
        kind: "list",
        title: "Browse by topic",
        items: [
          {
            meta: "Product",
            title: "Launches and deep dives",
            body: "What shipped, why it matters and how to adopt it without a migration weekend.",
          },
          {
            meta: "Company",
            title: "Decisions and culture",
            body: "Hiring, pricing, remote practice and the trade-offs behind each choice.",
          },
          {
            meta: "Industry",
            title: "Perspectives",
            body: "Where we think developer infrastructure is heading, with the reasoning shown.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Get the monthly digest",
        body: "One email a month with the best posts, releases and community work. Unsubscribe in a click.",
      },
    ],
  },

  news: {
    tone: "brand-3",
    heroVariant: "minimal",
    intro:
      "Official announcements, funding news, partnerships and press coverage.",
    meta: [
      { label: "Media contact", value: "press@nazexa.com" },
      { label: "Response time", value: "Within 4 hours" },
    ],
    blocks: [
      {
        kind: "timeline",
        title: "Announcements",
        items: [
          {
            date: "8 Aug 2026",
            title: "Nazexa reaches 14,000 production teams",
            body: "Platform crosses 4.1 billion daily requests with 99.99% trailing twelve-month availability.",
            tag: "Milestone",
          },
          {
            date: "19 Jun 2026",
            title: "$78M Series C led by Northgate Capital",
            body: "Funding will expand the regional footprint to 26 locations and grow the security engineering team.",
            tag: "Funding",
          },
          {
            date: "4 May 2026",
            title: "Strategic partnership with Lumen Cloud",
            body: "Nazexa becomes a first-party option in the Lumen marketplace with committed-spend eligibility.",
            tag: "Partnership",
          },
          {
            date: "12 Mar 2026",
            title: "ISO 27017 and 27018 certification",
            body: "Cloud-specific security and privacy certifications added to the existing SOC 2 Type II and ISO 27001.",
            tag: "Compliance",
          },
        ],
      },
      {
        kind: "cards",
        title: "In the press",
        items: [
          {
            tag: "TechWire",
            title: '"The quiet consolidation of the backend"',
            body: "A feature on why platform teams are collapsing their vendor list, with Nazexa as the primary case study.",
            meta: "Jul 2026",
          },
          {
            tag: "The Stack",
            title: "Series C analysis",
            body: "Coverage of the funding round and what it signals for the developer infrastructure market.",
            meta: "Jun 2026",
          },
        ],
      },
      {
        kind: "cta",
        title: "Media enquiries",
        body: "Our communications team replies within four hours on business days. Brand assets are in the press kit.",
      },
    ],
  },

  "press-kit": {
    tone: "brand-3",
    heroVariant: "split",
    intro:
      "Logos, brand rules, executive bios and approved boilerplate — everything you need to publish accurately.",
    meta: [
      { label: "Assets", value: "SVG, PNG, EPS" },
      { label: "Licence", value: "Editorial use" },
      { label: "Contact", value: "press@nazexa.com" },
    ],
    blocks: [
      {
        kind: "cards",
        title: "Download assets",
        items: [
          {
            tag: "Logos",
            title: "Primary mark",
            body: "Full logotype and standalone glyph in light, dark and monochrome variants.",
            meta: "SVG · PNG · EPS",
          },
          {
            tag: "Colour",
            title: "Brand palette",
            body: "Core and extended palette with hex, OKLCH and Pantone equivalents plus accessibility pairings.",
            meta: "ASE · PDF",
          },
          {
            tag: "Product",
            title: "Product screenshots",
            body: "High-resolution console, schema designer and trace viewer captures in both themes.",
            meta: "PNG · 3840px",
          },
          {
            tag: "People",
            title: "Executive headshots",
            body: "Approved photography and biographies for the founders and functional leads.",
            meta: "JPG · TXT",
          },
        ],
      },
      {
        kind: "checklist",
        title: "Usage rules",
        columns: [
          {
            title: "Please do",
            items: [
              "Use the supplied files unmodified",
              "Keep clear space equal to the glyph height",
              "Use the monochrome mark on busy imagery",
              'Write the name as "Nazexa"',
            ],
          },
          {
            title: "Please don't",
            items: [
              "Recolour or add effects to the mark",
              "Stretch, rotate or outline the logotype",
              "Use the mark to imply endorsement",
              'Write "NAZEXA" or "Nazexa.io"',
            ],
          },
        ],
      },
      {
        kind: "prose",
        title: "Company boilerplate",
        paragraphs: [
          "Nazexa is a developer platform that combines managed Postgres, an edge function runtime, storage, authentication and observability behind one API. Founded in 2018 and headquartered in Amsterdam, Nazexa is used by more than 14,000 engineering teams in production and serves over four billion requests per day.",
          'Approved short form: "Nazexa is a developer platform that brings the database, runtime and observability layers of an application together behind a single API."',
        ],
        aside: {
          title: "Facts to quote",
          items: [
            "Founded 2018, Amsterdam",
            "180 employees in 24 countries",
            "$142M raised to date",
            "14,000+ production teams",
          ],
        },
      },
      {
        kind: "cta",
        title: "Need something specific?",
        body: "Ask press@nazexa.com for custom assets, executive interviews or data under embargo.",
      },
    ],
  },

  careers: {
    tone: "brand-3",
    heroVariant: "split",
    intro:
      "Remote-first roles across engineering, design, product and go-to-market — with a hiring process that respects your time.",
    meta: [
      { label: "Open roles", value: "14" },
      { label: "Locations", value: "EU, UK, US remote" },
      { label: "Process", value: "4 conversations, 2 weeks" },
    ],
    blocks: [
      {
        kind: "table",
        title: "Open positions",
        columns: ["Role", "Team", "Location", "Level"],
        rows: [
          ["Staff Engineer, Storage", "Core", "EU remote", "Staff"],
          ["Senior Engineer, Edge Runtime", "Core", "EU / UK remote", "Senior"],
          ["Security Engineer, Detection", "Trust", "EU remote", "Mid–Senior"],
          ["Product Designer, Console", "Design", "EU remote", "Senior"],
          ["Developer Advocate", "DevRel", "US East remote", "Mid"],
          ["Solutions Architect", "Services", "UK remote", "Senior"],
          ["Technical Writer", "Docs", "EU remote", "Mid"],
        ],
      },
      {
        kind: "steps",
        title: "How we hire",
        items: [
          {
            title: "Intro call — 30 min",
            body: "A hiring manager explains the role honestly, including the parts that are hard, and answers your questions.",
          },
          {
            title: "Craft conversation — 90 min",
            body: "A discussion of real problems from our backlog. No whiteboard algorithms, no take-home marathon.",
          },
          {
            title: "Team and values — 2 × 45 min",
            body: "Meet two future colleagues, one from outside your function, to talk collaboration and trade-offs.",
          },
          {
            title: "Offer — within 48 hours",
            body: "Transparent band, equity explained in plain numbers, and a written summary of everything discussed.",
          },
        ],
      },
      {
        kind: "checklist",
        title: "Benefits",
        columns: [
          {
            title: "Money",
            items: [
              "Transparent salary bands",
              "Meaningful equity with 10-year exercise",
              "Annual review with published criteria",
              "Home office budget of €3,000",
            ],
          },
          {
            title: "Time",
            items: [
              "35 days paid leave including holidays",
              "Four meeting-free days per week",
              "Sabbatical after four years",
              "Fully flexible hours",
            ],
          },
          {
            title: "Growth",
            items: [
              "€2,500 annual learning budget",
              "Conference speaking support",
              "Internal mobility after 12 months",
              "Mentoring in both directions",
            ],
          },
        ],
      },
      {
        kind: "cta",
        title: "Nothing fits today?",
        body: "Send an open application. We keep strong profiles warm and get in touch when a matching role opens.",
      },
    ],
  },

  team: {
    tone: "brand-1",
    heroVariant: "center",
    intro:
      "A distributed team of engineers, designers and product managers building the tools they always wanted to use.",
    blocks: [],
  },

  contact: {
    tone: "brand-1",
    heroVariant: "split",
    intro:
      "Every message is routed to a human on the right team — no ticket bots, no round-robin lottery.",
    meta: [
      { label: "Sales reply", value: "Within 4 business hours" },
      { label: "Support reply", value: "8 h Team, 15 min P1 Enterprise" },
      { label: "Offices", value: "Amsterdam · London · New York" },
    ],
    blocks: [
      {
        kind: "channels",
        title: "Reach the right team",
        items: [
          {
            title: "Sales",
            body: "Scoping, pricing, migration estimates and procurement paperwork for teams evaluating the platform.",
            action: "sales@nazexa.com · +31 20 123 4567",
          },
          {
            title: "Support",
            body: "Technical help for existing customers. Include your project ID and a request ID for the fastest resolution.",
            action: "support@nazexa.com · in-console chat",
          },
          {
            title: "Partnerships",
            body: "Agencies, technology vendors and cloud marketplaces looking to build, resell or co-market.",
            action: "partners@nazexa.com",
          },
          {
            title: "Press",
            body: "Interviews, embargoed briefings, data requests and brand assets.",
            action: "press@nazexa.com",
          },
          {
            title: "Security",
            body: "Vulnerability reports and responsible disclosure. PGP key published on the security page.",
            action: "security@nazexa.com",
          },
          {
            title: "Careers",
            body: "Questions about a role, the process or accessibility accommodations during interviews.",
            action: "people@nazexa.com",
          },
        ],
      },
      {
        kind: "table",
        title: "Offices",
        columns: ["Location", "Address", "Best for"],
        rows: [
          [
            "Amsterdam (HQ)",
            "Keizersgracht 241, 1016 EA",
            "Engineering, executive",
          ],
          ["London", "18 Finsbury Circus, EC2M 7EB", "Sales, services"],
          ["New York", "412 Broadway, NY 10013", "Americas sales and support"],
        ],
      },
      {
        kind: "faq",
        title: "Before you write",
        items: [
          {
            title: "Having an incident?",
            body: "Check the status page first, then open a P1 in the console — that pages the on-call engineer directly.",
          },
          {
            title: "Need a signed DPA or BAA?",
            body: "Sales can send both within one business day; standard terms are pre-approved by most legal teams.",
          },
          {
            title: "Want a technical deep dive?",
            body: "Ask for a solutions architect on the call and we will bring someone who has read your architecture.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Prefer to talk?",
        body: "Book a 30-minute call with a solutions engineer at a time that suits your timezone.",
      },
    ],
  },

  faq: {
    tone: "brand-1",
    heroVariant: "center",
    intro:
      "The questions evaluating teams ask most, answered in full rather than in marketing shorthand.",
    blocks: [
      {
        kind: "faq",
        title: "Getting started",
        items: [
          {
            title: "How long does onboarding take?",
            body: "Most teams deploy a first workload in under a day using a starter template. A full migration from an existing stack typically takes two to six weeks depending on data volume and compliance review.",
          },
          {
            title: "Do we need a platform team?",
            body: "No. The median customer runs Nazexa with fewer than two dedicated platform engineers, because provisioning, scaling and patching are handled by the control plane.",
          },
          {
            title: "Can we trial with production data?",
            body: "Yes. Create a branch seeded from an anonymised production snapshot and run real traffic shadows against it before committing.",
          },
        ],
      },
      {
        kind: "faq",
        title: "Billing and contracts",
        items: [
          {
            title: "How does usage billing work?",
            body: "You are billed for storage, invocations, egress and vector operations after the included allowance, with per-branch attribution visible daily rather than at month end.",
          },
          {
            title: "What stops a runaway bill?",
            body: "Hard spend caps per project. Choose throttle or fail-closed behaviour; both alert at 50%, 80% and 100% of the cap.",
          },
          {
            title: "Can we pay annually?",
            body: "Yes, with committed use discounts from 15%. Invoicing with net-30 terms is available above $2,000 per month.",
          },
        ],
      },
      { ...trustFaq, title: "Security and data" },
      {
        kind: "faq",
        title: "Migration and exit",
        items: [
          {
            title: "How do we migrate off our current provider?",
            body: "We provide dual-write tooling, a verification query suite and a rehearsed rollback plan. Services teams can run the whole programme if you prefer.",
          },
          {
            title: "What if we want to leave?",
            body: "Everything is standard Postgres and object storage. Export a full logical dump plus your buckets at any time — no egress charge for exports.",
          },
          {
            title: "Is there vendor lock-in in the runtime?",
            body: "Functions are standard Web APIs. The compatibility layer runs the same code on any Workers-compatible runtime.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Still have a question?",
        body: "Support answers technical questions publicly in the community forum, usually within a few hours.",
      },
    ],
  },

  community: {
    tone: "brand-2",
    heroVariant: "center",
    intro:
      "20,000 builders sharing patterns, plugins, benchmarks and the occasional war story.",
    blocks: [
      {
        kind: "stats",
        title: "The community today",
        items: [
          { value: 20400, suffix: "+", label: "Discord members" },
          { value: 3100, label: "Forum answers in 2026" },
          { value: 260, label: "Community plugins" },
          { value: 42, label: "Cities with meetups" },
        ],
      },
      {
        kind: "channels",
        title: "Where people gather",
        items: [
          {
            title: "Discord",
            body: "Realtime help with dedicated channels per product area, staffed by the engineering team on weekdays.",
            action: "Join 20,400 members",
          },
          {
            title: "Forum",
            body: "Longer-form, searchable answers with accepted solutions and a median first response under two hours.",
            action: "Browse discussions",
          },
          {
            title: "GitHub",
            body: "SDKs, CLI, docs and the benchmark harness are open source and accept contributions.",
            action: "18 public repositories",
          },
          {
            title: "Champions",
            body: "Recognition programme with early access, conference support and direct roadmap input.",
            action: "Nominate someone",
          },
        ],
      },
      {
        kind: "checklist",
        title: "Community guidelines",
        columns: [
          {
            title: "We expect",
            items: [
              "Assume good intent",
              "Share reproducible examples",
              "Credit other people's work",
              "Keep recruiting to the jobs channel",
            ],
          },
          {
            title: "We moderate",
            items: [
              "Harassment of any kind",
              "Undisclosed vendor promotion",
              "Sharing other people's credentials",
              "Off-topic political campaigning",
            ],
          },
        ],
      },
      {
        kind: "cta",
        title: "Say hello",
        body: "Introduce yourself in #welcome — the team reads every message and answers most of them.",
      },
    ],
  },

  events: {
    tone: "brand-2",
    heroVariant: "editorial",
    intro:
      "Conferences, hands-on workshops, community meetups and livestreams — most of them free.",
    blocks: [
      {
        kind: "timeline",
        title: "Upcoming",
        items: [
          {
            date: "3 Sep 2026",
            title: "Workshop: Multi-region in practice",
            body: "Two-hour hands-on session with a solutions architect. Bring a laptop; you leave with a working deployment.",
            tag: "Online · Free",
          },
          {
            date: "24 Sep 2026",
            title: "Nazexa Conf, Amsterdam",
            body: "One day, two tracks, 900 attendees. Keynote, deep dives, and office hours with the engineering team.",
            tag: "In person · €95",
          },
          {
            date: "8 Oct 2026",
            title: "Meetup: London platform engineering",
            body: "Three lightning talks and open discussion, hosted with the London Platform Guild.",
            tag: "In person · Free",
          },
          {
            date: "22 Oct 2026",
            title: "Livestream: Query plan advisor beta",
            body: "Live walkthrough of the beta with Q&A, recorded and published the same day.",
            tag: "Online · Free",
          },
        ],
      },
      {
        kind: "cards",
        title: "Formats",
        items: [
          {
            tag: "Annual",
            title: "Nazexa Conf",
            body: "Product keynote, engineering deep dives and customer stories, with all talks published free within a week.",
            meta: "Sep · Amsterdam",
          },
          {
            tag: "Monthly",
            title: "Workshops",
            body: "Small-group, hands-on sessions capped at 30 people so every question gets answered.",
            meta: "Online",
          },
          {
            tag: "Ongoing",
            title: "Community meetups",
            body: "Run by community organisers in 42 cities; we cover venue and catering costs on request.",
            meta: "Worldwide",
          },
        ],
      },
      {
        kind: "cta",
        title: "Host or speak",
        body: "We fund community meetups and coach first-time speakers. Tell us what you want to run.",
      },
    ],
  },

  partners: {
    tone: "brand-3",
    heroVariant: "split",
    intro:
      "Agencies, technology vendors and cloud marketplaces building, reselling and integrating with Nazexa.",
    meta: [
      { label: "Partners", value: "240 worldwide" },
      { label: "Margin", value: "Up to 25%" },
      { label: "Approval", value: "Within 10 days" },
    ],
    blocks: [
      {
        kind: "cards",
        title: "Programme tracks",
        items: [
          {
            tag: "Solution",
            title: "Agencies and consultancies",
            body: "Certified delivery partners with co-selling support, deal registration and shared implementation resources.",
            meta: "25% margin",
          },
          {
            tag: "Technology",
            title: "Product integrations",
            body: "Deep integrations listed in the directory, with joint engineering support and co-marketing.",
            meta: "Listed free",
          },
          {
            tag: "Cloud",
            title: "Marketplace resellers",
            body: "Sell Nazexa through your marketplace with committed-spend eligibility and consolidated billing.",
            meta: "Negotiated",
          },
        ],
      },
      {
        kind: "table",
        title: "Partner tiers",
        columns: ["Benefit", "Registered", "Certified", "Premier"],
        rows: [
          ["Deal registration", "Yes", "Yes", "Yes"],
          ["Margin on resale", "10%", "18%", "25%"],
          ["Named partner manager", "—", "Yes", "Yes"],
          ["Joint marketing fund", "—", "$5k / year", "$25k / year"],
          ["Early access to betas", "—", "Yes", "Yes"],
          ["Certified engineers required", "1", "4", "10"],
        ],
      },
      {
        kind: "steps",
        title: "Becoming a partner",
        items: [
          {
            title: "Apply",
            body: "A ten-minute form covering your practice, target market and existing certifications.",
          },
          {
            title: "Certify",
            body: "Your engineers complete the certification paths; we cover exam costs for the first four.",
          },
          {
            title: "Launch",
            body: "You appear in the directory, get deal registration access and a joint launch plan.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Apply to the programme",
        body: "Applications are reviewed weekly and approved within ten business days.",
      },
    ],
  },

  customers: {
    tone: "brand-1",
    heroVariant: "center",
    intro:
      "From seed-stage startups to Fortune 100 platform teams — 14,000 organisations run production workloads on Nazexa.",
    blocks: [
      {
        kind: "stats",
        title: "The customer base",
        items: [
          { value: 14000, suffix: "+", label: "Organisations" },
          { value: 61, label: "Countries" },
          { value: 118, label: "Fortune 500 teams" },
          { value: 96, suffix: "%", label: "Net revenue retention" },
        ],
      },
      {
        kind: "cards",
        title: "Customer stories",
        items: [
          {
            tag: "Logistics",
            title: "Northwind",
            body: "140 engineers consolidated five services onto Core and now deploy 40 times a day with a 90-second pipeline.",
            meta: "8× faster releases",
          },
          {
            tag: "Healthcare",
            title: "Helio Health",
            body: "Retired three Kubernetes clusters and moved 400 services to managed edge compute without a headcount change.",
            meta: "62% lower cost",
          },
          {
            tag: "Retail",
            title: "Vantage Retail",
            body: "Handled 40,200 requests per second through peak season with zero manual scaling interventions.",
            meta: "0 peak incidents",
          },
          {
            tag: "Fintech",
            title: "Payward",
            body: "Cleared a tier-one bank's vendor security review in nine days using the published evidence pack.",
            meta: "9-day review",
          },
        ],
      },
      {
        kind: "quotes",
        title: "In their words",
        items: [
          {
            quote:
              "The first invoice matched the estimate to within three percent. That has never happened to us before.",
            name: "Marc Fischer",
            role: "CTO, Lumen Logistics",
          },
          {
            quote: "Two platform engineers now support 140 product engineers.",
            name: "Sofia Marchetti",
            role: "Director of Engineering, Aperture",
          },
          {
            quote:
              "We stopped having a weekly infrastructure meeting. There was nothing left to discuss.",
            name: "Tomas Lund",
            role: "Staff Engineer, Helio Health",
          },
        ],
      },
      {
        kind: "list",
        title: "Customer programmes",
        items: [
          {
            meta: "Advisory board",
            title: "Shape the roadmap",
            body: "Twenty customers meet quarterly with product leadership and see designs before they are built.",
          },
          {
            meta: "Design partners",
            title: "Build features with us",
            body: "Early access to unreleased capabilities with direct engineering support during adoption.",
          },
          {
            meta: "Reference programme",
            title: "Share your story",
            body: "Optional, always reviewed by you, and never used without written approval.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Join them",
        body: "Start on the free tier, or ask for a reference call with a customer in your industry.",
      },
    ],
  },

  integrations: {
    tone: "brand-1",
    heroVariant: "minimal",
    intro:
      "150+ integrations across CI, observability, identity, data and communication — most take under five minutes to wire up.",
    blocks: [
      {
        kind: "table",
        title: "Integration directory",
        columns: ["Category", "Integrations", "Setup"],
        rows: [
          [
            "CI/CD",
            "GitHub Actions, GitLab CI, Buildkite, CircleCI, Jenkins",
            "OAuth app",
          ],
          [
            "Observability",
            "Datadog, Grafana, Honeycomb, New Relic, Sentry",
            "API key",
          ],
          [
            "Identity",
            "Okta, Entra ID, Auth0, Google Workspace, JumpCloud",
            "SAML / OIDC",
          ],
          ["Data", "Snowflake, BigQuery, dbt, Fivetran, Airbyte", "Connector"],
          [
            "Communication",
            "Slack, Teams, PagerDuty, Opsgenie, Discord",
            "Webhook",
          ],
          ["Billing", "Stripe, Paddle, Chargebee", "API key"],
        ],
      },
      {
        kind: "features",
        title: "How integrations work",
        items: [
          {
            title: "Scoped credentials",
            body: "Every integration gets its own token with the narrowest scope required, revocable independently.",
          },
          {
            title: "Event-driven",
            body: "Integrations subscribe to platform events rather than polling, so state stays fresh without rate-limit pain.",
          },
          {
            title: "Build your own",
            body: "Signed webhooks and a public OpenAPI schema mean a custom integration is an afternoon, not a quarter.",
          },
        ],
      },
      {
        kind: "code",
        title: "Custom webhook in a few lines",
        language: "typescript",
        code: `import { verifySignature } from "@nazexa/webhooks";

export async function POST(request: Request) {
  const body = await request.text();
  if (!verifySignature(body, request.headers, process.env.NZ_WEBHOOK_SECRET!)) {
    return new Response("invalid signature", { status: 401 });
  }
  const event = JSON.parse(body);
  if (event.type === "deployment.succeeded") await notifyTeam(event.data);
  return new Response("ok");
}`,
      },
      {
        kind: "cta",
        title: "Missing an integration?",
        body: "Request it, or build it against the public schema — we will list community integrations in the directory.",
      },
    ],
  },

  "download-center": {
    tone: "brand-2",
    heroVariant: "minimal",
    intro:
      "CLI binaries, SDKs, desktop apps and signed artifacts with published checksums and provenance.",
    meta: [
      { label: "Latest CLI", value: "v4.2.1" },
      { label: "Signing", value: "Sigstore + cosign" },
      { label: "Support window", value: "18 months" },
    ],
    blocks: [
      {
        kind: "table",
        title: "CLI downloads",
        columns: ["Platform", "Architecture", "File", "Size"],
        rows: [
          ["macOS", "arm64 / x86_64", "nz_4.2.1_darwin_universal.pkg", "24 MB"],
          ["Linux", "x86_64", "nz_4.2.1_linux_amd64.tar.gz", "21 MB"],
          ["Linux", "arm64", "nz_4.2.1_linux_arm64.tar.gz", "20 MB"],
          ["Windows", "x86_64", "nz_4.2.1_windows_amd64.msi", "26 MB"],
          ["Docker", "multi-arch", "ghcr.io/nazexa/cli:4.2.1", "—"],
        ],
      },
      {
        kind: "table",
        title: "SDKs",
        columns: ["Language", "Package", "Version", "Status"],
        rows: [
          ["TypeScript", "@nazexa/core", "4.2.1", "Stable"],
          ["Go", "github.com/nazexa/go-sdk", "4.2.0", "Stable"],
          ["Python", "nazexa", "4.2.1", "Stable"],
          ["Rust", "nazexa", "3.9.4", "Stable"],
          ["Java", "com.nazexa:sdk", "3.8.0", "Maintenance"],
          ["Elixir", "nazexa_ex", "0.9.1", "Community"],
        ],
      },
      {
        kind: "code",
        title: "Install and verify",
        language: "bash",
        code: `curl -fsSL https://get.nazexa.com | sh

cosign verify-blob \\
  --certificate nz_4.2.1_linux_amd64.tar.gz.pem \\
  --signature  nz_4.2.1_linux_amd64.tar.gz.sig \\
  nz_4.2.1_linux_amd64.tar.gz`,
      },
      {
        kind: "faq",
        title: "Download questions",
        items: [
          {
            title: "How long is a version supported?",
            body: "Each minor release receives security fixes for 18 months from its publication date.",
          },
          {
            title: "Is there an air-gapped bundle?",
            body: "Yes — Enterprise customers can download a signed offline bundle containing the CLI, SDKs and documentation.",
          },
          {
            title: "Where are the checksums?",
            body: "SHA-256 sums and Sigstore signatures are published beside every artifact and mirrored in the release notes.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Get started with the CLI",
        body: "One install command, then `nz init` scaffolds a project with a database, function and preview URL.",
      },
    ],
  },

  security: {
    tone: "brand-2",
    heroVariant: "split",
    intro:
      "SOC 2 Type II, ISO 27001, 27017 and 27018, encryption everywhere, and a funded bug bounty with public triage times.",
    meta: [
      { label: "Certifications", value: "SOC 2 II · ISO 27001/17/18" },
      { label: "Bounty", value: "Up to $50,000" },
      { label: "Triage", value: "Median 6 hours" },
    ],
    blocks: [
      {
        kind: "checklist",
        title: "Controls in place",
        columns: [
          {
            title: "Data protection",
            items: [
              "AES-256 at rest, TLS 1.3 in transit",
              "Customer-managed keys via KMS",
              "Field-level encryption helpers",
              "35–365 day point-in-time recovery",
            ],
          },
          {
            title: "Access",
            items: [
              "SSO with SAML and OIDC",
              "SCIM provisioning and deprovisioning",
              "Hardware-key enforced admin access",
              "Just-in-time production access with review",
            ],
          },
          {
            title: "Assurance",
            items: [
              "Annual third-party penetration test",
              "Continuous control monitoring",
              "Immutable audit log export",
              "Published sub-processor list",
            ],
          },
        ],
      },
      {
        kind: "table",
        title: "Compliance artefacts",
        columns: ["Artefact", "Availability", "Refresh"],
        rows: [
          ["SOC 2 Type II report", "Under NDA", "Annual"],
          ["ISO 27001 certificate", "Public", "Annual"],
          ["Penetration test summary", "Under NDA", "Annual"],
          ["DPA and sub-processor list", "Public", "On change"],
          ["BAA (healthcare)", "On request", "On signature"],
          ["Security questionnaire pack", "Public", "Quarterly"],
        ],
      },
      {
        kind: "steps",
        title: "Responsible disclosure",
        items: [
          {
            title: "Report",
            body: "Email security@nazexa.com with the PGP key published on this page, or submit through the bounty platform.",
          },
          {
            title: "Triage",
            body: "Median first response of six hours, with a severity assessment and a named engineer within one business day.",
          },
          {
            title: "Reward and disclose",
            body: "Bounties from $500 to $50,000 paid on fix verification, with coordinated public disclosure after remediation.",
          },
        ],
      },
      trustFaq,
      {
        kind: "cta",
        title: "Request the evidence pack",
        body: "Sales can send the SOC 2 report, penetration test summary and questionnaire answers within one business day.",
      },
    ],
  },

  services: {
    tone: "brand-2",
    heroVariant: "split",
    intro:
      "Beyond the platform, our solution architects and implementation teams ensure your transition to Nazexa is predictable and fast.",
    blocks: [],
  },

  privacy: {
    tone: "brand-3",
    heroVariant: "minimal",
    intro:
      "Last updated 1 July 2026. This policy explains what personal data we process, why, and the rights you have.",
    meta: [
      { label: "Effective", value: "1 July 2026" },
      { label: "Controller", value: "Nazexa B.V., Amsterdam" },
      { label: "DPO", value: "privacy@nazexa.com" },
    ],
    blocks: [
      {
        kind: "legal",
        title: "Policy",
        sections: [
          {
            heading: "1. Data we collect",
            body: "Account data (name, work email, organisation), billing data processed by our payment provider, and product telemetry such as request metadata, error traces and feature usage. We do not read the contents of your databases or object storage except when you explicitly grant time-limited support access.",
          },
          {
            heading: "2. Why we process it",
            body: "To provide the service under our contract with you, to bill accurately, to secure the platform against abuse, and — where you have consented — to send product updates. Legitimate interest covers security monitoring and aggregate product analytics.",
          },
          {
            heading: "3. Retention",
            body: "Account data is retained for the life of the contract plus 90 days. Telemetry is retained for 30 days by default, or up to 13 months where you configure longer retention. Billing records are kept for seven years as required by Dutch tax law.",
          },
          {
            heading: "4. Your rights",
            body: "You can access, correct, export or delete your personal data at any time from the console or by emailing privacy@nazexa.com. We respond within 30 days and never charge for a first request. You may also lodge a complaint with the Dutch Data Protection Authority.",
          },
          {
            heading: "5. International transfers",
            body: "Data stays in the region you select. Where support requires access from another region, transfers rely on Standard Contractual Clauses plus supplementary technical measures including encryption and access logging.",
          },
          {
            heading: "6. Sub-processors",
            body: "We publish a versioned list of sub-processors with their purpose and location. Customers on Team and Enterprise receive 30 days notice of any addition and may object in writing.",
          },
          {
            heading: "7. Changes to this policy",
            body: "Material changes are announced by email and in the changelog at least 30 days before they take effect. Previous versions remain available for reference.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Questions about your data?",
        body: "Our data protection officer answers privacy enquiries within five business days at privacy@nazexa.com.",
      },
    ],
  },

  terms: {
    tone: "brand-3",
    heroVariant: "minimal",
    intro:
      "Last updated 1 July 2026. These terms govern your use of Nazexa products and services.",
    meta: [
      { label: "Effective", value: "1 July 2026" },
      { label: "Governing law", value: "Netherlands" },
      { label: "Entity", value: "Nazexa B.V." },
    ],
    blocks: [
      {
        kind: "legal",
        title: "Terms of service",
        sections: [
          {
            heading: "1. Your account",
            body: "You are responsible for the security of your credentials, the actions of users you invite, and the lawfulness of the content you store. You must be authorised to bind the organisation you register on behalf of.",
          },
          {
            heading: "2. Acceptable use",
            body: "No unlawful content, no attempts to breach isolation between tenants, no cryptocurrency mining, no sending unsolicited bulk email, and no use that materially degrades service for others. We give notice before enforcement unless the abuse is active and severe.",
          },
          {
            heading: "3. Service levels",
            body: "Team receives a 99.9% monthly availability target; Enterprise receives a contractual 99.99% SLA with service credits of 10% to 50% of monthly fees depending on the shortfall. Credits are claimed within 30 days of the incident.",
          },
          {
            heading: "4. Fees and payment",
            body: "Usage is billed monthly in arrears. Invoices are due within 14 days for card billing and 30 days for invoiced accounts. Disputed amounts must be raised within 30 days; undisputed amounts remain payable.",
          },
          {
            heading: "5. Intellectual property",
            body: "You own your content and any code you deploy. We own the platform. You grant us only the licence needed to operate and secure the service on your behalf.",
          },
          {
            heading: "6. Termination",
            body: "Either party may terminate a monthly plan at any time, effective at the end of the billing period. On termination you have 30 days to export your data at no charge before deletion.",
          },
          {
            heading: "7. Liability",
            body: "Liability is capped at fees paid in the twelve months preceding the claim, except for breaches of confidentiality, data protection obligations or wilful misconduct. Neither party is liable for indirect or consequential loss.",
          },
          {
            heading: "8. Changes",
            body: "We may update these terms with 30 days notice. Material changes to Enterprise agreements require written agreement from both parties.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Need a custom agreement?",
        body: "Enterprise contracts, DPAs, BAAs and security addenda are handled by our legal team within five business days.",
      },
    ],
  },

  "cookie-policy": {
    tone: "brand-3",
    heroVariant: "minimal",
    intro:
      "Last updated 1 July 2026. What we store in your browser, why, and how to change it.",
    meta: [
      { label: "Effective", value: "1 July 2026" },
      { label: "Consent", value: "Required for analytics" },
      { label: "Contact", value: "privacy@nazexa.com" },
    ],
    blocks: [
      {
        kind: "table",
        title: "Cookies we set",
        columns: ["Name", "Purpose", "Type", "Duration"],
        rows: [
          [
            "nz_session",
            "Keeps you signed in to the console",
            "Essential",
            "30 days",
          ],
          [
            "nz_csrf",
            "Protects form submissions from forgery",
            "Essential",
            "Session",
          ],
          [
            "nz_theme",
            "Remembers light or dark preference",
            "Preference",
            "1 year",
          ],
          ["nz_consent", "Stores your cookie choices", "Essential", "1 year"],
          [
            "nz_analytics",
            "Aggregate, cookie-less page measurement",
            "Analytics",
            "24 hours",
          ],
        ],
      },
      {
        kind: "legal",
        title: "Details",
        sections: [
          {
            heading: "Essential cookies",
            body: "These are required for authentication, security and load balancing. They cannot be disabled without breaking sign-in, and they are set on the basis of our legitimate interest in operating the service securely.",
          },
          {
            heading: "Analytics",
            body: "We use privacy-preserving, aggregate measurement with no cross-site tracking, no advertising identifiers and no data sold or shared with third parties. Analytics is off until you consent and can be withdrawn at any time.",
          },
          {
            heading: "Managing your choices",
            body: "Open the cookie preferences link in the site footer to change your selection at any time. You can also block cookies in your browser, though essential cookies are needed for the console to function.",
          },
          {
            heading: "Third parties",
            body: "We do not run advertising networks or social media pixels on this site. Embedded video, when present, is loaded only after you press play and is served in privacy-enhanced mode.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Change your preferences",
        body: "Cookie settings are available from the footer on every page, and your choice applies immediately.",
      },
    ],
  },

  support: {
    tone: "brand-1",
    heroVariant: "split",
    intro:
      "Self-serve answers, community help and named engineers — with response targets we publish and measure.",
    meta: [
      { label: "P1 target", value: "15 minutes (Enterprise)" },
      { label: "Coverage", value: "24/7/365" },
      { label: "CSAT", value: "4.8 / 5" },
    ],
    blocks: [
      {
        kind: "table",
        title: "Response targets",
        columns: ["Severity", "Definition", "Free", "Team", "Enterprise"],
        rows: [
          [
            "P1",
            "Production down or data at risk",
            "Community",
            "4 hours",
            "15 minutes",
          ],
          ["P2", "Major feature degraded", "Community", "8 hours", "2 hours"],
          [
            "P3",
            "Minor issue with a workaround",
            "Community",
            "1 business day",
            "8 hours",
          ],
          [
            "P4",
            "Question or feature guidance",
            "Community",
            "2 business days",
            "1 business day",
          ],
        ],
      },
      {
        kind: "channels",
        title: "Ways to get help",
        items: [
          {
            title: "Help center",
            body: "Searchable answers, troubleshooting trees and runbooks for the errors we see most often.",
            action: "Browse 400+ articles",
          },
          {
            title: "Community forum",
            body: "Public questions answered by staff and community members, median first response under two hours.",
            action: "Ask a question",
          },
          {
            title: "Console ticketing",
            body: "Open a ticket with project context attached automatically, and track it against its SLA.",
            action: "Open a ticket",
          },
          {
            title: "Premium support",
            body: "Named support engineers, a private Slack channel and quarterly reliability reviews.",
            action: "Talk to sales",
          },
        ],
      },
      {
        kind: "steps",
        title: "Getting a fast resolution",
        items: [
          {
            title: "Include the request ID",
            body: "Every API response carries an x-request-id; it lets us jump straight to your trace.",
          },
          {
            title: "Describe the expectation",
            body: "Tell us what you expected and what happened instead — the gap is usually where the bug lives.",
          },
          {
            title: "Set the right severity",
            body: "Honest severity keeps P1 paging meaningful for everyone, including you.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Need help right now?",
        body: "Check the status page for known incidents, then open a ticket from the console with your project selected.",
      },
    ],
  },

  status: {
    tone: "brand-1",
    heroVariant: "minimal",
    intro:
      "Live availability across every region and service, with full incident history and subscription options.",
    meta: [
      { label: "Current", value: "All systems operational" },
      { label: "90-day uptime", value: "99.996%" },
      { label: "Open incidents", value: "0" },
    ],
    blocks: [
      {
        kind: "table",
        title: "Service status",
        columns: ["Service", "Status", "90-day uptime", "p50 latency"],
        rows: [
          ["API control plane", "Operational", "99.998%", "38 ms"],
          ["Database (managed Postgres)", "Operational", "99.997%", "4 ms"],
          ["Edge functions", "Operational", "99.995%", "42 ms"],
          ["Object storage", "Operational", "99.999%", "27 ms"],
          ["Authentication", "Operational", "99.998%", "31 ms"],
          ["Insight ingestion", "Operational", "99.992%", "immediate"],
        ],
      },
      {
        kind: "timeline",
        title: "Incident history",
        items: [
          {
            date: "22 Jul 2026",
            title: "EU-West degraded reads — 41 minutes",
            body: "A metadata cache stampede increased read latency to 900 ms p99 in one region. Mitigated by shedding cache traffic; permanent fix shipped 24 July.",
            tag: "Resolved",
          },
          {
            date: "3 Jun 2026",
            title: "Delayed Insight ingestion — 2 hours",
            body: "A schema migration on the ingestion pipeline slowed trace availability. No data was lost; backlog cleared automatically.",
            tag: "Resolved",
          },
          {
            date: "14 Apr 2026",
            title: "Scheduled maintenance — US-East",
            body: "Planned storage node replacement completed with no customer-visible impact.",
            tag: "Maintenance",
          },
        ],
      },
      {
        kind: "channels",
        title: "Stay informed",
        items: [
          {
            title: "Email and SMS",
            body: "Per-service and per-region subscriptions so you only hear about what you actually run.",
            action: "Subscribe",
          },
          {
            title: "Webhooks",
            body: "Signed status events pushed into Slack, PagerDuty, Opsgenie or your own endpoint.",
            action: "Configure",
          },
          {
            title: "RSS and API",
            body: "Machine-readable feed and a JSON status API for your internal dashboards.",
            action: "View feed",
          },
        ],
      },
      {
        kind: "cta",
        title: "Reporting an issue?",
        body: "If you see something the status page does not, open a P1 from the console — it pages the on-call engineer immediately.",
      },
    ],
  },

  "feature-requests": {
    tone: "brand-2",
    heroVariant: "center",
    intro:
      "Tell us what to build next, see what others are asking for, and follow a request from idea to release.",
    blocks: [
      {
        kind: "cards",
        title: "Most requested right now",
        items: [
          {
            tag: "1,204 votes",
            title: "Query plan advisor",
            body: "Automatic index suggestions with measured impact from your own workload.",
            meta: "Status: In progress",
          },
          {
            tag: "986 votes",
            title: "Scheduled branch refresh",
            body: "Nightly reseeding of long-lived branches from an anonymised production snapshot.",
            meta: "Status: Planned",
          },
          {
            tag: "742 votes",
            title: "Per-endpoint rate limit rules",
            body: "Declarative limits with burst allowances configured alongside the route.",
            meta: "Status: Under review",
          },
          {
            tag: "610 votes",
            title: "Terraform provider parity",
            body: "Full coverage of branches, policies and spend caps in the official provider.",
            meta: "Status: Shipped",
          },
        ],
      },
      {
        kind: "steps",
        title: "How a request becomes a feature",
        items: [
          {
            title: "Submit the problem",
            body: "Describe the situation and impact rather than the solution — it gives us room to find a better one.",
          },
          {
            title: "Weekly triage",
            body: "Product and engineering review new requests every Monday and set a status with a public comment.",
          },
          {
            title: "Build and release",
            body: "Requests move through Planned, In progress and Shipped, and everyone who voted gets notified at each change.",
          },
        ],
      },
      {
        kind: "table",
        title: "Statuses explained",
        columns: ["Status", "Meaning", "Typical time"],
        rows: [
          [
            "Under review",
            "Triaged, gathering demand and context",
            "1–4 weeks",
          ],
          ["Planned", "Committed to a quarter on the roadmap", "1–2 quarters"],
          [
            "In progress",
            "Actively being built, beta flag likely available",
            "4–12 weeks",
          ],
          [
            "Shipped",
            "Generally available, linked to the changelog entry",
            "—",
          ],
          ["Not planned", "Declined with a written explanation", "—"],
        ],
      },
      {
        kind: "cta",
        title: "Post a request",
        body: "Two minutes to write, and every submission gets a human response within a week.",
      },
    ],
  },

  "release-notes": {
    tone: "brand-2",
    heroVariant: "minimal",
    intro:
      "Versioned notes for every stable, beta and security release, with migration guidance where it is needed.",
    meta: [
      { label: "Current", value: "v4.2.1" },
      { label: "Cadence", value: "Weekly, Thursdays" },
      { label: "Support", value: "18 months per minor" },
    ],
    blocks: [
      {
        kind: "timeline",
        title: "Stable releases",
        items: [
          {
            date: "v4.2.1 · 8 Aug 2026",
            title: "Multi-region writes GA",
            body: "Regional write acceptance with last-writer-wins or custom merge functions. No migration required; enable per project.",
            tag: "Minor",
          },
          {
            date: "v4.2.0 · 1 Aug 2026",
            title: "Branch-aware analytics",
            body: "Traces and spend segmented by branch. Existing dashboards continue to work; new branch filters are additive.",
            tag: "Minor",
          },
          {
            date: "v4.1.4 · 24 Jul 2026",
            title: "Scheduler rewrite",
            body: "Cold start median down to 11 ms. Behavioural change: isolates now pre-warm on route registration rather than first request.",
            tag: "Patch",
          },
          {
            date: "v4.1.0 · 26 Jun 2026",
            title: "Fail-closed spend caps",
            body: "Adds a hard-stop budget mode. Deprecates the soft_limit field, which continues to work until v5.0.",
            tag: "Minor",
          },
        ],
      },
      {
        kind: "table",
        title: "Version support",
        columns: ["Version", "Released", "Security fixes until", "Status"],
        rows: [
          ["v4.2", "Aug 2026", "Feb 2028", "Current"],
          ["v4.1", "Jun 2026", "Dec 2027", "Supported"],
          ["v4.0", "Mar 2026", "Sep 2027", "Supported"],
          ["v3.9", "Nov 2025", "May 2027", "Maintenance"],
          ["v3.8", "Aug 2025", "Feb 2027", "Maintenance"],
        ],
      },
      {
        kind: "checklist",
        title: "Upgrade guidance",
        columns: [
          {
            title: "Before upgrading",
            items: [
              "Read the deprecation section",
              "Run the codemod in a branch",
              "Check SDK version compatibility",
              "Verify against a preview deployment",
            ],
          },
          {
            title: "Our commitments",
            items: [
              "12 months notice for breaking changes",
              "Codemods for every breaking API",
              "Security patches within 48 hours",
              "Published CVE disclosures",
            ],
          },
        ],
      },
      {
        kind: "cta",
        title: "Subscribe to releases",
        body: "RSS, email or webhook — including a security-only feed if that is all you need.",
      },
    ],
  },
};
