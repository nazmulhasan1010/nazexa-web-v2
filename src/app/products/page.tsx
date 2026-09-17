import { constructMetadata } from '@/lib/seo';
import { ProductsIndex } from '@/components/products/ProductsIndex';
import { fetchContentItems } from '@/lib/cms';
import { pages } from '@/lib/site-content';

const basePage = pages['products'];

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/products',
});

export default async function ProductsPage() {
  const dynamicProducts = await fetchContentItems('products');

  return <ProductsIndex dynamicProducts={dynamicProducts} />;
}
