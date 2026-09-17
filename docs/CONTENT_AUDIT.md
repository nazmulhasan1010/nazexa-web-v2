# Nazexa Web — Content Architecture Audit

Audit of hardcoded vs. CMS-driven content across the public site, plus the changes made in the
Smart Content Ecosystem upgrade. Legend: **HC** = hardcoded literal, **DYN** = from DB/CMS,
**HYBRID** = CMS when the collection is populated, hardcoded fallback otherwise.

## How content flows

- **DB/CMS**: one generic `content_items` table (25 collections, keyed by `collection`), plus
  `home_sections` (homepage), `pages`, `site_settings`, `contact_settings`. Access via Server
  Actions in `src/lib/cms.ts`.
- **Homepage**: `home_sections` rows → shared registry `src/lib/home-sections.tsx` → section
  components. Repeatable cards come from `content_items` collections.
- **StandardPages**: `pages[slug]` defaults (`src/lib/site-content.ts` + `src/lib/page-blocks.ts`),
  several of which now prepend a CMS block when the matching collection has items.

## Audit table

| Page              | Section                                                                   | Static content              | Should be dynamic?        | Content type | CMS source                  |
| ----------------- | ------------------------------------------------------------------------- | --------------------------- | ------------------------- | ------------ | --------------------------- |
| Global            | Header nav / mega-menu                                                    | 5 groups, ~35 links         | No — structural nav       | list         | code (`site-content.ts`)    |
| Global            | Footer links / tagline                                                    | ~35 links, tagline          | No — structural           | list         | code                        |
| Global            | Header "Pricing" menu                                                     | product list                | **DYN** ✓                 | list         | `products`                  |
| Home              | Hero                                                                      | headline, badge, body, CTAs | **DYN** ✓                 | text         | `home_sections` (hero copy) |
| Home              | What we do (pillars)                                                      | capability cards            | **DYN** ✓                 | card         | `pillars`                   |
| Home              | Services                                                                  | service cards + copy        | **DYN** ✓                 | card         | `services`                  |
| Home              | Mission & Vision                                                          | mission/vision              | **DYN** ✓                 | card         | `missionvision`             |
| Home              | Technologies                                                              | tech chips                  | **DYN** ✓                 | list         | `technologies`              |
| Home              | Why Nazexa                                                                | values + stats              | **DYN** ✓                 | card/stat    | `values`, `stats`           |
| Home              | Process                                                                   | delivery steps              | **DYN** ✓                 | steps        | `process`                   |
| Home              | Our products                                                              | product cards               | HYBRID                    | card         | `products` / `lib/products` |
| Home              | **Trusted by**                                                            | client logos/names          | **DYN** ✓ _(now wired)_   | list         | `customers` (fallback HC)   |
| Home              | **Stats**                                                                 | headline metrics            | **DYN** ✓ _(now wired)_   | stat         | `stats` (fallback HC)       |
| Home              | **Testimonials**                                                          | client quotes               | **DYN** ✓ _(now wired)_   | quote        | `customers` (fallback HC)   |
| Home              | **FAQ preview**                                                           | Q&A                         | **DYN** ✓ _(now wired)_   | faq          | `faq` (fallback HC, cap 6)  |
| Home              | Feature grid / Platform / Timeline / TechStack / Blog preview / Final CTA | marketing copy              | No — marketing/structural | mixed        | code (fallback)             |
| About             | all blocks                                                                | narrative, timeline, stats  | No — long-form prose      | text         | code                        |
| Products          | product cards                                                             | title/body/links            | DYN                       | card         | `products`                  |
| Products          | hero, "how they work", CTA                                                | copy                        | No — marketing            | text         | code                        |
| Services          | service cards                                                             | practice cards              | HYBRID                    | card         | `services`                  |
| Services          | mission/process/tech/why/CTA                                              | long-form                   | No — marketing            | mixed        | code (`services.ts`)        |
| Solutions         | leading block                                                             | outcome cards               | HYBRID ✓                  | list         | `solutions`                 |
| Industries        | leading block                                                             | coverage cards              | HYBRID ✓                  | card         | `industries`                |
| Case Studies      | leading block                                                             | featured items              | HYBRID ✓                  | list         | `case-studies`              |
| Portfolio         | leading block                                                             | selected work               | HYBRID ✓                  | list         | `portfolio`                 |
| Pricing           | leading block                                                             | usage tiers                 | HYBRID ✓                  | pricing      | `pricing`                   |
| FAQ               | leading block                                                             | Q&A                         | HYBRID ✓                  | faq          | `faq`                       |
| Team              | people blocks                                                             | member profiles             | HYBRID ✓                  | people       | `team`                      |
| Partners          | leading block                                                             | programme tracks            | HYBRID ✓                  | card         | `partners`                  |
| Integrations      | leading block                                                             | directory                   | HYBRID ✓                  | table        | `integrations`              |
| **Blog**          | posts                                                                     | article cards               | **DYN** ✓ _(now wired)_   | card         | `blog`                      |
| **News**          | posts                                                                     | news cards                  | **DYN** ✓ _(now wired)_   | card         | `news`                      |
| **Events**        | events                                                                    | event cards                 | **DYN** ✓ _(now wired)_   | card         | `events`                    |
| **Announcements** | —                                                                         | _(page did not exist)_      | **DYN** ✓ _(new page)_    | card         | `announcement`              |
| Contact           | info panel                                                                | phone/email/address         | DYN                       | text         | `contact_settings`          |
| Contact           | channels, offices, FAQ                                                    | copy                        | No — structural           | mixed        | code                        |
| `[slug]/pricing`  | tiers                                                                     | plans + prices              | DYN                       | pricing      | products + payment plans    |

