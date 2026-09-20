import type { Metadata } from 'next';
import { Providers } from './Providers';
import { constructMetadata, generateOrganizationSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { fetchContentItems, fetchSiteSettings } from '@/lib/cms';
import { PRESET_THEMES, type FullThemeVars } from '@/lib/theme-registry';
import { ServerThemeSync } from '@/components/site/ServerThemeSync';
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
  const [dynamicProducts, siteSettings] = await Promise.all([
    fetchContentItems('products'),
    fetchSiteSettings(),
  ]);

  let frontendVars: FullThemeVars | undefined;
  let adminVars: FullThemeVars | undefined;
  const themeObj = siteSettings?.theme;

  if (themeObj) {
    const activeFrontId = themeObj.frontend?.activeThemeId || 'preset-aurora';
    const presetFront = PRESET_THEMES.find((p) => p.id === activeFrontId);
    if (presetFront) frontendVars = presetFront.vars;
    else {
      const custom = themeObj.frontend?.customThemes?.find((c: any) => c.id === activeFrontId);
      if (custom) frontendVars = custom.vars;
    }

    const activeAdminId = themeObj.admin?.activeThemeId || 'preset-midnight';
    const presetAdmin = PRESET_THEMES.find((p) => p.id === activeAdminId);
    if (presetAdmin) adminVars = presetAdmin.vars;
    else {
      const custom = themeObj.admin?.customThemes?.find((c: any) => c.id === activeAdminId);
      if (custom) adminVars = custom.vars;
    }
  }

  // Fallbacks
  if (!frontendVars) frontendVars = PRESET_THEMES.find((p) => p.id === 'preset-aurora')?.vars;
  if (!adminVars) adminVars = PRESET_THEMES.find((p) => p.id === 'preset-midnight')?.vars;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ServerThemeSync 
          frontendVars={frontendVars} 
          adminVars={adminVars} 
          brand1={themeObj?.frontend?.brand1}
          brand2={themeObj?.frontend?.brand2}
          brand3={themeObj?.frontend?.brand3}
          radius={themeObj?.frontend?.radius}
        />
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
