'use client';

import Link from 'next/link';
import { 
  Menu, X, ChevronDown, ChevronRight, User, Settings, LogOut, 
  Search, Box, Lightbulb, Code, BookOpen, Building2, CreditCard, 
  HelpCircle, Compass, Zap, Users, Sparkles, Database, Server, 
  Globe, Activity, Rocket, Layout, Terminal, Blocks, Shield, Cpu, Cloud, Laptop
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { navGroups } from '@/lib/site-content';
import type { NavMenu, NavItemWithChildren } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useSignOut } from '@/hooks/useAuth';
import { useLogo } from '@/hooks/useLogo';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ContentItem } from '@/lib/cms';
import { Input } from '@/components/ui/input';
import { openSiteSearch } from '@/components/site/SiteSearch';
import { DynamicIcon } from '@/components/DynamicIcon';

const GROUP_ICONS: Record<string, any> = {
  'Product': Box,
  'Solutions': Lightbulb,
  'Developers': Code,
  'Resources': BookOpen,
  'Company': Building2,
  'Pricing': CreditCard,
};

function getSubMenuIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('database') || t.includes('db')) return Database;
  if (t.includes('server') || t.includes('compute')) return Server;
  if (t.includes('edge') || t.includes('network') || t.includes('globe')) return Globe;
  if (t.includes('analytics') || t.includes('activity')) return Activity;
  if (t.includes('auth') || t.includes('security')) return Shield;
  if (t.includes('api') || t.includes('terminal')) return Terminal;
  if (t.includes('ai') || t.includes('cpu')) return Cpu;
  if (t.includes('component') || t.includes('block')) return Blocks;
  if (t.includes('app') || t.includes('layout')) return Layout;
  if (t.includes('deploy') || t.includes('rocket')) return Rocket;
  if (t.includes('cloud')) return Cloud;
  return ChevronRight;
}

