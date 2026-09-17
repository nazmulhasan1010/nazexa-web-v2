import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const slug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function seedModel(delegate, rows, label) {
  const existing = await db[delegate].count();
  if (existing > 0) return `${label}: skipped (${existing})`;
  for (let i = 0; i < rows.length; i++) {
    await db[delegate].create({ data: { position: i, published: true, ...rows[i] } });
  }
  return `${label}: seeded ${rows.length}`;
}

async function seedCollection(collection, rows, label) {
  const existing = await db.contentItem.count({ where: { collection } });
  if (existing > 0) return `${label}: skipped (${existing})`;
  await db.contentItem.createMany({
    data: rows.map((r, i) => ({
      collection,
      slug: slug(r.title || `${collection}-${i}`),
      position: i,
      published: true,
      title: r.title ?? null,
      subtitle: r.subtitle ?? null,
      body: r.body ?? null,
      category: r.category ?? null,
      icon: r.icon ?? null,
      link_url: r.link_url ?? null,
      link_label: r.link_label ?? null,
      data: JSON.stringify(r.data ?? {}),
    })),
  });
  return `${label}: seeded ${rows.length}`;
}

async function main() {
  const out = [];

  out.push(
    await seedModel(
      'jobPosting',
      [
        {
          title: 'Staff Engineer, Storage',
          slug: 'staff-engineer-storage',
          department: 'Core',
          location: 'EU remote',
          level: 'Staff',
          employment_type: 'Full-time',
          remote: true,
          excerpt: 'Own the durability and performance of our managed database layer.',
          body: '<p>You will lead the design of our branchable storage engine and its replication story.</p>',
          responsibilities: JSON.stringify([
            'Design storage internals',
            'Lead replication + failover work',
            'Mentor senior engineers',
          ]),
          requirements: JSON.stringify([
            '8+ years systems engineering',
            'Deep Postgres or storage internals',
            'Rust or C++',
          ]),
          apply_url: '/contact',
          featured: true,
          posted_at: new Date('2026-07-20'),
        },
        {
          title: 'Senior Frontend Engineer',
          slug: 'senior-frontend-engineer',
          department: 'Product',
          location: 'Remote',
          level: 'Senior',
          employment_type: 'Full-time',
          remote: true,
          excerpt: 'Build the dashboard and developer experience used by thousands of teams.',
          body: '<p>Craft fast, accessible product surfaces in React and TypeScript.</p>',
          responsibilities: JSON.stringify([
            'Ship product UI',
            'Own a11y + performance',
            'Partner with design',
          ]),
          requirements: JSON.stringify([
            '5+ years React/TypeScript',
            'Strong product sense',
            'Care about DX',
          ]),
          apply_url: '/contact',
          posted_at: new Date('2026-08-01'),
        },
        {
          title: 'Developer Advocate',
          slug: 'developer-advocate',
          department: 'Community',
          location: 'US remote',
          level: 'Mid',
          employment_type: 'Full-time',
          remote: true,
          excerpt: 'Help developers succeed through docs, talks and sample apps.',
          body: '<p>Be the voice of the developer inside Nazexa.</p>',
          responsibilities: JSON.stringify([
            'Write tutorials + talks',
            'Grow the community',
            'Feed insights to product',
          ]),
          requirements: JSON.stringify([
            'Strong writing + speaking',
            'Hands-on engineering background',
          ]),
          apply_url: '/contact',
          posted_at: new Date('2026-08-10'),
        },
      ],
      'job_postings'
    )
  );

  out.push(
    await seedModel(
      'resource',
      [
        {
          title: 'State of Platform Engineering 2026',
          slug: 'state-of-platform-engineering-2026',
          type: 'Report',
          format: 'PDF · 48 pages',
          excerpt: 'Benchmarks and trends from 1,200 engineering teams.',
          featured: true,
          file_url: '#',
        },
        {
          title: 'Multi-region reference architecture',
          slug: 'multi-region-reference-architecture',
          type: 'Architecture',
          format: 'Diagram + guide',
          excerpt: 'A blueprint for active-active deployments with row-level policies.',
          file_url: '#',
        },
        {
          title: 'Incident response template',
          slug: 'incident-response-template',
          type: 'Template',
          format: 'Notion + PDF',
          excerpt: 'A ready-to-use runbook for on-call teams.',
          file_url: '#',
        },
        {
          title: 'Migration playbook',
          slug: 'migration-playbook',
          type: 'Playbook',
          format: 'PDF · 24 pages',
          excerpt: 'Move a legacy monolith onto the platform in stages.',
          file_url: '#',
        },
        {
          title: 'Cost calculator',
          slug: 'cost-calculator',
          type: 'Calculator',
          format: 'Spreadsheet',
          excerpt: 'Estimate compute, storage and egress before you commit.',
          file_url: '#',
        },
        {
          title: 'Row-level security guide',
          slug: 'row-level-security-guide',
          type: 'Guide',
          format: 'Web + PDF',
          excerpt: 'Design tenant isolation that passes a security review.',
          file_url: '#',
        },
      ],
      'resources'
    )
  );

  out.push(
    await seedModel(
      'pressAsset',
      [
        {
          title: 'Logos',
          slug: 'logos',
          type: 'Logo',
          description: 'Primary and monochrome logos in vector and raster formats.',
          formats: 'SVG · PNG · EPS',
          file_url: '#',
        },
        {
          title: 'Colour palette',
          slug: 'colour-palette',
          type: 'Colour',
          description: 'Brand colours with hex, RGB and print values.',
          formats: 'PDF · ASE',
          file_url: '#',
        },
        {
          title: 'Product screenshots',
          slug: 'product-screenshots',
          type: 'Product',
          description: 'High-resolution product imagery for editorial use.',
          formats: 'PNG · WebP',
          file_url: '#',
        },
        {
          title: 'Executive headshots',
          slug: 'executive-headshots',
          type: 'People',
          description: 'Approved headshots and short bios.',
          formats: 'JPG',
          file_url: '#',
        },
      ],
      'press_assets'
    )
  );

  out.push(
    await seedModel(
      'companyMilestone',
      [
        {
          date: '2018',
          title: 'Two people, one thesis',
          body: 'Nazexa starts as an internal tool for shipping side projects faster.',
          tag: 'Founded',
        },
        {
          date: '2021',
          title: 'Edge runtime launches',
          body: 'Functions go multi-region; the first 1,000 teams join.',
          tag: 'Product',
        },
        {
          date: '2023',
          title: 'Series B',
          body: '$90M to build the AI layer and expand to 24 countries.',
          tag: 'Funding',
        },
        {
          date: '2026',
          title: 'One platform',
          body: 'Databases, compute, AI and observability unify under one control plane.',
          tag: 'Milestone',
        },
      ],
      'company_milestones'
    )
  );

  out.push(
    await seedModel(
      'learningPath',
      [
        {
          title: 'Foundations',
          slug: 'foundations',
          level: 'Beginner',
          module_count: 6,
          duration_label: '3 h',
          summary: 'From your first deploy to a production-ready service.',
          featured: true,
        },
        {
          title: 'Production engineering',
          slug: 'production-engineering',
          level: 'Intermediate',
          module_count: 8,
          duration_label: '5 h',
          summary: 'Observability, scaling and incident response in practice.',
        },
        {
          title: 'Data and AI',
          slug: 'data-and-ai',
          level: 'Advanced',
          module_count: 10,
          duration_label: '7 h',
          summary: 'Embeddings, agents and evals on the platform.',
        },
      ],
      'learning_paths'
    )
  );

  out.push(
    await seedModel(
      'certification',
      [
        {
          name: 'Nazexa Certified Developer',
          requirements: 'Complete Foundations + pass the exam',
          validity: '2 years',
        },
        {
          name: 'Nazexa Certified Architect',
          requirements: 'Certified Developer + Production Engineering',
          validity: '2 years',
        },
        {
          name: 'Nazexa AI Specialist',
          requirements: 'Data and AI path + capstone project',
          validity: '2 years',
        },
      ],
      'certifications'
    )
  );

  out.push(
    await seedModel(
      'release',
      [
        {
          version: 'v4.2.1',
          title: 'Multi-region writes generally available',
          slug: 'v4-2-1-multi-region-writes-ga',
          type: 'Feature',
          channel: 'stable',
          status: 'Current',
          released_at: new Date('2026-08-08'),
          body: '<p>Active-active writes are now GA across all regions.</p>',
          featured: true,
        },
        {
          version: 'v4.2.0',
          title: 'Faster cold starts',
          slug: 'v4-2-0-faster-cold-starts',
          type: 'Performance',
          channel: 'stable',
          status: 'Supported',
          released_at: new Date('2026-07-25'),
          security_until: new Date('2027-07-25'),
          body: '<p>Edge cold starts reduced to 38ms p50.</p>',
        },
        {
          version: 'v4.1.3',
          title: 'Deprecation: legacy auth tokens',
          slug: 'v4-1-3-deprecate-legacy-auth',
          type: 'Deprecation',
          channel: 'stable',
          status: 'Maintenance',
          released_at: new Date('2026-06-30'),
          security_until: new Date('2027-06-30'),
          body: '<p>Legacy tokens will stop working in v5.</p>',
        },
      ],
      'releases'
    )
  );

  const rel = await db.release.findFirst({ where: { slug: 'v4-2-1-multi-region-writes-ga' } });
  out.push(
    await seedModel(
      'downloadArtifact',
      [
        {
          kind: 'CLI',
          name: 'nazexa-cli (macOS)',
          platform: 'macOS',
          architecture: 'arm64',
          version: 'v4.2.1',
          file_size: '18 MB',
          status: 'Stable',
          file_url: '#',
          release_id: rel?.id ?? null,
        },
        {
          kind: 'CLI',
          name: 'nazexa-cli (Linux)',
          platform: 'Linux',
          architecture: 'x86_64',
          version: 'v4.2.1',
          file_size: '19 MB',
          status: 'Stable',
          file_url: '#',
          release_id: rel?.id ?? null,
        },
        {
          kind: 'CLI',
          name: 'nazexa-cli (Windows)',
          platform: 'Windows',
          architecture: 'x86_64',
          version: 'v4.2.1',
          file_size: '20 MB',
          status: 'Stable',
          file_url: '#',
          release_id: rel?.id ?? null,
        },
        {
          kind: 'SDK',
          name: 'TypeScript SDK',
          language: 'TypeScript',
          package_name: '@nazexa/sdk',
          version: '4.2.1',
          status: 'Stable',
          file_url: '#',
        },
        {
          kind: 'SDK',
          name: 'Python SDK',
          language: 'Python',
          package_name: 'nazexa',
          version: '4.2.1',
          status: 'Stable',
          file_url: '#',
        },
        {
          kind: 'SDK',
          name: 'Go SDK',
          language: 'Go',
          package_name: 'github.com/nazexa/go',
          version: '4.2.0',
          status: 'Maintenance',
          file_url: '#',
        },
      ],
      'download_artifacts'
    )
  );

  out.push(
    await seedModel(
      'roadmapItem',
      [
        {
          title: 'Multi-region writes',
          slug: 'rm-multi-region-writes',
          phase: 'now',
          tag: 'In rollout',
          target_label: 'Q3 2026',
          body: 'Active-active writes rolling out to all regions.',
        },
        {
          title: 'Branch-aware analytics',
          slug: 'rm-branch-aware-analytics',
          phase: 'now',
          tag: 'Beta',
          target_label: 'Q3 2026',
          body: 'Query preview data with production tooling.',
        },
        {
          title: 'Managed vector search',
          slug: 'rm-managed-vector-search',
          phase: 'next',
          tag: 'Planned',
          target_label: 'Q4 2026',
          body: 'First-class embeddings + ANN indexes.',
        },
        {
          title: 'Edge scheduled jobs',
          slug: 'rm-edge-scheduled-jobs',
          phase: 'next',
          tag: 'Planned',
          target_label: 'Q4 2026',
          body: 'Durable cron at the edge.',
        },
        {
          title: 'On-device sync',
          slug: 'rm-on-device-sync',
          phase: 'later',
          tag: 'Research',
          target_label: '2027',
          body: 'Local-first sync engine under exploration.',
        },
      ],
      'roadmap_items'
    )
  );

  out.push(
    await seedModel(
      'docArticle',
      [
        {
          title: 'Quickstart',
          slug: 'quickstart',
          area: 'Getting started',
          difficulty: 'Beginner',
          version: 'v4.2',
          reading_minutes: 5,
          excerpt: 'Deploy your first project in five minutes.',
          body: '<p>Install the CLI, link your repo and deploy.</p>',
          featured: true,
        },
        {
          title: 'Data modelling',
          slug: 'data-modelling',
          area: 'Database',
          difficulty: 'Intermediate',
          version: 'v4.2',
          reading_minutes: 12,
          excerpt: 'Design schemas, generate migrations and preview diffs.',
          body: '<p>Model your schema visually and ship real migrations.</p>',
        },
        {
          title: 'Edge runtime concepts',
          slug: 'edge-runtime-concepts',
          area: 'Runtime',
          difficulty: 'Intermediate',
          version: 'v4.2',
          reading_minutes: 10,
          excerpt: 'How functions run across 34 regions.',
          body: '<p>Understand cold starts, regions and isolates.</p>',
        },
        {
          title: 'Object storage',
          slug: 'object-storage',
          area: 'Storage',
          difficulty: 'Beginner',
          version: 'v4.2',
          reading_minutes: 8,
          excerpt: 'S3-compatible storage with signed URLs.',
          body: '<p>Upload, sign and transform objects.</p>',
        },
        {
          title: 'Tracing and metrics',
          slug: 'tracing-and-metrics',
          area: 'Observability',
          difficulty: 'Advanced',
          version: 'v4.2',
          reading_minutes: 15,
          excerpt: 'Correlate traces, metrics and logs by request.',
          body: '<p>Instrument and query your telemetry.</p>',
        },
      ],
      'doc_articles'
    )
  );

  out.push(
    await seedModel(
      'apiEndpoint',
      [
        {
          method: 'GET',
          path: '/v4/projects',
          api_group: 'Projects',
          summary: 'List all projects',
          version: 'v4',
        },
        {
          method: 'POST',
          path: '/v4/projects',
          api_group: 'Projects',
          summary: 'Create a project',
          version: 'v4',
        },
        {
          method: 'GET',
          path: '/v4/functions',
          api_group: 'Functions',
          summary: 'List functions',
          version: 'v4',
        },
        {
          method: 'POST',
          path: '/v4/deployments',
          api_group: 'Deployments',
          summary: 'Create a deployment',
          version: 'v4',
        },
        {
          method: 'DELETE',
          path: '/v4/projects/:id',
          api_group: 'Projects',
          summary: 'Delete a project',
          version: 'v4',
        },
      ],
      'api_endpoints'
    )
  );

  out.push(
    await seedModel(
      'apiErrorCode',
      [
        {
          status: 400,
          code: 'invalid_request',
          meaning: 'The request was malformed or missing required fields.',
        },
        { status: 401, code: 'unauthorized', meaning: 'Missing or invalid authentication token.' },
        {
          status: 403,
          code: 'forbidden',
          meaning: 'The token lacks permission for this resource.',
        },
        { status: 404, code: 'not_found', meaning: 'The requested resource does not exist.' },
        {
          status: 429,
          code: 'rate_limited',
          meaning: 'Too many requests — retry after the reset window.',
        },
      ],
      'api_error_codes'
    )
  );

  out.push(
    await seedModel(
      'statusComponent',
      [
        {
          name: 'API',
          component_group: 'Core',
          current_status: 'operational',
          uptime_90d: '99.99%',
          p50_latency_ms: '42 ms',
        },
        {
          name: 'Dashboard',
          component_group: 'Core',
          current_status: 'operational',
          uptime_90d: '99.98%',
          p50_latency_ms: '120 ms',
        },
        {
          name: 'Database',
          component_group: 'Data',
          current_status: 'operational',
          uptime_90d: '99.995%',
          p50_latency_ms: '8 ms',
        },
        {
          name: 'Edge runtime',
          component_group: 'Compute',
          current_status: 'operational',
          uptime_90d: '99.99%',
          p50_latency_ms: '38 ms',
        },
        {
          name: 'Object storage',
          component_group: 'Data',
          current_status: 'operational',
          uptime_90d: '99.97%',
          p50_latency_ms: '60 ms',
        },
      ],
      'status_components'
    )
  );

  out.push(
    await seedModel(
      'incident',
      [
        {
          title: 'Elevated API latency in EU',
          slug: 'elevated-api-latency-eu',
          severity: 'major',
          status: 'resolved',
          started_at: new Date('2026-07-15T09:00:00Z'),
          resolved_at: new Date('2026-07-15T10:20:00Z'),
          body: '<p>A saturated connection pool caused elevated p99 latency in eu-west. Mitigated by scaling the pool and adding backpressure.</p>',
          updates: JSON.stringify([
            { date: '2026-07-15 09:10', status: 'identified', body: 'Root cause identified.' },
            { date: '2026-07-15 10:20', status: 'resolved', body: 'Latency back to normal.' },
          ]),
        },
        {
          title: 'Scheduled database maintenance',
          slug: 'scheduled-db-maintenance',
          severity: 'maintenance',
          status: 'maintenance',
          started_at: new Date('2026-08-02T02:00:00Z'),
          body: '<p>Planned maintenance window with no expected downtime.</p>',
          updates: JSON.stringify([]),
        },
      ],
      'incidents'
    )
  );

  out.push(
    await seedModel(
      'featureRequest',
      [
        {
          title: 'Official Terraform provider',
          slug: 'terraform-provider',
          category: 'Platform',
          status: 'Planned',
          vote_count: 1204,
          body: 'Manage projects and resources as code with Terraform.',
          featured: true,
        },
        {
          title: 'Python 3.13 support',
          slug: 'python-3-13-support',
          category: 'Runtime',
          status: 'In progress',
          vote_count: 842,
          body: 'Add the latest Python runtime to functions.',
        },
        {
          title: 'Custom domains per branch',
          slug: 'custom-domains-per-branch',
          category: 'Preview',
          status: 'Under review',
          vote_count: 623,
          body: 'Assign stable custom domains to preview branches.',
        },
        {
          title: 'Point-in-time restore UI',
          slug: 'pitr-ui',
          category: 'Database',
          status: 'Shipped',
          vote_count: 410,
          body: 'Restore databases to any second from the dashboard.',
        },
      ],
      'feature_requests'
    )
  );

  out.push(
    await seedCollection(
      'tutorials',
      [
        {
          title: 'Build semantic search in 9 lines',
          subtitle: 'Add embeddings-powered search to any table.',
          category: 'AI',
          data: {
            duration: '20 min',
            difficulty: 'Beginner',
            language: 'TypeScript',
            repo_url: '#',
          },
        },
        {
          title: 'Deploy a multi-region API',
          subtitle: 'Ship a globally distributed API with failover.',
          category: 'Platform',
          data: { duration: '35 min', difficulty: 'Intermediate', language: 'Go', repo_url: '#' },
        },
        {
          title: 'Row-level security from scratch',
          subtitle: 'Tenant isolation with policies.',
          category: 'Security',
          data: { duration: '25 min', difficulty: 'Intermediate', language: 'SQL', repo_url: '#' },
        },
      ],
      'tutorials'
    )
  );

  out.push(
    await seedCollection(
      'community',
      [
        {
          title: 'Discord',
          subtitle: '20,000+ builders sharing patterns and war stories.',
          icon: 'MessageCircle',
          link_url: '#',
          link_label: 'Join Discord',
        },
        {
          title: 'Community forum',
          subtitle: 'Long-form Q&A and searchable answers.',
          icon: 'Users',
          link_url: '#',
          link_label: 'Browse forum',
        },
        {
          title: 'GitHub',
          subtitle: 'Open-source SDKs, examples and plugins.',
          icon: 'Github',
          link_url: '#',
          link_label: 'View GitHub',
        },
        {
          title: 'Champions',
          subtitle: 'Recognising the people who help others most.',
          icon: 'Award',
          link_url: '#',
          link_label: 'Meet champions',
        },
      ],
      'community'
    )
  );

  console.log(JSON.stringify(out, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
