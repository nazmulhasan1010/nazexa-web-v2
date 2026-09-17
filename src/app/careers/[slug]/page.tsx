import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';

import { constructMetadata } from '@/lib/seo';
import { PageHero, Section } from '@/components/site/PageShell';
import { Button } from '@/components/ui/button';
import { getJobBySlug, parseList } from '@/lib/cms-models/public';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  return constructMetadata({
    title: job ? `${job.title} — Careers` : 'Careers',
    description: job?.excerpt || undefined,
    url: `/careers/${slug}`,
  });
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const responsibilities = parseList(job.responsibilities);
  const requirements = parseList(job.requirements);
  const meta = [job.department, job.location, job.level, job.remote ? 'Remote' : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageHero eyebrow={meta || 'Careers'} title={job.title} description={job.excerpt || ''}>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="glow-ring">
            <a href={job.apply_url || '/contact'}>Apply now</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/careers">All roles</Link>
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="mx-auto max-w-3xl">
          {job.body ? (
            <div
              className="prose prose-sm dark:prose-invert prose-p:leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{ __html: job.body }}
            />
          ) : null}

          {responsibilities.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">What you'll do</h2>
              <ul className="mt-4 space-y-2">
                {responsibilities.map((r) => (
                  <li key={r} className="text-muted-foreground flex gap-2 text-sm">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requirements.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">What we're looking for</h2>
              <ul className="mt-4 space-y-2">
                {requirements.map((r) => (
                  <li key={r} className="text-muted-foreground flex gap-2 text-sm">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" className="glow-ring">
              <a href={job.apply_url || '/contact'}>Apply for this role</a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
