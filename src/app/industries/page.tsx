import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { StandardPage } from "@/components/site/PageShell";
import { pages } from "@/lib/site-content";
import { fetchContentItems } from "@/lib/cms";

const basePage = pages["industries"]!;

export const metadata = constructMetadata({
  title: typeof page !== "undefined" && page.title ? page.title : undefined,
  description:
    typeof page !== "undefined" && page.description
      ? page.description
      : undefined,
  url: "/industries",
});

export default async function Page() {
  const page = { ...basePage };
  const industriesItems = await fetchContentItems("industries");

  if (industriesItems.length > 0) {
    const cardsBlock = {
      kind: "cards" as const,
      title: "Industry coverage",
      items: industriesItems.map((i) => ({
        tag: i.title || "Industry",
        title: i.title || "",
        body: i.subtitle || (i.body as string) || "",
        meta: (i.data?.meta as string) || "",
      })),
    };

    page.blocks = [
      cardsBlock,
      ...page.blocks.filter((b) => b.kind !== "features"),
    ];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.title,
            description: page.description,
          }),
        }}
      />
      <StandardPage page={page} />
    </>
  );
}
