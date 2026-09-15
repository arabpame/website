# handoff.md. EARTHLINK Philippines

The project's shared memory. Another developer, or another AI assistant, should be able to
continue confidently after reading only this file.

Last updated: 16 September 2026, live report intake and documented 2026 cases.

---

## 1. Project overview

EARTHLINK Philippines is a national digital environmental action platform. A resident reports
an environmental problem, it becomes a numbered case, the community verifies it, it is
referred to the office with the mandate to act, volunteers act on it, and the public watches
the status until it is resolved and the result is measured.

**Client:** Adam Tryler Guttierez, referred to throughout the engagement as Direk.
**Built by:** Erick Cabal, Erick Cabal Web Studio (Enclave).
**Project folder:** `33. Earthlink Philippines`. Dev port **3033**.

### Commercial context

A function-by-function valuation was issued on 14 September 2026, reference **EC V-2609**. It
splits the complete platform into five phases.

**The figures are deliberately not in this repository.** This repository is public. The
function counts, build days, phase pricing and market range live in `PRIVATE-NOTES.md`,
which is gitignored and exists only on the studio machine. That file is not backed up by
git, so it needs to be carried by hand to a new laptop along with `.env.local`.

The client's stated need was narrower than the full platform: a **design**, complete enough
for competition judges to see that the work exists, with implementation deferred to later in
the year or next year. That is what this repository is.

**This build corresponds to the valuation's Phase 1 in spirit but exceeds it in scope.** The
valuation's Phase 1 covers an advocacy site. What was actually built here is the designed
front end of *all five phases*: the reporting flow, the map, the case register, the
transparency dashboard, the learning hub, missions, the partner directory, EARTH Score and
the ambassador programme. Everything except the backend.

If scope is ever disputed, this paragraph is the record of what was delivered, and
`PRIVATE-NOTES.md` holds the figures it should be read against.

## 2. Goals

1. Give the client something real to put in front of judges, LGUs and sponsors **now**.
2. Make the platform's actual argument visible, which is measurement and accountability, not
   awareness.
3. Build it so the next stage continues from this codebase rather than replacing it.
4. Never let an invented record pass as a real one. Since 16 September 2026 there are none:
   every case is a filed report or a documented incident with sources.

## 3. Current status

**Live, with real intake.** `npm run verify` passes: typecheck, 53 contrast pairs, QA, grammar,
security, and a production build of 96 pages. Production is at earthlinkph.vercel.app.

| Area | State |
|---|---|
| Design system and tokens | Done. `DESIGN_DIRECTION.md`, `tailwind.config.ts`, `docs/CONTRAST.md` |
| All 20 routes | Done, 96 pages including dynamic |
| The EARTH Map | Done. Real PSA geometry, verified against 19 cities and every case in the register |
| Report flow | **Live.** Files to Supabase, stores photographs, emails the founder, refreshes the map. See section 5a |
| Case data | 46 documented 2026 incidents from published reporting, with sources, in `data/source/`. Compiled by `npm run data:build` |
| Case register and case pages | Done |
| Transparency dashboard | Done, including the referral-waiting table |
| Learn, EARTH Kids | Structure done. Lesson content to be written with teachers |
| Missions, Connect, Score, Ambassadors | Done |
| Legal pages | Done. Privacy written against RA 10173 |
| Photography | Three founder photographs in. Every other slot is still an honest placeholder |
| QA tooling | Done. 6 scripts, all zero-dependency |
| Docs | Done. README, USER_MANUAL, this file, PROJECT_RULES, DESIGN_DIRECTION, STACK_DECISION |
| Backend | Report intake only: one table, one bucket, one email. No accounts, no admin screen yet |

## 4. Features

Five core functions, from the client's concept document, all present as designed screens:

- **Learn.** Ten topic tracks plus three EARTH Kids sets. 53 lessons, 43 with quizzes.
- **Report.** Four-step flow: what, where, evidence, who. Real validation, real filing: a
  permanent case number, a pin on the map, a public case page, and an email to the founder
  with the photographs attached.
- **Connect.** Partner directory of the real offices that appear on the documented cases, with
  counts derived from the case records.
- **Act.** 14 real, publicly announced 2026 volunteer events, with the organiser's own
  registration route and measured results where the organiser reported them.
- **Track.** The transparency dashboard, including cases referred and still waiting, sorted
  longest first.

Plus the EARTH Map (7 category layers, 6 status filters, hotspot view), EARTH Score
(leaderboard with published rules and a full breakdown per row), and the ambassador programme.

## 5. Architecture

