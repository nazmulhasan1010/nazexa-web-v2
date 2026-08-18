"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";
import type React from "react";

import {
  AuroraBackground,
  FloatingShapes,
  GridBackground,
} from "@/components/backgrounds/AnimatedBackground";
import { Counter, Reveal } from "@/components/motion/Reveal";
import {
  DevToolsVisual,
  ErdVisual,
} from "@/components/products/ProductVisuals";
import {
  BuildVisual,
  CloudVisual,
  DesignVisual,
  IntegrationVisual,
  MobileVisual,
} from "@/components/services/ServiceVisuals";
import { Section } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contentQuery, type ContentItem } from "@/lib/queries";
import { getIcon } from "@/lib/icons";
import { products } from "@/lib/products";

/** Props every homepage section accepts — copy is managed from the admin panel. */
export type SectionProps = {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown>;
};

const str = (c: SectionProps["content"], key: string) =>
  typeof c?.[key] === "string" && (c[key] as string).trim()
    ? (c[key] as string)
    : undefined;

const visuals: Record<
  string,
  (p: { className?: string }) => React.ReactElement
> = {
  build: BuildVisual,
  mobile: MobileVisual,
  cloud: CloudVisual,
  design: DesignVisual,
  integration: IntegrationVisual,
};

function useContent(collection: string) {
  const { data } = useQuery(contentQuery(collection));
  return data ?? [];
}

const points = (item: ContentItem): string[] =>
  Array.isArray(item.data?.["points"]) ? (item.data["points"] as string[]) : [];

