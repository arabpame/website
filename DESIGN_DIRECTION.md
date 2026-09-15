# Design Direction: EARTHLINK Philippines

Written before the first component, per `WEBSITE_PLAYBOOK.md` section 2.6 and
`PROJECT_RULES.md` section 2.

---

## Brand foundation

**Business.** A national digital environmental action platform. A resident reports an
environmental problem, it becomes a numbered case, the community verifies it, it is
referred to the agency that can fix it, volunteers act on it, and the public watches the
status until it is resolved.

**Customer.** Three audiences, in this order of priority for Phase 1:

1. Filipino youth, roughly 12 to 24, on a phone, on mobile data. They are the movement.
2. Institutions that must take the platform seriously: LGUs, DENR offices, barangay
   councils, school administrators, sponsors.
3. Competition judges evaluating whether this advocacy is real and already built.

**What they need to believe.** That this is not another awareness page. That a report
filed here does not disappear. That someone can check whether anything actually happened.

**Primary action.** Report an environmental concern. Everything else on the site exists to
make a first-time visitor trust that reporting is worth their time.

**Three-word personality.** Accountable. Alive. Unignorable.

**The feeling to create.** A working instrument, not a poster. The site should feel like
equipment that is currently switched on and measuring something.

**Not.** Corporate. Preachy. Cute-NGO. Generic-green.

---

## References studied

Researched September 2026, per the playbook's reference gallery plus sector-specific
sources.

