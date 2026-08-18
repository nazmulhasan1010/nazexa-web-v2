import { constructMetadata } from "@/lib/seo";
import { ProductsIndex } from "@/components/products/ProductsIndex";
import { fetchContentItems } from "@/lib/cms";

export const metadata = constructMetadata({
  title: typeof page !== "undefined" && page.title ? page.title : undefined,
  description:
    typeof page !== "undefined" && page.description
      ? page.description
      : undefined,
  url: "/products",
});

export default async function ProductsPage() {
  const dynamicProducts = await fetchContentItems("products");

  return <ProductsIndex dynamicProducts={dynamicProducts} />;
}
