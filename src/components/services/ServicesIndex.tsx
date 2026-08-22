import Link from 'next/link';

import { ArrowRight, Check } from 'lucide-react';

import {
  AuroraBackground,
  FloatingShapes,
  GridBackground,
} from '@/components/backgrounds/AnimatedBackground';
import { Counter, Reveal, TextReveal } from '@/components/motion/Reveal';
import {
  BuildVisual,
  CloudVisual,
  IntegrationVisual,
  MobileVisual,
} from '@/components/services/ServiceVisuals';
import { Section } from '@/components/site/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  engagementProcess,
  industriesServed,
  services,
  techStack,
  whyNazexa,
} from '@/lib/services';
import { type ContentItem } from '@/lib/cms';
import { getIcon } from '@/lib/icons';

export function ServicesIndex({ cmsServices = [] }: { cmsServices?: ContentItem[] }) {
  const finalServices =
    cmsServices.length > 0
      ? cmsServices.map((s) => ({
          slug: s.slug || '',
          tone: s.tone || 'brand-1',
          icon: getIcon(s.icon || 'Box'),
          category: s.category || 'Service',
          name: s.title || '',
          tagline: s.subtitle || '',
          summary: (s.body as string) || '',
        }))
      : services;

  return (
    <div>
      <ServicesHero />
      <ServicesBody servicesList={finalServices} />
    </div>
  );
}

