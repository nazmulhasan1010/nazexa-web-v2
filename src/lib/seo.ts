import { Metadata } from 'next';

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nazexa.com';

export function constructMetadata({
  title,
  description = 'Databases, edge compute, auth, AI and observability in one coherent platform.',
  image = '/logos/logo.png',
  icons = '/logos/logo-sm.svg',
  noIndex = false,
  url,
  type = 'website',
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  url?: string;
  type?: 'website' | 'article';
} = {}): Metadata {
  const metadataBase = new URL(defaultUrl);

  // Clean up title structure if it's meant to be a template or exact string.
  // We'll let Next.js title template in layout handle suffixing where possible,
  // but if we pass a full string we can just set it.

  return {
    title,
    description,
    applicationName: 'Nazexa',
    appleWebApp: {
      title: 'Nazexa',
      statusBarStyle: 'default',
    },
    openGraph: {
      title,
      description,
      type,
      url: url ? `${defaultUrl}${url}` : defaultUrl,
      siteName: 'Nazexa',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || 'Nazexa',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nazexa',
      creator: '@nazexa',
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase,
    alternates: {
      canonical: url ? `${defaultUrl}${url}` : defaultUrl,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nazexa',
    url: defaultUrl,
    logo: `${defaultUrl}/logos/logo.png`,
    image: `${defaultUrl}/logos/logo.png`,
    description: 'Developer platform for databases, edge compute, auth, AI and observability.',
    sameAs: ['https://twitter.com/nazexa', 'https://github.com/nazexa'],
  };
}

export function generateWebPageSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${defaultUrl}${url}`,
    publisher: {
      '@type': 'Organization',
      name: 'Nazexa',
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nazexa',
    url: defaultUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateSoftwareSchema({
  name,
  description,
  applicationCategory = 'DeveloperApplication',
  url,
}: {
  name: string;
  description: string;
  applicationCategory?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem: 'Web',
    url: `${defaultUrl}${url}`,
    publisher: {
      '@type': 'Organization',
      name: 'Nazexa',
    },
  };
}
