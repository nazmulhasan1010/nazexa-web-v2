import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";

import {
  AuroraBackground,
  GridBackground,
} from "@/components/backgrounds/AnimatedBackground";
import { Reveal, TextReveal } from "@/components/motion/Reveal";
import {
  DevToolsVisual,
  ErdVisual,
} from "@/components/products/ProductVisuals";
import { Section } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@/lib/cms";

export function ProductsIndex({
  dynamicProducts = [],
}: {
  dynamicProducts?: ContentItem[];
}) {
  return (
    <div>
      <section className="relative isolate overflow-hidden pb-12 pt-36">
        <AuroraBackground />
        <GridBackground variant="dots" />
        <div className="mx-auto max-w-4xl px-5 text-center">
          <Reveal variant="fade">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary"
            >
              Products
            </Badge>
          </Reveal>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">
            <TextReveal text="Two products for the way you build with data" />
          </h1>
          <Reveal variant="up" delay={150}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Nazexa DB Design turns database modelling into a visual, validated
              workflow. Nazexa DEV Tools puts the utilities you reach for every
              day into one fast workspace.
            </p>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {dynamicProducts.map((p, i) => (
            <Reveal key={p.id} delay={i * 110}>
              <article
                className="surface-card hover-lift group h-full overflow-hidden p-6 flex flex-col"
                style={{
                  ["--primary" as string]: p.tone
                    ? `var(--${p.tone})`
                    : `var(--brand-1)`,
                }}
              >
                {p.slug === "db-design" && <ErdVisual />}
                {p.slug === "dev-tools" && <DevToolsVisual />}
                {p.image_url &&
                  p.slug !== "db-design" &&
                  p.slug !== "dev-tools" && (
                    <div className="-mx-6 -mt-6 mb-6 overflow-hidden border-b border-border bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt={p.title ?? ""}
                        className="w-full object-cover aspect-video"
                      />
                    </div>
                  )}
                <h2 className="mt-6 text-2xl font-semibold">{p.title}</h2>
                <p className="mt-1 text-sm font-medium text-primary">
                  {p.subtitle}
                </p>
                {p.body && (
                  <div
                    className="mt-4 text-sm text-muted-foreground prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-li:my-0.5"
                    dangerouslySetInnerHTML={{ __html: p.body }}
                  />
                )}
                <div className="mt-auto pt-7 flex flex-wrap gap-3">
                  {p.link_url && (
                    <Button asChild className="glow-ring">
                      <Link href={p.link_url}>
                        {p.link_label || "Explore"}{" "}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/pricing">Pricing</Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="How they work together">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "One account, one workspace",
              body: "Use the same projects, teams and billing across DB Design and DEV Tools.",
            },
            {
              title: "Design, then debug",
              body: "Model the schema in DB Design and inspect the API and payloads it powers in DEV Tools.",
            },
            {
              title: "Laravel-friendly end to end",
              body: "Generate models and migrations from your diagram, then keep generating boilerplate as you build.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div className="surface-card hover-lift h-full p-6">
                <h3 className="text-base font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal variant="zoom">
          <div className="surface-card glow-ring relative overflow-hidden p-10 text-center sm:p-16">
            <AuroraBackground />
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Start with the product you need today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Both products are free to try, and they share the same account
              when you are ready for the other.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/db-design">Explore Nazexa DB Design</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dev-tools">Explore Nazexa DEV Tools</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