/** What Nazexa does — dual identity: own products + client engineering. */
export function WhatWeDo({ title, subtitle }: SectionProps) {
  const pillars = useContent("pillars");
  if (!pillars.length) return null;
  return (
    <Section title={title || "What Nazexa does"}>
      <Reveal>
        <p className="-mt-6 mb-10 max-w-3xl text-muted-foreground">
          {subtitle ||
            "Nazexa is a software development and technology company. We turn ideas into reliable, scalable digital solutions — and we prove our standards by running our own products on them."}
        </p>
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-3">
        {pillars.map((p, i) => {
          const Icon = getIcon(p.icon);
          const Visual =
            visuals[String(p.data?.["visual"] ?? "build")] ?? BuildVisual;
          return (
            <Reveal key={p.id} delay={i * 100}>
              <article className="surface-card hover-lift flex h-full flex-col overflow-hidden p-6">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title ?? ""}
                    loading="lazy"
                    className="h-36 w-full rounded-xl object-cover"
                  />
                ) : (
                  <Visual />
                )}
                <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/25">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/** Full services grid — every practice, interactive cards. */
export function ServicesSection({ title, subtitle, content }: SectionProps) {
  const items = useContent("services");
  if (!items.length) return null;
  return (
    <section id="services" className="relative isolate overflow-hidden">
      <GridBackground variant="dots" />
      <Section>
        <Reveal>
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary"
          >
            {str(content, "badge") ?? "Services"}
          </Badge>
          <h2 className="mt-5 max-w-3xl text-2xl font-semibold sm:text-3xl">
            {title || "Software and technology services, end to end"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {subtitle ||
              `${items.length} practices covering the whole lifecycle — strategy, design, engineering, cloud and support. Engage one, or all of them as a single delivery team.`}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => {
            const Icon = getIcon(s.icon);
            const to = s.link_url || `/services/${s.slug}`;
            return (
              <Reveal key={s.id} delay={(i % 3) * 70}>
                <Link
                  href={to as never}
                  className="surface-card hover-lift group relative flex h-full flex-col overflow-hidden p-6"
                  style={{
                    ["--primary" as string]: `var(--${s.tone || "brand-1"})`,
                  }}
                >
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/25 transition-transform duration-300 group-hover:scale-110">
                      {s.image_url ? (
                        <img
                          src={s.image_url}
                          alt=""
                          loading="lazy"
                          className="h-5 w-5"
                        />
                      ) : (
                        <Icon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    {s.category && (
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {s.category}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {s.body || s.subtitle}
                  </p>
                  <span className="mt-5 inline-flex items-center text-sm font-medium text-primary">
                    {s.link_label || "Learn more"}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="glow-ring">
              <Link href={(str(content, "primaryHref") ?? "/contact") as never}>
                {str(content, "primaryCta") ?? "Start a project"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link
                href={(str(content, "secondaryHref") ?? "/services") as never}
              >
                {str(content, "secondaryCta") ?? "Explore all services"}
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>
    </section>
  );
}

/** Mission and vision, side by side. */
export function MissionVision(_props: SectionProps) {
  const items = useContent("missionvision");
  if (!items.length) return null;
  return (
    <section className="relative isolate overflow-hidden border-y border-border">
      <AuroraBackground />
      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((it, i) => {
            const Icon = getIcon(it.icon);
            return (
              <Reveal
                key={it.id}
                variant={i === 0 ? "left" : "right"}
                delay={i * 100}
              >
                <article
                  className="surface-card h-full p-8"
                  style={{
                    ["--primary" as string]: `var(--${it.tone || "brand-1"})`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/25">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-primary">
                      {it.subtitle}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold sm:text-2xl">
                    {it.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {it.body}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {points(it).map((p) => (
                      <li
                        key={p}
                        className="flex gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </section>
  );
}

/** Technologies, frameworks and languages. */
export function TechnologiesSection({ title, subtitle }: SectionProps) {
  const items = useContent("technologies");
  if (!items.length) return null;
  const groups = items.reduce<Record<string, ContentItem[]>>((acc, item) => {
    const key = item.category || "Other";
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
  return (
    <Section title={title || "Modern technologies we build with"}>
      <Reveal>
        <p className="-mt-6 mb-10 max-w-2xl text-muted-foreground">
          {subtitle ||
            "We choose boring, proven technology by default and reach for something newer only when it earns its place. Every stack below is one we run in production today."}
        </p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groups).map(([group, entries], i) => (
          <Reveal key={group} delay={(i % 3) * 80}>
            <div className="surface-card hover-lift h-full p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
                {group}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {entries.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-lg bg-secondary px-3 py-1.5 font-mono text-xs text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
                  >
                    {t.title}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Why clients choose Nazexa + quality guarantees. */
export function WhyNazexaSection({ title }: SectionProps) {
  const values = useContent("values");
  const stats = useContent("stats");
  if (!values.length && !stats.length) return null;
  return (
    <section className="relative isolate overflow-hidden">
      <GridBackground />
      <FloatingShapes />
      <Section title={title || "Why clients choose Nazexa"}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {values.map((w, i) => (
            <Reveal key={w.id} delay={(i % 3) * 80}>
              <div className="surface-card hover-lift group h-full p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 font-mono text-xs text-primary ring-1 ring-primary/25">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 text-base font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {stats.length > 0 && (
          <Reveal delay={120}>
            <div className="surface-card mt-6 grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((q) => (
                <div key={q.id} className="text-center">
                  <div className="text-gradient font-display text-3xl font-semibold">
                    <Counter
                      to={Number(q.title ?? 0)}
                      suffix={String(q.data?.["suffix"] ?? "")}
                      decimals={Number(q.data?.["decimals"] ?? 0)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {q.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </Section>
    </section>
  );
}

/** Professional development process. */
export function ProcessSection({ title, subtitle }: SectionProps) {
  const steps = useContent("process");
  if (!steps.length) return null;
  return (
    <Section title={title || "How we deliver"}>
      <Reveal>
        <p className="-mt-6 mb-10 max-w-2xl text-muted-foreground">
          {subtitle ||
            "A predictable, documented process — you always know what is being built, what it costs and what happens next."}
        </p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((p, i) => (
          <Reveal key={p.id} variant="up" delay={i * 80}>
            <div className="surface-card hover-lift relative h-full overflow-hidden p-6">
              <span className="font-display absolute right-4 top-3 text-4xl font-semibold text-primary/15">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              <span className="mt-5 block h-px w-full bg-gradient-to-r from-primary/60 to-transparent" />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Our own products — positioned as proof of engineering standards. */
export function OwnProducts({ title, subtitle, content }: SectionProps) {
  return (
    <section className="relative isolate overflow-hidden border-y border-border">
      <AuroraBackground />
      <Section>
        <Reveal>
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary"
          >
            {str(content, "badge") ?? "Our products"}
          </Badge>
          <h2 className="mt-5 max-w-3xl text-2xl font-semibold sm:text-3xl">
            {title || "The software we build for ourselves"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {subtitle ||
              "Two developer products designed, shipped and supported in-house — the clearest proof of the engineering standard your project gets."}
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 110}>
              <article
                className="surface-card hover-lift flex h-full flex-col overflow-hidden p-6"
                style={{ ["--primary" as string]: `var(--${p.tone})` }}
              >
                {p.slug === "db-design" ? <ErdVisual /> : <DevToolsVisual />}
                <h3 className="mt-6 text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  {p.tagline}
                </p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-6">
                  <Button asChild variant="outline">
                    <Link href={p.to}>
                      {p.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </section>
  );
}

/** Conversion-focused closing CTA for client projects. */
export function ClientCta({ title, subtitle, content }: SectionProps) {
  return (
    <Section>
      <Reveal variant="zoom">
        <div className="surface-card glow-ring relative isolate overflow-hidden p-10 text-center sm:p-16">
          <AuroraBackground />
          <FloatingShapes />
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold sm:text-4xl">
            {title || "Have a project in mind? Let's scope it together."}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {subtitle ||
              "Tell us what you are building. You'll get a senior engineer on the first call, a written approach within a week, and a delivery plan you can hold us to."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="glow-ring h-12 px-7 text-base">
              <Link href={(str(content, "primaryHref") ?? "/contact") as never}>
                {str(content, "primaryCta") ?? "Start a project"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-7 text-base"
            >
              <Link
                href={(str(content, "secondaryHref") ?? "/services") as never}
              >
                {str(content, "secondaryCta") ?? "Explore our services"}
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {str(content, "note") ??
              "Typical kickoff within 14 days · You own the code from the first commit"}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
