'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeSync } from '@/components/site/ThemeSync';
import { AuthProvider } from '@/hooks/useAuth';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { MouseGlow, NoiseOverlay } from '@/components/backgrounds/AnimatedBackground';
import { Toaster } from '@/components/ui/sonner';
import type { ContentItem } from '@/lib/cms';

export function Providers({
  children,
  products,
}: {
  children: React.ReactNode;
  products: ContentItem[];
}) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const bare = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeSync />
        {!bare && <MouseGlow />}
        <NoiseOverlay />
        {!bare && <SiteHeader products={products} />}
        <main className="relative z-10">{children}</main>
        {!bare && <SiteFooter />}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
