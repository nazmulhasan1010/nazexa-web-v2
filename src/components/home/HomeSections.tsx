import Link from 'next/link';

import {
  ArrowRight,
  Boxes,
  Brain,
  Cloud,
  Code2,
  Database,
  Gauge,
  GitBranch,
  Globe,
  Lock,
  Play,
  Quote,
  Star,
  Terminal,
  Workflow,
  Zap,
} from 'lucide-react';

import {
  AuroraBackground,
  FloatingShapes,
  GridBackground,
  ParticleField,
  WaveBackground,
} from '@/components/backgrounds/AnimatedBackground';
import { Counter, Magnetic, Reveal, TextReveal } from '@/components/motion/Reveal';
import { homeSectionsQuery } from '@/lib/queries';
import { Section } from '@/components/site/PageShell';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const brands = [
  'Northwind',
  'Helio Health',
  'Vantage',
  'Lumen Labs',
  'Cobalt',
  'Orbital',
  'Ferrous',
  'Kestrel',
];

export type HeroProps = {
  title?: string | undefined;
  subtitle?: string | undefined;
  badge?: string | undefined;
  body?: string | undefined;
  primaryCta?: string | undefined;
  secondaryCta?: string | undefined;
};

export function Hero({
  title = 'We build modern software',
  subtitle = 'that businesses run on',
  badge = 'Software development · Android · Web · Cloud · Consulting',
  body = 'Nazexa is a software development and technology company. We turn ideas into reliable, scalable digital solutions — custom software, mobile and web apps, APIs, databases and cloud — and we ship our own developer products with the same standards.',
  primaryCta = 'Start a project',
  secondaryCta = 'Explore our services',
}: HeroProps = {}) {
  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-24">
      <AuroraBackground />
      <GridBackground />
      <ParticleField />
      <FloatingShapes />
      <div className="mx-auto w-full max-w-6xl px-5 text-center">
        <Reveal variant="fade">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            <Zap className="mr-1.5 h-3 w-3" /> {badge}
          </Badge>
        </Reveal>

        <h1 className="mx-auto mt-8 max-w-4xl text-5xl leading-[1.02] font-semibold sm:text-7xl">
          <TextReveal text={title} />
          <span className="block">
            <TextReveal text={subtitle} wordClassName="text-gradient" />
          </span>
        </h1>

        <Reveal variant="up" delay={220}>
          <p className="text-muted-foreground mx-auto mt-7 max-w-2xl text-lg sm:text-xl">{body}</p>
        </Reveal>

        <Reveal variant="up" delay={340}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button asChild size="lg" className="glow-ring h-12 px-7 text-base">
                <Link href="/contact">
                  {primaryCta} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic strength={8}>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <Link href="/services">
                  <Play className="mr-1.5 h-4 w-4" /> {secondaryCta}
                </Link>
              </Button>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal variant="blur" delay={480}>
          <div className="surface-card mx-auto mt-14 max-w-3xl overflow-hidden text-left">
            <div className="border-border flex items-center gap-2 border-b px-4 py-2.5">
              <span className="bg-destructive/70 h-2.5 w-2.5 rounded-full" />
              <span className="bg-accent/70 h-2.5 w-2.5 rounded-full" />
              <span className="bg-primary/70 h-2.5 w-2.5 rounded-full" />
              <span className="text-muted-foreground ml-2 font-mono text-xs">nazexa delivery</span>
            </div>
            <pre className="text-muted-foreground overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
              <code>{`> discovery      goals, users, constraints mapped
> architecture   data model + services defined
> build          2-week increments, tested
> launch         staged rollout, monitored

$ your product is live — and you own every line`}</code>
            </pre>
          </div>
        </Reveal>
      </div>
      <WaveBackground />
    </section>
  );
}

