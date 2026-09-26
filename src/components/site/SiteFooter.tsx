'use client';

import Link from 'next/link';

import { Sparkles } from 'lucide-react';
import Image from 'next/image';

import { WaveBackground } from '@/components/backgrounds/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { NewsletterSubscription } from './NewsletterSubscription';
import { footerColumns } from '@/lib/site-content';
import { useLogo } from '@/hooks/useLogo';
import type { NavMenu, NavItemWithChildren } from '@/lib/navigation';

export function SiteFooter({ footerMenu }: { footerMenu?: NavMenu }) {
  const { frontendLogo } = useLogo();

  const displayCols = footerMenu?.items?.length ? footerMenu.items : footerColumns.map(c => ({
    id: c.title,
    label: c.title,
    children: c.links.map(l => ({
      id: l.to,
      label: l.label,
      url: l.to
    }))
  })) as any as NavItemWithChildren[];

  return (
    <footer className="border-border relative isolate overflow-hidden border-t pt-20">
      <WaveBackground />
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src={frontendLogo} alt="Nazexa" width={100} height={32} className="h-8 w-auto object-contain" />
            </div>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm">
              The developer platform for teams who ship. Databases, edge compute, AI and
              observability in one coherent product.
            </p>
            <NewsletterSubscription />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {displayCols.map((col) => (
              <div key={col.id || col.label}>
                <div className="text-foreground text-xs font-semibold tracking-widest uppercase">
                  {col.label}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.children?.map((l: any) => (
                    <li key={l.id || l.url || l.label}>
                      <Link
                        href={l.url || '#'}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-16 flex flex-col gap-3 border-t py-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Nazexa Technologies. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
