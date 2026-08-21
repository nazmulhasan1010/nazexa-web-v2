"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuroraBackground } from "@/components/backgrounds/AnimatedBackground";

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (!loading && user && user.hasPassword) {
      router.replace("/");
    }
    if (!loading && user && !user.emailVerified) {
      router.replace("/verify");
    }
  }, [user, loading, router]);

  async function onSubmit(data: z.infer<typeof setPasswordSchema>) {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/users/me/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to set password");
      }

      toast.success("Password configured successfully!");
      // Force reload to get updated session with hasPassword=true
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading || !user || user.hasPassword || !user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen flex items-center justify-center p-4">
      <AuroraBackground />

      <div className="w-full max-w-md relative z-10">
        <div className="surface-card p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              Secure Your Account
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Since you logged in with a third-party provider, please set a
              backup password to secure your account.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="pl-10 bg-background/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                          className="pl-10 bg-background/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 mt-4">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full h-11 text-base font-medium"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : null}
                  Complete Setup
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { window.location.href = "/"; }}
                  disabled={isUpdating}
                  className="w-full h-11 text-base"
                >
                  Maybe later
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