function MobileNavGroup({ 
  label, 
  items, 
  onClose 
}: { 
  label: string; 
  items: { title: string; to: string; description?: string; icon?: string | null }[]; 
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = GROUP_ICONS[label] || Compass;

  return (
    <div className={cn(
      "overflow-hidden rounded-3xl border border-border/50 transition-all duration-500",
      isOpen ? "bg-card shadow-lg ring-1 ring-primary/10" : "bg-card/30 shadow-sm hover:bg-card/50"
    )}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center gap-4 p-4 text-left outline-none"
      >
        <div className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500",
          isOpen 
            ? "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.25)] ring-1 ring-primary/20 scale-105" 
            : "bg-secondary/40 text-secondary-foreground ring-1 ring-white/5 group-hover:bg-secondary/60"
        )}>
          {isOpen && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent opacity-50" />
          )}
          <Icon className="relative z-10 h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold tracking-tight">{label}</div>
          <div className="mt-0.5 text-xs font-medium text-muted-foreground line-clamp-1 transition-colors group-hover:text-foreground/70">
            Explore {label.toLowerCase()}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            isOpen ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground group-hover:bg-secondary"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              {/* Elegant divider */}
              <div className="absolute top-0 inset-x-5 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
              
              <div className="flex flex-col gap-2.5 bg-gradient-to-b from-muted/5 to-transparent px-3 pb-4 pt-4">
                {items.map((item, i) => {
                  const SubIcon = getSubMenuIcon(item.title);
                  return (
                    <motion.div 
                      key={item.to}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={item.to}
                        onClick={onClose}
                        className="group relative flex flex-col overflow-hidden rounded-2xl bg-transparent p-3.5 transition-all duration-300 hover:bg-card hover:shadow-md active:scale-[0.98] ring-1 ring-transparent hover:ring-border/50"
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        <div className="flex items-center gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/30 text-muted-foreground transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary group-hover:shadow-[0_0_12px_rgba(var(--primary),0.15)] group-hover:scale-105">
                            {item.icon ? <DynamicIcon name={item.icon} className="h-4 w-4 transition-transform duration-300" /> : <SubIcon className="h-4 w-4 transition-transform duration-300" />}
                          </div>
                          <div className="flex flex-1 items-center justify-between">
                            <span className="text-sm font-semibold tracking-tight text-foreground/80 transition-colors duration-300 group-hover:text-foreground">
                              {item.title}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                          </div>
                        </div>
                        {item.description && (
                          <p className="mt-2.5 pl-[52px] text-[13px] leading-snug text-muted-foreground/80 line-clamp-2 transition-colors duration-300 group-hover:text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Optional Featured Card at the bottom of the submenu */}
                {label === 'Products' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: items.length * 0.05 + 0.1, duration: 0.3 }}
                    className="mx-1 mt-2"
                  >
                    <Link
                      href="/db-design"
                      onClick={onClose}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 ring-1 ring-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.15)] active:scale-[0.98]"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
                            Featured
                          </div>
                          <div className="text-sm font-bold tracking-tight text-foreground">
                            Nazexa DB Design
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground/80">
                          Try the new visual ERD tool
                        </span>
                        <ChevronRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function SiteHeader({ products = [], headerMenu }: { products?: ContentItem[], headerMenu?: NavMenu }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const { frontendLogo } = useLogo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const { user, loading } = useAuth();
  const signOut = useSignOut();

  const displayItems = headerMenu?.items?.length ? headerMenu.items : navGroups.map(g => ({
    id: g.label,
    label: g.label,
    url: null,
    children: g.items.map(i => ({
      id: i.to,
      label: i.title,
      url: i.to,
      description: i.description,
      children: []
    }))
  })) as any as NavItemWithChildren[];

  return (
    <>
      <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        (scrolled || open) ? 'border-border bg-background/95 border-b backdrop-blur-xl' : 'bg-transparent'
      )}
      onMouseLeave={() => setGroup(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <Image src={frontendLogo} alt="Nazexa" width={100} height={32} className="h-8 w-auto object-contain" priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {displayItems.map((g) => (
            g.children && g.children.length > 0 ? (
              <button
                key={g.id || g.label}
                onMouseEnter={() => setGroup(g.label)}
                onFocus={() => setGroup(g.label)}
                className={cn(
                  'text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors',
                  group === g.label && 'text-foreground'
                )}
              >
                {g.label}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    group === g.label && 'rotate-180'
                  )}
                />
              </button>
            ) : (
              <Link
                key={g.id || g.label}
                href={g.url || '#'}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
              >
                {g.label}
              </Link>
            )
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => openSiteSearch()}
          >
            <Search className="h-4 w-4" />
          </Button>

          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any).image ?? undefined} alt={user.email} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {(user as any).name || 'User'}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/support/tickets" className="flex cursor-pointer items-center">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support Tickets</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="glow-ring">
                <Link href="/contact">Start building</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="relative z-50 ml-auto rounded-md p-2 lg:hidden flex items-center justify-center h-10 w-10 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mega menu */}
      <div
        className={cn(
          'border-border hidden overflow-hidden transition-all duration-300 lg:block',
          group ? 'bg-background/95 max-h-96 border-b backdrop-blur-xl' : 'max-h-0'
        )}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3 px-5 py-8">
            {displayItems
              .find((g) => g.label === group)
              ?.children?.map((item) => (
                <Link
                  key={item.id || item.url || item.label}
                  href={item.url || '#'}
                  onClick={() => setGroup(null)}
                  className="group relative flex flex-col rounded-xl border border-transparent bg-transparent p-4 transition-all hover:bg-card hover:border-border/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      {item.icon ? <DynamicIcon name={item.icon} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-primary">
                      {item.label}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-2 pl-11 text-xs text-muted-foreground line-clamp-2 transition-colors group-hover:text-foreground/70">
                      {item.description}
                    </p>
                  )}
                </Link>
              ))}
          </div>
        </div>
      </header>

      {/* Mobile menu (Full Screen Overlay) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 top-[64px] z-40 flex flex-col bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex-1 overflow-y-auto px-5 py-6 pb-[max(env(safe-area-inset-bottom),24px)]">
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 relative"
              >
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  readOnly
                  onClick={() => {
                    setOpen(false);
                    openSiteSearch();
                  }}
                  placeholder="Search Nazexa..." 
                  className="h-12 w-full rounded-xl bg-card/50 pl-11 text-base shadow-sm focus-visible:ring-primary/20 cursor-pointer" 
                />
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 grid grid-cols-2 gap-3"
              >
                <Link 
                  href="/documentation" 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 rounded-xl border bg-card/40 p-3.5 shadow-sm transition-colors hover:bg-card active:scale-[0.98]"
                >
                  <div className="bg-primary/10 rounded-lg p-1.5 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Docs</span>
                </Link>
                <Link 
                  href="/support" 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 rounded-xl border bg-card/40 p-3.5 shadow-sm transition-colors hover:bg-card active:scale-[0.98]"
                >
                  <div className="bg-primary/10 rounded-lg p-1.5 text-primary">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Support</span>
                </Link>
                <Link 
                  href="/community" 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 rounded-xl border bg-card/40 p-3.5 shadow-sm transition-colors hover:bg-card active:scale-[0.98]"
                >
                  <div className="bg-primary/10 rounded-lg p-1.5 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Community</span>
                </Link>
                <Link 
                  href="/changelog" 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 rounded-xl border bg-card/40 p-3.5 shadow-sm transition-colors hover:bg-card active:scale-[0.98]"
                >
                  <div className="bg-primary/10 rounded-lg p-1.5 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Changelog</span>
                </Link>
              </motion.div>

              <div className="text-muted-foreground mb-3 px-1 text-xs font-semibold tracking-widest uppercase">
                Explore
              </div>

              <div className="flex flex-col gap-3">
                {displayItems.map((g, i) => (
                  <motion.div
                    key={g.id || g.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.15 }}
                  >
                    {g.children && g.children.length > 0 ? (
                      <MobileNavGroup 
                        label={g.label} 
                        items={g.children.map((c: any) => ({ title: c.label, to: c.url || '#', description: c.description || undefined, icon: c.icon }))} 
                        onClose={() => setOpen(false)} 
                      />
                    ) : (
                      <Link
                        href={g.url || '#'}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-3xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                      >
                        <div className="text-base font-bold tracking-tight">{g.label}</div>
                      </Link>
                    )}
                  </motion.div>
                ))}

                
              </div>
              
              {/* Bottom Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayItems.length * 0.05 + 0.25 }}
                className="mt-8"
              >
                <div className="flex flex-col gap-3">
                  {loading ? null : user ? (
                    <Button asChild variant="outline" className="h-12 w-full justify-center rounded-xl text-base font-medium">
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        <User className="mr-2 h-5 w-5" /> Go to Profile
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="h-12 w-full justify-center rounded-xl text-base font-medium">
                      <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                    </Button>
                  )}
                  <Button asChild className="h-12 w-full justify-center rounded-xl text-base font-medium glow-ring">
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      Start building
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}





