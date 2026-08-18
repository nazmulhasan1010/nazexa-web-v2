"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { upsertCmsPage, deleteCmsPage, type CmsPage } from "@/lib/cms";
import { cmsPagesQuery } from "@/lib/queries";

export default PagesAdmin;

function PagesAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(cmsPagesQuery);
  const [draft, setDraft] = useState<Partial<CmsPage> | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: cmsPagesQuery.queryKey });

  const upsert = useMutation({
    mutationFn: async (page: Partial<CmsPage>) => {
      await upsertCmsPage(page);
    },
    onSuccess: () => {
      toast.success("Page saved");
      setDraft(null);
      void refresh();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await deleteCmsPage(id);
    },
    onSuccess: () => {
      toast.success("Page deleted");
      void refresh();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  if (isLoading)
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Pages</h1>
          <p className="mt-2 text-muted-foreground">
            CMS-managed pages with their own SEO metadata.
          </p>
        </div>
        <Button
          className="glow-ring"
          onClick={() => setDraft({ published: false })}
        >
          <Plus className="mr-1.5 h-4 w-4" /> New page
        </Button>
      </div>

      {draft && (
        <div className="surface-card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={draft.slug ?? ""}
              placeholder="changelog"
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={draft.title ?? ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={draft.description ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>SEO title</Label>
            <Input
              value={draft.seo_title ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, seo_title: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>SEO description</Label>
            <Input
              value={draft.seo_description ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, seo_description: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch
              checked={Boolean(draft.published)}
              onCheckedChange={(v) => setDraft({ ...draft, published: v })}
            />
            <span className="text-sm text-muted-foreground">Published</span>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => upsert.mutate(draft)}
                disabled={upsert.isPending}
              >
                Save page
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {(data ?? []).map((page) => (
          <div
            key={page.id}
            className="surface-card flex items-center gap-3 p-4"
          >
            <button
              type="button"
              className="flex-1 text-left"
              onClick={() => setDraft(page)}
            >
              <p className="font-medium">{page.title}</p>
              <p className="font-mono text-xs text-muted-foreground">
                /{page.slug}
              </p>
            </button>
            <span
              className={
                page.published
                  ? "text-xs text-primary"
                  : "text-xs text-muted-foreground"
              }
            >
              {page.published ? "Published" : "Draft"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove.mutate(page.id)}
              aria-label="Delete page"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {!data?.length && !draft && (
          <p className="text-sm text-muted-foreground">
            No CMS pages yet — create your first one.
          </p>
        )}
      </div>
    </div>
  );
}
