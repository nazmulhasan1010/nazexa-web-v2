"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  image: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      image: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: (user as any).name || "",
        image: (user as any).image || "",
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      form.setValue("image", data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Image uploaded. Don't forget to save changes!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Cover Photo Area - Using Theme Colors */}
      <div className="h-32 w-full bg-linear-to-r from-primary/30 via-primary/10 to-transparent relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background/80" />
      </div>

      <div className="px-8 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section overlapping cover */}
            <div className="relative -mt-12 flex items-end justify-between sm:items-center">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 w-full">
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-1 ring-border/10 bg-muted">
                    <AvatarImage
                      src={form.watch("image") || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-medium bg-primary/5 text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <span className="text-xs font-medium">Change</span>
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
                <div className="pt-2 sm:pt-14 space-y-1 flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {form.watch("name") || "Your Profile"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 grid gap-8">
              {/* Form Fields */}
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          className="bg-background/50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden image field just to keep react-hook-form happy, although setValue manages it */}
                <div className="hidden">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => <Input {...field} />}
                  />
                </div>
              </div>

              <div className="space-y-3 p-5 rounded-xl border border-border/40 bg-primary/5 shadow-sm">
                <div>
                  <h4 className="text-sm font-semibold">Email Address</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your email address is managed by your authentication
                    provider.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    disabled
                    value={user.email}
                    className="flex-1 bg-background/80"
                  />
                  {user.emailVerified ? (
                    <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1.5 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">
                      Verified
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      asChild
                    >
                      <Link href="/verify">Verify Email</Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-8 h-10"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
