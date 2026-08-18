import type { PageBlock } from "./site-content";

export type ProductSummary = {
  slug: string;
  to: "/db-design" | "/dev-tools";
  name: string;
  tagline: string;
  description: string;
  cta: string;
  bullets: string[];
  tone: "brand-1" | "brand-2";
};

export type ProductDetail = ProductSummary & {
  eyebrow: string;
  heroTitle: string;
  meta: { label: string; value: string }[];
  audience: { title: string; body: string }[];
  groups: {
    title: string;
    body: string;
    items: string[];
    visual: "erd" | "layout" | "export" | "json" | "api" | "jwt";
  }[];
  blocks: PageBlock[];
};

export const dbDesign: ProductDetail = {
  slug: "db-design",
  to: "/db-design",
  name: "Nazexa DB Design",
  tagline: "Visual database design, from first entity to production migration",
  description:
    "Design schemas, ERDs, tables, columns, indexes and relationships on an infinite canvas, then export clean SQL, JSON or Laravel migrations for MySQL, PostgreSQL, SQLite and more.",
  cta: "Explore Nazexa DB Design",
  bullets: [
    "Drag & drop ERD designer with snap-to-grid, minimap and auto-layout",
    "Relationship validation before a single migration runs",
    "SQL / JSON import & export plus Laravel model and migration generation",
  ],
  tone: "brand-1",
  eyebrow: "Product · Database design",
  heroTitle: "Design your database visually. Ship it as real migrations.",
  meta: [
    { label: "Engines", value: "MySQL · PostgreSQL · SQLite" },
    { label: "Exports", value: "SQL · JSON · Laravel · PNG · SVG" },
    { label: "Canvas", value: "Zoom, minimap, auto-layout" },
    { label: "Teams", value: "Projects & collaborators" },
  ],
  audience: [
    {
      title: "Backend engineers",
      body: "Model a schema visually, validate relationships, and generate migrations you would have written by hand anyway.",
    },
    {
      title: "Laravel teams",
      body: "Generate Eloquent models and migrations for legacy or latest Laravel versions straight from the diagram.",
    },
    {
      title: "Architects & analysts",
      body: "Communicate data models with exportable PNG/SVG ERDs that stay in sync with the real schema.",
    },
  ],
  groups: [
    {
      title: "Visual schema modelling",
      body: "An infinite canvas built for real schemas, not toy diagrams.",
      items: [
        "Visual ERD and database designer",
        "Tables, columns, indexes and constraints",
        "Drag & drop schema editing",
        "Inline column types, defaults and nullability",
      ],
      visual: "erd",
    },
    {
      title: "Relationships you can trust",
      body: "Every foreign key is checked as you draw it, so broken models never reach a migration.",
      items: [
        "One-to-one, one-to-many and many-to-many relationships",
        "Relationship validation with actionable warnings",
        "Cascade, restrict and set-null behaviours",
        "Index and key suggestions on join columns",
      ],
      visual: "erd",
    },
    {
      title: "Canvas & productivity",
      body: "Navigate hundreds of tables without losing your place.",
      items: [
        "Grid and snap-to-grid alignment",
        "Minimap and smooth zoom",
        "Auto-layout for generated schemas",
        "Keyboard-first editing",
      ],
      visual: "layout",
    },
    {
      title: "Import, export & code generation",
      body: "Round-trip between diagram and database, and generate framework code from the same source of truth.",
      items: [
        "SQL and JSON import & export",
        "MySQL, PostgreSQL, SQLite and other engines",
        "Laravel model and migration generator",
        "Laravel legacy and latest version export",
        "PNG and SVG diagram export",
      ],
      visual: "export",
    },
  ],
  blocks: [
    {
      kind: "steps",
      title: "How teams work in DB Design",
      items: [
        {
          title: "1. Start from anywhere",
          body: "Create a blank project, import an existing SQL dump, or paste a JSON schema — auto-layout arranges it instantly.",
        },
        {
          title: "2. Model and validate",
          body: "Add tables, columns and indexes, draw relationships, and fix validation warnings before they become migration bugs.",
        },
        {
          title: "3. Generate and share",
          body: "Export SQL, JSON, Laravel models and migrations, or a PNG/SVG diagram for the docs and the design review.",
        },
      ],
    },
    {
      kind: "cards",
      title: "Why teams choose it",
      items: [
        {
          title: "Fewer migration mistakes",
          body: "Validation catches missing keys, mismatched types and orphaned relations while you design.",
          tag: "Quality",
        },
        {
          title: "Faster onboarding",
          body: "A readable ERD explains a legacy database faster than any wiki page.",
          tag: "Clarity",
        },
        {
          title: "Less boilerplate",
          body: "Models, migrations and SQL are generated from the diagram instead of typed twice.",
          tag: "Speed",
        },
        {
          title: "Shared understanding",
          body: "Projects and collaborators keep product, backend and data teams on the same schema.",
          tag: "Collaboration",
        },
      ],
    },
    {
      kind: "checklist",
      title: "Projects & collaboration",
      columns: [
        {
          title: "Project management",
          items: [
            "Organise schemas into projects",
            "Version-friendly JSON export",
            "Duplicate and template projects",
            "Diagram history at a glance",
          ],
        },
        {
          title: "Collaboration",
          items: [
            "Invite collaborators per project",
            "Role-appropriate access",
            "Shareable diagram exports",
            "Plan-based project and collaborator limits",
          ],
        },
      ],
    },
    {
      kind: "faq",
      title: "Frequently asked",
      items: [
        {
          title: "Which databases are supported?",
          body: "MySQL, PostgreSQL and SQLite are first-class, with generic SQL export for other engines.",
        },
        {
          title: "Can I import an existing database?",
          body: "Yes — import a SQL dump or JSON schema and DB Design reconstructs tables, columns, indexes and relationships, then auto-lays out the diagram.",
        },
        {
          title: "How does the Laravel generator work?",
          body: "It produces Eloquent models and migration files from your diagram, with an option to target legacy or the latest Laravel version.",
        },
        {
          title: "Are there limits on projects?",
          body: "Project and collaborator counts are plan-based; you can raise them at any time from billing.",
        },
      ],
    },
    {
      kind: "cta",
      title: "Design your next schema visually",
      body: "Start a project, import your current database, and export production-ready migrations today.",
    },
  ],
};

