# EARTHLINK Philippines. Developer handoff

Everything the next developer, or the next AI session, needs to continue confidently. Read
this and `README.md` before changing anything. Last updated 17 September 2026.

**Client:** Adam Tryler Guttierez, founder, referred to as Direk. **Built by:** Erick Cabal,
Erick Cabal Web Studio (Enclave). **Project folder:** `33. Earthlink Philippines`. **Dev
port:** 3033. **Live:** https://earthlinkph.vercel.app.

Commercial figures are deliberately not in this repository, which is public. They live in
`PRIVATE-NOTES.md`, gitignored, on the studio machine only.

---

## 1. Tech stack and versions

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js, App Router, Turbopack | 16.3.5 |
| UI | React, React DOM | 19.3.0 |
| Language | TypeScript, strict, `noUncheckedIndexedAccess` | 5.9.3 |
| Styling | Tailwind CSS, with `tailwindcss-animate` | 3.4.19 |
| Fonts | Bricolage Grotesque, Public Sans, JetBrains Mono through `next/font/google` | self-hosted by Next |
| Lint | ESLint with `eslint-config-next` | 9.39.5 (pinned, see Known issues) |
| Runtime | Node | 24.19.0 in `.nvmrc`, `>=20.10` in `engines` |
| Database and files | Supabase Postgres and Storage, through REST with plain `fetch` | no SDK |
| Email | Resend HTTP API with plain `fetch` | no SDK |
| Hosting | Vercel, Hobby plan, region Singapore | |
| Package manager | npm 11 | |

Runtime dependencies are `next`, `react`, `react-dom`. That is the whole list, on purpose.

## 2. Every app and service, what it does, where the account lives

| Service | Does | Account | Notes |
|---|---|---|---|
| **GitHub** `arabpame/website` | Source of truth for code. Push to `main` deploys. | The founder's GitHub, `arabpame` | Public repository. Nothing commercial or personal goes into a tracked file. |
| **Vercel** project `earthlink` | Builds and serves the site. Holds the environment variables. Deployment Protection is the kill switch. | Team `arabpame-7215`, under the founder's Gmail | `vercel.json` gates every build behind QA, grammar and security. Domains: `earthlinkph.vercel.app` (canonical), `earthlink-ebon.vercel.app` (original alias). |
| **Supabase** project `earthlinkph`, ref `wdhxojrunxbtllzcyxby` | Table `public.reports`, bucket `evidence`. | The founder's Gmail | RLS on with no policies. Server uses the service role key only. |
| **Resend** | Sends report and enquiry emails. | The founder's Gmail, `arabpame@gmail.com` | No domain verified, so delivery is limited to that address, which is where the founder wants them anyway. |
| philippines-json-maps (GitHub, MIT) | Source of the map geometry and the gazetteer. | none | Fetched only by build scripts; outputs are committed. |

## 3. Environment variables and where each value comes from

Read by the app. All set in Vercel (Production; the URL also in Preview) and in `.env.local`
on the developer machine. `.env.example` is the contract and must stay blank.

| Variable | Read in | Value from |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `lib/constants.ts` via `lib/seo.tsx` | The canonical URL, `https://earthlinkph.vercel.app`. |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/reports/db.ts` | Supabase, Project Settings, API Keys, "Project URL". Must be `https://<ref>.supabase.co`. `db.ts` refuses a key pasted here. |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/reports/db.ts` | Same page, the `service_role` key. Server only. Never `NEXT_PUBLIC_`. |
| `RESEND_API_KEY` | `lib/reports/email.ts` | Resend, API Keys. Sending access. |
| `REPORTS_TO_EMAIL` | `lib/reports/email.ts` | Where report emails go. Must own the Resend account until a domain is verified. |
| `CONTACT_TO_EMAIL` | `app/contact/actions.ts` | Optional. Falls back to `REPORTS_TO_EMAIL`. |
| `FROM_EMAIL` | `lib/reports/email.ts` | Optional. Leave unset until a domain is verified in Resend. |
| `VERCEL` | `lib/reports/storage.ts` | Set by Vercel automatically. Selects "no local file store". |

