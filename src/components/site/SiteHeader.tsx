"use client";

import Link from "next/link";

import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { navGroups } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/75 backdrop-blur-xl"
          : "bg-transparent",
      )}
      onMouseLeave={() => setGroup(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <img src="/logos/logo-sm.svg" alt="Nazexa" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Nazexa
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navGroups.map((g) => (
            <button
              key={g.label}
              onMouseEnter={() => setGroup(g.label)}
              onFocus={() => setGroup(g.label)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                group === g.label && "text-foreground",
              )}
            >
              {g.label}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  group === g.label && "rotate-180",
                )}
              />
            </button>
          ))}
          <Link
            href="/pricing"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="glow-ring">
            <Link href="/contact">Start building</Link>
          </Button>
        </div>

        <button
          className="ml-auto rounded-md p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mega menu */}
      <div
        className={cn(
          "hidden overflow-hidden border-border transition-all duration-300 lg:block",
          group
            ? "max-h-96 border-b bg-background/95 backdrop-blur-xl"
            : "max-h-0",
        )}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-5 py-6">
          {navGroups
            .find((g) => g.label === group)
            ?.items.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setGroup(null)}
                className="rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/50"
              >
                <div className="text-sm font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-b border-border bg-background/98 px-5 pb-8 backdrop-blur-xl lg:hidden">
          {navGroups.map((g) => (
            <div key={g.label} className="py-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {g.label}
              </div>
              <div className="grid gap-1">
                {g.items.map((item) => (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md py-1.5 text-sm"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Button asChild className="mt-4 w-full">
            <Link href="/contact" onClick={() => setOpen(false)}>
              Start building
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