```
Server Component (default)
    reads lib/store.ts
        which merges filed reports (lib/reports, Supabase) with data/cases.ts
        (documented incidents compiled from data/source/*.json)

Report intake (the one write path)
    components/forms/ReportForm.tsx     resizes photographs in the browser, posts FormData
    app/report/actions.ts               fileReport: validate, place, rate limit, save, store
                                        photographs, email, revalidatePath
    lib/reports/storage.ts              picks Supabase, or the .cache/ file store on a laptop
    lib/reports/db.ts                   Supabase REST and Storage with plain fetch
    lib/reports/email.ts                Resend with plain fetch
    lib/places.ts                       gazetteer: typed place or device coordinates to a pin

Client Components, the complete list:
    components/layout/Header.tsx        scroll state, mobile drawer
    components/layout/Reveal.tsx        scroll reveal
    components/map/MapExplorer.tsx      filtering
    components/forms/ReportForm.tsx     the report flow
    components/forms/ContactForm.tsx    enquiries
```

Everything else is a Server Component. That is why the shipped JavaScript is small and why
the map renders into the HTML.

## 6. Folder structure

See `README.md`.

## 7. Design system

Full reasoning in `DESIGN_DIRECTION.md`. The short version:

**The palette came from the client's own concept document.** The concept defines six case
states with six colours and seven map categories with seven icons. That is a functional colour
system, supplied by the client, and it is treated as a first-class part of the brand.

Two consequences:

1. **The accent cannot be red, orange, amber, blue, green or grey**, because all six are
   spoken for by the case states. Hence `signal`, a hi-vis chartreuse that sits outside the
   status ramp entirely and reads as field equipment.
2. **Every status and category has two tones.** `pin` (saturated, for dots and map pins,
   needs 3:1) and `text` (darkened, for labels on the light ground, needs 4.5:1). A single
   tone failed twelve contrast pairs. The two-tone values were solved for numerically.

```
brand.ink      #07231E   mangrove ink, body type, dark bands
brand.deep     #0B3B32   headings on light
brand.primary  #0E6B55   primary action
brand.signal   #C2F24D   chartreuse accent and focus. NEVER small text on light: 1.18:1
brand.paper    #F1F5F1   cool page ground, deliberately NOT the studio's usual warm cream
brand.line     #D4DED8
```

**Type:** Bricolage Grotesque (display), Public Sans (body), JetBrains Mono (data only).
The third face is justified: case numbers, coordinates and counters are tabular data, and
setting them proportionally is what makes civic platforms read as brochures.

**Brand voice:** direct, plain English, unafraid of an uncomfortable number. Never
inspirational-poster. The site argues by publishing its own worst figures.

**Signature element:** the case chip. Case number, six-segment rail, status label. It appears
on every surface a case appears on.

## 8. Important technical decisions

| Decision | Why |
|---|---|
| **No tile-provider map.** Hand-built SVG from PSA PSGC boundary data. | No API key, no bill, no CSP problem, works offline. Renders on the server so pins are in the HTML. Mapbox belongs in Phase 2 when there is real geodata. See `STACK_DECISION.md`. |
| **Map data committed, not fetched at build.** | `npm run build` never touches the network. A fresh laptop with no internet still builds. |
| **Adaptive simplification tolerance in the map build.** | A flat tolerance collapsed Bongao island and lost Tawi-Tawi, the country's southernmost province, from a national map. Tolerance now scales with each island's size. |
| **`IS_DEMO` is a constant, not an env var.** | It gated the sample-data notices while the site carried invented data. It is false since 16 September 2026, when the sample data was replaced, and flipping it either way is a deliberate code change. `SHOW_DEMO_BANNER` still exists only for the same historical reason. |
| **Forms validate but do not submit, and say so.** | A form that silently discards a real environmental report is worse than no form. Someone will try this. |
| **Tailwind 3, not 4.** | The studio's brand-token convention lives in `tailwind.config.ts`; v4 moves tokens into CSS and would change its shape on a client build. |
| **`lib/store.ts` as the only data boundary.** | It merges filed reports with the documented cases. No page component knows the difference. |
| **Header is sticky with dark type in both states.** | A transparent header over a full-bleed dark hero looks better in a mockup but forces type to change colour on scroll and requires every page to open dark forever. The sample-data banner sits above the header anyway, so a true full-bleed hero was never achievable. |
| **No testimonials section.** | The house page arc puts testimonials before the final CTA. This platform has no users to quote, and inventing them for a civic platform would be dishonest. The transparency dashboard closes instead, and it is stronger. |
| **Derived drawer state in the Header.** | An effect calling `setOpen(false)` on pathname change caused a cascading render on every navigation. ESLint caught it. The drawer now stores the path it was opened on and `open` is derived. |

## 5a. Report intake, in one place

- **Storage.** Supabase table `public.reports` and private bucket `evidence`. Row level
  security is on with no policies: the anon key can do nothing, and the server uses the service
  role key. `lib/reports/db.ts` selects only public columns when listing, so reporter name,
  contact and the IP hash never reach a page. Migration: `supabase/migrations/0001_reports.sql`.
  Setup: `supabase/README.md`.