Behaviour without them: on a laptop, reports go to `.cache/reports/reports.local.json`
and photographs to `.cache/reports/evidence/`; on Vercel, the form returns "reporting is
temporarily unavailable" and files nothing. Email failure never blocks a filing.

`.env.local` is gitignored but the folder is inside OneDrive, so it syncs to the cloud.
`npm run security` warns about that on every run. Rotate every key if a laptop is lost.

## 4. Running locally

```bash
node scripts/doctor.mjs     # machine preflight, zero dependencies, run first on a new laptop
npm run clean               # delete build caches. Always safe. Do it first when a build fails strangely
npm install
cp .env.example .env.local  # then fill the four intake values from the dashboards
npm run dev                 # http://localhost:3033
npm run verify              # typecheck, contrast, qa, grammar, security, build. The definition of done
```

Windows note: PowerShell's execution policy blocks `npm run` on a fresh install. The doctor
detects it and prints the one-line fix. Never write source files with PowerShell `Set-Content`.

## 5. Deploying

Push to `main`. Vercel builds with `npm run qa && npm run grammar && npm run security &&
npm run build` and deploys in about two minutes. Preview deployments come from branches.
Environment variable changes need a redeploy. The Vercel CLI login on the studio laptop
expires; `npm run vercel:login` restores it, and `npm run site:status`, `site:offline`,
`site:online` then work.

## 6. Folder structure and where things live

```
app/                        routes. Server Components by default
  report/actions.ts         fileReport: the one write path. Validate, place, rate limit, save,
                            store photographs, email, revalidatePath
  contact/actions.ts        sendEnquiry
  cases/[slug]/page.tsx     case page. Sources for documented cases, private-photo note for filed ones
  map/, cases/, track/, page.tsx   read cases through lib/store, revalidate every 300 s
  sitemap.ts robots.ts manifest.ts loading.tsx error.tsx not-found.tsx
components/
  forms/ReportForm.tsx      four steps, browser-side photo resizing, device location, honeypot
  forms/ContactForm.tsx     enquiry form
  layout/                   Header, Footer, Reveal
  sections/                 Hero, PageHeader, CaseCard, Legal
  map/                      EarthMap (server SVG), MapExplorer (client filters)
  ui/                       CaseChip (the signature element), Primitives (Stat, chips, links)
data/
  source/cases-*.json       THE RESEARCH RECORD: 46 documented 2026 incidents with source URLs
  source/missions.json      14 real announced 2026 events with sources
  cases.ts missions.ts      GENERATED by npm run data:build. Never edit by hand
  partners.ts               partner seeds with regex matchers; counts, EARTH Score and dashboard
                            counters derived from cases and missions at build time
  tracks.ts                 learning tracks (structure; lesson content still to be written)
  ph-map.json               GENERATED by npm run map:build. Committed. Map geometry
  ph-places.json            GENERATED by npm run places:build. Committed. 1,634 places
lib/
  store.ts                  data access layer. Merges filed reports with data/cases.ts. Server only
  places.ts                 gazetteer: findPlace, nearestPlace, regionAt
  reports/types.ts          ReportStore contract and row shapes
  reports/db.ts             Supabase REST and Storage with fetch. Validates the URL and key shape
  reports/local.ts          file store for development
  reports/storage.ts        picks Supabase, the local store, or nothing (Vercel without config)
  reports/email.ts          Resend: sendPlainEmail, sendReportEmail with attachments
  reports/case.ts           reportToCase: a filed report shaped as an EarthCase
  constants.ts types.ts taxonomy.ts map.ts seo.tsx fonts.ts utils.ts
scripts/                    zero-dependency tooling, see section 12
supabase/migrations/        0001_reports.sql, idempotent. supabase/README.md walks the setup
docs/                       USER-MANUAL.md, DEVELOPER-HANDOFF.md (this), FILING-A-REPORT.md, CONTRAST.md (generated)
public/                     og.png (share image, rendered from og.svg), icon.svg, photos/
```

