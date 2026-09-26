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
import { LogoProvider } from '@/hooks/useLogo';
import type { NavMenu } from '@/lib/navigation';

export function Providers({
  children,
  products,
  frontendLogo,
  adminLogo,
  headerMenu,
  footerMenu,
}: {
  children: React.ReactNode;
  products: ContentItem[];
  frontendLogo: string;
  adminLogo: string;
  headerMenu?: NavMenu;
  footerMenu?: NavMenu;
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
          <LogoProvider frontendLogo={frontendLogo} adminLogo={adminLogo}>
            <ThemeSync />
            {!bare && <MouseGlow />}
            <NoiseOverlay />
            {!bare && <SiteHeader products={products} headerMenu={headerMenu} />}
            <main className="relative z-10">{children}</main>
            {!hideFooter && <SiteFooter footerMenu={footerMenu} />}
            <Toaster position="top-center" />
            {!pathname?.startsWith('/admin') && <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />}
          </LogoProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
