import { notFound } from 'next/navigation';

import { fetchContentItemById } from '@/lib/cms';
import { ContentPreviewClient } from './ContentPreviewClient';

export const dynamic = 'force-dynamic';

export default async function ContentPreviewPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;
  const item = await fetchContentItemById(id);
  if (!item) notFound();
  return <ContentPreviewClient collection={collection} initial={item} />;
}