## 7. Database schema

One table and one bucket. `supabase/migrations/0001_reports.sql` creates both and can be re-run.

`public.reports`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `seq` | bigint identity, starts at 100 | Documented cases use 0001 upwards; filed reports start at 0100 |
| `case_number` | text, unique | Set by trigger `reports_assign_case_number`: `EARTH-YYYY-NNNN`, year in Asia/Manila |
| `created_at` | timestamptz | |
| `category` | text, check | water, forest, waste, air, biodiversity, land, hazard |
| `title`, `description` | text, length checks | 8 to 120, 30 to 4000 |
| `observed_on` | date | |
| `urgency` | text, check | low, moderate, high, critical |
| `barangay`, `municipality`, `province`, `region`, `landmark` | text | region is the PSGC short code used by the map |
| `lat`, `lng` | double | municipality centre from the gazetteer, or device coordinates |
| `location_source` | text | `device` or `place` |
| `status` | text, check, default `reported` | the six public states |
| `anonymous` | boolean | |
| `reporter_name`, `reporter_contact` | text, nullable | PRIVATE. Never selected for the site |
| `ip_hash` | text | sha256 of the IP, for the five-per-hour rate limit. PRIVATE |
| `evidence` | jsonb | `[{ path, type, size }]`, paths inside the bucket |

Indexes on `created_at` and `(ip_hash, created_at)`. RLS enabled, no policies: the anon key
can do nothing. Bucket `evidence`: private, 3 MB per file, JPEG, PNG, WebP only.

Deleting: `npm run report:delete -- EARTH-2026-NNNN` removes files and row. SQL cannot
delete from `storage.objects`; the Storage API must be used, which the script does.

## 8. Third-party integrations

- **Supabase REST** (`/rest/v1/reports`) and **Storage** (`/storage/v1/object/...`) with the
  service role key in `apikey` and `Authorization` headers. `cache: "no-store"` on every
  request. Listing selects only the public columns.
- **Resend** (`POST https://api.resend.com/emails`) with attachments as base64. From address
  defaults to Resend's onboarding sender until `FROM_EMAIL` is set.
- **Vercel API** in `scripts/site-access.mjs` for the kill switch, using the CLI's saved login.
- **philippines-json-maps** fetched only by `scripts/build-map.mjs` and
  `scripts/build-places.mjs`, cached under `.cache/geo/`. Outputs are committed so the build
  never touches the network.

## 9. Design tokens

Full reasoning in `DESIGN_DIRECTION.md`. Values in `tailwind.config.ts`.

Brand:

```
brand.ink      #07231E   body type and dark bands
brand.deep     #0B3B32   headings on the light ground
brand.primary  #0E6B55   primary action (600 #0C5A47, 700 #0A4A3B)
brand.signal   #C2F24D   chartreuse accent. NEVER small text on light, 1.18:1 (400 #D3F67E, 600 #A8D92F)
brand.paper    #F1F5F1   page ground
brand.surface  #FFFFFF   cards
brand.line     #D4DED8   hairlines
```

Six case states (pin colour, text colour): reported #DF3023/#C3281D, verifying
#F79009/#965705, referred #CA8A04/#895E03, progress #2E90FA/#0563C9, resolved
#12B76A/#0C7544, monitoring #98A2B3/#5A667A.

Seven categories: water #0EA5E9, forest #168740, waste #8C52EF, air #67778F, biodiversity
#0D9488, land #A86607, hazard #DE3030, each with a darker text tone.

Type: `font-display` Bricolage Grotesque (headings), `font-body` Public Sans (prose),
`font-data` JetBrains Mono (case numbers, coordinates, counters, never prose). Display
sizes `display-2xl` to `display-md` are clamp() scales. Container max 1240px.

