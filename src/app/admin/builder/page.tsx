"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Eye, EyeOff, GripVertical, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveHomeSections, type HomeSection } from "@/lib/cms";
import { homeSectionsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export default BuilderPage;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  trusted: "Trusted by",
  features: "Feature grid",
  platform: "Platform overview",
  stats: "Stats",
  testimonials: "Testimonials",
  timeline: "Timeline",
  techstack: "Tech stack",
  blog: "Blog preview",
  faq: "FAQ",
  cta: "Final CTA",
};

function BuilderPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(homeSectionsQuery);
  const [items, setItems] = useState<HomeSection[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async (rows: HomeSection[]) => {
      await saveHomeSections(rows);
    },
    onSuccess: () => {
      toast.success("Homepage saved");
      void queryClient.invalidateQueries({
        queryKey: homeSectionsQuery.queryKey,
      });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  function move(from: number, to: number) {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      return next;
    });
  }

  function patch(id: string, changes: Partial<HomeSection>) {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    );
  }

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Homepage builder</h1>
          <p className="mt-2 text-muted-foreground">
            Drag to reorder, toggle visibility, and edit section copy. Changes
            go live on save.
          </p>
        </div>
        <Button
          className="glow-ring"
          onClick={() => save.mutate(items)}
          disabled={save.isPending}
        >
          {save.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>

      <div className="mt-8 space-y-2">
        {items.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== index) {
                move(dragIndex, index);
                setDragIndex(index);
              }
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              "surface-card p-4 transition-opacity",
              dragIndex === index && "opacity-60",
              !section.visible && "opacity-60",
            )}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                {index + 1}
              </span>
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() =>
                  setSelected(selected === section.id ? null : section.id)
                }
              >
                <span className="font-medium">
                  {SECTION_LABELS[section.type] ?? section.type}
                </span>
                {section.title && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {section.title}
                  </span>
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patch(section.id, { visible: !section.visible })}
                aria-label={section.visible ? "Hide section" : "Show section"}
              >
                {section.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>

            {selected === section.id && (
              <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={section.title ?? ""}
                    onChange={(e) =>
                      patch(section.id, { title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Subtitle</Label>
                  <Input
                    value={section.subtitle ?? ""}
                    onChange={(e) =>
                      patch(section.id, { subtitle: e.target.value })
                    }
                  />
                </div>
                {section.type === "hero" && (
                  <>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Badge</Label>
                      <Input
                        value={String(section.content["badge"] ?? "")}
                        onChange={(e) =>
                          patch(section.id, {
                            content: {
                              ...section.content,
                              badge: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Body copy</Label>
                      <Textarea
                        rows={3}
                        value={String(section.content["body"] ?? "")}
                        onChange={(e) =>
                          patch(section.id, {
                            content: {
                              ...section.content,
                              body: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Primary button</Label>
                      <Input
                        value={String(section.content["primaryCta"] ?? "")}
                        onChange={(e) =>
                          patch(section.id, {
                            content: {
                              ...section.content,
                              primaryCta: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Secondary button</Label>
                      <Input
                        value={String(section.content["secondaryCta"] ?? "")}
                        onChange={(e) =>
                          patch(section.id, {
                            content: {
                              ...section.content,
                              secondaryCta: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
