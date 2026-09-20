import { db as prisma } from '@/lib/db';
import menus from '@/data/menus.json';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string | null;
  url: string;
  isDraft: boolean;
  score?: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
}

export interface SearchGroup {
  group: string;
  items: SearchResult[];
}

/**
 * Global search service across all CMS content models.
 * Strictly searches published public data for the website frontend.
 */
export async function globalCmsSearch({ query, limit = 5 }: SearchOptions): Promise<SearchGroup[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const q = query.trim();

  // Run parallel queries against major CMS models (strictly published only)
  const [
    pages,
    contentItems,
    resources,
    docArticles,
    releases,
    jobPostings
  ] = await Promise.all([
    // 1. Core Pages
    prisma.page.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, description: true, slug: true, published: true }
    }),
    
    // 2. Generic Content Items (Products, FAQs, Blogs, etc.)
    prisma.contentItem.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { subtitle: { contains: q } },
        ]
      },
      take: limit * 2, // Take more since it's multiplexed
      select: { id: true, title: true, subtitle: true, slug: true, published: true, collection: true }
    }),

    // 3. Resources
    prisma.resource.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, excerpt: true, slug: true, published: true }
    }),

    // 4. Docs
    prisma.docArticle.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, excerpt: true, slug: true, published: true }
    }),

    // 5. Releases
    prisma.release.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, slug: true, published: true }
    }),

    // 6. Jobs
    prisma.jobPosting.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, excerpt: true, slug: true, published: true }
    })
  ]);

  // Aggregate into standard groupings
  const groups: SearchGroup[] = [];

  const addGroup = (groupName: string, items: SearchResult[]) => {
    if (items.length > 0) {
      groups.push({ group: groupName, items });
    }
  };

  // 1. Navigation Menus & Submenus
  const lowerQ = q.toLowerCase();
  const menuResults: SearchResult[] = [];
  const subMenuResults: SearchResult[] = [];

  for (const group of menus) {
    if (group.label.toLowerCase().includes(lowerQ)) {
      menuResults.push({
        id: `menu-${group.label}`,
        type: 'Menu',
        title: group.label,
        excerpt: 'Navigation Menu',
        url: group.items[0]?.to || '#',
        isDraft: false
      });
    }
    for (const item of group.items) {
      if (item.title.toLowerCase().includes(lowerQ) || item.description.toLowerCase().includes(lowerQ)) {
        subMenuResults.push({
          id: `submenu-${item.title}`,
          type: 'Submenu',
          title: item.title,
          excerpt: item.description,
          url: item.to,
          isDraft: false
        });
      }
    }
  }

  addGroup('Menus', menuResults.slice(0, limit));
  addGroup('Submenus', subMenuResults.slice(0, limit));

  // Pages
  addGroup('Pages', pages.map((p: any) => ({
    id: p.id,
    type: 'Page',
    title: p.title,
    excerpt: p.description,
    url: `/${p.slug.replace(/^\//, '')}`,
    isDraft: false
  })));

  // Group generic content items dynamically by their collection
  const collectionMap = new Map<string, SearchResult[]>();
  for (const item of contentItems) {
    const col = item.collection.charAt(0).toUpperCase() + item.collection.slice(1);
    if (!collectionMap.has(col)) collectionMap.set(col, []);
    
    // Simple heuristic for public URLs based on common collections
    let publicUrl = `/${item.collection}/${item.slug}`;
    if (item.collection === 'products') publicUrl = `/products/${item.slug}`;
    else if (item.collection === 'blog') publicUrl = `/blog/${item.slug}`;
    else if (item.collection === 'news') publicUrl = `/news/${item.slug}`;
    else if (item.collection === 'faq') publicUrl = `/faq`;
    
    collectionMap.get(col)!.push({
      id: item.id,
      type: col,
      title: item.title || 'Untitled',
      excerpt: item.subtitle,
      url: publicUrl,
      isDraft: false
    });
  }
  for (const [colName, items] of Array.from(collectionMap.entries())) {
    addGroup(colName, items);
  }

  // Resources
  addGroup('Resources', resources.map((r: any) => ({
    id: r.id,
    type: 'Resource',
    title: r.title,
    excerpt: r.excerpt,
    url: `/resources/${r.slug}`,
    isDraft: false
  })));

  // Docs
  addGroup('Documentation', docArticles.map((d: any) => ({
    id: d.id,
    type: 'DocArticle',
    title: d.title,
    excerpt: d.excerpt,
    url: `/documentation/${d.slug}`,
    isDraft: false
  })));

  // Releases
  addGroup('Releases', releases.map((r: any) => ({
    id: r.id,
    type: 'Release',
    title: r.title,
    excerpt: null,
    url: `/release-notes/${r.slug}`,
    isDraft: false
  })));

  // Jobs
  addGroup('Jobs', jobPostings.map((j: any) => ({
    id: j.id,
    type: 'Job',
    title: j.title,
    excerpt: j.excerpt,
    url: `/careers/${j.slug}`,
    isDraft: false
  })));

  return groups;
}
