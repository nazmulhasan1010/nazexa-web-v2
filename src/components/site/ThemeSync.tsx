'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { FullThemeVars } from '@/lib/theme-registry';
import { useLogo } from '@/hooks/useLogo';
import { resolveThemeLogo } from '@/lib/theme-utils';

/** 
 * ThemeSync handles:
 * 1. Updating the data-theme attribute during client-side SPA navigations.
 * 2. Live Preview messages from the Theme Builder.
 * 
 * Initial rendering is handled synchronously via ServerThemeSync in RootLayout.
 */
export function ThemeSync() {
  const pathname = usePathname();
  const { setPreviewLogos } = useLogo();

  // Sync data-theme on client-side SPA navigations
  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      document.documentElement.setAttribute('data-theme', 'admin');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [pathname]);

  useEffect(() => {
    // Listen for live preview updates from Theme Builder
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'NAZEXA_THEME_PREVIEW' && e.data.theme) {
        const previewVars = e.data.theme as FullThemeVars;
        const root = document.documentElement;
        
        for (const [key, value] of Object.entries(previewVars)) {
          const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(`--${kebabKey}`, value as string);
        }

        // Dynamically update the logo based on the new background color during preview
        if (previewVars.background) {
          const newLogo = resolveThemeLogo(previewVars.background);
          
          // Determine if we are previewing frontend or admin
          // The Theme Builder passes a scope or we can just infer by current path
          if (window.location.pathname.startsWith('/admin')) {
            setPreviewLogos({ adminLogo: newLogo });
          } else {
            setPreviewLogos({ frontendLogo: newLogo });
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    
    // Announce readiness to the parent (if we are in an iframe)
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'NAZEXA_THEME_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
}
