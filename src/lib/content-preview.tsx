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
      className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-li:my-0.5 mt-4 max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Media({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  // Plain img: preview URLs are admin-supplied and may be external / not in next.config domains.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="mb-5 w-full rounded-lg border object-cover" />;
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
  return (
    <article className="mx-auto max-w-2xl">
      {item.category && (
        <span className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium">
          {item.category}
        </span>
      )}
      <h1 className="text-3xl font-semibold tracking-tight">{item.title || 'Untitled'}</h1>
      {item.subtitle && <p className="text-muted-foreground mt-3 text-lg">{item.subtitle}</p>}
      {(str(item.data?.author) || str(item.data?.publish_date) || str(item.data?.start_date)) && (
        <p className="text-muted-foreground mt-2 text-sm">
          {[str(item.data?.author), str(item.data?.publish_date) || str(item.data?.start_date)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      {item.image_url && <div className="mt-6" />}
      <Media src={item.image_url || ''} alt={item.title || ''} />
      {item.body ? (
        <Prose html={item.body} />
      ) : (
        <p className="text-muted-foreground mt-4">No content yet.</p>
      )}
    </article>
  );
}

function CardPreview({ item }: { item: ContentItem }) {
  return (
    <div className="surface-card mx-auto max-w-xl p-6">
      {item.category && (
        <p className="text-primary text-xs font-medium tracking-wider uppercase">{item.category}</p>
      )}
      <div className="flex items-center gap-3">
        {item.icon && !item.image_url && (
          <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
            {item.icon}
          </span>
        )}
        <h2 className="text-xl font-semibold">{item.title || 'Untitled'}</h2>
      </div>
      {item.subtitle && <p className="text-muted-foreground mt-2">{item.subtitle}</p>}
      <Media src={item.image_url || ''} alt={item.title || ''} />
      {item.body && <Prose html={item.body} />}
      {item.link_url && (
        <a href={item.link_url} className="text-primary mt-4 inline-block text-sm font-medium">
          {item.link_label || 'Learn more'} →
        </a>
      )}
    </div>
  );
}

function PricingPreview({ item }: { item: ContentItem }) {
  const features = toList(item.data?.features);
  return (
    <div className="surface-card mx-auto max-w-sm p-6">
      <h3 className="text-lg font-semibold">{item.title || 'Plan'}</h3>
      {item.subtitle && <p className="mt-1 text-3xl font-bold">{item.subtitle}</p>}
      {item.body && <p className="text-muted-foreground mt-2 text-sm">{item.body}</p>}
      {features.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
      {(item.link_label || item.link_url) && (
        <button className="bg-primary text-primary-foreground mt-6 w-full rounded-md py-2 text-sm font-medium">
          {item.link_label || 'Get started'}
        </button>
      )}
    </div>
  );
}

function FaqPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-xl font-semibold">{item.title || 'Question'}</h2>
      {item.category && <span className="text-muted-foreground text-xs">{item.category}</span>}
      {item.body ? (
        <Prose html={item.body} />
      ) : (
        <p className="text-muted-foreground mt-3">No answer yet.</p>
      )}
    </div>
  );
}

function ProfilePreview({ item }: { item: ContentItem }) {
  return (
    <div className="surface-card mx-auto max-w-sm p-6 text-center">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.title || ''}
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="bg-muted mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold">
          {(item.title || '?').charAt(0)}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold">{item.title || 'Team member'}</h3>
      {item.subtitle && <p className="text-primary text-sm">{item.subtitle}</p>}
      <p className="text-muted-foreground mt-1 text-xs">
        {[item.category, str(item.data?.location)].filter(Boolean).join(' · ')}
      </p>
      {item.body && <p className="text-muted-foreground mt-3 text-sm">{item.body}</p>}
    </div>
  );
}

function LogoPreview({ item }: { item: ContentItem }) {
  const quote = str(item.data?.testimonial);
  return (
    <div className="surface-card mx-auto max-w-xl p-6 text-center">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.title || ''} className="mx-auto h-12 object-contain" />
      ) : (
        <p className="text-lg font-semibold">{item.title}</p>
      )}
      {quote && <blockquote className="text-muted-foreground mt-4 italic">“{quote}”</blockquote>}
      {(str(item.data?.author) || str(item.data?.author_role)) && (
        <p className="mt-2 text-sm font-medium">
          {[str(item.data?.author), str(item.data?.author_role)].filter(Boolean).join(', ')}
        </p>
      )}
    </div>
  );
}

function StatPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-xs text-center">
      <p className="text-primary text-5xl font-bold">{str(item.data?.value) || '—'}</p>
      <p className="text-muted-foreground mt-2">{item.title || 'Statistic'}</p>
    </div>
  );
}

function GalleryPreview({ item }: { item: ContentItem }) {
  const extra = toList(item.data?.additional_images);
  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold">{item.title || 'Gallery'}</h2>
      <Media src={item.image_url || ''} alt={item.title || ''} />
      {extra.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {extra.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="aspect-square w-full rounded-md border object-cover"
            />
          ))}
        </div>
      )}
      {item.subtitle && <p className="text-muted-foreground mt-3 text-sm">{item.subtitle}</p>}
    </div>
  );
}

function VideoPreview({ item }: { item: ContentItem }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title || ''} className="h-full w-full object-cover" />
        ) : (
          <span className="text-muted-foreground text-sm">
            {str(item.data?.video_url) || 'Video'}
          </span>
        )}
      </div>
      <h2 className="mt-4 text-xl font-semibold">{item.title || 'Video'}</h2>
      {str(item.data?.duration) && (
        <span className="text-muted-foreground text-xs">{str(item.data?.duration)}</span>
      )}
      {item.subtitle && <p className="text-muted-foreground mt-2">{item.subtitle}</p>}
      {item.body && <Prose html={item.body} />}
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
