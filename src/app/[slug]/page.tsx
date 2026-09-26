import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Renderer } from '@/lib/builder/Renderer';
import type { Metadata } from 'next';
import { PageSchema } from '@/lib/builder/types';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug: params.slug, published: true }
  });

  if (!page) return {};

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || page.description,
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await db.page.findUnique({
    where: { slug: params.slug, published: true }
  });

  if (!page) {
    notFound();
  }

  // Parse the published schema
  let schema: PageSchema | null = null;
  if (page.publishedData) {
    schema = typeof page.publishedData === 'string' ? JSON.parse(page.publishedData) : page.publishedData;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        {schema && schema.root ? (
          <Renderer element={schema.root} />
        ) : (
          <div className="container mx-auto py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
            {page.description && <p className="text-xl text-muted-foreground">{page.description}</p>}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
