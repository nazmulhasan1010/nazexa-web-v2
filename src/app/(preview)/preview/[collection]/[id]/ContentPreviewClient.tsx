'use client';

import { useEffect, useState } from 'react';

import type { ContentItem } from '@/lib/cms';
import { renderContentPreview } from '@/lib/content-preview';

// Single-item preview surface. Live-syncs unsaved edits from the admin (parent window) via postMessage.
export function ContentPreviewClient({
  collection,
  initial,
}: {
  collection: string;
  initial: ContentItem;
}) {
  const [item, setItem] = useState<ContentItem>(initial);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; item?: ContentItem };
      if (data?.type === 'nazexa:preview-item' && data.item) setItem(data.item);
    }
    window.addEventListener('message', onMessage);
    try {
      window.parent?.postMessage({ type: 'nazexa:preview-ready' }, window.location.origin);
    } catch {
      /* not embedded */
    }
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return <div className="px-4 py-10">{renderContentPreview(collection, item)}</div>;
}
