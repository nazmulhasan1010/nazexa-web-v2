import type { Metadata } from 'next';
import { Providers } from './Providers';
import { constructMetadata, generateOrganizationSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { fetchContentItems } from '@/lib/cms';
import '../styles.css';

export const metadata: Metadata = {
  ...constructMetadata({
    description:
      'Nazexa unifies databases, edge compute, auth, AI and observability into one premium developer platform.',
  }),
  title: {
    template: '%s | Nazexa',
    default: 'Nazexa — The developer platform for teams who ship',
  },
  authors: [{ name: 'Nazexa' }],
  keywords: ['nazexa', 'developer platform', 'database', 'edge compute', 'AI', 'observability'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dynamicProducts = await fetchContentItems('products');

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link rel="icon" href="/logos/logo-sm.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logos/logo.png" />
        <link rel="icon" href="/logos/logo.png" sizes="192x192" />
        <JsonLd schema={generateOrganizationSchema()} />
      </head>
      <body>
        <Providers products={dynamicProducts}>{children}</Providers>
      </body>
    </html>
  );
}
