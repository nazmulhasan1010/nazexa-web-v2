import { db as prisma } from '@/lib/db';

export interface AdminSearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string | null;
  url: string;
  isDraft: boolean;
}

export interface AdminSearchOptions {
  query: string;
  limit?: number;
}

export interface AdminSearchGroup {
  group: string;
  items: AdminSearchResult[];
}

/**
 * Dedicated Admin Search service across all CMS content models.
 * Never checks 'published' state (always includes drafts).
 * URLs always point to the CMS Edit routes.
 */
export async function adminCmsSearch({ query, limit = 5 }: AdminSearchOptions): Promise<AdminSearchGroup[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const q = query.trim();

  // Run parallel queries against major CMS models (NO publish filter)
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
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { slug: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, description: true, slug: true, published: true }
    }),
    
    // 2. Generic Content Items (Products, FAQs, Blogs, etc.)
    prisma.contentItem.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { subtitle: { contains: q } },
          { slug: { contains: q } },
        ]
      },
      take: limit * 2, // Take more since it's multiplexed
      select: { id: true, title: true, subtitle: true, slug: true, published: true, collection: true }
    }),

    // 3. Resources
    prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { slug: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, excerpt: true, slug: true, published: true }
    }),

    // 4. Docs
    prisma.docArticle.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { slug: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, excerpt: true, slug: true, published: true }
    }),

    // 5. Releases
    prisma.release.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { slug: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, slug: true, published: true }
    }),

    // 6. Jobs
    prisma.jobPosting.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { slug: { contains: q } },
        ]
      },
      take: limit,
      select: { id: true, title: true, excerpt: true, slug: true, published: true }
    })
  ]);

  // Aggregate into standard groupings
  const groups: AdminSearchGroup[] = [];

  const addGroup = (groupName: string, items: AdminSearchResult[]) => {
    if (items.length > 0) {
      groups.push({ group: groupName, items });
    }
  };



  // Pages
  addGroup('Pages', pages.map((p) => ({
    id: p.id,
    type: 'Page',
    title: p.title,
    excerpt: p.description,
    url: `/admin/pages?edit=${p.id}`,
    isDraft: !p.published
  })));

  // Group generic content items dynamically by their collection
  const collectionMap = new Map<string, AdminSearchResult[]>();
  for (const item of contentItems) {
    const col = item.collection.charAt(0).toUpperCase() + item.collection.slice(1);
    if (!collectionMap.has(col)) collectionMap.set(col, []);
    
    collectionMap.get(col)!.push({
      id: item.id,
      type: col,
      title: item.title || 'Untitled',
      excerpt: item.subtitle,
      url: `/admin/content/${item.collection}?edit=${item.id}`,
      isDraft: !item.published
    });
  }
  for (const [colName, items] of Array.from(collectionMap.entries())) {
    addGroup(colName, items);
  }

  // Resources
  addGroup('Resources', resources.map((r) => ({
    id: r.id,
    type: 'Resource',
    title: r.title,
    excerpt: r.excerpt,
    url: `/admin/resources?edit=${r.id}`,
    isDraft: !r.published
  })));

  // Docs
  addGroup('Documentation', docArticles.map((d) => ({
    id: d.id,
    type: 'DocArticle',
    title: d.title,
    excerpt: d.excerpt,
    url: `/admin/docs?edit=${d.id}`,
    isDraft: !d.published
  })));

  // Releases
  addGroup('Releases', releases.map((r) => ({
    id: r.id,
    type: 'Release',
    title: r.title,
    excerpt: null,
    url: `/admin/releases?edit=${r.id}`,
    isDraft: !r.published
  })));

  // Jobs
  addGroup('Jobs', jobPostings.map((j) => ({
    id: j.id,
    type: 'Job',
    title: j.title,
    excerpt: j.excerpt,
    url: `/admin/jobs?edit=${j.id}`,
    isDraft: !j.published
  })));

  return groups;
}