## Changes made in this pass

- **Homepage sections wired to CMS** — Trusted-by, Stats, Testimonials and FAQ now read from
  `customers`/`stats`/`faq` (with hardcoded fallbacks for zero visual regression). All homepage
  section rendering unified through one registry (`src/lib/home-sections.tsx`).
- **Blog / News / Events** now render CMS collections (prepended block, hardcoded fallback);
  **Announcements** page created (`/announcements` ← `announcement` collection).
- **Server-side revalidation** added to every content mutation (`revalidatePath`), so admin edits
  reflect on the public site without a manual redeploy.
- **SEO metadata bug fixed** across 13 StandardPage routes (they were emitting the generic default
  because module-level `metadata` referenced an out-of-scope `page`).
- Seeded `blog` + `announcement` (and reused existing `stats`/`customers`/`faq`/`news`) so the CMS
  is the live source of truth.

## Intentionally kept in code (per scope decision)

Header/footer nav (`site-content.ts`), About narrative, long-form service copy (`services.ts`),
and generic marketing prose in `page-blocks.ts`. These are structural/marketing text, not
frequently-changing business content.

## Remaining opportunities (future passes)

- Blog/News/Events detail routes (`/blog/[slug]`) — currently list-only.
- Migrating the rest of `page-blocks.ts` (tables, stat bands, quotes) behind a generic per-page
  block composer.
- SEO for CMS-driven pages could derive title/description from content instead of `pages[]` defaults.

---

# Addendum — Dedicated content models (editorial core pass)

Added **dedicated Prisma models** for editorial content whose UI is too structured for the generic
`content_items` blob, plus a **config-driven admin** (`/admin/models`) that renders a premium tabbed
editor + list for each. All server mutations are admin-gated via `getAdminSession()`.

| Route → UI section                              | Model (table)                                                         | Key fields                                                                                                                                                                             | Admin                                      | Seed    |
| ----------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------- |
| `/careers` "Open positions" + `/careers/[slug]` | `JobPosting` (`job_postings`)                                         | title, slug, department, location, level, employment_type, remote, excerpt, body, responsibilities(JSON), requirements(JSON), apply_url, featured, published, position, posted_at, seo | General·Content·CTA·SEO·Publishing         | 3 roles |
| `/resources` cards                              | `Resource` (`resources`)                                              | title, slug, type, format, excerpt, body, file_url, external_url, image_url, gated, featured, published, position, seo                                                                 | General·Content·Media·SEO·Publishing       | 6       |
| `/press-kit` "Download assets"                  | `PressAsset` (`press_assets`)                                         | title, slug, type, description, file_url, formats, image_url                                                                                                                           | General·Media·Publishing                   | 4       |
| `/about` timeline                               | `CompanyMilestone` (`company_milestones`)                             | date, title, body, tag                                                                                                                                                                 | General·Publishing                         | 4       |
| `/learning-center` paths + certs                | `LearningPath` (`learning_paths`), `Certification` (`certifications`) | path: level, module_count, duration_label, summary, modules(JSON); cert: name, requirements, validity                                                                                  | General·Content·Items·Media·SEO·Publishing | 3 + 3   |
| `/changelog` + `/release-notes`                 | `Release` (`releases`)                                                | version, title, slug, body, type, channel, released_at, security_until, status, migration_notes                                                                                        | General·Content·SEO·Publishing             | 3       |
| `/download-center` tables                       | `DownloadArtifact` (`download_artifacts`) → `Release`                 | kind, name, platform, architecture, language, package_name, version, file_url, file_size, checksum, signature_url, status                                                              | General·Files·Publishing                   | 6       |
| `/roadmap` now/next/later                       | `RoadmapItem` (`roadmap_items`)                                       | title, slug, body, phase, tag, target_label, featured                                                                                                                                  | General·Content·SEO·Publishing             | 5       |