- **Case numbers** are assigned by a database trigger, `EARTH-YYYY-NNNN`, identity starting at
  100 so they never collide with the documented cases, which are numbered from 0001 in order
  of first report.
- **Location.** A typed city or municipality is resolved against `data/ph-places.json` (1,634
  entries, built from the same PSA boundary data as the map). Device coordinates are checked
  against the map's own region polygons and snapped to the nearest place name. A pin is the
  municipality centre unless the reporter used device location.
- **Photographs** are resized to 1600 px JPEG in the browser, because Vercel caps a function
  body at 4.5 MB. Up to ten, each under 2.5 MB after resizing, stored privately, attached to the
  email, never published.
- **Abuse.** Honeypot field, server-side re-validation of every field, and five reports per IP
  hash per hour, counted in the database.
- **Freshness.** After a successful insert the action calls `revalidatePath` on the home page,
  map, register, dashboard, sitemap and the new case page, so a new report is visible within
  seconds on statically rendered pages.
- **Failure order.** Save first, photographs second, email last. An email outage is logged and
  the reporter still gets their number. A missing Supabase configuration on Vercel returns a
  plain "reporting is temporarily unavailable" and files nothing; on a laptop it falls back to a
  JSON file under `.cache/` so the whole flow can be exercised offline.

## 9. Security posture

The attack surface is one form and one email. What is in place:

- Security headers in `vercel.json`: nosniff, SAMEORIGIN, strict-origin-when-cross-origin,
  Permissions-Policy, HSTS with preload.
- `npm run security` scans for hardcoded secrets, fail-open credential defaults,
  `NEXT_PUBLIC_` secret leaks, `dangerouslySetInnerHTML` outside the JSON-LD builder, missing
  headers, and `target="_blank"` without `rel="noopener"`.
- `npm audit` clean. postcss was bumped to 8.5.28 to clear four advisories.
- Honeypot on both forms, server-side validation of every field, per-IP rate limit on reports.
  Turnstile can be added if spam appears.
- The Supabase service role key and the Resend key are server only. `npm run security` fails
  on any `NEXT_PUBLIC_` variable whose name suggests a secret, and on any credential with a
  literal fallback.

**OneDrive warning.** This project lives in OneDrive. A gitignored `.env.local` still syncs to
Microsoft's cloud. Gitignore protects the repo, not the disk.

## 10. Coding conventions

See `USER_MANUAL.md` Part 2. The enforced ones:

- Chartreuse is never small text on light. QA fails on it.
- The mono face is data only. QA fails on prose set in it.
- No em dashes anywhere. Grammar check fails on them.
- Footer year is computed, never a literal. QA fails on a literal.
- `IS_DEMO` is false and must stay false. If it were ever true again, QA would demand the
  banner back.
- `data/cases.ts` and `data/missions.ts` are generated. Edit `data/source/` and run
  `npm run data:build`.

## 11. Environment setup

`npm install && npm run dev` runs the whole site. Live intake needs four variables from two
dashboards, listed in `.env.example` and walked through in `supabase/README.md`.

## 12. Deployment process

Deployed on Vercel, project `earthlink`, at earthlinkph.vercel.app (earthlink-ebon.vercel.app is
the original alias and still works). Every push to `main` deploys. The report intake goes live
in production the moment the four environment variables are set in the Vercel dashboard and
the site is redeployed.

The code is on GitHub at `arabpame/website`, branch `main`. **That repository is public**,
which is why the valuation figures were moved out of this file before the first push. Keep it
that way: nothing commercial, and no client contact detail, goes into a tracked file.

To deploy: create the Vercel project, set `NEXT_PUBLIC_SITE_URL`, connect the GitHub repo,
push to `main`. `vercel.json` gates the build behind QA, grammar and security.

## 13. Known issues and technical debt

| Issue | Severity | Notes |
|---|---|---|
| **ESLint pinned to 9.39.5, which upstream marks unsupported.** | Medium | ESLint 10 breaks `eslint-plugin-react` bundled inside `eslint-config-next` 16 (`contextOrFilename.getFilename is not a function`). Revisit when Next ships an ESLint 10 compatible config. Not a vulnerability: `npm audit` is clean. |
| **`PRIVATE-NOTES.md` is not backed up anywhere.** | Medium | It holds the EC V-2609 figures and is gitignored on purpose, because the GitHub repository is public. Git will not save it. Carry it by hand to a new laptop, the same way as `.env.local`. |
| **No automated tests.** | Medium | The six QA scripts cover more than most projects here, but there is no Playwright pass on the report flow, which now writes to a database. The flow was exercised by hand against the local store on 16 September 2026. |
| **Reports are managed in the Supabase Table Editor.** | Medium | Status changes and verification happen by editing a row. A verification screen is the next build stage. |
| **Documented cases are frozen at their research date.** | Low | A case's status is what the sources said when it was researched (September 2026). Update the source JSON and rebuild when a case moves on. |
| **Map pins are not keyboard-focusable.** | Medium | Mitigated by the parallel case list published beneath the map, which is a real list of links with the same data. Recorded publicly on the accessibility page. |
| **No screen-reader testing by an actual user.** | Medium | Automated and keyboard testing only. Recorded publicly. |
| **English only.** | Medium | A real limitation for the intended audience. Recorded publicly. |
| **`og.svg` rather than a PNG.** | Low | Some social platforms prefer PNG for OG images. Revisit if sharing looks wrong. |

