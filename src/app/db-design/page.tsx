import { ProductDetailPage } from '@/components/products/ProductDetailPage';
import { dbDesign } from '@/lib/products';
import { constructMetadata, generateSoftwareSchema } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

const title = 'Nazexa DB Design — Visual Database & ERD Designer';
const description =
  'Design schemas, ERDs, tables, indexes and relationships visually, then export SQL, JSON, Laravel models and migrations for MySQL, PostgreSQL and SQLite.';

export const metadata = constructMetadata({
  title,
  description,
  url: '/db-design',
});

export default function DbDesignPage() {
  return (
    <>
      <JsonLd
        schema={generateSoftwareSchema({
          name: 'Nazexa DB Design',
          description,
          url: '/db-design',
        })}
      />
      <ProductDetailPage product={dbDesign} />
    </>
  );
}
