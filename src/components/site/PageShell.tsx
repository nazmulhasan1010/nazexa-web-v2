import Link from 'next/link';

import { ArrowRight, Check } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import {
  AuroraBackground,
  FloatingShapes,
  GridBackground,
} from '@/components/backgrounds/AnimatedBackground';
import { Counter, Reveal, TextReveal } from '@/components/motion/Reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PageBlock, PageContent } from '@/lib/site-content';
import { PricingTiers } from '@/components/pricing/PricingTiers';

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-36 pb-20">
      <AuroraBackground />
      <GridBackground variant="dots" />
      <FloatingShapes />
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Reveal variant="fade">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            {eyebrow}
          </Badge>
        </Reveal>
        <h1 className="mt-6 text-4xl leading-[1.05] font-semibold sm:text-6xl">
          <TextReveal text={title} />
        </h1>
        <Reveal variant="up" delay={160}>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">{description}</p>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function Section({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative mx-auto max-w-7xl px-5 py-16 ${className ?? ''}`}>
      {title ? (
        <Reveal>
          <h2 className="mb-10 text-2xl font-semibold sm:text-3xl">{title}</h2>
        </Reveal>
      ) : null}
      {children}
    </section>
  );
}

export function StandardPage({ page }: { page: PageContent }) {
  const toneStyle = page.tone
    ? ({ ['--primary' as string]: `var(--${page.tone})` } as CSSProperties)
    : undefined;
  return (
    <div style={toneStyle}>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description}>
        {page.intro ? (
          <Reveal variant="up" delay={220}>
            <p className="text-muted-foreground/80 mx-auto mt-5 max-w-2xl text-sm">{page.intro}</p>
          </Reveal>
        ) : null}
        {page.meta?.length ? (
          <Reveal variant="up" delay={240}>
            <dl className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {page.meta.map((m) => (
                <div key={m.label} className="surface-card px-4 py-3 text-left">
                  <dt className="text-primary text-[10px] tracking-widest uppercase">{m.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{m.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}
        <Reveal variant="up" delay={280}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="glow-ring">
              <Link href="/contact">
                Talk to us <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/documentation">Read the docs</Link>
            </Button>
          </div>
        </Reveal>
      </PageHero>

      <PageBlocks blocks={page.blocks} />
    </div>
  );
}

export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'features') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 90}>
                    <div className="surface-card hover-lift h-full p-6">
                      <div className="bg-primary/12 ring-primary/30 flex h-9 w-9 items-center justify-center rounded-lg ring-1">
                        <Check className="text-primary h-4 w-4" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'list') {
          return (
            <Section key={i} title={block.title}>
              <div className="divide-border border-border divide-y border-y">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 80}>
                    <div className="grid gap-2 py-6 md:grid-cols-[180px_1fr]">
                      <div className="text-primary text-xs tracking-widest uppercase">
                        {item.meta}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground mt-1.5 text-sm">{item.body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'stats') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {block.items.map((item, j) => (
                  <Reveal key={item.label} variant="zoom" delay={j * 90}>
                    <div className="surface-card p-6 text-center">
                      <div className="text-gradient font-display text-4xl font-semibold">
                        <Counter
                          to={item.value}
                          suffix={item.suffix ?? ''}
                          decimals={item.value % 1 ? 2 : 0}
                        />
                      </div>
                      <div className="text-muted-foreground mt-2 text-sm">{item.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'faq') {
          return (
            <Section key={i} title={block.title}>
              <Accordion type="single" collapsible className="mx-auto max-w-3xl">
                {block.items.map((item) => (
                  <AccordionItem key={item.title} value={item.title}>
                    <AccordionTrigger className="text-left">{item.title}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.body}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Section>
          );
        }

        if (block.kind === 'prose') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-5">
                  {block.paragraphs.map((p, j) => (
                    <Reveal key={j} delay={j * 70}>
                      <p className="text-muted-foreground text-base leading-relaxed">{p}</p>
                    </Reveal>
                  ))}
                </div>
                {block.aside ? (
                  <Reveal variant="up" delay={120}>
                    <div className="surface-card h-full p-6">
                      <div className="text-primary text-xs tracking-widest uppercase">
                        {block.aside.title}
                      </div>
                      <ul className="mt-4 space-y-3">
                        {block.aside.items.map((it) => (
                          <li key={it} className="text-muted-foreground flex gap-2 text-sm">
                            <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ) : null}
              </div>
            </Section>
          );
        }

        if (block.kind === 'steps') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 90}>
                    <div className="surface-card hover-lift h-full p-6">
                      <div className="font-display text-primary/70 text-3xl font-semibold">
                        {String(j + 1).padStart(2, '0')}
                      </div>
                      <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'timeline') {
          return (
            <Section key={i} title={block.title}>
              <div className="border-border relative border-l pl-6">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 80}>
                    <div className="relative pb-10">
                      <span className="bg-primary ring-primary/15 absolute top-1.5 -left-[31px] h-3 w-3 rounded-full ring-4" />
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-primary text-xs tracking-widest uppercase">
                          {item.date}
                        </span>
                        {item.tag ? (
                          <Badge
                            variant="outline"
                            className="border-border text-muted-foreground text-xs"
                          >
                            {item.tag}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'table') {
          return (
            <Section key={i} title={block.title}>
              <Reveal>
                <div className="surface-card overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        {block.columns.map((c) => (
                          <th
                            key={c}
                            className="text-primary px-5 py-4 text-xs tracking-widest uppercase"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, j) => (
                        <tr key={j} className="border-border/60 border-b last:border-0">
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className={
                                k === 0
                                  ? 'px-5 py-4 font-medium'
                                  : 'text-muted-foreground px-5 py-4'
                              }
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </Section>
          );
        }

        if (block.kind === 'quotes') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.name} variant="zoom" delay={j * 90}>
                    <figure className="surface-card h-full p-6">
                      <blockquote className="text-base leading-relaxed">
                        &ldquo;{item.quote}&rdquo;
                      </blockquote>
                      <figcaption className="mt-5 text-sm">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-muted-foreground block">{item.role}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'people') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.name} delay={j * 70}>
                    <div className="surface-card hover-lift h-full p-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/12 font-display text-primary ring-primary/30 flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ring-1">
                          {item.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{item.name}</div>
                          <div className="text-muted-foreground text-xs">{item.role}</div>
                        </div>
                      </div>
                      {item.focus ? (
                        <p className="text-muted-foreground mt-4 text-sm">{item.focus}</p>
                      ) : null}
                      {item.location ? (
                        <div className="text-primary mt-3 text-xs tracking-widest uppercase">
                          {item.location}
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'cards') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 80}>
                    <div className="surface-card hover-lift flex h-full flex-col p-6">
                      {item.tag ? (
                        <Badge
                          variant="outline"
                          className="border-primary/40 bg-primary/10 text-primary w-fit"
                        >
                          {item.tag}
                        </Badge>
                      ) : null}
                      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-2 flex-1 text-sm">{item.body}</p>
                      {item.meta ? (
                        <div className="border-border text-muted-foreground mt-5 border-t pt-4 text-xs tracking-widest uppercase">
                          {item.meta}
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'checklist') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-3">
                {block.columns.map((col, j) => (
                  <Reveal key={col.title} delay={j * 90}>
                    <div className="surface-card h-full p-6">
                      <h3 className="text-base font-semibold">{col.title}</h3>
                      <ul className="mt-4 space-y-3">
                        {col.items.map((it) => (
                          <li key={it} className="text-muted-foreground flex gap-2 text-sm">
                            <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'code') {
          return (
            <Section key={i} title={block.title}>
              {block.body ? (
                <Reveal>
                  <p className="text-muted-foreground -mt-6 mb-6 max-w-2xl text-sm">{block.body}</p>
                </Reveal>
              ) : null}
              <Reveal variant="up">
                <div className="surface-card overflow-hidden">
                  <div className="border-border flex items-center gap-2 border-b px-5 py-3">
                    <span className="bg-primary/50 h-2.5 w-2.5 rounded-full" />
                    <span className="bg-muted-foreground/30 h-2.5 w-2.5 rounded-full" />
                    <span className="bg-muted-foreground/20 h-2.5 w-2.5 rounded-full" />
                    <span className="text-muted-foreground ml-2 text-xs tracking-widest uppercase">
                      {block.language}
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-5 py-5 text-sm leading-relaxed">
                    <code className="text-muted-foreground font-mono">{block.code}</code>
                  </pre>
                </div>
              </Reveal>
            </Section>
          );
        }

        if (block.kind === 'pricing') {
          return (
            <Section key={i} title={block.title}>
              <PricingTiers tiers={block.tiers as any} />
            </Section>
          );
        }

        if (block.kind === 'channels') {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-2">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 70}>
                    <div className="surface-card hover-lift h-full p-6">
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm">{item.body}</p>
                      <div className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                        {item.action} <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === 'legal') {
          return (
            <Section key={i} title={block.title}>
              <div className="mx-auto max-w-3xl space-y-8">
                {block.sections.map((sec, j) => (
                  <Reveal key={sec.heading} delay={j * 60}>
                    <div>
                      <h3 className="text-base font-semibold">{sec.heading}</h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {sec.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        return (
          <Section key={i}>
            <Reveal variant="zoom">
              <div className="surface-card glow-ring relative overflow-hidden p-10 text-center sm:p-16">
                <AuroraBackground />
                <h2 className="text-3xl font-semibold sm:text-4xl">{block.title}</h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-xl">{block.body}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg">
                    <Link href="/pricing">See pricing</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/contact">Contact sales</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </Section>
        );
      })}
    </>
  );
}
