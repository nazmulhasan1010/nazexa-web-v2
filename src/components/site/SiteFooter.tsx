import Link from 'next/link';

import { Sparkles } from 'lucide-react';

import { WaveBackground } from '@/components/backgrounds/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { footerColumns } from '@/lib/site-content';

export function SiteFooter() {
  return (
    <footer className="border-border relative isolate overflow-hidden border-t pt-20">
      <WaveBackground />
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logos/logo-sm.svg" alt="Nazexa" className="h-8 w-8" />
              <span className="font-display text-lg font-semibold">Nazexa</span>
            </div>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm">
              The developer platform for teams who ship. Databases, edge compute, AI and
              observability in one coherent product.
            </p>
            <form className="mt-6 flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder="you@company.com" aria-label="Email address" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <div className="text-foreground text-xs font-semibold tracking-widest uppercase">
                  {col.title}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        href={l.to}
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