## 14. Current priorities and next steps

In order.

1. **Get the client's assets.** Domain, twelve photographs, real contact details, and one
   named approver. Every one of these blocks going live and none of them is a code task.
2. **Deploy to Vercel** on a real domain so it can be shared with judges by link.
3. **Settle the scope and cost of the live intake**, which went beyond the phase that was paid
   for. Figures are in `PRIVATE-NOTES.md`.
4. **Set the four intake variables in Vercel** so filing works on the live site, then file one
   test report and delete its row.

## 15. Future improvements

Ranked by value, not effort.

1. **Filipino translation.** The largest single improvement available. The intended audience
   is Filipino youth and barangay officials, and the site is in English.
2. **Playwright on the report flow**, now that it writes to a database.
3. **Keyboard-focusable map pins**, so the map is not pointer-only.
4. **Screen-reader testing with real users.**
5. **A lightweight offline mode.** Reporters in coastal and upland barangays are on poor
   mobile data at exactly the moment they need to file. A queued offline report would be
   genuinely transformative, and it is unusual enough to be a differentiator.
6. **SMS reporting.** Higher reach than the web in many barangays. Worth costing.
7. **A verification screen** so filed reports can be checked, merged and referred without the
   Supabase dashboard.

## 16. Session notes

**15 September 2026. Phase 1 design build, from an empty folder.**

Worked from the studio playbook (`WEBSITE_PLAYBOOK.md`, `PROJECT_RULES.md`) and the
EC V-2609 valuation.

Things worth knowing that are not obvious from the code:

- **The contrast checker earned its place immediately.** The first palette pass had a single
  tone per status and category, and twelve of the pairs failed. The two-tone split came out of
  that failure, not out of taste.
- **The map nearly lost Tawi-Tawi.** A flat simplification tolerance collapsed Bongao island
  so completely that the point-in-polygon check put Bongao in open water. Tolerance is now
  scaled per island. The southernmost province silently vanishing from a national map would
  have been a bad thing for a judge to spot.
- **The grammar checker was rewritten once.** Its first version checked raw lines and produced
  156 findings of which about four were real: it flagged `viewBox="0 0 16 16"` as a repeated
  word and `items-center` as an American spelling. It now extracts prose first. A checker that
  cries wolf gets switched off.
- **ESLint caught a real bug**, a `setState` inside an effect in the Header causing cascading
  renders on every navigation.
- **One design decision was made and then reverted after looking at it**: a transparent header
  with light type over the hero. The header is sticky and therefore in normal flow above the
  hero, so its ground is the paper body colour, not the hero. The comment in `Header.tsx`
  records this so nobody tries it again.
- **A visual and programmatic audit was run at 375px and found five real defects**, all
  fixed: duplicate SVG gradient ids (the homepage renders the map twice, and a fixed id
  made the second map's pin glow take its colour from the first), arrow links at 19px
  against a 24px WCAG 2.2 target, eyebrow text at 10.4px and data labels at 9.5px caused by
  the inherited 95 percent root scale, case page titles running to 70 characters and cutting
  mid-word, and six pipeline labels truncating to "Under veri..." on a phone. The root scale
  is now 100 percent, the smallest label is 11px, titles go through a word-boundary `trim()`,
  and the pipeline labels hide below `sm` while staying available to a screen reader.
- **The sample data is gone (16 September 2026).** The founder is presenting to judges on
  20 September and expects them to file a report live, so the site could no longer read as a
  demonstration. In one session: the report flow was wired to Supabase and Resend; the 37
  invented cases were replaced by 46 real 2026 incidents researched from news and official
  releases, each with its sources on the case page; missions became 14 real announced events;
  partners, scores and dashboard counters became derived values; a gazetteer of every city and
  municipality was built so a typed place becomes a pin; and every demo notice, "Phase N" and
  "nothing was filed" text was removed. `IS_DEMO` is false. This work exceeded the paid Phase
  1 scope and was being priced with the founder as an add-on.

---

Built with care by Erick Cabal. https://erickcabal.com
