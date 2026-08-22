import { MetadataRoute } from 'next';

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nazexa.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/api-documentation',
    '/blog',
    '/careers',
    '/case-studies',
    '/changelog',
    '/community',
    '/contact',
    '/cookie-policy',
    '/customers',
    '/db-design',
    '/dev-tools',
    '/developer-blog',
    '/documentation',
    '/download-center',
    '/events',
    '/faq',
    '/feature-requests',
    '/industries',
    '/integrations',
    '/learning-center',
    '/news',
    '/partners',
    '/portfolio',
    '/press-kit',
    '/pricing',
    '/privacy',
    '/products',
    '/release-notes',
    '/resources',
    '/roadmap',
    '/security',
    '/services',
    '/solutions',
    '/status',
    '/support',
    '/team',
    '/terms',
    '/tutorials',
  ].map((route) => ({
    url: `${defaultUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === '' || route.startsWith('/blog') ? 'daily' : ('weekly' as any),
    priority: route === '' ? 1 : route === '/db-design' || route === '/dev-tools' ? 0.9 : 0.8,
  }));

  return routes;
}
