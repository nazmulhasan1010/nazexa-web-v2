'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Boxes } from 'lucide-react';

import { MODEL_REGISTRY, MODEL_KEYS } from '@/lib/cms-models/registry';
import { modelCounts } from '@/lib/cms-models/actions';
import { cn } from '@/lib/utils';

export default function ModelsHub() {
  const [counts, setCounts] = useState<Record<string, { total: number; published: number }>>({});

  useEffect(() => {
    modelCounts()
      .then(setCounts)
      .catch(() => setCounts({}));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Pages &amp; Data</h1>
        <p className="text-muted-foreground mt-2">
          Structured content models behind the marketing pages — careers, resources, releases,
          roadmap and more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODEL_KEYS.map((key) => {
          const config = MODEL_REGISTRY[key]!;
          const entry = counts[key];
          return (
            <Link
              key={key}
              href={`/admin/models/${key}`}
              className="surface-card hover-lift group flex flex-col gap-3 p-5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Boxes className="text-primary h-5 w-5" />
                </div>
                <span className="text-muted-foreground group-hover:text-primary text-xs transition-colors">
                  Manage →
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{config.label}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {config.description}
                </p>
              </div>
              <div className="text-muted-foreground mt-auto flex items-center gap-3 text-xs">
                <span className={cn('font-medium', (entry?.total ?? 0) > 0 && 'text-foreground')}>
                  {entry?.total ?? 0} item{(entry?.total ?? 0) === 1 ? '' : 's'}
                </span>
                {entry && entry.total > 0 && <span>· {entry.published} published</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
