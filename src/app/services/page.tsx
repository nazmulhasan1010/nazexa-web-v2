import { constructMetadata } from "@/lib/seo";
import { ServicesIndex } from "@/components/services/ServicesIndex";
import { fetchContentItems } from "@/lib/cms";

export const metadata = constructMetadata({
  title: typeof page !== "undefined" && page.title ? page.title : undefined,
  description:
    typeof page !== "undefined" && page.description
      ? page.description
      : undefined,
  url: "/services",
});

export default async function Page() {
  const cmsServices = await fetchContentItems("services");
  return <ServicesIndex cmsServices={cmsServices} />;
}
