import { ProductDetailPage } from '@/components/products/ProductDetailPage';
import { devTools } from '@/lib/products';
import { constructMetadata, generateSoftwareSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

const title = 'Nazexa DEV Tools — JSON, API, JWT & SQL Developer Toolkit';
const description =
  'A single workspace for everyday developer tools: JSON formatter and validator, API request tester, JWT decoder, SQL formatter and Laravel code generators.';

export const metadata = constructMetadata({
  title,
  description,
  url: '/dev-tools',
});

export default function DevToolsPage() {
  return (
    <>
      <JsonLd
        schema={generateSoftwareSchema({
          name: 'Nazexa DEV Tools',
          description,
          url: '/dev-tools',
        })}
      />
      <ProductDetailPage product={devTools} />
    </>
  );
}
