import { notFound } from 'next/navigation';

import { ModelListView } from '@/components/admin/models/ModelListView';
import { MODEL_REGISTRY } from '@/lib/cms-models/registry';

export default async function ModelAdminPage({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  if (!MODEL_REGISTRY[model]) notFound();
  return <ModelListView modelKey={model} backHref="/admin/models" />;
}