**Extended existing `content_items` collections** (zero-migration, `content-schema.ts`): `blog` +excerpt(subtitle);
`events` +subtitle/end_date/registration_url/price_label/format; new `tutorials` (→ `/tutorials`) and
`community` (→ `/community`) collections; `team` people block now renders the photo.

**Frontend integration:** each page maps published records onto existing `PageBlock` shapes (cards now
support an optional `href`) with the hardcoded blocks as fallback when empty — premium UI preserved.

**Also fixed:** `serviceBySlug` was an object map called as a function (runtime `TypeError`) → now a lookup
function; a broken related-service `<Link href="/services/$slug" params>` → correct `/services/[slug]`.

**Tests:** `serviceBySlug` (valid/invalid) + generic model CRUD, slug-uniqueness, draft/published visibility,
ordering, featured, admin-auth rejection (`tests/services`, `tests/cms-models`).

**Deferred (agreed):** full Docs (`DocArticle`/`DocCategory`) + API reference (`ApiEndpoint`/`ApiErrorCode`);
**Status** as Incidents-CMS + a pluggable live-health adapter (no fabricated metrics); **Feature Requests**
voting (app-data). News date/type + press-coverage, customers industry/metric, partners margin, and
`/developer-blog` wiring are quick follow-ups on the same pattern.

## Addendum 2 — Documentation, API, Status & Feature Requests (completed)

The previously-deferred subsystems are now implemented on the same dedicated-model + config-driven-admin
framework (all admin at `/admin/models`, admin-gated):

| Route → UI section                  | Model (table)                                                                          | Notes                                                                                                                                                                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/documentation` "Start here"       | `DocArticle` (`doc_articles`)                                                          | area, difficulty, version, reading_minutes; cards                                                                                                                                                                                                                                         |
| `/api-documentation` tables         | `ApiEndpoint` (`api_endpoints`), `ApiErrorCode` (`api_error_codes`)                    | Core endpoints table + Error codes table                                                                                                                                                                                                                                                  |
| `/status` service table + incidents | `StatusComponent` (`status_components`), `Incident` (`incidents`)                      | **Health via pluggable adapter** `getStatusComponents()` — reads `STATUS_API_URL` (real monitor) if set, else DB rows; **no fabricated live metrics**. Hero summary derived from real component/incident state. Incidents are CMS-authored post-mortems (with a JSON `updates` timeline). |
| `/feature-requests` board           | `FeatureRequest` (`feature_requests`) + `FeatureRequestVote` (`feature_request_votes`) | **Real voting** — `voteFeatureRequest` server action, cookie-deduped via a unique `(request_id, voter_key)` constraint, not CMS-authored counts.                                                                                                                                          |

Seeded (idempotent): 5 docs, 5 endpoints, 5 error codes, 5 status components, 2 incidents, 4 feature requests.
Tests: generic CRUD covers all (same actions); dedicated tests for vote dedup + status adapter fallback.

**Status page honesty:** component health is never hand-edited-as-fake — the adapter provides a real seam
(`STATUS_API_URL`) and the DB rows are the admin/monitor-fed fallback. Set `STATUS_API_URL` to a monitor
returning `{components:[{name,group,status,uptime,latency}]}` to go fully live.

**Still deferred (lower value):** a separate `DocCategory` tree (docs group by `area` today) and
OpenAPI-generated API reference (endpoints are CMS-managed today).
