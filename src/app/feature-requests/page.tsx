import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { constructMetadata } from '@/lib/seo';
import { PageHero, PageBlocks } from '@/components/site/PageShell';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/Reveal';
import { pages } from '@/lib/site-content';
import { getFeatureRequests } from '@/lib/cms-models/public';
import { FeatureVoteBoard } from '@/components/site/FeatureVoteBoard';

const basePage = pages['feature-requests']!;

export const metadata = constructMetadata({
  title: basePage?.title || undefined,
  description: basePage?.description || undefined,
  url: '/feature-requests',
});

export default async function Page() {
  const requests = await getFeatureRequests();
  const board = requests.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    status: r.status,
    category: r.category,
    vote_count: r.vote_count,
  }));
  // Keep every static block except the hardcoded "Most requested" cards, which the live board replaces.
  const restBlocks = basePage.blocks.filter((b) => b.kind !== 'cards');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: basePage.title,
            description: basePage.description,
          }),
        }}
      />
      <PageHero
        eyebrow={basePage.eyebrow}
        title={basePage.title}
        description={basePage.description}
      >
        {basePage.intro ? (
          <Reveal variant="up" delay={220}>
            <p className="text-muted-foreground/80 mx-auto mt-5 max-w-2xl text-sm">
              {basePage.intro}
            </p>
          </Reveal>
        ) : null}
        <Reveal variant="up" delay={280}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="glow-ring">
              <Link href="/contact">
                Suggest a feature <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/roadmap">See the roadmap</Link>
            </Button>
          </div>
        </Reveal>
      </PageHero>

      <FeatureVoteBoard requests={board} />

      <PageBlocks blocks={restBlocks} />
    </>
  );
}
