import type { Track } from "@/lib/types";

/**
 * The LEARN hub. Ten topic tracks, exactly the ten named in the concept document,
 * plus the EARTH KIDS versions.
 *
 * SAMPLE CURRICULUM. The structure, lesson counts and durations are designed.
 * The lesson content itself is written in Phase 4, with teachers, and should be
 * reviewed against the DepEd curriculum before any school uses it.
 */

export const TRACKS: Track[] = [
  {
    slug: "climate-change",
    title: "Climate change, and what it does here",
    topic: "Climate change education",
    category: "air",
    level: "foundation",
    audience: "Everyone. Start here if you start anywhere.",
    summary:
      "What is actually changing, why the Philippines sits among the most exposed countries on earth, and which parts of it a community can do something about. Ends with the difference between mitigation and adaptation, because the two need different actions and get confused constantly.",
    lessons: [
      { slug: "what-is-changing", title: "What is actually changing", duration: 8, format: "video", summary: "The mechanism, in eight minutes, without the polar bear.", hasQuiz: true },
      { slug: "why-the-philippines", title: "Why the Philippines is so exposed", duration: 10, format: "infographic", summary: "Typhoon tracks, sea level, and 36,000 kilometres of coastline.", hasQuiz: true },
      { slug: "mitigation-vs-adaptation", title: "Mitigation and adaptation are not the same thing", duration: 7, format: "reading", summary: "Reducing the cause and surviving the effect need different work.", hasQuiz: true },
      { slug: "what-a-barangay-can-do", title: "What one barangay can actually do", duration: 12, format: "activity", summary: "A mapping exercise for your own area.", hasQuiz: false },
    ],
  },
  {
    slug: "waste-segregation",
    title: "Waste segregation that actually works",
    topic: "Waste segregation guides",
    category: "waste",
    level: "foundation",
    audience: "Households, barangay officials, school eco-clubs.",
    summary:
      "RA 9003 in plain language, the five-bin reality most places cannot reach, and the pragmatic three-stream version that works. Includes the most common failure, which is segregating at home and then watching one truck take it all away.",
    lessons: [
      { slug: "ra-9003-in-plain-language", title: "The law, in plain language", duration: 9, format: "reading", summary: "RA 9003, the Ecological Solid Waste Management Act, without the legalese.", hasQuiz: true },
      { slug: "three-streams", title: "Three streams beat five bins", duration: 6, format: "video", summary: "Why the simpler system survives contact with real households.", hasQuiz: true },
      { slug: "the-collection-problem", title: "When segregation is undone at collection", duration: 8, format: "reading", summary: "What to do when one truck takes everything. Includes how to document it.", hasQuiz: true },
      { slug: "setting-up-an-mrf", title: "Setting up a materials recovery point", duration: 14, format: "infographic", summary: "Space, staffing and the numbers a barangay needs to argue for one.", hasQuiz: false },
      { slug: "audit-your-own-waste", title: "Audit your own household waste", duration: 20, format: "activity", summary: "One week, one notebook. Most people are surprised.", hasQuiz: false },
    ],
  },
  {
    slug: "plastic-pollution",
    title: "Plastic pollution and the sachet economy",
    topic: "Plastic pollution awareness",
    category: "waste",
    level: "foundation",
    audience: "Students and general audiences.",
    summary:
      "Where plastic actually goes, why the sachet is the hardest Philippine case, and the difference between a personal habit change and a systemic one. Careful not to pretend a refill station solves a supply chain.",
    lessons: [
      { slug: "where-plastic-goes", title: "Where it goes after the bin", duration: 9, format: "video", summary: "Following one sachet from a sari-sari store to a river mouth.", hasQuiz: true },
      { slug: "the-sachet-problem", title: "Why the sachet is the hard case", duration: 11, format: "reading", summary: "Affordability, multilayer film, and why recycling it is not simple.", hasQuiz: true },
      { slug: "habit-vs-system", title: "Habit change and system change", duration: 7, format: "infographic", summary: "Both matter. Only one of them scales on its own.", hasQuiz: true },
      { slug: "brand-audit", title: "Run a brand audit", duration: 25, format: "activity", summary: "Count what you collect by brand. It changes the conversation.", hasQuiz: false },
    ],
  },
  {
    slug: "marine-coastal",
    title: "Marine and coastal conservation",
    topic: "Marine and coastal conservation",
    category: "biodiversity",
    level: "intermediate",
    audience: "Coastal communities, dive operators, fisherfolk organisations, students.",
    summary:
      "Reefs, seagrass and mangroves as one connected system rather than three separate topics. Covers marine protected areas, what bantay dagat volunteers actually do, and how to document reef damage in a way an agency can act on.",
    lessons: [
      { slug: "one-connected-system", title: "Reef, seagrass and mangrove are one system", duration: 12, format: "video", summary: "Why protecting one and ignoring the others fails.", hasQuiz: true },
      { slug: "marine-protected-areas", title: "What a marine protected area does", duration: 10, format: "reading", summary: "And the difference between one on paper and one in the water.", hasQuiz: true },
      { slug: "mangrove-basics", title: "Mangroves: the cheapest sea wall there is", duration: 9, format: "infographic", summary: "Storm protection, nursery habitat, carbon. Plus why planting the wrong species fails.", hasQuiz: true },
      { slug: "documenting-reef-damage", title: "Documenting reef damage properly", duration: 15, format: "activity", summary: "Transects, scale references, GPS marks. What makes evidence usable.", hasQuiz: true },
    ],
  },
  {
    slug: "forest-protection",
    title: "Forest protection and watersheds",
    topic: "Forest protection",
    category: "forest",
    level: "intermediate",
    audience: "Upland communities, people's organisations, students.",
    summary:
      "Why a forest is mostly about water, how to tell legal cutting from illegal cutting, and what a permit notice is supposed to look like at a site. Includes reforestation that survives, which is a different skill from reforestation that photographs well.",
    lessons: [
      { slug: "forests-are-about-water", title: "A forest is mostly about water", duration: 10, format: "video", summary: "Watersheds, infiltration, and the flood that happens downstream.", hasQuiz: true },
      { slug: "legal-or-not", title: "Telling legal cutting from illegal cutting", duration: 12, format: "reading", summary: "Permits, notices, and what should be posted at a site.", hasQuiz: true },
      { slug: "planting-that-survives", title: "Planting that survives past the photograph", duration: 11, format: "infographic", summary: "Species choice, spacing, and counting survival at ninety days.", hasQuiz: true },
      { slug: "reporting-a-clearing", title: "Reporting a clearing safely", duration: 9, format: "reading", summary: "How to document without putting yourself at risk.", hasQuiz: true },
    ],
  },
  {
    slug: "water-conservation",
    title: "Water conservation and quality",
    topic: "Water conservation",
    category: "water",
    level: "foundation",
    audience: "Households, schools, barangay health workers.",
    summary:
      "Where household water goes, what contamination looks like before a laboratory confirms it, and the specific things a community can observe and record. Includes what to do when a water source is upstream of something worrying.",
    lessons: [
      { slug: "household-water", title: "Where household water actually goes", duration: 7, format: "infographic", summary: "The uses people think are large, and the ones that really are.", hasQuiz: true },
      { slug: "seeing-contamination", title: "What contamination looks like before a lab confirms it", duration: 11, format: "video", summary: "Colour, smell, foam, fish. And the limits of each.", hasQuiz: true },
      { slug: "protecting-a-source", title: "Protecting a water source", duration: 10, format: "reading", summary: "Buffer zones, upstream uses, and who to talk to.", hasQuiz: true },
      { slug: "simple-water-log", title: "Keep a simple water log", duration: 18, format: "activity", summary: "Four weeks of observations at one point. Evidence starts here.", hasQuiz: false },
    ],
  },
  {
    slug: "disaster-preparedness",
    title: "Disaster preparedness",
    topic: "Disaster preparedness",
    category: "hazard",
    level: "foundation",
    audience: "Every household. Especially coastal and low-lying areas.",
    summary:
      "Typhoon, flood, landslide and storm surge, and the preparation that genuinely changes outcomes. Built around the hazard maps that already exist for your area and that most people have never seen.",
    lessons: [
      { slug: "know-your-hazard", title: "Find the hazard map for your own barangay", duration: 12, format: "activity", summary: "It exists. This lesson is how to get it and read it.", hasQuiz: true },
      { slug: "before-the-storm", title: "The 72 hours before", duration: 9, format: "infographic", summary: "What to do at each warning signal, in order.", hasQuiz: true },
      { slug: "go-bag", title: "A go bag that is actually usable", duration: 7, format: "video", summary: "Weight, documents, medicine, and what people always forget.", hasQuiz: true },
      { slug: "after-the-water", title: "After the water goes down", duration: 10, format: "reading", summary: "Contamination, electricity, and the injuries that happen in clean-up.", hasQuiz: true },
    ],
  },
  {
    slug: "biodiversity",
    title: "Biodiversity and why it is not decoration",
    topic: "Biodiversity education",
    category: "biodiversity",
    level: "intermediate",
    audience: "Students, teachers, youth organisations.",
    summary:
      "Philippine endemism, what a keystone species does, and the wildlife trade as it actually appears: a roadside stall, not a documentary. Includes how to report suspected illegal wildlife trade without endangering yourself.",
    lessons: [
      { slug: "why-so-endemic", title: "Why so much of it lives nowhere else", duration: 10, format: "video", summary: "Island biogeography, explained with birds you have seen.", hasQuiz: true },
      { slug: "keystone-species", title: "What a keystone species does", duration: 8, format: "infographic", summary: "Remove one, and the structure changes. Real Philippine examples.", hasQuiz: true },
      { slug: "wildlife-trade", title: "The wildlife trade looks like a roadside stall", duration: 11, format: "reading", summary: "What is protected, what the law says, and what it looks like in practice.", hasQuiz: true },
      { slug: "reporting-safely", title: "Reporting suspected wildlife trade safely", duration: 9, format: "reading", summary: "Anonymity, evidence, and the agencies that handle it.", hasQuiz: true },
    ],
  },
  {
    slug: "sustainable-living",
    title: "Sustainable living without the guilt",
    topic: "Sustainable living",
    category: "land",
    level: "foundation",
    audience: "General audiences, students.",
    summary:
      "Honest about what individual choices achieve and what they do not. Focuses on the small number of changes with real weight, and on the collective actions that are usually more effective than any of them.",
    lessons: [
      { slug: "what-actually-matters", title: "The few changes that carry weight", duration: 9, format: "infographic", summary: "Ranked by actual effect, not by how visible they are.", hasQuiz: true },
      { slug: "the-guilt-problem", title: "Why guilt is a poor motivator", duration: 7, format: "reading", summary: "And what works better over a year.", hasQuiz: true },
      { slug: "collective-over-individual", title: "Collective action beats individual virtue", duration: 10, format: "video", summary: "The arithmetic, using a barangay as the unit.", hasQuiz: true },
      { slug: "one-month-change", title: "Pick one change and hold it for a month", duration: 30, format: "activity", summary: "One change, tracked. Not twelve, abandoned.", hasQuiz: false },
    ],
  },
  {
    slug: "environmental-law",
    title: "Environmental law and your rights as a citizen",
    topic: "Environmental laws and citizens' rights",
    category: "hazard",
    level: "advanced",
    audience: "Community leaders, organisers, barangay officials, older students.",
    summary:
      "The laws that matter most in practice, who enforces each one, and the rights a citizen actually has. Covers the writ of kalikasan, the Clean Air and Clean Water Acts, RA 9003, and the practical question of which office to approach first.",
    lessons: [
      { slug: "the-laws-that-matter", title: "The five laws that come up most", duration: 14, format: "reading", summary: "RA 9003, RA 8749, RA 9275, RA 9147 and the Local Government Code.", hasQuiz: true },
      { slug: "who-enforces-what", title: "Who enforces what", duration: 12, format: "infographic", summary: "Barangay, city, DENR, EMB, MGB, BFAR, Coast Guard. Which one, for what.", hasQuiz: true },
      { slug: "writ-of-kalikasan", title: "The writ of kalikasan", duration: 13, format: "video", summary: "What it is, when it applies, and what it does not do.", hasQuiz: true },
      { slug: "building-a-complaint", title: "Building a complaint that survives", duration: 16, format: "activity", summary: "Evidence, chronology, and the format an office can act on.", hasQuiz: true },
      { slug: "your-rights", title: "Your rights when you report", duration: 10, format: "reading", summary: "Including protection for environmental defenders, and its limits.", hasQuiz: true },
    ],
  },

  // -------------------------------------------------------------- EARTH KIDS
  {
    slug: "kids-where-does-my-trash-go",
    title: "Where does my trash go?",
    topic: "EARTH Kids",
    category: "waste",
    level: "foundation",
    audience: "Ages 7 to 10. Built for a classroom or a living room.",
    kids: true,
    summary:
      "Follows one wrapper from a hand to a river. Ends with the only question that matters at this age, which is not what climate change is, but what can I actually do about it.",
    lessons: [
      { slug: "one-wrapper", title: "The journey of one wrapper", duration: 5, format: "video", summary: "A short story with a real ending.", hasQuiz: true },
      { slug: "sorting-game", title: "The sorting game", duration: 10, format: "activity", summary: "Three bins, twenty objects, one timer.", hasQuiz: false },
      { slug: "my-house-my-job", title: "The job I can do at home", duration: 6, format: "infographic", summary: "One task a child can genuinely own.", hasQuiz: true },
    ],
  },
  {
    slug: "kids-the-sea-is-a-neighbourhood",
    title: "The sea is a neighbourhood",
    topic: "EARTH Kids",
    category: "biodiversity",
    level: "foundation",
    audience: "Ages 7 to 10, especially coastal schools.",
    kids: true,
    summary:
      "Who lives in the reef, who lives in the mangrove, and what happens to the neighbours when one house is taken away.",
    lessons: [
      { slug: "who-lives-there", title: "Who lives there", duration: 6, format: "video", summary: "Meet eight neighbours.", hasQuiz: true },
      { slug: "mangrove-house", title: "The mangrove is a nursery", duration: 5, format: "infographic", summary: "Where the small fish grow up.", hasQuiz: true },
      { slug: "draw-your-coast", title: "Draw your own coast", duration: 15, format: "activity", summary: "Then mark one thing you would protect.", hasQuiz: false },
    ],
  },
  {
    slug: "kids-a-tree-is-a-water-tank",
    title: "A tree is a water tank",
    topic: "EARTH Kids",
    category: "forest",
    level: "foundation",
    audience: "Ages 8 to 11.",
    kids: true,
    summary:
      "Why the hill above the town matters to the town, explained with a sponge, a bottle and a tray. A practical demonstration a teacher can run with things already in the room.",
    lessons: [
      { slug: "sponge-and-tray", title: "The sponge and the tray", duration: 10, format: "activity", summary: "A demonstration you can do with a sponge, a bottle and a tray.", hasQuiz: false },
      { slug: "where-the-flood-comes-from", title: "Where a flood comes from", duration: 6, format: "video", summary: "Following rain from the hill to the street.", hasQuiz: true },
      { slug: "plant-one-properly", title: "How to plant one properly", duration: 8, format: "infographic", summary: "And how to check on it after three months.", hasQuiz: true },
    ],
  },
];

export const TRACKS_MAIN = TRACKS.filter((t) => !t.kids);
export const TRACKS_KIDS = TRACKS.filter((t) => t.kids);

export const LESSON_COUNT = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
export const QUIZ_COUNT = TRACKS.reduce((n, t) => n + t.lessons.filter((l) => l.hasQuiz).length, 0);
