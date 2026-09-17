'use client';

import { useSearchParams } from 'next/navigation';

import { ContentLibraryHub } from '@/components/admin/ContentLibraryHub';
import { ContentLibraryView } from '@/components/admin/ContentLibraryView';
import { CollectionEditor } from '@/components/admin/CollectionEditor';

const LIBRARY_COLLECTIONS = [
  'blog',
  'announcement',
  'video',
  'gallery',
  'document',
  'faq',
  'products',
  'services',
  'solutions',
  'industries',
  'case-studies',
  'portfolio',
  'news',
  'integrations',
  'events',
  'team',
  'customers',
  'partners',
  'pricing',
  'tutorials',
  'community',
];

export default function ContentPage() {
  const searchParams = useSearchParams();
  const collection = searchParams?.get('collection') ?? null;
  const mode = searchParams?.get('mode') ?? null;
  const isValid = collection !== null && LIBRARY_COLLECTIONS.includes(collection);

  if (isValid && mode === 'reorder') {
    return (
      <CollectionEditor
        collection={collection}
        backHref="/admin/content"
        backLabel="Content Library"
      />
    );
  }

  if (isValid) {
    return <ContentLibraryView collection={collection} backHref="/admin/content" />;
  }

  return (
    <ContentLibraryHub
      collections={LIBRARY_COLLECTIONS}
      basePath="/admin/content"
      title="Content Library"
      description="Search, preview, and manage every content type. Select a collection to add, edit, publish or reorder entries."
    />
  );
}
