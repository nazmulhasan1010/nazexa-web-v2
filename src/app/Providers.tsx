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

import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import { SiteSearch } from '@/components/site/SiteSearch';

export function Providers({
  children,
  products,
}: {
  children: React.ReactNode;
  products: ContentItem[];
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const bare = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');
  const hideFooter = bare || pathname?.startsWith('/preview');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <ThemeSync />
          {!bare && <MouseGlow />}
          <NoiseOverlay />
          {!bare && <SiteHeader products={products} />}
          <main className="relative z-10">{children}</main>
          {!hideFooter && <SiteFooter />}
          <Toaster position="top-center" />
          {!pathname?.startsWith('/admin') && <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />}
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
