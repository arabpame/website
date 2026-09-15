# EARTHLINK Philippines. User manual

Two parts. Part 1 is for whoever runs EARTHLINK and needs no technical knowledge at all.
Part 2 is for a developer.

---

# PART 1. OWNER GUIDE

Written for someone who has never opened a terminal. Nothing here requires code.

## What this website is, right now

EARTHLINK is live. Every screen works, and two things on it are real in the fullest sense:

- **Reports are real.** Anything filed on the Report page is saved, given a permanent case
  number, pinned on the map, given its own public case page, and emailed to you with the
  photographs attached. Since 16 September 2026.
- **The cases are real.** Every case in the register is a documented 2026 incident taken from
  published news reporting or an official release, and the sources are listed on the case page.
  Nothing is invented. The partner counts, the EARTH Score and every dashboard number are
  calculated from those cases.

What is not built yet: accounts, an admin screen, and messages back to reporters. Filed
reports are read and updated in the Supabase dashboard for now.

**Do not put invented data back.** A judge, an LGU officer or a sponsor who finds one made-up
case will doubt every real one. If you want a case on the site, file it through the Report
page or add it to the research record with its source.

## The pages, and what each one is for

| Page | What it is for |
|---|---|
| **Home** | The argument. It opens on a live map of the country with every case on it, because a map with tracked cases proves something a photograph of a beach only promises. |
| **Report** | The main thing the platform is for. Four steps, about five minutes, works on a phone. |
| **EARTH Map** | Every case plotted across the Philippines. Filter by the seven categories and the six case states. Shows hotspots, meaning places where the same problem keeps returning. |
| **Cases** | The register. Every case at every stage, including the ones still waiting. Each has its own page with the full history. |
| **Track** | The transparency dashboard. The platform's own numbers, including how long referrals have been waiting. |
| **Learn** | Ten topic tracks, from climate change to environmental law. |
| **EARTH Kids** | A separate simplified area for children aged about 7 to 11. |
| **Missions** | Volunteer opportunities, and the measured results of completed ones. |
| **Connect** | The directory of LGUs, agencies, barangays, schools and organisations. |
| **EARTH Score** | The leaderboard for barangays, schools and organisations, with the rules published. |
| **Ambassadors** | The youth programme. |
| **About** | The vision, the full ten-step cycle, and an honest list of what is and is not built. |
| **Get involved, Contact** | Ways in, and the enquiry form. |
| **Privacy, Terms, Accessibility** | The legal and access commitments. |

## The most important thing to know

**Every number on this site says what it counts.**

Under each figure on the dashboard there is a small line explaining exactly what is included
and what is excluded. For example, trees are counted at ninety days after planting, not on
planting day, so the number is always smaller than the number announced at the event.

This is deliberate and it is the whole argument of the platform. Anyone can announce that
four thousand mangroves were planted. Almost nobody publishes how many were still alive three
months later. Doing that is what will make an LGU take EARTHLINK seriously.

Please do not let anyone talk you into removing those lines to make the numbers look bigger.

## Showing this to judges or sponsors

A five-minute route that lands well:

1. **Home.** Let them see the map with the case pins. Scroll to the six-state pipeline.
2. **A case page.** Open a case they may have heard of, for example the Binaliw landfill
   collapse in Cebu City or the Magat Dam fish kill. Show the timeline, the office it was
   referred to, the measured figures, and the sources at the bottom.
3. **Report.** File a report live. See the next section. This is the moment that proves the
   platform is operating and not a mock-up.
4. **The map, again.** Their pin is on it. Open the new case page and walk the six stages.
5. **Track.** Scroll to "Cases referred and still waiting". This is the slide that wins the
   room, because no other environmental platform in the country publishes it.

If someone asks "is this real?", the answer is yes, twice: the report you just filed is in the
database and in the founder's inbox, and every other case is a documented incident with its
sources on the page.

## Filing a report live, in front of an audience

Rehearse this twice before the day. It takes about ninety seconds.

**Before you go on**

- Have the site open on your phone at `/report`, on mobile data, not venue Wi-Fi.
- Have two or three photographs already in your camera roll. Anything of a real problem you
  have seen. Do not take a photo of the audience.
