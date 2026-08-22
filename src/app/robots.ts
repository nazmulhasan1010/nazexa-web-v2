import { MetadataRoute } from 'next';

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nazexa.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/private/', '/api/', '/_next/'],
    },
    sitemap: `${defaultUrl}/sitemap.xml`,
  };
}
