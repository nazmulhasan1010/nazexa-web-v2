import { fetchHomeSections, fetchHomepageDraft } from '@/lib/cms';
import { defaultHomeSections } from '@/lib/home-sections';
import { HomePreviewClient } from './HomePreviewClient';

// Live homepage preview surface, embedded as an iframe by the Homepage Builder.
// Uses the real root layout (site header/footer) so the preview matches production.
export const dynamic = 'force-dynamic';

export default async function HomePreviewPage() {
  const [live, draft] = await Promise.all([fetchHomeSections(), fetchHomepageDraft()]);
  const initial = draft?.sections?.length
    ? draft.sections
    : live?.length
      ? live
      : defaultHomeSections();

  return <HomePreviewClient initial={initial} />;
}
