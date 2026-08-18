"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeSync } from "@/components/site/ThemeSync";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  MouseGlow,
  NoiseOverlay,
} from "@/components/backgrounds/AnimatedBackground";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const bare = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeSync />
        {!bare && <MouseGlow />}
        <NoiseOverlay />
        {!bare && <SiteHeader />}
        <main className="relative z-10">{children}</main>
        {!bare && <SiteFooter />}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
