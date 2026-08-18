"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveContentItems, type ContentItem } from "@/lib/cms";
import { CONTENT_COLLECTIONS } from "@/lib/constants";
import { CONTENT_SCHEMA } from "@/lib/content-schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminContentQuery } from "@/lib/queries";
import { IconPicker } from "@/components/ui/icon-picker";
import { ImageUploader } from "@/components/ui/image-uploader";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

export default ContentPage;

type Draft = ContentItem & { _new?: boolean; _deleted?: boolean };

function ContentPage() {
  const [collection, setCollection] = useState<string>(CONTENT_COLLECTIONS[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(adminContentQuery(collection));
  const [items, setItems] = useState<Draft[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setItems((prev) => {
        const newItems = prev.filter(
          (i) => i._new && i.collection === collection,
        );
        return [...(data as Draft[]), ...newItems];
      });
    }
  }, [data, collection]);

  const save = useMutation({
    mutationFn: async (rows: Draft[]) => {
      await saveContentItems(rows);
    },
    onSuccess: () => {
      toast.success("Content saved");
      void queryClient.invalidateQueries({ queryKey: ["content_items"] });
      void queryClient.invalidateQueries({
        queryKey: ["content_items_admin", collection],
      });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  function handleSave() {
    for (const item of items) {
      if (item._deleted) continue;
      const schema = CONTENT_SCHEMA[item.collection];
      if (!schema) continue;
      for (const field of schema.fields) {
        const value = field.isData
          ? item.data?.[field.name]
          : item[field.name as keyof Draft];
        if (
          field.type === "text" ||
          field.type === "textarea" ||
          field.type === "rich-text"
        ) {
          if (
            field.name === "title" &&
            (!value || (value as string).trim() === "")
          ) {
            setOpen(item.id);
            return toast.error(`Title is required for item in ${schema.label}`);
          }
          if (typeof value === "string") {
            if (field.type === "text" && value.length > 255) {
              setOpen(item.id);
              return toast.error(`${field.label} exceeds 255 characters`);
            }
            if (field.type === "textarea" && value.length > 1000) {
              setOpen(item.id);
              return toast.error(`${field.label} exceeds 1000 characters`);
            }
          }
        }
      }
    }
    save.mutate(items);
  }

  function patch(id: string, changes: Partial<Draft>) {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function addItem(targetCollection: string) {
    const id = `new-${crypto.randomUUID()}`;
    setCollection(targetCollection);
    setItems((prev) => [
      ...prev,
      {
        id,
        collection: targetCollection,
        slug: "",
        position: prev.length,
        published: true,
        title: "New item",
        subtitle: null,
        body: null,
        icon: null,
        tone: "brand-1",
        category: null,
        image_url: null,
        link_url: null,
        link_label: null,
        data: {},
        _new: true,
      },
    ]);
    setOpen(id);
    setIsAddModalOpen(false);
  }

  const visible = items.filter((i) => !i._deleted);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Content library</h1>
          <p className="mt-2 text-muted-foreground">
            Every homepage and services block — add, edit, reorder, publish or
            remove without code.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add item
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CONTENT_COLLECTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCollection(c);
              setOpen(null);
            }}
            className={cn(
              "rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors",
              collection === c
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {CONTENT_SCHEMA[c]?.label || c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="mt-8 h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="mt-6 space-y-2">
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No items yet — use “Add item” to create the first one.
            </p>
          )}
          {visible.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "surface-card p-4",
                !item.published && "opacity-60",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                >
                  <span className="font-medium">
                    {item.title || "Untitled"}
                  </span>
                  {item.category && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => move(index, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch(item.id, { published: !item.published })}
                  aria-label={item.published ? "Unpublish" : "Publish"}
                >
                  {item.published ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch(item.id, { _deleted: true })}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              {open === item.id && (
                <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                  {CONTENT_SCHEMA[collection]?.fields.map((field) => {
                    const value = field.isData
                      ? ((item.data?.[field.name] as string) ?? "")
                      : ((item[field.name as keyof typeof item] as string) ??
                        "");

                    const onChange = (val: string | null) => {
                      if (field.isData) {
                        patch(item.id, {
                          data: { ...(item.data || {}), [field.name]: val },
                        });
                      } else {
                        patch(item.id, { [field.name]: val });
                      }
                    };

                    return (
                      <Field
                        key={field.name}
                        label={field.label}
                        className={field.className}
                      >
                        {field.type === "text" && (
                          <div className="space-y-1">
                            <Input
                              placeholder={field.placeholder}
                              value={value}
                              maxLength={255}
                              onChange={(e) => onChange(e.target.value)}
                            />
                            <div className="text-[10px] text-muted-foreground text-right">
                              {value.length} / 255
                            </div>
                          </div>
                        )}
                        {field.type === "textarea" && (
                          <div className="space-y-1">
                            <Textarea
                              placeholder={field.placeholder}
                              rows={3}
                              value={value}
                              maxLength={1000}
                              onChange={(e) => onChange(e.target.value)}
                            />
                            <div className="text-[10px] text-muted-foreground text-right">
                              {value.length} / 1000
                            </div>
                          </div>
                        )}
                        {field.type === "rich-text" && (
                          <RichTextEditor
                            placeholder={field.placeholder}
                            value={value}
                            onChange={onChange}
                          />
                        )}
                        {field.type === "icon" && (
                          <IconPicker
                            value={value || null}
                            onChange={onChange}
                          />
                        )}
                        {field.type === "image" && (
                          <ImageUploader
                            value={value || null}
                            onChange={onChange}
                          />
                        )}
                        {field.type === "tone" && (
                          <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value || null)}
                          >
                            <option value="">Default</option>
                            <option value="brand-1">Brand 1</option>
                            <option value="brand-2">Brand 2</option>
                            <option value="brand-3">Brand 3</option>
                          </select>
                        )}
                        {field.type === "select" && (
                          <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={value}
                            onChange={(e) => onChange(e.target.value || null)}
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {(field.type === "date" ||
                          field.type === "datetime") && (
                          <Input
                            type={
                              field.type === "datetime"
                                ? "datetime-local"
                                : "date"
                            }
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                          />
                        )}
                      </Field>
                    );
                  })}

                  <Field label="Extra data (JSON)" className="sm:col-span-2">
                    <Textarea
                      rows={3}
                      className="font-mono text-xs"
                      defaultValue={JSON.stringify(item.data ?? {})}
                      onBlur={(e) => {
                        try {
                          patch(item.id, {
                            data: JSON.parse(e.target.value || "{}"),
                          });
                        } catch {
                          toast.error("Extra data must be valid JSON");
                        }
                      }}
                    />
                  </Field>

                  <div className="sm:col-span-2 mt-4 flex justify-end border-t border-border pt-4">
                    <Button
                      className="glow-ring min-w-[150px]"
                      onClick={handleSave}
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>What would you like to create?</DialogTitle>
            <DialogDescription>
              Select the type of content you want to add to the library.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CONTENT_COLLECTIONS.map((c) => {
              const schema = CONTENT_SCHEMA[c];
              if (!schema) return null;
              return (
                <div
                  key={c}
                  onClick={() => addItem(c)}
                  className="flex flex-col gap-2 p-4 border rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-medium">{schema.label}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {schema.description}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
