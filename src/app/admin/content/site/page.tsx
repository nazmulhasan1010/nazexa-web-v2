'use client';

import { useSearchParams } from 'next/navigation';

import { ContentLibraryHub } from '@/components/admin/ContentLibraryHub';
import { ContentLibraryView } from '@/components/admin/ContentLibraryView';
import { CollectionEditor } from '@/components/admin/CollectionEditor';

const SITE_COLLECTIONS = ['pillars', 'missionvision', 'technologies', 'values', 'stats', 'process'];

export default function SiteContentPage() {
  const searchParams = useSearchParams();
  const collection = searchParams?.get('collection') ?? null;
  const mode = searchParams?.get('mode') ?? null;
  const isValid = collection !== null && SITE_COLLECTIONS.includes(collection);

  if (isValid && mode === 'reorder') {
    return (
      <CollectionEditor
        collection={collection}
        backHref="/admin/content/site"
        backLabel="Company & Site Content"
      />
    );
  }

  if (isValid) {
    return <ContentLibraryView collection={collection} backHref="/admin/content/site" />;
  }

  return (
    <ContentLibraryHub
      collections={SITE_COLLECTIONS}
      basePath="/admin/content/site"
      title="Company & Site Content"
      description="Manage the structural homepage sections — pillars, mission & vision, technology stack, values, company stats and delivery process steps."
    />
  );
}
