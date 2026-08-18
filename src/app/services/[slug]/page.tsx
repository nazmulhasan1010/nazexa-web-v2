import { ServiceDetail } from "@/components/services/ServiceDetail";
import { serviceBySlug } from "@/lib/services";
import { notFound } from "next/navigation";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return notFound();

  return <ServiceDetail service={service} />;
}
