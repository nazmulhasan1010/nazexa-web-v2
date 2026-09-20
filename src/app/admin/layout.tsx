'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Layers,
  FileText,
  Palette,
  Search,
  Loader2,
  Library,
  MessageSquare,
  PhoneCall,
  Bot,
  Users,
  Mail,
  BookOpen,
  Boxes,
  LogOut,
  ChevronDown,
  ChevronRight,
  AppWindow,
  Shield,
  Menu,
} from 'lucide-react';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useAdminAuth, useAdminSignOut } from '@/hooks/useAdminAuth';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { AdminSocketListeners } from '@/components/admin/AdminSocketListeners';
import { cn } from '@/lib/utils';
import { CONTENT_SCHEMA } from '@/lib/content-schema';
import { MODEL_REGISTRY, MODEL_KEYS } from '@/lib/cms-models/registry';
import { AdminSearch } from '@/components/admin/AdminSearch';
import Image from 'next/image';

// ── Nav definition ─────────────────────────────────────────────────────────────

const LIBRARY_KEYS = [
  'blog',
  'announcement',
  'video',
  'gallery',
  'document',
  'faq',
  'products',
  'services',
  'solutions',
  'industries',
  'case-studies',
  'portfolio',
  'news',
  'integrations',
  'events',
  'team',
  'customers',
  'partners',
  'pricing',
  'tutorials',
  'community',
];

const SITE_KEYS = ['pillars', 'missionvision', 'technologies', 'values', 'stats', 'process'];

type FlatNavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: 'payments' | 'messages';
};

type GroupNavItem = {
  label: string;
  icon: React.ElementType;
  href: string; // clicking the label navigates here
  children: { to: string; label: string }[];
};

type NavItem = ({ kind: 'flat' } & FlatNavItem) | ({ kind: 'group' } & GroupNavItem);

