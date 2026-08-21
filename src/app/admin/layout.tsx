"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Palette,
  Search,
  LogOut,
  Loader2,
  Library,
  MessageSquare,
  PhoneCall,
} from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useAuth, useRoles, useSignOut } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/builder", label: "Homepage builder", icon: Layers },
  { to: "/admin/content", label: "Content library", icon: Library },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/theme", label: "Theme", icon: Palette },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/contact-settings", label: "Contact Config", icon: PhoneCall },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const signOut = useSignOut();
  const { data: roles } = useRoles();
  const pathname = usePathname() || "";

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith("/auth")) {
      const nextParam = new URLSearchParams({ next: pathname }).toString();
      router.replace(`/auth?${nextParam}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 p-5 md:flex">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold"
        >
          <img src="/logos/logo-sm.svg" alt="Nazexa" className="h-6 w-auto" />
          Nazexa <span className="text-muted-foreground">CMS</span>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-4">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-0.5 text-xs text-primary">
            {roles?.length ? roles.join(", ") : "no role assigned"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
