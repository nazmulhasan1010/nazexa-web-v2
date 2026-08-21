import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";
import type { CSSProperties } from "react";

import {
  ApiVisual,
  AutoLayoutVisual,
  DevToolsVisual,
  ErdVisual,
  ExportVisual,
  JsonVisual,
  JwtVisual,
  RelationshipVisual,
} from "@/components/products/ProductVisuals";
import { Reveal, TextReveal } from "@/components/motion/Reveal";
import {
  AuroraBackground,
  GridBackground,
} from "@/components/backgrounds/AnimatedBackground";
import { PageBlocks, Section } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductDetail } from "@/lib/products";

const visuals = {
  erd: RelationshipVisual,
  layout: AutoLayoutVisual,
  export: ExportVisual,
  json: JsonVisual,
  api: ApiVisual,
  jwt: JwtVisual,
};

export function ProductDetailPage({ product }: { product: ProductDetail }) {
  const toneStyle = {
    ["--primary" as string]: `var(--${product.tone})`,
  } as CSSProperties;
  const Hero = product.slug === "db-design" ? ErdVisual : DevToolsVisual;

  return (
    <div style={toneStyle}>
      <section className="relative isolate overflow-hidden pb-16 pt-36">
        <AuroraBackground />
        <GridBackground variant="dots" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Reveal variant="fade">
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-primary"
              >
                {product.eyebrow}
              </Badge>
            </Reveal>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.06] sm:text-5xl">
              <TextReveal text={product.heroTitle} />
            </h1>
            <Reveal variant="up" delay={140}>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                {product.description}
              </p>
            </Reveal>
            <Reveal variant="up" delay={200}>
              <ul className="mt-6 space-y-2">
                {product.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal variant="up" delay={260}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="glow-ring">
                  <Link href="/contact">
                    Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={`/${product.slug}/pricing`}>See pricing</Link>
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal variant="zoom" delay={120}>
            <Hero />
          </Reveal>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-3 px-5 sm:grid-cols-2 lg:grid-cols-4">
          {product.meta.map((m, i) => (
            <Reveal key={m.label} delay={i * 70}>
              <div className="surface-card px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-primary">
                  {m.label}
                </div>
                <div className="mt-1 text-sm font-medium">{m.value}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Section title="Who it is for">
        <div className="grid gap-5 md:grid-cols-3">
          {product.audience.map((a, i) => (
            <Reveal key={a.title} delay={i * 90}>
              <div className="surface-card hover-lift h-full p-6">
                <h3 className="text-base font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="Capabilities, grouped by what you are doing">
        <div className="grid gap-6 md:grid-cols-2">
          {product.groups.map((g, i) => {
            const Visual = visuals[g.visual];
            return (
              <Reveal key={g.title} delay={i * 80}>
                <article className="surface-card hover-lift h-full overflow-hidden p-6">
                  <Visual />
                  <h3 className="mt-5 text-lg font-semibold">{g.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{g.body}</p>
                  <ul className="mt-4 space-y-2">
                    {g.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <PageBlocks blocks={product.blocks} />
    </div>
  );
}
