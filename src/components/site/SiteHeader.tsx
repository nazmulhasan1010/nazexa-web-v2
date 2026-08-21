"use client";

import Link from "next/link";
import {
  Menu,
  X,
  ChevronDown,
  Sparkles,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { navGroups } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { useAuth, useSignOut } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ContentItem } from "@/lib/cms";

export function SiteHeader({ products = [] }: { products?: ContentItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { user, loading } = useAuth();
  const signOut = useSignOut();

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
          <button
            onMouseEnter={() => setGroup("Pricing")}
            onFocus={() => setGroup("Pricing")}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus:outline-none",
              group === "Pricing" && "text-foreground",
            )}
          >
            Pricing
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                group === "Pricing" && "rotate-180",
              )}
            />
          </button>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={(user as any).image ?? undefined}
                      alt={user.email}
                    />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {(user as any).name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="glow-ring">
                <Link href="/contact">Start building</Link>
              </Button>
            </>
          )}
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
          {group === "Pricing" ? (
            <>
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.slug}/pricing`}
                  onClick={() => setGroup(null)}
                  className="rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/50"
                >
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    View pricing plans for {p.title}
                  </div>
                </Link>
              ))}
              <Link
                href="/pricing"
                onClick={() => setGroup(null)}
                className="rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/50"
              >
                <div className="text-sm font-medium">All Pricing</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Compare all plans side-by-side
                </div>
              </Link>
            </>
          ) : (
            navGroups
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
              ))
          )}
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
          <div className="py-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pricing
            </div>
            <div className="grid gap-1">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.slug}/pricing`}
                  onClick={() => setOpen(false)}
                  className="rounded-md py-1.5 text-sm"
                >
                  {p.title} Pricing
                </Link>
              ))}
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="rounded-md py-1.5 text-sm"
              >
                All Pricing
              </Link>
            </div>
          </div>
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
