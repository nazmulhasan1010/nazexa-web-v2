"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Layers, FileText, Palette, Search } from "lucide-react";

import {
  cmsPagesQuery,
  homeSectionsQuery,
  siteSettingsQuery,
} from "@/lib/queries";
import { useRoles } from "@/hooks/useAuth";

export default AdminOverview;

function AdminOverview() {
  const sections = useQuery(homeSectionsQuery);
  const pages = useQuery(cmsPagesQuery);
  const settings = useQuery(siteSettingsQuery);
  const { data: roles } = useRoles();
  const canEdit = roles?.some((r) => r === "admin" || r === "editor");

  const cards = [
    {
      to: "/admin/builder",
      icon: Layers,
      label: "Homepage sections",
      value: `${sections.data?.filter((s) => s.visible).length ?? 0}/${sections.data?.length ?? 0} visible`,
    },
    {
      to: "/admin/pages",
      icon: FileText,
      label: "CMS pages",
      value: `${pages.data?.length ?? 0} total`,
    },
    {
      to: "/admin/theme",
      icon: Palette,
      label: "Theme",
      value: settings.data?.site_name ?? "—",
    },
    {
      to: "/admin/seo",
      icon: Search,
      label: "SEO defaults",
      value: settings.data?.default_seo_title ? "configured" : "not set",
    },
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-semibold">Overview</h1>
      <p className="mt-2 text-muted-foreground">
        Everything powering nazexa.com, in one place.
      </p>

      {!canEdit && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Your account has no editor role yet, so saving is disabled. An admin
          needs to grant you the
          <span className="font-mono"> admin </span> or{" "}
          <span className="font-mono">editor</span> role.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            href={c.to}
            className="surface-card hover-lift block p-5"
          >
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-lg font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