`npm run contrast` checks 53 colour pairs and writes `docs/CONTRAST.md`.

## 10. Coding conventions

- Server Components by default. `"use client"` only at the leaf: Header, Reveal,
  MapExplorer, ReportForm, ContactForm.
- Pages never import from `data/`. They read `lib/store.ts`. Store functions are async.
- No em dashes anywhere, in page text, code comments or docs. The grammar check fails on them.
- The mono face is for data only. Chartreuse is never small text on light. QA fails on both.
- Every dashboard number carries a `basis` line saying what it counts.
- Footer year is computed. Links to routes must exist. Every image has alt text.
- Definition lists: `<dt>` before `<dd>` in the DOM, value shown first through CSS `order`.
- Generated files (`data/cases.ts`, `data/missions.ts`, `data/ph-map.json`,
  `data/ph-places.json`, `docs/CONTRAST.md`) are edited through their scripts only.
- Credentials never fall back to literals. `npm run security` fails the build on that.
- Persist before sending email. Email is not a database.

## 11. How the checks run

`npm run verify` = `typecheck`, `contrast`, `qa`, `grammar`, `security`, `build`. Zero
external dependencies for the scripts, so they run before `npm install`.

| Script | Checks |
|---|---|
| `qa-check.mjs` | metadata on every page, one h1, internal links resolve, no console.log, alt text, button names, focus styles, no chartreuse small text, no mono prose, placeholder contact values, footer year, image budget 300 KB, required assets and docs. Runs `verify-cases.mjs` and `verify-map.mjs` |
| `verify-cases.mjs` | every case in `data/cases.ts` projects inside the region it claims |
| `verify-map.mjs` | nineteen known cities land in the right region |
| `grammar-check.mjs` | em dashes, curly quotes, ellipsis characters, double spaces, house style, across code and docs |
| `security-check.mjs` | committed secrets, credential fallbacks, `NEXT_PUBLIC_` leaks, dangerouslySetInnerHTML, env hygiene, headers in `vercel.json`, `target="_blank"` without `rel` |
| `contrast-check.mjs` | 53 colour pairs against WCAG AA |
| `doctor.mjs` | the machine, not the code |

There are no automated browser tests. The report flow was exercised by hand end to end on
16 September 2026 against the live database, with photographs, and the contact form was
tested the same day. A Playwright pass on `/report` is the highest-value test to add.

## 12. Scripts that are not checks

| Command | Does |
|---|---|
| `npm run data:build` | compiles `data/source/*.json` into `data/cases.ts` and `data/missions.ts`, placing each case with the gazetteer and refusing to write if a source or a place is missing |
| `npm run places:build` | rebuilds `data/ph-places.json` from PSA boundary data plus a hand list of the independent cities the source omits |
| `npm run map:build` | rebuilds `data/ph-map.json` |
| `npm run report:delete -- EARTH-2026-NNNN` | deletes a filed report and its photographs |
| `npm run photos:optimize`, `assets:build` | image pipeline |
| `npm run site:status`, `site:offline`, `site:online`, `vercel:login` | the kill switch |
| `npm run clean`, `doctor` | machine hygiene |

## 13. How a report flows

1. `ReportForm` validates each step, resizes photographs to 1600 px JPEG in the browser
   (Vercel caps a function body at 4.5 MB), collects `FormData`, and calls `fileReport`.
2. `fileReport` (`app/report/actions.ts`): honeypot, full re-validation, location resolution
   (`findPlace` for typed places, `regionAt` and `nearestPlace` for device coordinates), rate
   limit (five per IP hash per hour, counted in the database), insert, photograph upload,
   evidence patch, signed links, email, `revalidatePath` on `/`, `/map`, `/cases`, `/track`,
   the new case page and the sitemap.
3. `lib/store.ts` merges filed reports with the documented cases on every read, so the map,
   register, dashboard, sitemap and partner counts include them without knowing the source.
