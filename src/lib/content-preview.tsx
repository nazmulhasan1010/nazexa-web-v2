import type { ReactNode } from 'react';

import type { ContentItem } from '@/lib/cms';

// ── Reusable content preview system ──
// One registry maps every collection to a faithful single-item layout, rendered with the
// site's design tokens so admins see content "as it appears on the website". Pure (no hooks)
// so it works in both the server preview route and client wrappers.

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function toList(v: unknown): string[] {
  if (Array.isArray(v))
    return v
      .map((x) => (typeof x === 'string' ? x : str((x as { title?: string })?.title)))
      .filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return toList(parsed);
    } catch {
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:my-0.5 mt-2 max-w-none text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Media({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  // Plain img: preview URLs are admin-supplied and may be external / not in next.config domains.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />;
}

type PreviewKind =
  'article' | 'card' | 'pricing' | 'faq' | 'profile' | 'logo' | 'stat' | 'gallery' | 'video';

const PREVIEW_MAP: Record<string, PreviewKind> = {
  blog: 'article',
  news: 'article',
  announcement: 'article',
  document: 'article',
  products: 'card',
  services: 'card',
  solutions: 'card',
  industries: 'card',
  'case-studies': 'card',
  portfolio: 'card',
  integrations: 'card',
  partners: 'card',
  pillars: 'card',
  values: 'card',
  missionvision: 'card',
  technologies: 'card',
  process: 'card',
  pricing: 'pricing',
  faq: 'faq',
  team: 'profile',
  customers: 'logo',
  gallery: 'gallery',
  video: 'video',
  stats: 'stat',
};

function ArticlePreview({ item }: { item: ContentItem }) {
  const metaParts = [str(item.data?.author), str(item.data?.publish_date) || str(item.data?.start_date)].filter(Boolean);
  
  return (
    <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg ring-1 ring-black/5 dark:ring-white/5">
      {item.image_url && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
          <Media src={item.image_url} alt={item.title || 'Header image'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-8 sm:p-12">
        {item.category && (
          <span className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-tight text-primary ring-1 ring-primary/20">
            {item.category}
          </span>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          {item.title || 'Untitled Article'}
        </h1>
        {item.subtitle && (
          <p className="mt-4 text-xl font-medium leading-relaxed text-muted-foreground">
            {item.subtitle}
          </p>
        )}
        {metaParts.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="font-semibold uppercase">{metaParts[0].charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{metaParts[0]}</span>
              {metaParts[1] && <span className="text-xs text-muted-foreground">{metaParts[1]}</span>}
            </div>
          </div>
        )}
        <div className="mt-10 border-t border-border/50 pt-10">
          {item.body ? (
            <Prose html={item.body} />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">No article content yet.</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CardPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border/50 bg-card shadow-xl transition-all hover:shadow-2xl hover:ring-1 hover:ring-primary/20">
      {item.image_url ? (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Media src={item.image_url} alt={item.title || 'Card image'} />
        </div>
      ) : (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-muted to-background">
          {item.icon && <span className="text-5xl text-primary/40">{item.icon}</span>}
        </div>
      )}
      <div className="p-8">
        <div className="flex items-center justify-between gap-4">
          {item.category && (
            <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase ring-1 ring-white/10">
              {item.category}
            </span>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{item.title || 'Untitled Card'}</h2>
        {item.subtitle && <p className="mt-2 text-sm font-medium text-primary">{item.subtitle}</p>}
        {item.body && (
          <div className="mt-4">
            <Prose html={item.body} />
          </div>
        )}
        {item.link_url && (
          <div className="mt-8">
            <a href={item.link_url} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">
              {item.link_label || 'Learn more'} &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPreview({ item }: { item: ContentItem }) {
  const features = toList(item.data?.features);
  const price = str(item.data?.price) || item.subtitle || '$0';
  const period = str(item.data?.period) || '/mo';
  
  return (
    <div className="mx-auto flex max-w-sm flex-col overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-card to-card/50 p-8 shadow-2xl ring-1 ring-primary/10">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title || 'Plan Name'}</h3>
        {item.category === 'popular' && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/20">
            Most Popular
          </span>
        )}
      </div>
      <div className="mb-2 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold tracking-tight text-foreground">{price}</span>
        <span className="text-sm font-medium text-muted-foreground">{period}</span>
      </div>
      {item.body && <p className="mb-8 text-sm text-muted-foreground">{item.body}</p>}
      
      {(item.link_label || item.link_url) && (
        <button className="mb-8 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-95">
          {item.link_label || 'Get Started'}
        </button>
      )}

      {features.length > 0 && (
        <ul className="flex flex-col gap-4 border-t border-border/50 pt-8">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground/80">{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FaqPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="font-bold">?</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{item.title || 'Frequently Asked Question'}</h2>
          {item.category && (
            <span className="mt-1 inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.category}
            </span>
          )}
          <div className="mt-3 text-muted-foreground">
            {item.body ? (
              <Prose html={item.body} />
            ) : (
              <p className="text-sm italic">No answer provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg text-center">
      <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title || ''}
              className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-md"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-muted text-3xl font-bold shadow-md">
              {(item.title || '?').charAt(0)}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-8 pt-16">
        <h3 className="text-2xl font-bold text-foreground">{item.title || 'Team Member'}</h3>
        {item.subtitle && <p className="mt-1 font-semibold text-primary">{item.subtitle}</p>}
        <p className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {[item.category, str(item.data?.location)].filter(Boolean).join(' • ')}
        </p>
        {item.body && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>}
      </div>
    </div>
  );
}

function LogoPreview({ item }: { item: ContentItem }) {
  const quote = str(item.data?.testimonial);
  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border/50 bg-card p-10 shadow-lg text-center">
      <div className="flex h-20 items-center justify-center">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title || ''} className="max-h-full max-w-xs object-contain opacity-80 transition-opacity hover:opacity-100" />
        ) : (
          <p className="text-2xl font-extrabold tracking-tight text-muted-foreground">{item.title || 'Logo Placeholder'}</p>
        )}
      </div>
      {quote && (
        <div className="mt-8 border-t border-border/50 pt-8">
          <blockquote className="text-xl font-medium italic leading-relaxed text-foreground/90">
            &ldquo;{quote}&rdquo;
          </blockquote>
          {(str(item.data?.author) || str(item.data?.author_role)) && (
            <p className="mt-4 text-sm font-semibold text-primary">
              {str(item.data?.author)} <span className="font-normal text-muted-foreground">— {str(item.data?.author_role)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center justify-center rounded-3xl border border-border/50 bg-card p-8 shadow-lg transition-transform hover:scale-105">
      <div className="mb-2 rounded-xl bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
        {item.category || 'Metric'}
      </div>
      <p className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-6xl font-black text-transparent">
        {str(item.data?.value) || '0'}
      </p>
      <p className="mt-3 text-center text-sm font-medium text-muted-foreground">{item.title || 'Statistic description'}</p>
    </div>
  );
}

function GalleryPreview({ item }: { item: ContentItem }) {
  const extra = toList(item.data?.additional_images);
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-card shadow-xl">
      <div className="border-b border-border/50 p-6">
        <h2 className="text-2xl font-bold tracking-tight">{item.title || 'Gallery Collection'}</h2>
        {item.subtitle && <p className="mt-1 text-sm font-medium text-muted-foreground">{item.subtitle}</p>}
      </div>
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="col-span-4 md:col-span-3">
            {item.image_url ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
                <Media src={item.image_url} alt={item.title || ''} />
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">Main Image</p>
              </div>
            )}
          </div>
          {extra.length > 0 && (
            <div className="col-span-4 flex gap-4 overflow-x-auto pb-2 md:col-span-1 md:flex-col md:overflow-visible md:pb-0">
              {extra.slice(0, 4).map((src, i) => (
                <div key={i} className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted md:w-full">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              {extra.length > 4 && (
                <div className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/50 md:w-full">
                  <span className="text-sm font-bold text-muted-foreground">+{extra.length - 4}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/50 bg-card shadow-xl">
      <div className="group relative aspect-video w-full overflow-hidden bg-black/90">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title || ''} className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/50" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
            <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {str(item.data?.duration) && (
          <div className="absolute bottom-4 right-4 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold tracking-wider text-white backdrop-blur-md">
            {str(item.data?.duration)}
          </div>
        )}
      </div>
      <div className="p-8">
        <div className="flex items-center gap-3">
          {item.category && (
            <span className="rounded-full bg-secondary/50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {item.category}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight">{item.title || 'Video Title'}</h2>
        </div>
        {item.subtitle && <p className="mt-2 text-lg font-medium text-primary">{item.subtitle}</p>}
        {item.body && (
          <div className="mt-6 border-t border-border/50 pt-6">
            <Prose html={item.body} />
          </div>
        )}
      </div>
    </div>
  );
}

export function renderContentPreview(collection: string, item: ContentItem): ReactNode {
  const kind = PREVIEW_MAP[collection] ?? 'card';
  switch (kind) {
    case 'article':
      return <ArticlePreview item={item} />;
    case 'pricing':
      return <PricingPreview item={item} />;
    case 'faq':
      return <FaqPreview item={item} />;
    case 'profile':
      return <ProfilePreview item={item} />;
    case 'logo':
      return <LogoPreview item={item} />;
    case 'stat':
      return <StatPreview item={item} />;
    case 'gallery':
      return <GalleryPreview item={item} />;
    case 'video':
      return <VideoPreview item={item} />;
    default:
      return <CardPreview item={item} />;
  }
}
