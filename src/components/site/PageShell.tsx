import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import {
  AuroraBackground,
  FloatingShapes,
  GridBackground,
} from "@/components/backgrounds/AnimatedBackground";
import { Counter, Reveal, TextReveal } from "@/components/motion/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PageBlock, PageContent } from "@/lib/site-content";

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
    <section className="relative isolate overflow-hidden pb-20 pt-36">
      <AuroraBackground />
      <GridBackground variant="dots" />
      <FloatingShapes />
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Reveal variant="fade">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary"
          >
            {eyebrow}
          </Badge>
        </Reveal>
        <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">
          <TextReveal text={title} />
        </h1>
        <Reveal variant="up" delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {description}
          </p>
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
    <section
      className={`relative mx-auto max-w-7xl px-5 py-16 ${className ?? ""}`}
    >
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
    ? ({ ["--primary" as string]: `var(--${page.tone})` } as CSSProperties)
    : undefined;
  return (
    <div style={toneStyle}>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      >
        {page.intro ? (
          <Reveal variant="up" delay={220}>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-muted-foreground/80">
              {page.intro}
            </p>
          </Reveal>
        ) : null}
        {page.meta?.length ? (
          <Reveal variant="up" delay={240}>
            <dl className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {page.meta.map((m) => (
                <div key={m.label} className="surface-card px-4 py-3 text-left">
                  <dt className="text-[10px] uppercase tracking-widest text-primary">
                    {m.label}
                  </dt>
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
        if (block.kind === "features") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 90}>
                    <div className="surface-card hover-lift h-full p-6">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/30">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "list") {
          return (
            <Section key={i} title={block.title}>
              <div className="divide-y divide-border border-y border-border">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 80}>
                    <div className="grid gap-2 py-6 md:grid-cols-[180px_1fr]">
                      <div className="text-xs uppercase tracking-widest text-primary">
                        {item.meta}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "stats") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {block.items.map((item, j) => (
                  <Reveal key={item.label} variant="zoom" delay={j * 90}>
                    <div className="surface-card p-6 text-center">
                      <div className="text-gradient font-display text-4xl font-semibold">
                        <Counter
                          to={item.value}
                          suffix={item.suffix ?? ""}
                          decimals={item.value % 1 ? 2 : 0}
                        />
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {item.label}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "faq") {
          return (
            <Section key={i} title={block.title}>
              <Accordion
                type="single"
                collapsible
                className="mx-auto max-w-3xl"
              >
                {block.items.map((item) => (
                  <AccordionItem key={item.title} value={item.title}>
                    <AccordionTrigger className="text-left">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.body}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Section>
          );
        }

        if (block.kind === "prose") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-5">
                  {block.paragraphs.map((p, j) => (
                    <Reveal key={j} delay={j * 70}>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    </Reveal>
                  ))}
                </div>
                {block.aside ? (
                  <Reveal variant="up" delay={120}>
                    <div className="surface-card h-full p-6">
                      <div className="text-xs uppercase tracking-widest text-primary">
                        {block.aside.title}
                      </div>
                      <ul className="mt-4 space-y-3">
                        {block.aside.items.map((it) => (
                          <li
                            key={it}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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

        if (block.kind === "steps") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 90}>
                    <div className="surface-card hover-lift h-full p-6">
                      <div className="font-display text-3xl font-semibold text-primary/70">
                        {String(j + 1).padStart(2, "0")}
                      </div>
                      <h3 className="mt-3 text-base font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "timeline") {
          return (
            <Section key={i} title={block.title}>
              <div className="relative border-l border-border pl-6">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 80}>
                    <div className="relative pb-10">
                      <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs uppercase tracking-widest text-primary">
                          {item.date}
                        </span>
                        {item.tag ? (
                          <Badge
                            variant="outline"
                            className="border-border text-xs text-muted-foreground"
                          >
                            {item.tag}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-base font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "table") {
          return (
            <Section key={i} title={block.title}>
              <Reveal>
                <div className="surface-card overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {block.columns.map((c) => (
                          <th
                            key={c}
                            className="px-5 py-4 text-xs uppercase tracking-widest text-primary"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, j) => (
                        <tr
                          key={j}
                          className="border-b border-border/60 last:border-0"
                        >
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className={
                                k === 0
                                  ? "px-5 py-4 font-medium"
                                  : "px-5 py-4 text-muted-foreground"
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

        if (block.kind === "quotes") {
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
                        <span className="block text-muted-foreground">
                          {item.role}
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "people") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.name} delay={j * 70}>
                    <div className="surface-card hover-lift h-full p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 font-display text-sm font-semibold text-primary ring-1 ring-primary/30">
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.role}
                          </div>
                        </div>
                      </div>
                      {item.focus ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                          {item.focus}
                        </p>
                      ) : null}
                      {item.location ? (
                        <div className="mt-3 text-xs uppercase tracking-widest text-primary">
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

        if (block.kind === "cards") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 80}>
                    <div className="surface-card hover-lift flex h-full flex-col p-6">
                      {item.tag ? (
                        <Badge
                          variant="outline"
                          className="w-fit border-primary/40 bg-primary/10 text-primary"
                        >
                          {item.tag}
                        </Badge>
                      ) : null}
                      <h3 className="mt-4 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                      {item.meta ? (
                        <div className="mt-5 border-t border-border pt-4 text-xs uppercase tracking-widest text-muted-foreground">
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

        if (block.kind === "checklist") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-3">
                {block.columns.map((col, j) => (
                  <Reveal key={col.title} delay={j * 90}>
                    <div className="surface-card h-full p-6">
                      <h3 className="text-base font-semibold">{col.title}</h3>
                      <ul className="mt-4 space-y-3">
                        {col.items.map((it) => (
                          <li
                            key={it}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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

        if (block.kind === "code") {
          return (
            <Section key={i} title={block.title}>
              {block.body ? (
                <Reveal>
                  <p className="-mt-6 mb-6 max-w-2xl text-sm text-muted-foreground">
                    {block.body}
                  </p>
                </Reveal>
              ) : null}
              <Reveal variant="up">
                <div className="surface-card overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                    <span className="ml-2 text-xs uppercase tracking-widest text-muted-foreground">
                      {block.language}
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-5 py-5 text-sm leading-relaxed">
                    <code className="font-mono text-muted-foreground">
                      {block.code}
                    </code>
                  </pre>
                </div>
              </Reveal>
            </Section>
          );
        }

        if (block.kind === "pricing") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 lg:grid-cols-3">
                {block.tiers.map((tier, j) => (
                  <Reveal key={tier.name} variant="up" delay={j * 90}>
                    <div
                      className={`surface-card flex h-full flex-col p-7 ${tier.highlight ? "glow-ring ring-1 ring-primary/40" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{tier.name}</h3>
                        {tier.highlight ? (
                          <Badge className="bg-primary/15 text-primary">
                            Most popular
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-gradient font-display text-4xl font-semibold">
                          {tier.price}
                        </span>
                        {tier.cadence ? (
                          <span className="text-xs text-muted-foreground">
                            {tier.cadence}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {tier.body}
                      </p>
                      <ul className="mt-6 flex-1 space-y-3">
                        {tier.features.map((ft) => (
                          <li
                            key={ft}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{ft}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className="mt-7"
                        variant={tier.highlight ? "default" : "outline"}
                      >
                        <Link href="/contact">Get started</Link>
                      </Button>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "channels") {
          return (
            <Section key={i} title={block.title}>
              <div className="grid gap-5 md:grid-cols-2">
                {block.items.map((item, j) => (
                  <Reveal key={item.title} delay={j * 70}>
                    <div className="surface-card hover-lift h-full p-6">
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        {item.action} <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Section>
          );
        }

        if (block.kind === "legal") {
          return (
            <Section key={i} title={block.title}>
              <div className="mx-auto max-w-3xl space-y-8">
                {block.sections.map((sec, j) => (
                  <Reveal key={sec.heading} delay={j * 60}>
                    <div>
                      <h3 className="text-base font-semibold">{sec.heading}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  {block.title}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  {block.body}
                </p>
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