| Reference | The specific move worth taking |
|---|---|
| [Web Design Awards 2026 criteria](https://www.webdesignawards.io/winners) | Judging weights performance (20%) and innovation (20%) above visual design (15%). Confirms the quality floor is not decoration. Build for measured performance first. |
| [CivicPulse, AI civic reporting (SF)](https://civictech.guide/) | Report in plain language by text, photo or voice, then auto-route by location. The routing, not the form, is the product. Our Connect phase is the same insight. |
| [Civic Tech Field Guide](https://civictech.guide/) | Civic platforms earn trust by publishing their own operating data, not by claiming credibility. Hence a public transparency dashboard in the primary nav, not buried. |
| [RESET.ORG on citizen environmental data](https://en.reset.org/civic-tech-citizens-drive-environmental-and-climate-protection-with-public-data-apps-and-platforms/) | Citizen-collected environmental data becomes a common good only when it is legible to non-specialists. Every number on this site gets a plain-language label. |
| [Dashboard design guide 2026, Aufait UX](https://www.aufaitux.com/blog/dashboard-design-examples-inspiration-best-practices/) | Dashboards carry invisible assumptions (date ranges, exclusions, freshness). Surface them in the UI. This directly produced our data-provenance line under every counter. |
| [ESG dashboard design 2026, Mokkup](https://medium.com/@mokkup/designing-the-future-of-esg-dashboards-how-to-build-sustainability-reporting-tools-for-2026-6106d647c9ed) | Sustainability reporting fails when it is visually clean but not actionable. Every metric on our dashboard links to the cases behind it. |
| [Dashboard trends 2026, Fuselab](https://fuselabcreative.com/top-dashboard-design-trends-2025/) | Move the interface to the user's decision workflow instead of making them adapt. Our report flow is four steps in the order a person actually notices a problem. |
| [Bricolage Grotesque pairing, Pimp my Type](https://pimpmytype.com/bricolage-grotesque-font-pairing/) | Public Sans is the recommended body partner for Bricolage Grotesque: same rational form model, simpler execution. Validated our type pairing externally rather than by taste. |
| [Best Environmental Website Awards](https://www.webaward.org/category/Environmental/best-environmental-websites.html) | The sector's default is photography of pristine nature over a green gradient. Deliberately avoided: our hero shows problems being tracked, not scenery. |
| [philippines-json-maps, faeldon (MIT)](https://github.com/faeldon/philippines-json-maps) | Administrative boundaries from PSA PSGC data, pre-simplified. Source of our map geometry, so the archipelago is real geography and not an illustration. |

**Competitors and adjacent work considered.** Existing Philippine environmental reporting
is mostly Facebook pages and a handful of LGU hotline forms, which is precisely the gap the
concept identifies. The aspirational references are civic-infrastructure platforms
(FixMyStreet-style reporting, public transparency dashboards), not NGO brochure sites.

---

## Chosen direction

### The core idea: a field instrument

The concept already contains its own design system and nobody noticed. The client wrote six
case states with six colours:

> REPORTED, UNDER VERIFICATION, REFERRED TO AUTHORITIES, ACTION IN PROGRESS, RESOLVED,
> MONITORING

That is a functional colour system supplied by the client. It is the most honest possible
source for this palette, so the status ramp is treated as a first-class part of the brand
rather than as UI chrome bolted on later.

### Palette application

**Dominant** is a deep mangrove ink, dark enough to read as near-black with a green cast.
It carries the dark data bands and all body type.

**Ground** is a cool, faintly green paper. This is a deliberate break: seven of the last
eight studio builds ground on a warm cream, sand or ivory. A warm ground would make this
read as another hospitality site. The ground here is cool because the subject is water,
air and measurement.

**Accent** is hi-vis chartreuse, the colour of field safety gear. It is the interactive
and focus colour. It was chosen by elimination and the elimination is the interesting part:
red, orange, amber, blue, green and grey are all spoken for by the six case states, so
using any of them as the brand accent would make the interface ambiguous. Chartreuse sits
outside the entire status ramp, reads as equipment rather than as decoration, and is
clearly distinct from the pure yellow used in ECG Fitness.

Chartreuse fails contrast as small text on the light ground, so it is used only on dark
surfaces, for large type, and for graphic elements. This is recorded as a rule, not left to
be discovered.

### Type

**Display: Bricolage Grotesque.** Rational, slightly contrasting, with real character in
its wide weights. Nothing in the portfolio uses it.

**Body: Public Sans.** Built for a government design system, so it is legible at small
sizes on poor screens and carries civic credibility without trying. Externally validated as
the recommended partner for Bricolage Grotesque.

**Data: JetBrains Mono.** The playbook allows a third face only with a reason. The reason:
EARTH case numbers, coordinates, timestamps and counters are tabular data, and setting them
in a proportional face is what makes civic platforms look like brochures. The mono face is
restricted to data, never used for prose.

### Layout archetype and hero

**Full-bleed dark data field.** The hero is not a photograph. It is the live map of the
Philippines with case pins on it, dark, with the headline bottom-left and the live counters
as the proof strip welded to its lower edge.

This is chosen over the portfolio's existing hero archetypes because it is the only one
that proves the claim in the headline. A photograph of a clean beach would be a promise. A
map with 40 tracked cases on it is evidence.

Height stops at `92vh` so a sliver of the next section shows, which is the ECG rule and it
is correct.

### Motion character

Instrument-like and restrained. Counters count up once on entry. Map pins drop with an
80ms stagger. Status rails fill left to right. Nothing bounces, nothing parallaxes. The
site should feel like a readout settling, not like a presentation.

### Imagery

Most photography is still outstanding, and the valuation lists twelve photographs as a
precondition for a build day. Rather than ship stock images pretending to be Philippine
communities, an unfilled photo slot renders a `PhotoFrame` placeholder: a tone-matched
gradient with grain and a visible "Photograph to be supplied" tag. An empty state that reads
as deliberate. This is the ECG pattern and it is honest about what is missing.

`PhotoFrame` takes an optional `src`. With one it renders the real photograph in the same
frame, radius and border, so a half-photographed page never looks half-built. Without one it
stays the placeholder. Filling a slot is therefore a one-line change and nothing else moves.

**Three founder photographs are in, and they are the only photography on the site.** They are
commissioned portraiture, generated to brief, and they are treated accordingly:

| File | Where | Why there |
|---|---|---|
| `founder-field.jpg` | About, "The advocate" | Documentary register. He is working, on a littered shoreline, looking off camera. It argues the platform's case rather than introducing a personality. |
| `founder-cutout.webp` | Home, "The advocate" band | Transparent cut-out composited over the brand gradient, with **live text**, never type baked into pixels. |
| `founder-hero.jpg` | Get involved, key art | Landscape key art under the page header. |

Two rules govern them, and both are load-bearing:

1. **They never touch the case register, the map or a mission.** They are not evidence. No
   case, location or date is attached to them, and no caption implies one. The sample-data
   rule in `PROJECT_RULES.md` covers photographs as well as figures.
2. **No type is ever baked into an image.** Baked text cannot be selected, read by a screen
   reader, reflowed at 375px or translated, and Filipino translation is the largest single
   improvement still available to this site. Every headline over a photograph is real text
   in the DOM.

Photographs are optimised by `npm run photos:optimize`, which converts anything dropped into
`public/photos` to a derivative under the 300 KB QA budget, keeps transparency as WebP, and
moves the untouched original into the gitignored `photos-master/`.

### The signature element: the case chip

A monospaced EARTH case number, a status dot, and a six-segment pipeline rail.

```
EARTH-2026-0417  ●  [■][■][■][□][□][□]  Action in progress
```

It appears on cards, on map pins, on the case page, in the dashboard and in the admin
queue. It is the visual proof of the platform's one real promise, that a report becomes a
tracked object rather than a post that scrolls away. Nothing in the portfolio has anything
like it, and no other environmental site in the sector has one either, because most of them
have nothing to track.

### How this differs from the last three builds

| | Ground | Dominant | Accent | Display type | Hero |
|---|---|---|---|---|---|
| Sourire Studio | Warm stone | Taupe/brown | Muted olive | Serif | Split, photo right |
| ECG Fitness | Off-white / black | Near-black | Pure yellow | Condensed sans | Full-bleed photo |
| Mana | Dark | Near-black brown | Gold | Serif | Full-screen scrim |
| **EARTHLINK** | **Cool green-grey paper** | **Mangrove ink** | **Hi-vis chartreuse** | **Bricolage Grotesque** | **Live data map** |

Different ground temperature, different accent family, different type classification,
different hero archetype. The only thing carried over is the quality floor.

---

## Deviations from the house menu (playbook 3.7), with reasons

| House pattern | Decision | Reason |
|---|---|---|
| Eyebrow label, uppercase, wide tracking | **Adopt**, fixed at `0.22em` | The playbook notes tracking drifts from 0.18em to 0.35em across projects and says pick one. Picked. |
| Exactly two hero CTAs, primary plus outline | **Adopt** | Report a concern (primary) and Explore the map (outline). |
| Display face plus sans body, assigned in the base layer | **Adopt** | Plus a third mono face for data only, justified above. |
| Body copy at 70 to 80 percent ink opacity | **Adopt** | `text-ink/75` on light, `text-paper/70` on dark. |
| Accent focus ring with ground-matched offset | **Adopt** | Chartreuse ring, paper offset on light, ink offset on dark. |
| `aria-hidden` on every decorative node | **Adopt** | Including all map ornament and the grain overlay. |
| Warm neutral ground | **Drop** | Deliberately replaced with a cool ground. See above. This is the single biggest break and it is the point. |
| Proof strip under the hero | **Adopt**, welded to the hero | Live impact counters. It pays off the headline immediately. |
| One dark contrast band per page | **Adapt** | On this site the dark band is the map itself, and it appears once per page as the rule requires. |
| Testimonials immediately before the final CTA | **Drop** | The platform has no customers to quote yet. Inventing testimonials for a civic platform would be dishonest. The closing argument is the transparency dashboard instead, which is stronger. |
| `group-hover:scale-105` on photos, `duration-500` | **Adopt** | On case cards and mission cards. |
| Section padding `py-16 sm:py-20 lg:py-28` | **Adopt** | Standardised, per the playbook's note that this varies across six projects. |
| `mt-12` heading to grid, `mt-10 text-center` grid to button | **Adopt** | |
| Stagger `index * 80` | **Adopt** | |
| Blurred accent orbs behind light heroes | **Drop** | The hero is dark and data-bearing. Orbs would be decoration on a page arguing against decoration. |
| Ink-tinted semantic shadows | **Adopt** | Tinted with mangrove ink, never black. |
| `loading.tsx` where data is fetched | **Adopt** | The playbook calls its absence the portfolio's biggest gap and the easiest win. Fixed here. |

---

## Tokens summary

Landing in `tailwind.config.ts` under `brand.*`.

```
brand.ink        #07231E   mangrove ink, body type and dark bands
brand.deep       #0B3B32   mid mangrove, headings on light
brand.primary    #0E6B55   primary action
brand.signal     #C2F24D   hi-vis chartreuse, accent and focus
brand.paper      #F1F5F1   cool page ground
brand.surface    #FFFFFF   raised cards
brand.line       #D4DED8   hairlines and borders
```

### Every status and category carries two tones

This is the most important decision in the palette, and it came out of the contrast
checker rather than out of taste.

The first pass gave each of the six statuses and seven categories a single vivid colour.
Running `npm run contrast` failed twelve of them. A mid-saturation orange or sky blue is
perfectly readable as a dot and completely unreadable as a label on a light ground, which
is exactly the failure mode the playbook warns about in section 3.6.

So each one has two tones, and the split is functional:

- **`pin`** is the saturated tone. Dots, map pins, rails, fills. It is graphic, it sits on
  the dark map, and it needs 3:1.
- **`text`** is the darkened tone. Labels on the light ground. It carries meaning as text,
  so it needs 4.5:1.

The tones were solved for numerically, holding hue and saturation and walking lightness
until each cleared its target with headroom, so a later nudge does not silently break one.

Case status ramp, from the client's own six states:

```
                      pin        text
status.reported     #DF3023    #C3281D   red
status.verifying    #F79009    #965705   orange
status.referred     #CA8A04    #895E03   amber
status.progress     #2E90FA    #0563C9   blue
status.resolved     #12B76A    #0C7544   green
status.monitoring   #98A2B3    #5A667A   grey
```

Seven map category layers, from the concept's own seven icons:

```
                        pin        text
cat.water             #0EA5E9    #096D9A   Water and ocean
cat.forest            #168740    #137538   Forest
cat.waste             #8C52EF    #7B39ED   Waste
cat.air               #67778F    #59677C   Air
cat.biodiversity      #0D9488    #0A7269   Biodiversity
cat.land              #A86607    #925906   Land
cat.hazard            #DE3030    #C72020   Environmental hazard
```

Waste is violet rather than the recycling green the icon implies, because a second green on
a map that already uses green for Forest and green for Resolved would be unreadable. Colour
is never the only carrier of meaning here: every category and status also carries a text
label and a distinct icon shape, so the interface still works in greyscale and for a
colour-blind reader.

### Contrast checks

Measured, not assumed. `npm run contrast` computes all 53 pairs from the same hex values
that land in `tailwind.config.ts` and writes `docs/CONTRAST.md`. It runs inside
`npm run verify`, so a palette change that breaks a pair fails the build rather than
shipping.

**All 53 pairs pass.** The headline ones:

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| ink `#07231E` on paper `#F1F5F1` | 15.04:1 | 4.5 | Pass |
| ink at 75% on paper | 6.93:1 | 4.5 | Pass |
| deep `#0B3B32` on paper | 11.31:1 | 4.5 | Pass |
| white on primary `#0E6B55` | 6.46:1 | 4.5 | Pass |
| ink on signal `#C2F24D` | 12.70:1 | 4.5 | Pass, this is the chartreuse button |
| signal on ink | 12.70:1 | 4.5 | Pass, chartreuse type on dark |
| paper at 70% on ink | 7.94:1 | 4.5 | Pass |
| status text tones on paper | 5.20 to 5.27:1 | 4.5 | All six pass |
| category text tones on paper | 5.20 to 5.26:1 | 4.5 | All seven pass |
| category pin tones on the ink map | 3.60 to 5.97:1 | 3.0 | All seven pass |
| signal on paper | 1.18:1 | 4.5 | **Forbidden and recorded as such.** Chartreuse is never small text on the light ground. |

---

## Type scale

```
display-2xl  clamp(3rem, 8vw, 6rem)      line-height 0.95   Bricolage
display-xl   clamp(2.5rem, 5.5vw, 4.25rem) line-height 1.02 Bricolage
display-lg   clamp(2rem, 4vw, 3rem)      line-height 1.08   Bricolage
body         16px minimum                line-height 1.6    Public Sans
data         14px                        tabular-nums       JetBrains Mono
```

Line height shrinks as size grows, per the playbook.

---

Built with care by Erick Cabal. https://erickcabal.com
