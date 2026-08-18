import { fetchHomeSections } from "@/lib/cms";
import {
  BlogPreview,
  FinalCta,
  Hero,
  FeatureGrid,
  FaqPreview,
  PlatformOverview,
  Stats,
  TechStack,
  Testimonials,
  Timeline,
  TrustedBy,
} from "@/components/home/HomeSections";
import {
  ClientCta,
  MissionVision,
  OwnProducts,
  ProcessSection,
  ServicesSection,
  TechnologiesSection,
  WhatWeDo,
  WhyNazexaSection,
} from "@/components/home/CompanySections";
import { ServicesShowcase } from "@/components/services/ServicesIndex";
import {
  constructMetadata,
  generateWebPageSchema,
  generateWebSiteSchema,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata = constructMetadata({
  title: "Nazexa — Software Development & Technology Company",
  description:
    "Nazexa builds custom software, Android apps, web platforms, APIs, databases and cloud solutions — and ships its own developer products. Start your project with a senior engineering team.",
  url: "/",
});

export default async function Index() {
  const data = await fetchHomeSections();

  if (data?.length) {
    return (
      <>
        <JsonLd schema={generateWebSiteSchema()} />
        <JsonLd
          schema={generateWebPageSchema({
            name: "Nazexa — Software Development & Technology Company",
            description:
              "Nazexa builds custom software, Android apps, web platforms, APIs, databases and cloud solutions — and ships its own developer products. Start your project with a senior engineering team.",
            url: "/",
          })}
        />
        {data
          .filter((s) => s.visible)
          .map((s) => {
            switch (s.type) {
              case "hero":
                return (
                  <Hero
                    key={s.id}
                    title={s.title ?? undefined}
                    subtitle={s.subtitle ?? undefined}
                    badge={(s.content["badge"] as string) || undefined}
                    body={(s.content["body"] as string) || undefined}
                    primaryCta={
                      (s.content["primaryCta"] as string) || undefined
                    }
                    secondaryCta={
                      (s.content["secondaryCta"] as string) || undefined
                    }
                  />
                );
              case "trusted":
                return <TrustedBy key={s.id} />;
              case "features":
                return <FeatureGrid key={s.id} />;
              case "services":
                return <ServicesShowcase key={s.id} />;
              case "whatwedo":
                return (
                  <WhatWeDo
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "servicesfull":
                return (
                  <ServicesSection
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "mission":
                return (
                  <MissionVision
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "technologies":
                return (
                  <TechnologiesSection
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "why":
                return (
                  <WhyNazexaSection
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "process":
                return (
                  <ProcessSection
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "ourproducts":
                return (
                  <OwnProducts
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "clientcta":
                return (
                  <ClientCta
                    key={s.id}
                    title={s.title}
                    subtitle={s.subtitle}
                    content={s.content}
                  />
                );
              case "platform":
                return <PlatformOverview key={s.id} />;
              case "stats":
                return <Stats key={s.id} />;
              case "testimonials":
                return <Testimonials key={s.id} />;
              case "timeline":
                return <Timeline key={s.id} />;
              case "techstack":
                return <TechStack key={s.id} />;
              case "blog":
                return <BlogPreview key={s.id} />;
              case "faq":
                return <FaqPreview key={s.id} />;
              case "cta":
                return <FinalCta key={s.id} />;
              default:
                return null;
            }
          })}
      </>
    );
  }

  return (
    <>
      <JsonLd schema={generateWebSiteSchema()} />
      <JsonLd
        schema={generateWebPageSchema({
          name: "Nazexa — Software Development & Technology Company",
          description:
            "Nazexa builds custom software, Android apps, web platforms, APIs, databases and cloud solutions — and ships its own developer products. Start your project with a senior engineering team.",
          url: "/",
        })}
      />
      <Hero />
      <TrustedBy />
      <WhatWeDo />
      <ServicesSection />
      <MissionVision />
      <TechnologiesSection />
      <Stats />
      <WhyNazexaSection />
      <ProcessSection />
      <OwnProducts />
      <Testimonials />
      <FaqPreview />
      <ClientCta />
    </>
  );
}