export const devTools: ProductDetail = {
  slug: "dev-tools",
  to: "/dev-tools",
  name: "Nazexa DEV Tools",
  tagline: "The everyday developer toolbox, in one fast workspace",
  description:
    "JSON, API, JWT, SQL and Laravel utilities in a single place — formatters, validators, request builders, decoders and generators, with AI assistance where it genuinely helps.",
  cta: "Explore Nazexa DEV Tools",
  bullets: [
    "JSON formatter, validator and minifier",
    "API request builder and JWT inspector",
    "SQL formatting plus Laravel code generators",
  ],
  tone: "brand-2",
  eyebrow: "Product · Developer tooling",
  heroTitle: "Every small tool you open ten times a day, in one place",
  meta: [
    { label: "Toolset", value: "JSON · API · JWT · SQL" },
    { label: "Frameworks", value: "Laravel generators" },
    { label: "Assist", value: "AI where it helps" },
    { label: "Workflow", value: "Keyboard-first" },
  ],
  audience: [
    {
      title: "Full-stack developers",
      body: "Stop juggling five sketchy tabs to format a payload, sign a token and replay a request.",
    },
    {
      title: "API teams",
      body: "Build, send and inspect requests, then decode the tokens and payloads behind them in the same workspace.",
    },
    {
      title: "Laravel developers",
      body: "Generate boilerplate and use framework-aware helpers tuned for real Laravel projects.",
    },
  ],
  groups: [
    {
      title: "Data & payload tools",
      body: "Read, fix and reshape payloads without leaving the workspace.",
      items: [
        "JSON formatter and beautifier",
        "JSON validator with precise error positions",
        "JSON minifier",
        "Structure-aware diff and search",
      ],
      visual: "json",
    },
    {
      title: "API workflow",
      body: "Compose a request, send it, and read the response properly.",
      items: [
        "Request builder with headers, params and bodies",
        "Response inspector with timing and status",
        "Reusable request collections",
        "Environment values for hosts and tokens",
      ],
      visual: "api",
    },
    {
      title: "Auth & tokens",
      body: "Understand what a token actually contains before you debug further.",
      items: [
        "JWT decoder and inspector",
        "JWT encoder for test tokens",
        "Claim and expiry inspection",
        "Signature and algorithm checks",
      ],
      visual: "jwt",
    },
    {
      title: "SQL, Laravel & code utilities",
      body: "Framework-aware helpers and generators for day-to-day work.",
      items: [
        "SQL formatter and query utilities",
        "Laravel developer tools and code generators",
        "Encoding, hashing and string utilities",
        "AI-powered assistance for explaining and rewriting snippets",
      ],
      visual: "export",
    },
  ],
  blocks: [
    {
      kind: "steps",
      title: "A typical debugging loop",
      items: [
        {
          title: "1. Reproduce the call",
          body: "Build the request in the API tester with the right headers, body and environment values.",
        },
        {
          title: "2. Inspect what came back",
          body: "Format and validate the JSON response, then decode the JWT that produced it.",
        },
        {
          title: "3. Fix and generate",
          body: "Format the offending SQL, generate the Laravel boilerplate you need, and get on with the feature.",
        },
      ],
    },
    {
      kind: "cards",
      title: "Why teams choose it",
      items: [
        {
          title: "One workspace",
          body: "No more untrusted random tools for pasting production-shaped payloads.",
          tag: "Focus",
        },
        {
          title: "Consistent UX",
          body: "Same shortcuts, same layout, same behaviour across every tool.",
          tag: "Flow",
        },
        {
          title: "Framework aware",
          body: "Laravel generators understand the conventions your project already follows.",
          tag: "Laravel",
        },
        {
          title: "AI where it helps",
          body: "Explain a payload or rewrite a query — assistance stays optional and out of the way.",
          tag: "AI",
        },
      ],
    },
    {
      kind: "faq",
      title: "Frequently asked",
      items: [
        {
          title: "Do I need an account?",
          body: "Core utilities work immediately; saving collections, environments and history needs an account.",
        },
        {
          title: "Is my data sent anywhere?",
          body: "Formatting, validation and decoding happen in your session; AI assistance is opt-in per action.",
        },
        {
          title: "Does it work with DB Design?",
          body: "Yes — the same account and projects, so schema work and daily tooling live side by side.",
        },
        {
          title: "Which Laravel versions are supported?",
          body: "Generators target current Laravel releases with options for older, long-lived projects.",
        },
      ],
    },
    {
      kind: "cta",
      title: "Speed up your everyday workflow",
      body: "Open DEV Tools, bring your next payload, and see how much tab-switching disappears.",
    },
  ],
};

export const products: ProductDetail[] = [dbDesign, devTools];
