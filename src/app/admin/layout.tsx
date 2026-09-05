'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Layers,
  FileText,
  Palette,
  Search,
  LogOut,
  Loader2,
  Library,
  MessageSquare,
  PhoneCall,
  Bot,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useAdminAuth, useAdminSignOut } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/admin/builder', label: 'Homepage builder', icon: Layers },
  { to: '/admin/content', label: 'Content library', icon: Library },
  { to: '/admin/pages', label: 'Pages', icon: FileText },
  { to: '/admin/theme', label: 'Theme', icon: Palette },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/contact-settings', label: 'Contact Config', icon: PhoneCall },
  { to: '/admin/ai-management', label: 'AI Management', icon: Bot },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/team', label: 'Team & Roles', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const signOut = useAdminSignOut();
  const pathname = usePathname() || '';

  useEffect(() => {
    if (!loading) {
      if (!user && !pathname.startsWith('/auth')) {
        const nextParam = new URLSearchParams({ next: pathname }).toString();
        router.replace(`/auth?${nextParam}`);
        return;
      }

      if (user && !user.permissions.includes('*')) {
        const allowed = user.permissions.some(p => pathname === p || pathname.startsWith(`${p}/`));
        if (!allowed && pathname !== '/admin') {
          router.replace('/admin');
        }
      }
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="border-border bg-card/40 sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r p-5 md:flex">
        <Link href="/" className="font-display flex items-center gap-2 text-lg font-semibold">
          <img src="/logos/logo-sm.svg" alt="Nazexa" className="h-6 w-auto" />
          Nazexa <span className="text-muted-foreground">CMS</span>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {nav.filter(item => user.permissions.includes('*') || user.permissions.includes(item.to)).map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-border border-t pt-4">
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          <p className="text-primary mt-0.5 text-xs">
            {user.role || 'no role assigned'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