- Make sure your Resend inbox is open on the laptop or the screen, so the email can be shown
  arriving.
- Decide the location in advance. Type it, do not rely on the venue's GPS. City and province
  are enough; the barangay is optional.

**The four steps, spoken aloud**

1. **What you saw.** Pick the category ("seven categories, and they decide which office the
   case is routed to"). Type a short title and a sentence or two. Enter the date. Choose the
   urgency.
2. **Where it is.** Type the city or municipality and the province. Say that the platform
   knows every city and municipality in the country and places the pin itself.
3. **Evidence.** Tap "Tap to add photographs" and pick two. Say they are resized on the phone
   before sending, so it works on mobile data.
4. **About you.** Tick the consent box. Say that a name is optional and that anonymous
   reports get a case number too. Tap "File this report".

**What they see next**

- The case number, for example EARTH-2026-0104. "Permanent, never reused."
- "Open the case page": the report is already a public page with the six-stage pipeline at
  Reported.
- "See it on the map": the new pin.
- On the laptop: the email, with the photographs attached, within a few seconds.

**What happens after, and what to say**

- Reported, then Under verification: the team checks it and merges duplicates.
- Referred: sent to the responsible office with the evidence. The public page shows how many
  days it has waited.
- In progress, Resolved, Monitoring: the result is measured, and the case is watched.
- For now the status is changed by you in the Supabase dashboard; the next build stage puts a
  verification screen on the site.

**If something goes wrong**

- "Reporting is temporarily unavailable": the four environment variables are not set on
  Vercel. Nothing is lost; set them and redeploy. Check this the day before, not on the day.
- "We could not find that city or municipality": check the spelling of both fields, or write
  "Metro Manila" as the province for an NCR city.
- No email arrives: the report is still saved and on the map. Resend only delivers to the
  address that owns the Resend account until a domain is verified.

**Afterwards**

Delete the test report's row in Supabase so the register stays honest, or keep it if a judge
filed a real concern.

## What you will need to supply before this can go live

Nothing here is code. These are the things only you can provide.

1. **A domain.** Something like `earthlink.ph`. Until it exists, the site cannot be published
   at a real address.
2. **Photographs.** At least twelve. Every photo slot currently shows a dark placeholder that
   says "Photograph to be supplied". Real photographs of real Philippine communities, missions
   and coastlines will transform how this feels.
3. **The real contact details.** A phone number and a postal address. They currently say
   "TO BE SUPPLIED" and the QA check will refuse to publish the live version until they are
   filled in.
4. **A named person who approves changes.** One person. This matters more than it sounds.
5. **The organisation's registration**, if EARTHLINK is to receive anything or sign anything.

## How updates go live

Once the project is connected to hosting, publishing is one step:

```bash
npm run verify
```

If that passes, push to the `main` branch and the site updates in about a minute. If it fails,
it tells you exactly what is wrong and nothing is published. That is the point: the checks
exist so a broken or dishonest page cannot reach the public by accident.

## Common situations

**"I want to change some wording."**
All of the site's text lives inside the page files. Ask a developer, or Claude, to change the
wording on a named page. It is a small job.

**"I want to add a case that was in the news."**
Add it to the right `data/source/cases-*.json` file with its source URLs, then run
`npm run data:build`. The script places it on the map from the city and province, numbers it,
and refuses to write anything if a source is missing or a place cannot be found. Do not edit
`data/cases.ts` by hand: it is generated.

**"The numbers on the dashboard are wrong."**
They are calculated from the cases and missions, not typed in. If a case changes, the
dashboard changes with it. That is deliberate, so the dashboard can never quietly disagree
with the pages it summarises.

**"Someone filed a report."**
You have the email with the photographs. Open the case in Supabase, check it, and change its
`status` as it moves: verifying, referred, progress, resolved, monitoring. The public case page
shows the new status on the next visit. Reply to the reporter yourself from the email if they
left a contact.

## Daily routine checklist

- [ ] Read every new report email. Each one is also a row in Supabase.
- [ ] Verify or merge anything that has been waiting more than three days.
- [ ] Check which referrals are approaching thirty days and chase them.
- [ ] Reply to anything in the enquiry inbox.

## QA checklist before publishing

- [ ] `npm run verify` passes.
- [ ] Every page has been looked at on a phone, not only on a laptop.
- [ ] No placeholder text anywhere the public can see.
- [ ] The Report page files a test report on the live site, and the email arrives.
- [ ] Every number still has its explanation line underneath it.

## Troubleshooting

**"The site will not start."**
Run `npm run clean`, then `npm install`, then `npm run dev`. Nine times out of ten this is a
build cache that came from a different laptop through OneDrive, and cleaning fixes it.

**"A build error mentions a folder that is not on my computer."**
Exactly the same cause. `npm run clean` and try again. This is not a real error and it has
cost this studio months in the past.

**"Something I fixed came back."**
Look for a file with a laptop name in it, like `page-DESKTOP-ABC.tsx` sitting next to
`page.tsx`. That is OneDrive resolving an edit made on two machines, and the file with the
device name is usually your actual work. `npm run doctor` finds these automatically.

## Frequently asked questions

**Can people report anonymously?**
Yes. No name, no account, no contact details required. The case still gets a number.

**What happens to a report if the agency ignores it?**
It stays visible at "Referred to authorities" and the number of days it has been waiting
keeps climbing, in public, on the Track page. That pressure is the point of the platform.

**Is the map real?**
Yes. The coastline and all seventeen regions come from Philippine Statistics Authority
boundary data. Each pin is placed at the centre of the city or municipality the case names,
unless the reporter used their phone's location, in which case it is exactly where they stood.

**Can this be translated into Filipino?**
Not yet, and it should be. It is recorded as a real limitation on the accessibility page
rather than hidden.

**How much of the full platform is this?**
Phase 1 of five, and a small fraction of the total build. What it gives you is every screen,
so you can raise funding against something real instead of a description. The phase-by-phase
breakdown is in the EC V-2609 valuation, which is a separate document.

---

# PART 2. DEVELOPER GUIDE

## Tech stack

Next.js 16.3 App Router, React 19.3, TypeScript strict, Tailwind 3.4. Three runtime
dependencies: `next`, `react`, `react-dom`.

Tailwind 3 rather than 4 is deliberate: the studio's brand-token convention lives in
`tailwind.config.ts` and v4 moves tokens into CSS, which would change the token shape on a
client build for no benefit here.

## Architecture

```
Server Component (default)
    reads via lib/store.ts
        which merges filed reports (Supabase, lib/reports) with the documented cases (data/cases.ts)

Client Component ("use client", at the leaf only)
    Header, MapExplorer, ReportForm, ContactForm, Reveal
    That is the complete list. Everything else is a Server Component.
```

Three rules that keep it that way:

1. **Server Components by default.** `"use client"` goes at the leaf, never on a layout. One
   `"use client"` near the root drags the whole tree into the bundle and wrecks INP.
2. **Pages never import from `data/`.** They import from `lib/store.ts`. When accounts arrive that one
   file changes and no page component does.
3. **Store functions are async even though nothing awaits.** Same reason. A synchronous call
   site would have to be rewritten later.

## Folder structure

See `README.md`. The one rule worth restating: `lib/constants.ts` holds every brand fact, and
nothing may restate a value that lives there.

## Install and run

```bash
node scripts/doctor.mjs
npm install
npm run dev     # port 3033, matching the project folder number
```

## Environment variables

None are needed to build or browse. Live report intake needs four, from two dashboards:
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` and
`REPORTS_TO_EMAIL`. `.env.example` lists them and `supabase/README.md` walks through
getting them. On a laptop without them, reports go to a file under `.cache/` so the flow can be
tested offline. On Vercel without them, the Report page says reporting is unavailable.

## Build process

`npm run verify` chains: typecheck, contrast, qa, grammar, security, build. `vercel.json`
gates the deploy behind qa, grammar and security.

Run typecheck and build separately, never concurrently. Running both at once has OOM-killed
builds in this studio with exit 137.

## Deployment

GitHub `main` to Vercel, auto-deploy. Preview deploys on branches.

## Components

| Component | Notes |
|---|---|
| `CaseChip` | **The signature element.** Case number, six-segment rail, status label. Appears everywhere a case does. If you build a new case surface, use this. |
| `EarthMap` | Server-rendered SVG. `detail="hero"` drops the 300 smallest islands for the homepage. |
| `MapExplorer` | The client-side filtering map. Memoises the 457 shapes: do not remove that. |
| `PhotoFrame` | Tone-matched placeholder with grain and a visible tag. Cycles tones so adjacent placeholders differ. |
| `PageHeader` | The dark band every inner page opens with. |
| `Reveal` | CSS-first scroll reveal with a 1200ms failsafe. Content is visible by default. |

## APIs and server actions

Two Server Actions, no API routes.

- `app/report/actions.ts`, `fileReport(FormData)`: honeypot, full re-validation, location
  resolution through `lib/places.ts`, rate limit (five per IP hash per hour), insert, store
  photographs, email, `revalidatePath`. Persist before sending, always: email is not a
  database. Returns the case number or field errors keyed by field id.
- `app/contact/actions.ts`, `sendEnquiry(FormData)`: honeypot, validation, one email with
  the sender as reply-to.

## Database and RLS

Supabase. One table, `public.reports`, and one private bucket, `evidence`. Row level
security is on with no policies at all, so the anon key can read and write nothing. Only the
server, with the service role key, touches the data, and it selects the public columns only
when listing. Case numbers come from a trigger. Migration: `supabase/migrations/0001_reports.sql`.
When accounts arrive: index every column a policy references, and wrap `auth.uid()` in a
subselect so Postgres evaluates it once rather than per row.

## Auth model

None yet. The next stage uses Supabase Auth for partner accounts and a signed cookie session
for the owner-only verification screen. Fail closed: never `process.env.ADMIN_PASSWORD ||
"literal"`. `npm run security` fails the build on that pattern.

## Coding conventions

- Components PascalCase. `lib/` files kebab-case. Route segments kebab-case.
- No hardcoded hex outside `tailwind.config.ts`.
- Body copy at 70 to 80 percent ink opacity.
- `aria-hidden` on every decorative node.
- Section padding `py-16 sm:py-20 lg:py-28`, via the `.section` class.
- Eyebrow tracking is `0.22em`, fixed, via `tracking-eyebrow`.
- The mono face (`font-data`) is for data only. The QA check fails on prose set in it.
- Chartreuse is never small text on the light ground. That pair is 1.18:1 and the QA check
  fails on it.

## Security practices

`npm run security` scans for hardcoded secrets, fail-open credential defaults, `NEXT_PUBLIC_`
leaks, `dangerouslySetInnerHTML` outside the JSON-LD builder, missing headers, and
`target="_blank"` without `rel="noopener"`.

This folder is inside OneDrive. A gitignored `.env.local` still syncs to Microsoft's cloud.
Gitignore protects the repo, not the disk.

## QA procedures

| Script | Catches |
|---|---|
| `contrast-check.mjs` | All 53 colour pairs. Writes `docs/CONTRAST.md` |
| `qa-check.mjs` | Broken internal links, missing or oversized metadata, multiple h1s, missing alt, `console.log`, asset budgets, and the project-specific rules above |
| `grammar-check.mjs` | Em dashes across everything; spelling and repeated words over extracted prose only |
| `security-check.mjs` | See above |
| `verify-map.mjs` | 19 real cities land in their real regions |
| `verify-cases.mjs` | Every documented case lands in the region it claims |

The last two matter more than they look. A pin in the wrong sea is the most obvious way this
demonstration could embarrass someone presenting it.

## Troubleshooting

**Build fails quoting a path from another operating system.** `npm run clean`. OneDrive synced
a build cache from another machine. This is not a real error.

**`npm run doctor` reports a sync conflict copy.** Compare both files against `HEAD` before
deleting anything. The copy with the device name in it is usually the real work.

**ESLint crashes with `contextOrFilename.getFilename is not a function`.** Something upgraded
ESLint to 10. `eslint-config-next` 16 bundles an `eslint-plugin-react` that is not compatible
with it. Pin ESLint to 9.39.5. This is recorded in `handoff.md` as known debt.

**A map pin is in the wrong place.** `npm run qa` should have caught it. If the projection in
`lib/map.ts` was edited, it must stay in step with `scripts/build-map.mjs`.

## Future improvements

Ranked, with reasoning, in `handoff.md` section 15.

---

Built with care by Erick Cabal. https://erickcabal.com
