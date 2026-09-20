import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { globalCmsSearch } from '@/lib/search';
import Link from 'next/link';
import { Search, ChevronRight, FileText, Package, Briefcase, FileCode, Users, BookOpen, Layout, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


export const metadata: Metadata = {
  title: 'Search | Nazexa',
  description: 'Search across the entire Nazexa ecosystem.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  
  if (!q || q.length < 2) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 md:py-32">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Search Nazexa</h1>
        <form action="/search" method="GET" className="relative flex max-w-2xl items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input 
            name="q"
            placeholder="Search products, documentation, resources..." 
            className="h-14 w-full rounded-2xl bg-card pl-12 text-lg shadow-sm"
            autoFocus
          />
          <Button type="submit" className="absolute right-2 rounded-xl">Search</Button>
        </form>
      </div>
    );
  }

  const groups = await globalCmsSearch({ query: q, limit: 15 });
  const totalResults = groups.reduce((acc, g) => acc + g.items.length, 0);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'menu': return <Compass className="h-5 w-5 text-emerald-500" />;
      case 'submenu': return <Layout className="h-5 w-5 text-emerald-500" />;
      case 'product': case 'products': return <Package className="h-5 w-5 text-primary" />;
      case 'docarticle': case 'documentation': return <FileCode className="h-5 w-5 text-cyan-500" />;
      case 'job': case 'jobs': return <Briefcase className="h-5 w-5 text-orange-500" />;
      case 'resource': case 'resources': return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'page': case 'pages': return <Layout className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
      <form action="/search" method="GET" className="relative mb-12 flex max-w-2xl items-center">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <Input 
          name="q"
          defaultValue={q}
          placeholder="Search products, documentation, resources..." 
          className="h-14 w-full rounded-2xl bg-card pl-12 text-lg shadow-sm"
        />
        <Button type="submit" className="absolute right-2 rounded-xl">Search</Button>
      </form>

      <div className="mb-10 flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Search Results for &quot;{q}&quot;
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {totalResults} results
        </span>
      </div>

      {totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/30 py-24 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-xl font-medium">No results found</h3>
          <p className="max-w-sm text-muted-foreground">
            We couldn't find anything matching &quot;{q}&quot;. Try adjusting your search terms or browsing our categories.
          </p>
        </div>
      ) : (
        <div className="grid gap-12 md:grid-cols-[200px_1fr]">
          <div className="hidden md:block">
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Categories</h3>
            <ul className="space-y-2">
              {groups.map(g => (
                <li key={g.group}>
                  <a href={`#${g.group}`} className="text-sm hover:text-primary transition-colors flex justify-between">
                    <span>{g.group}</span>
                    <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-[10px]">{g.items.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-12">
            {groups.map((group) => (
              <div key={group.group} id={group.group} className="scroll-mt-32">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight">
                  {group.group}
                  <span className="text-sm font-normal text-muted-foreground">({group.items.length})</span>
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="group flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                    >
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-primary/10">
                            {getIcon(item.type)}
                          </div>
                          {item.isDraft && (
                            <span className="rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">Draft</span>
                          )}
                        </div>
                        <h4 className="mb-2 font-semibold tracking-tight transition-colors group-hover:text-primary">
                          {item.title}
                        </h4>
                        {item.excerpt && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View {group.group.toLowerCase().replace(/s$/, '')}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