const nav: NavItem[] = [
  { kind: 'flat', to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { kind: 'flat', to: '/admin/builder', label: 'Homepage builder', icon: Layers },
  {
    kind: 'group',
    label: 'Content Library',
    icon: Library,
    href: '/admin/content',
    children: LIBRARY_KEYS.map((key) => ({
      to: `/admin/content?collection=${key}`,
      label: CONTENT_SCHEMA[key]?.label || key,
    })),
  },
  {
    kind: 'group',
    label: 'Site Content',
    icon: BookOpen,
    href: '/admin/content/site',
    children: SITE_KEYS.map((key) => ({
      to: `/admin/content/site?collection=${key}`,
      label: CONTENT_SCHEMA[key]?.label || key,
    })),
  },
  {
    kind: 'group',
    label: 'Pages & Data',
    icon: Boxes,
    href: '/admin/models',
    children: MODEL_KEYS.map((key) => ({
      to: `/admin/models/${key}`,
      label: MODEL_REGISTRY[key]?.label || key,
    })),
  },
  { kind: 'flat', to: '/admin/pages', label: 'Pages', icon: FileText },
  { kind: 'flat', to: '/admin/applications', label: 'Applications', icon: AppWindow },
  { kind: 'flat', to: '/admin/subscribers', label: 'Subscribers', icon: Users },
  { kind: 'flat', to: '/admin/mail-subscribers', label: 'Mail Subscribers', icon: Mail },
  {
    kind: 'group',
    label: 'Theme & Styling',
    icon: Palette,
    href: '/admin/theme',
    children: [
      { to: '/admin/theme', label: 'Website Theme' },
      { to: '/admin/theme/admin', label: 'Admin Theme' },
    ],
  },
  { kind: 'flat', to: '/admin/seo', label: 'SEO', icon: Search },
  {
    kind: 'flat',
    to: '/admin/messages',
    label: 'Messages',
    icon: MessageSquare,
    badge: 'messages',
  },
  { kind: 'flat', to: '/admin/contact-settings', label: 'Contact Config', icon: PhoneCall },
  { kind: 'flat', to: '/admin/ai-management', label: 'AI Management', icon: Bot },
  { kind: 'flat', to: '/admin/payments', label: 'Payments', icon: CreditCard, badge: 'payments' },
  { kind: 'flat', to: '/admin/team', label: 'Team & Roles', icon: Users },
  { kind: 'flat', to: '/admin/security', label: 'Security', icon: Shield },
];

// ── GroupNavRow — label navigates, chevron toggles ────────────────────────────

function GroupNavRow({
  item,
  pathname,
  searchQuery,
}: {
  item: GroupNavItem;
  pathname: string;
  searchQuery: string;
}) {
  // Determine if any child is active
  const isAnyChildActive = item.children.some((child) => {
    const [childPath, childQuery] = child.to.split('?');
    return pathname === childPath && (!childQuery || searchQuery.includes(childQuery));
  });

  // Auto-open when a child is active; stay open if user manually opened it
  const [open, setOpen] = useState(isAnyChildActive);
  useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [isAnyChildActive]);

  const isParentActive = pathname === item.href || isAnyChildActive;

  return (
    <div>
      {/* Row: left = Link (navigate), right = chevron button (toggle) */}
      <div
        className={cn(
          'flex items-center rounded-md text-sm transition-colors',
          isParentActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        {/* Clickable label → navigates to overview page AND opens dropdown */}
        <Link
          href={item.href}
          onClick={() => setOpen((prev) => !prev)}
          className="flex flex-1 items-center gap-2.5 px-3 py-2"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className={cn('truncate', isParentActive && 'font-medium')}>{item.label}</span>
        </Link>

        {/* Chevron → only toggles dropdown, does NOT navigate */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Dropdown children */}
      {open && (
        <div className="mt-0.5 ml-7 flex flex-col space-y-0.5 border-l pl-2.5">
          {item.children.map((child) => {
            const [childPath, childQuery] = child.to.split('?');
            const isActive =
              pathname === childPath && (!childQuery || searchQuery.includes(childQuery));
            return (
              <Link
                key={child.to}
                href={child.to}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const signOut = useAdminSignOut();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.toString() ?? '';
  const [adminSearchOpen, setAdminSearchOpen] = useState(false);

  const [pendingPaymentCount, setPendingPaymentCount] = useState<number>(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const queryClient = useQueryClient();

  // Keep the Overview AI section live even when the dashboard page is not mounted.
  const onAiUsage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ai-overview-stats'] });
  }, [queryClient]);

  // Auth Guard
  useEffect(() => {
    if (!loading) {
      if (!user && !pathname.startsWith('/auth')) {
        const nextParam = new URLSearchParams({ next: pathname }).toString();
        router.replace(`/auth?${nextParam}`);
        return;
      }
      if (user && !user.permissions.includes('*')) {
        const allowed = user.permissions.some(
          (p) => pathname === p || pathname.startsWith(`${p}/`)
        );
        if (!allowed && pathname !== '/admin') {
          router.replace('/admin');
        }
      }
    }
  }, [loading, user, router, pathname]);

  // Payments badge
  useEffect(() => {
    if (user && (user.permissions.includes('*') || user.permissions.includes('/admin/payments'))) {
      fetch('/api/admin/payments/pending-count')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setPendingPaymentCount(d.count);
        })
        .catch(console.error);
    }
  }, [user]);

  // Messages badge
  useEffect(() => {
    if (user && (user.permissions.includes('*') || user.permissions.includes('/admin/messages'))) {
      if (pathname === '/admin/messages') {
        setUnreadMessageCount(0);
      } else {
        fetch('/api/admin/messages/unread-count')
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setUnreadMessageCount(d.count);
          })
          .catch(console.error);
      }
    }
  }, [pathname, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex min-h-screen">
        <AdminSocketListeners
          setPendingPaymentCount={setPendingPaymentCount}
          setUnreadMessageCount={setUnreadMessageCount}
          onAiUsage={onAiUsage}
        />

        {/* Sidebar */}
        <aside className="border-border bg-card/40 sticky top-0 hidden h-screen w-64 shrink-0 scrollbar-none flex-col border-r p-5 [-ms-overflow-style:none] md:flex overflow-y-hidden">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="font-display flex shrink-0 items-center gap-2 text-lg font-semibold"
            >
              <div
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <div className="relative flex h-10 w-32 shrink-0 items-center justify-center">
                  <Image src={'/logos/logo-light.webp'} alt="Logo" width={200} height={200} />
                  <p className="absolute top-7 right-1 text-[9px] text-muted-foreground uppercase">CMS</p>
                </div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => {
                if (typeof window !== 'undefined') window.dispatchEvent(new Event('nazexa:open-admin-search'));
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-0.5 h-full overflow-y-auto scrollbar-none">
            {nav.map((item) => {
              // Permission check
              if (item.kind === 'group') {
                const hasPerm =
                  user.permissions.includes('*') || user.permissions.includes('/admin/content');
                if (!hasPerm) return null;

                return (
                  <GroupNavRow
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    searchQuery={searchQuery}
                  />
                );
              }

              // Flat item
              const hasPerm = user.permissions.includes('*') || user.permissions.includes(item.to);
              if (!hasPerm) return null;

              const active = item.exact
                ? pathname === item.to
                : item.to === '/admin/content'
                  ? pathname === '/admin/content' && !searchQuery.includes('collection=') === false
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);

              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge === 'payments' && pendingPaymentCount > 0 && (
                    <span className="bg-primary text-primary-foreground flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                      {pendingPaymentCount}
                    </span>
                  )}
                  {item.badge === 'messages' && unreadMessageCount > 0 && (
                    <span className="bg-primary text-primary-foreground flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                      {unreadMessageCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="shrink-0 border-t pt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold uppercase">
                {user.name?.[0] || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-muted-foreground truncate text-xs">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-2 w-full justify-start gap-2.5"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="relative flex h-8 w-24 items-center justify-center">
              <Image src={'/logos/logo-light.webp'} alt="Logo" width={150} height={150} />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => {
                  if (typeof window !== 'undefined') window.dispatchEvent(new Event('nazexa:open-admin-search'));
                }}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col h-full bg-card">
                <div className="flex flex-col h-full p-5 overflow-hidden">
                  <Link
                    href="/"
                    className="font-display flex shrink-0 items-center gap-2 text-lg font-semibold"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="relative flex h-10 w-32 shrink-0 items-center justify-center">
                        <Image src={'/logos/logo-light.webp'} alt="Logo" width={200} height={200} />
                        <p className="absolute top-7 right-1 text-[9px] text-muted-foreground uppercase">CMS</p>
                      </div>
                    </div>
                  </Link>

                  <nav className="my-4 flex-1 space-y-0.5 h-full overflow-y-auto scrollbar-none">
                    {nav.map((item) => {
                      if (item.kind === 'group') {
                        const hasPerm =
                          user.permissions.includes('*') || user.permissions.includes('/admin/content');
                        if (!hasPerm) return null;

                        return (
                          <GroupNavRow
                            key={item.label}
                            item={item}
                            pathname={pathname}
                            searchQuery={searchQuery}
                          />
                        );
                      }

                      const hasPerm = user.permissions.includes('*') || user.permissions.includes(item.to);
                      if (!hasPerm) return null;

                      const active = item.exact
                        ? pathname === item.to
                        : item.to === '/admin/content'
                          ? pathname === '/admin/content' && !searchQuery.includes('collection=') === false
                          : pathname === item.to || pathname.startsWith(`${item.to}/`);

                      return (
                        <Link
                          key={item.to}
                          href={item.to}
                          className={cn(
                            'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                            active
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge === 'payments' && pendingPaymentCount > 0 && (
                            <span className="bg-primary text-primary-foreground flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                              {pendingPaymentCount}
                            </span>
                          )}
                          {item.badge === 'messages' && unreadMessageCount > 0 && (
                            <span className="bg-primary text-primary-foreground flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                              {unreadMessageCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="shrink-0 border-t pt-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold uppercase">
                        {user.name?.[0] || 'A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-2 w-full justify-start gap-2.5"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>

          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 w-full">{children}</div>
        </main>
        <AdminSearch open={adminSearchOpen} onOpenChange={setAdminSearchOpen} />
      </div>
    </SocketProvider>
  );
}

// useSearchParams() must sit under a Suspense boundary so admin routes don't fail
// static prerender during `next build`.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
