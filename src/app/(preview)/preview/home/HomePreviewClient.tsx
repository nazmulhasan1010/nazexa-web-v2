'use client';

import { useEffect, useState } from 'react';

import type { HomeSection } from '@/lib/cms';
import { renderSection } from '@/lib/home-sections';

// Renders homepage sections and live-syncs with the Homepage Builder (parent window)
// via postMessage. Falls back to the server-provided initial sections before any message.
export function HomePreviewClient({ initial }: { initial: HomeSection[] }) {
  const [sections, setSections] = useState<HomeSection[]>(initial);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; sections?: HomeSection[] };
      if (data?.type === 'nazexa:preview' && Array.isArray(data.sections)) {
        setSections(data.sections);
      }
    }
    window.addEventListener('message', onMessage);
    // Announce readiness so the builder can push the current working draft immediately.
    try {
      window.parent?.postMessage({ type: 'nazexa:preview-ready' }, window.location.origin);
    } catch {
      /* not embedded */
    }
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return <>{sections.filter((s) => s.visible).map((s) => renderSection(s))}</>;
}