4. Pages that read cases also carry `revalidate = 300`, so a status edit or a deletion in the
   database is visible within five minutes without a deploy.

## 14. Known issues and decisions to make

| Item | Severity | Notes |
|---|---|---|
| Every public address is the founder's Gmail | Low | Decided 17 September 2026 as the interim. When a domain exists: verify it in Resend, set `FROM_EMAIL`, and change the three addresses in `lib/constants.ts` `CONTACT`. |
| No verification screen | Medium | Status changes happen in the Supabase Table Editor. `referred_to` and timeline notes for filed reports are not editable yet. |
| Documented cases are frozen at research date | Low | Edit `data/source/*.json` and rebuild when a case moves on. |
| Mobile Lighthouse performance 70 on the home page, and a 0.48 layout-shift reading | Low | After 17 September 2026: desktop scores 100 across performance, accessibility, best practices and SEO; mobile 70 / 100 / 100 / 100. Lighthouse attributes a 0.48 layout shift on mobile to the footer, far below the fold, with the same value on every run; no jump is visible when scrolling a real phone, and deferring sections with content-visibility made it worse, so that was removed. Remaining mobile cost is the hero photograph and the inline map SVG. Options: a smaller phone-only hero image, and rendering the hero map client-side after idle. |
| ESLint pinned to 9.39.5 | Low | ESLint 10 breaks `eslint-plugin-react` inside `eslint-config-next` 16. `npm audit` is clean. |
| Tailwind 4, TypeScript 7, `@types/node` 26 available | Low | Major upgrades, none security. Tailwind 4 changes the token convention; do not upgrade casually. |
| `PRIVATE-NOTES.md` is not in git | Medium | Carry it by hand to a new laptop with `.env.local`. |
| No screen-reader testing by a real user; English only; map pins not keyboard-focusable | Medium | All recorded on the public accessibility page. The case list under the map is the keyboard route. |

## 15. Where things live, the short map

- **A page's text:** `app/<route>/page.tsx`. Shared copy in `lib/constants.ts`.
- **A case:** `data/source/cases-<theme>.json`, then `npm run data:build`.
- **A filed report:** Supabase, table `reports`; photographs in bucket `evidence`.
- **A setting:** Vercel, Environment Variables, then redeploy.
- **Colours and fonts:** `tailwind.config.ts`, `lib/fonts.ts`, `styles/globals.css`.
- **The map:** `lib/map.ts` (projection), `data/ph-map.json` (geometry), `components/map/`.
- **Place lookup:** `lib/places.ts`, `data/ph-places.json`.
- **Email text:** `lib/reports/email.ts` (`reportEmailText`), `app/contact/actions.ts`.
- **Legal pages:** `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/accessibility/page.tsx`.
- **SEO:** `lib/seo.tsx`, `app/sitemap.ts`, `app/robots.ts`, `public/og.png`.
- **The owner's instructions:** `docs/USER-MANUAL.md`. **Presenting:** `docs/FILING-A-REPORT.md`.

## 16. History that explains the shape of things

- **Phase 1 (to 15 September 2026)** was a design build: every screen, invented sample data,
  a persistent sample-data notice, no backend.
- **16 September 2026:** the founder is presenting to judges on 20 September and expects them
  to file a report live. In one session the intake went live (Supabase, Resend, gazetteer,
  photo pipeline), the 37 invented cases were replaced by 46 documented incidents with
  sources, missions became real events, partners, scores and counters became derived, every
  demo notice was removed, and the docs were rewritten. This exceeded the paid Phase 1 scope
  and was being priced as an add-on.
- **Same day, QA pass:** the demo-notice code was deleted outright, the share image became a
  PNG (Messenger ignores SVG previews), four Lighthouse accessibility findings were fixed
  (list semantics, logo accessible name, two faint labels), case pages gained a five-minute
  self-refresh, `report:delete` was added, `.env.example` was trimmed to what is read, and
  the manuals moved to `docs/` under these names.