export function TrustedBy() {
  return (
    <section className="border-border relative border-y py-10">
      <div className="mx-auto max-w-7xl px-5">
        <p className="text-muted-foreground text-center text-xs tracking-[0.25em] uppercase">
          Trusted by engineering teams at
        </p>
        <div className="mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-14">
            {[...brands, ...brands].map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="font-display text-muted-foreground/70 text-lg font-medium"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Database,
    title: 'Managed Postgres',
    body: 'Branchable databases with instant restores and connection pooling built in.',
  },
  {
    icon: Globe,
    title: 'Edge runtime',
    body: 'Deploy functions to 34 regions with sub-50ms cold starts.',
  },
  {
    icon: Lock,
    title: 'Auth & permissions',
    body: 'SSO, SCIM, passkeys and row-level policies without a separate service.',
  },
  {
    icon: Brain,
    title: 'AI primitives',
    body: 'Embeddings, agents, evals and streaming inference with usage-based billing.',
  },
  {
    icon: Gauge,
    title: 'Observability',
    body: 'Traces, metrics and logs correlated by request, out of the box.',
  },
  {
    icon: Workflow,
    title: 'Workflows',
    body: 'Durable jobs and schedules that survive deploys and outages.',
  },
  {
    icon: GitBranch,
    title: 'Preview environments',
    body: 'A full stack per pull request, torn down automatically.',
  },
  {
    icon: Boxes,
    title: 'Object storage',
    body: 'S3-compatible storage with signed URLs and image transforms.',
  },
  {
    icon: Cloud,
    title: 'Multi-region',
    body: 'Read replicas and failover configured in a single click.',
  },
];

export function FeatureGrid() {
  return (
    <Section title="Everything the product needs, already wired together">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 70}>
            <div className="surface-card hover-lift group relative h-full overflow-hidden p-6">
              <div className="via-primary/60 absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="bg-primary/12 ring-primary/25 flex h-10 w-10 items-center justify-center rounded-xl ring-1">
                <f.icon className="text-primary h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function PlatformOverview() {
  const rows = [
    {
      icon: Terminal,
      title: 'Developer experience',
      body: 'One CLI, typed SDKs in five languages, and a local emulator that matches production.',
    },
    {
      icon: Code2,
      title: 'Database designer',
      body: 'Model schemas visually, generate migrations, and preview the diff before it runs.',
    },
    {
      icon: Zap,
      title: 'Instant deploys',
      body: 'Atomic, zero-downtime releases with automatic rollback on error-rate regression.',
    },
  ];
  return (
    <section className="relative isolate overflow-hidden py-16">
      <AuroraBackground />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <Reveal>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Platform overview
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
              A single control plane for your entire stack
            </h2>
            <p className="text-muted-foreground mt-4">
              Stop stitching six vendors together. Nazexa gives you one mental model, one bill, and
              one place to debug when something goes wrong at 3am.
            </p>
          </Reveal>
          <div className="mt-8 space-y-5">
            {rows.map((r, i) => (
              <Reveal key={r.title} variant="left" delay={i * 110}>
                <div className="flex gap-4">
                  <div className="bg-secondary ring-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1">
                    <r.icon className="text-primary h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{r.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal variant="right" delay={120}>
          <div className="surface-card relative overflow-hidden p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground font-mono text-xs">schema.designer</span>
              <span className="bg-primary/12 text-primary rounded-full px-2 py-0.5 text-[10px] tracking-widest uppercase">
                live preview
              </span>
            </div>
            <svg viewBox="0 0 460 300" className="w-full">
              {[
                { x: 20, y: 30, label: 'users' },
                { x: 250, y: 20, label: 'orders' },
                { x: 250, y: 170, label: 'sessions' },
              ].map((t) => (
                <g key={t.label}>
                  <rect
                    x={t.x}
                    y={t.y}
                    width="170"
                    height="110"
                    rx="10"
                    fill="color-mix(in oklab, var(--card) 92%, transparent)"
                    stroke="var(--brand-1)"
                    strokeOpacity="0.35"
                  />
                  <text
                    x={t.x + 14}
                    y={t.y + 26}
                    fill="var(--foreground)"
                    fontSize="13"
                    fontFamily="monospace"
                  >
                    {t.label}
                  </text>
                  {['id  uuid', 'created_at', 'meta  jsonb'].map((c, ci) => (
                    <text
                      key={c}
                      x={t.x + 14}
                      y={t.y + 50 + ci * 20}
                      fill="var(--muted-foreground)"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {c}
                    </text>
                  ))}
                </g>
              ))}
              <path
                className="animate-draw"
                d="M190 80 C 225 80, 215 60, 250 60 M190 100 C 225 100, 215 210, 250 210"
                stroke="var(--brand-1)"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity="0.7"
              />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Stats() {
  const stats: {
    value: number;
    suffix: string;
    label: string;
    decimals?: number;
  }[] = [
    { value: 120, suffix: '+', label: 'Projects delivered for clients' },
    { value: 13, suffix: '', label: 'Service practices in-house' },
    { value: 40, suffix: '+', label: 'Technologies we work with' },
    { value: 9, suffix: ' yrs', label: 'Building software since 2019' },
  ];
  return (
    <section className="border-border relative isolate overflow-hidden border-y py-16">
      <GridBackground variant="dots" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} variant="zoom" delay={i * 90}>
            <div className="text-center">
              <div className="text-gradient font-display text-5xl font-semibold">
                <Counter to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <p className="text-muted-foreground mt-2 text-sm">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const items = [
    {
      quote:
        'Nazexa replaced a decade-old internal system in four months. Their discovery phase alone was worth the engagement.',
      name: 'Priya Raman',
      role: 'VP Operations, Northwind',
    },
    {
      quote:
        'We got a senior engineer on the first call and a written plan in a week. Every demo landed on schedule.',
      name: 'Tomas Lindqvist',
      role: 'Founder, Cobalt',
    },
    {
      quote:
        'The Android app and the API behind it were delivered together, documented, and handed to our team cleanly.',
      name: 'Amara Okafor',
      role: 'CTO, Helio Health',
    },
  ];
  return (
    <Section title="What clients say about working with us">
      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.name} delay={i * 110}>
            <figure className="surface-card hover-lift flex h-full flex-col p-7">
              <Quote className="text-primary/60 h-6 w-6" />
              <blockquote className="text-foreground/90 mt-4 flex-1 text-sm leading-relaxed">
                "{t.quote}"
              </blockquote>
              <figcaption className="border-border mt-6 border-t pt-4">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-muted-foreground text-xs">{t.role}</div>
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="fill-accent text-accent h-3 w-3" />
                  ))}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Timeline() {
  const events = [
    {
      year: '2019',
      title: 'Two people, one thesis',
      body: 'Nazexa starts as an internal tool for shipping side projects faster.',
    },
    {
      year: '2021',
      title: 'Edge runtime launches',
      body: 'Functions go multi-region; the first 1,000 teams join.',
    },
    {
      year: '2023',
      title: 'Series B',
      body: '$90M to build the AI layer and expand to 24 countries.',
    },
    {
      year: '2026',
      title: 'One platform',
      body: 'Databases, compute, AI and observability unify under one control plane.',
    },
  ];
  return (
    <Section title="Company timeline">
      <div className="border-border relative border-l pl-8">
        <span className="from-primary/70 via-primary/20 absolute top-0 left-0 h-full w-px bg-gradient-to-b to-transparent" />
        {events.map((e, i) => (
          <Reveal key={e.year} variant="left" delay={i * 100}>
            <div className="relative pb-10">
              <span className="bg-primary ring-background absolute top-1.5 -left-[38px] flex h-3 w-3 items-center justify-center rounded-full ring-4" />
              <div className="text-primary font-mono text-xs">{e.year}</div>
              <h3 className="mt-1 text-base font-semibold">{e.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{e.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function TechStack() {
  const tech = [
    'TypeScript',
    'Postgres',
    'Rust',
    'WebAssembly',
    'OpenTelemetry',
    'gRPC',
    'Kubernetes',
    'Terraform',
    'Redis',
    'Kafka',
    'React',
    'Go',
  ];
  return (
    <Section title="Built on technology you already trust">
      <div className="flex flex-wrap gap-2.5">
        {tech.map((t, i) => (
          <Reveal key={t} variant="zoom" delay={i * 45}>
            <span className="surface-card hover-lift text-muted-foreground inline-block px-4 py-2 font-mono text-xs">
              {t}
            </span>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function BlogPreview() {
  const posts = [
    {
      tag: 'Engineering',
      title: 'How we cut cold starts to 38ms',
      body: 'A deep dive into snapshotting V8 isolates at the edge.',
      to: '/developer-blog',
    },
    {
      tag: 'Product',
      title: 'Introducing branch-aware analytics',
      body: 'Query your preview data with the same tools as production.',
      to: '/blog',
    },
    {
      tag: 'News',
      title: 'Nazexa achieves ISO 27001',
      body: 'Our third independent certification this year.',
      to: '/news',
    },
  ];
  return (
    <Section title="Latest from the blog">
      <div className="grid gap-5 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.title} delay={i * 100}>
            <Link href={p.to} className="surface-card hover-lift block h-full overflow-hidden">
              <div className="bg-secondary/40 relative h-36 overflow-hidden">
                <AuroraBackground />
                <div className="dot-grid absolute inset-0 opacity-40" />
              </div>
              <div className="p-6">
                <span className="text-primary text-xs tracking-widest uppercase">{p.tag}</span>
                <h3 className="mt-2 text-base font-semibold">{p.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{p.body}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function FaqPreview() {
  const faqs = [
    [
      'How do projects usually start?',
      'With a short discovery call, followed by a written approach covering scope, architecture, milestones and a fixed estimate — normally within a week.',
    ],
    [
      'Who owns the code and infrastructure?',
      'You do, from the first commit. Repositories, cloud accounts and credentials are in your name throughout.',
    ],
    [
      'Can you work with our existing team or codebase?',
      'Yes. We regularly join in-house teams, take over legacy systems and run audits before recommending any rewrite.',
    ],
    [
      'What happens after launch?',
      'We offer maintenance and support plans with monitoring, security updates and an agreed response time, plus knowledge transfer whenever you want to take over.',
    ],
  ];
  return (
    <Section title="Working with Nazexa, answered">
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {faqs.map(([q, a]) => (
          <AccordionItem key={q} value={q as string}>
            <AccordionTrigger className="text-left">{q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section>
      <Reveal variant="zoom">
        <div className="surface-card glow-ring relative isolate overflow-hidden p-10 text-center sm:p-20">
          <AuroraBackground />
          <FloatingShapes />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-5xl">
            Ship your next release on <span className="text-gradient">Nazexa</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl">
            Start free in under a minute. Invite your team, connect your repo, and deploy to
            production today.
          </p>
          <form className="mx-auto mt-8 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="you@company.com" aria-label="Work email" />
            <Button type="submit" className="shrink-0">
              Get started
            </Button>
          </form>
        </div>
      </Reveal>
    </Section>
  );
}