/** Compact services block for the homepage. */
export function ServicesShowcase({ cmsServices = [] }: { cmsServices?: ContentItem[] }) {
  const finalServices =
    cmsServices.length > 0
      ? cmsServices.map((s) => ({
          slug: s.slug || '',
          tone: s.tone || 'brand-1',
          icon: getIcon(s.icon || 'Box'),
          name: s.title || '',
          summary: (s.body as string) || '',
        }))
      : services;

  return (
    <Section title="Services for clients who need software built">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {finalServices.slice(0, 6).map((s, i) => (
          <Reveal key={s.slug} delay={(i % 3) * 80}>
            <Link
              href="/services/$slug"
              params={{ slug: s.slug }}
              className="surface-card hover-lift group flex h-full flex-col p-6"
              style={{ ['--primary' as string]: `var(--${s.tone})` }}
            >
              <div className="bg-primary/12 ring-primary/25 flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110">
                <s.icon className="text-primary h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{s.name}</h3>
              <p className="text-muted-foreground mt-2 flex-1 text-sm">{s.summary}</p>
            </Link>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="glow-ring">
            <Link href="/services">
              Explore all services <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Start a project</Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}

function ServicesHero() {
  return (
    <div>
      <section className="relative isolate overflow-hidden pt-36 pb-14">
        <AuroraBackground />
        <GridBackground variant="dots" />
        <FloatingShapes />
        <div className="mx-auto max-w-5xl px-5 text-center">
          <Reveal variant="fade">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Services
            </Badge>
          </Reveal>
          <h1 className="mt-6 text-4xl leading-[1.05] font-semibold sm:text-6xl">
            <TextReveal text="Your engineering partner for software, apps and cloud" />
          </h1>
          <Reveal variant="up" delay={150}>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              Nazexa builds its own developer products — and builds software for clients. From
              custom platforms and Android apps to APIs, databases, cloud infrastructure and
              technology consulting, we take an idea from discovery to a maintained production
              system.
            </p>
          </Reveal>
          <Reveal variant="up" delay={250}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="glow-ring">
                <Link href="/contact">
                  Start a project <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/portfolio">See our work</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal variant="up" delay={320}>
            <dl className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-4">
              {[
                { value: 13, suffix: '+', label: 'Services' },
                { value: 40, suffix: '+', label: 'Technologies' },
                { value: 2, suffix: '', label: 'Own products shipped' },
                { value: 14, suffix: ' days', label: 'Typical kickoff' },
              ].map((s) => (
                <div key={s.label} className="surface-card px-4 py-4 text-center">
                  <dd className="text-gradient font-display text-2xl font-semibold">
                    <Counter to={s.value} suffix={s.suffix} />
                  </dd>
                  <dt className="text-muted-foreground mt-1 text-xs">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ServicesBody({ servicesList }: { servicesList: any[] }) {
  return (
    <div>
      <Section title="What we build for clients">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicesList.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 80}>
              <Link
                href="/services/$slug"
                params={{ slug: s.slug }}
                className="surface-card hover-lift group flex h-full flex-col p-6"
                style={{ ['--primary' as string]: `var(--${s.tone})` }}
              >
                <div className="flex items-start justify-between">
                  <div className="bg-primary/12 ring-primary/25 flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="text-primary h-5 w-5" />
                  </div>
                  <span className="text-muted-foreground text-[10px] tracking-widest uppercase">
                    {s.category}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{s.name}</h3>
                <p className="text-primary mt-1 text-sm">{s.tagline}</p>
                <p className="text-muted-foreground mt-3 flex-1 text-sm">{s.summary}</p>
                <span className="text-primary mt-5 inline-flex items-center text-sm font-medium">
                  Explore service
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="border-border relative isolate overflow-hidden border-y py-16">
        <AuroraBackground />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-2">
          <Reveal variant="left">
            <div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Our mission
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
                Turn business ideas into reliable, scalable software
              </h2>
              <p className="text-muted-foreground mt-4">
                Nazexa exists to remove the distance between an idea and a working product. We
                combine product thinking, modern engineering and long-term maintainability so the
                systems we deliver keep paying off years after launch.
              </p>
              <p className="text-muted-foreground mt-4">
                <span className="text-foreground font-medium">Our vision:</span> to be the
                technology partner teams trust for everything from a first prototype to a platform
                serving millions — building software that is fast, secure and genuinely
                maintainable.
              </p>
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <BuildVisual />
          </Reveal>
        </div>
      </section>

      <Section title="How we work">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {engagementProcess.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="surface-card hover-lift h-full p-6">
                <div className="font-display text-primary/70 text-3xl font-semibold">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Technologies we build with">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {techStack.map((g, i) => (
            <Reveal key={g.group} delay={i * 70}>
              <div className="surface-card h-full p-6">
                <div className="text-primary text-xs tracking-widest uppercase">{g.group}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span
                      key={t}
                      className="bg-secondary text-muted-foreground ring-border rounded-md px-2.5 py-1 font-mono text-xs ring-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Why clients choose Nazexa">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {whyNazexa.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              <div className="surface-card hover-lift h-full p-6">
                <div className="bg-primary/12 ring-primary/30 flex h-9 w-9 items-center justify-center rounded-lg ring-1">
                  <Check className="text-primary h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{w.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Industries we support">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industriesServed.map((ind, i) => (
            <Reveal key={ind.title} variant="zoom" delay={i * 60}>
              <div className="surface-card h-full p-5">
                <h3 className="text-sm font-semibold">{ind.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{ind.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Quality standards on every engagement">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                'Scalability',
                "Architecture sized for your next order of magnitude, not just today's traffic.",
              ],
              [
                'Security',
                'Least-privilege access, encrypted data, validated inputs and patched dependencies.',
              ],
              [
                'Performance',
                'Measured budgets for load time, query time and API latency, enforced in CI.',
              ],
              [
                'Maintainability',
                'Conventional structure, tests and documentation so any team can continue the work.',
              ],
            ].map(([t, b], i) => (
              <Reveal key={t} delay={i * 70}>
                <div className="surface-card h-full p-5">
                  <h3 className="text-primary text-sm font-semibold">{t}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="right" delay={120}>
            <div className="grid gap-4">
              <MobileVisual />
              <div className="grid gap-4 sm:grid-cols-2">
                <CloudVisual />
                <IntegrationVisual />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal variant="zoom">
          <div className="surface-card glow-ring relative isolate overflow-hidden p-10 text-center sm:p-16">
            <AuroraBackground />
            <FloatingShapes />
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
              Have a project in mind? Let's scope it together.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
              Tell us the problem you are solving. You will get an honest assessment, a proposed
              approach and a written estimate — usually within three working days.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="glow-ring">
                <Link href="/contact">
                  Start a project <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/products">Explore our products</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
