import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

const STATIC_ROUTES = [
  { label: 'Home', url: '/', category: 'Static' },
  { label: 'About', url: '/about', category: 'Static' },
  { label: 'Contact', url: '/contact', category: 'Static' },
  { label: 'Pricing', url: '/pricing', category: 'Static' },
  { label: 'Careers', url: '/careers', category: 'Static' },
  { label: 'Products', url: '/products', category: 'Static' },
  { label: 'Services', url: '/services', category: 'Static' },
  { label: 'Blog', url: '/blog', category: 'Static' },
  { label: 'FAQ', url: '/faq', category: 'Static' },
  { label: 'Support', url: '/support', category: 'Static' },
  { label: 'Documentation', url: '/documentation', category: 'Static' },
];

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').toLowerCase();
  
  if (!q) {
    return NextResponse.json([]);
  }

  const results = [];

  // Static routes
  const matchedStatic = STATIC_ROUTES.filter(r => r.label.toLowerCase().includes(q) || r.url.toLowerCase().includes(q));
  for (const r of matchedStatic) {
    results.push({
      id: `static-${r.url}`,
      label: r.label,
      url: r.url,
      source: 'static',
      sourceId: r.url,
      category: r.category,
    });
  }

  // 1. Search ContentItems (Products, Services, etc)
  const items = await db.contentItem.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q } },
        { slug: { contains: q } }
      ]
    },
    take: 10
  });

  for (const item of items) {
    results.push({
      id: item.id,
      label: item.title || item.slug,
      url: `/${item.collection}/${item.slug}`,
      source: 'content_library',
      sourceId: item.id,
      category: item.collection,
    });
  }

  // 2. Search Pages (Dynamic CMS Pages)
  const pages = await db.page.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q } },
        { slug: { contains: q } }
      ]
    },
    take: 10
  });

  for (const page of pages) {
    results.push({
      id: page.id,
      label: page.title || page.slug,
      url: `/${page.slug}`,
      source: 'page',
      sourceId: page.id,
      category: 'Pages',
    });
  }

  return NextResponse.json(results);
}
