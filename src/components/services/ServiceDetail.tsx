import Link from 'next/link';

import { ArrowRight, Check } from 'lucide-react';
import type { CSSProperties } from 'react';

import {
  AuroraBackground,
  FloatingShapes,
  GridBackground,
} from '@/components/backgrounds/AnimatedBackground';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { serviceVisual } from '@/components/services/ServiceVisuals';
import { Section } from '@/components/site/PageShell';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { engagementProcess, services, type Service } from '@/lib/services';

export function ServiceDetail({ service }: { service: Service }) {
  const Visual = serviceVisual(service.slug);
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const style = {
    ['--primary' as string]: `var(--${service.tone})`,
  } as CSSProperties;

  return (
    <div style={style}>
      <section className="relative isolate overflow-hidden pt-36 pb-12">
        <AuroraBackground />
        <GridBackground variant="dots" />
        <FloatingShapes />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Reveal variant="fade">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                <service.icon className="mr-1.5 h-3 w-3" /> {service.category} service
              </Badge>
            </Reveal>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold sm:text-5xl">
              <TextReveal text={service.name} />
            </h1>
            <Reveal variant="up" delay={150}>
              <p className="text-primary mt-4 text-lg">{service.tagline}</p>
              <p className="text-muted-foreground mt-4 max-w-xl">{service.summary}</p>
            </Reveal>
            <Reveal variant="up" delay={250}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="glow-ring">
                  <Link href="/contact">
                    Start a project <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/services">All services</Link>
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal variant="right" delay={120}>
            <Visual />
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {service.outcomes.map((o, i) => (
            <Reveal key={o.label} variant="zoom" delay={i * 80}>
              <div className="surface-card p-6 text-center">
                <div className="text-gradient font-display text-3xl font-semibold">{o.value}</div>
                <div className="text-muted-foreground mt-2 text-sm">{o.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Overview">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            {service.overview.map((p, i) => (
              <Reveal key={i} delay={i * 70}>
                <p className="text-muted-foreground text-base leading-relaxed">{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal variant="up" delay={120}>
            <div className="surface-card h-full p-6">
              <div className="text-primary text-xs tracking-widest uppercase">Who this is for</div>
              <ul className="mt-4 space-y-3">
                {service.audience.map((a) => (
                  <li key={a} className="text-muted-foreground flex gap-2 text-sm">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section title="Capabilities">
        <div className="grid gap-5 md:grid-cols-2">
          {service.capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="surface-card hover-lift group relative h-full overflow-hidden p-6">
                <div className="via-primary/60 absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="bg-primary/12 ring-primary/30 flex h-9 w-9 items-center justify-center rounded-lg ring-1">
                  <service.icon className="text-primary h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="What you receive">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <ul className="surface-card space-y-4 p-6">
              {service.deliverables.map((d) => (
                <li key={d} className="text-muted-foreground flex gap-3 text-sm">
                  <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal variant="right" delay={100}>
            <div className="surface-card h-full p-6">
              <div className="text-primary text-xs tracking-widest uppercase">Technologies</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.stack.map((t) => (
                  <span
                    key={t}
                    className="bg-secondary text-muted-foreground ring-border rounded-md px-2.5 py-1 font-mono text-xs ring-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground mt-6 text-sm">
                We choose tools that fit your team and hiring market, favour long-term support
                versions, and document every architectural decision we make on your behalf.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section title="Our delivery process">
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

      <Section title="Frequently asked">
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {service.faq.map((f) => (
            <AccordionItem key={f.title} value={f.title}>
              <AccordionTrigger className="text-left">{f.title}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section title="Related services">
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((r, i) => (
            <Reveal key={r.slug} delay={i * 80}>
              <Link
                href={`/services/${r.slug}`}
                className="surface-card hover-lift group block h-full p-6"
              >
                <div className="bg-primary/12 ring-primary/30 flex h-9 w-9 items-center justify-center rounded-lg ring-1">
                  <r.icon className="text-primary h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{r.name}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{r.tagline}</p>
                <span className="text-primary mt-4 inline-flex items-center text-sm">
                  Learn more{' '}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal variant="zoom">
          <div className="surface-card glow-ring relative isolate overflow-hidden p-10 text-center sm:p-16">
            <AuroraBackground />
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
              Ready to start your {service.name.toLowerCase()} project?
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
              Share your goals and constraints. We will come back with an approach, a timeline and a
              written estimate.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="glow-ring">
                <Link href="/contact">
                  Contact Nazexa <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/case-studies">Read case studies</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
