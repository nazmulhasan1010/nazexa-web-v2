import { fetchHomeSections } from '@/lib/cms';
import { renderSection, defaultHomeSections } from '@/lib/home-sections';
import { constructMetadata, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

const HOME_TITLE = 'Nazexa — Software Development & Technology Company';
const HOME_DESCRIPTION =
  'Nazexa builds custom software, Android apps, web platforms, APIs, databases and cloud solutions — and ships its own developer products. Start your project with a senior engineering team.';

export const metadata = constructMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  url: '/',
});

export default async function Index() {
  const rows = await fetchHomeSections();
  const sections = rows?.length ? rows : defaultHomeSections();

  return (
    <>
      <JsonLd schema={generateWebSiteSchema()} />
      <JsonLd
        schema={generateWebPageSchema({
          name: HOME_TITLE,
          description: HOME_DESCRIPTION,
          url: '/',
        })}
      />
      {sections.filter((s) => s.visible).map((s) => renderSection(s))}
    </>
  );
}
