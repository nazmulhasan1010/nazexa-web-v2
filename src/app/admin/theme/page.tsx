"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSiteSettings, type SiteTheme } from "@/lib/cms";
import { siteSettingsQuery } from "@/lib/queries";

export default ThemePage;

const PRESETS: { name: string; theme: SiteTheme }[] = [
  {
    name: "Aurora (default)",
    theme: {
      brand1: "oklch(0.82 0.16 178)",
      brand2: "oklch(0.68 0.17 258)",
      brand3: "oklch(0.72 0.19 320)",
    },
  },
  {
    name: "Ember",
    theme: {
      brand1: "oklch(0.78 0.17 60)",
      brand2: "oklch(0.66 0.2 25)",
      brand3: "oklch(0.7 0.16 340)",
    },
  },
  {
    name: "Forest",
    theme: {
      brand1: "oklch(0.8 0.16 150)",
      brand2: "oklch(0.65 0.13 190)",
      brand3: "oklch(0.72 0.14 120)",
    },
  },
  {
    name: "Monochrome",
    theme: {
      brand1: "oklch(0.9 0 0)",
      brand2: "oklch(0.7 0 0)",
      brand3: "oklch(0.55 0 0)",
    },
  },
];

function ThemePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(siteSettingsQuery);
  const [theme, setTheme] = useState<SiteTheme>({});
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    if (!data) return;
    setTheme(data.theme ?? {});
    setSiteName(data.site_name);
    setTagline(data.tagline ?? "");
  }, [data]);

  // Live preview while editing
  useEffect(() => {
    const root = document.documentElement;
    if (theme.brand1) root.style.setProperty("--brand-1", theme.brand1);
    if (theme.brand2) root.style.setProperty("--brand-2", theme.brand2);
    if (theme.brand3) root.style.setProperty("--brand-3", theme.brand3);
    if (theme.radius) root.style.setProperty("--radius", theme.radius);
  }, [theme]);

  const save = useMutation({
    mutationFn: async () => {
      await saveSiteSettings({
        theme: theme as never,
        site_name: siteName,
        tagline,
      });
    },
    onSuccess: () => {
      toast.success("Theme saved");
      void queryClient.invalidateQueries({
        queryKey: siteSettingsQuery.queryKey,
      });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  if (isLoading)
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Theme</h1>
          <p className="mt-2 text-muted-foreground">
            Brand tokens drive gradients, glows and accents across the whole
            site.
          </p>
        </div>
        <Button
          className="glow-ring"
          onClick={() => save.mutate()}
          disabled={save.isPending}
        >
          {save.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save theme
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setTheme({ ...theme, ...p.theme })}
            className="surface-card hover-lift p-4 text-left"
          >
            <div className="flex gap-1.5">
              {[p.theme.brand1, p.theme.brand2, p.theme.brand3].map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full"
                  style={{ background: c }}
                />
              ))}
            </div>
            <p className="mt-3 text-sm font-medium">{p.name}</p>
          </button>
        ))}
      </div>

      <div className="surface-card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Site name</Label>
          <Input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tagline</Label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        {(["brand1", "brand2", "brand3"] as const).map((key) => (
          <div key={key} className="space-y-1.5">
            <Label>{key.replace("brand", "Brand ")}</Label>
            <div className="flex items-center gap-2">
              <span
                className="h-9 w-9 shrink-0 rounded-md border border-border"
                style={{ background: theme[key] }}
              />
              <Input
                value={theme[key] ?? ""}
                onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                placeholder="oklch(0.8 0.16 178)"
                className="font-mono text-xs"
              />
            </div>
          </div>
        ))}
        <div className="space-y-1.5">
          <Label>Corner radius</Label>
          <Input
            value={theme.radius ?? ""}
            onChange={(e) => setTheme({ ...theme, radius: e.target.value })}
            placeholder="0.625rem"
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}
