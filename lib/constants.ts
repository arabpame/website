/**
 * Every brand fact for EARTHLINK Philippines lives here.
 *
 * Nothing in this file may be restated in a component. Name, address and phone in
 * particular must match the JSON-LD and the Google Business Profile character for
 * character, which is only achievable if there is exactly one copy of them.
 */

export const SITE = {
  name: "EARTHLINK Philippines",
  shortName: "EARTHLINK",
  tagline: "See the problem. Connect the people. Create the solution.",
  description:
    "A digital environmental action platform for the Philippines. Report an environmental problem in your community, watch it become a tracked case, and see whether anything was actually done about it.",
  /**
   * Set NEXT_PUBLIC_SITE_URL in Vercel. The fallback is only for local work, and it
   * is a placeholder domain: the real one is not registered yet.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://earthlink.ph",
  locale: "en_PH",
  country: "PH",
} as const;

export const CONTACT = {
  email: "hello@earthlink.ph",
  reportsEmail: "reports@earthlink.ph",
  partnersEmail: "partners@earthlink.ph",
  /**
   * Placeholders until the client supplies real details. The QA script flags any
   * value here that still begins with "TO BE" so they cannot ship by accident.
   */
  phone: "TO BE SUPPLIED",
  addressLine: "TO BE SUPPLIED",
  city: "TO BE SUPPLIED",
  region: "TO BE SUPPLIED",
  postalCode: "TO BE SUPPLIED",
} as const;

export const FOUNDER = {
  name: "Adam Tryler Guttierez",
  role: "Founder, EARTHLINK Philippines",
  shortName: "Adam",
  /**
   * Supplied by the founder. These are commissioned portraits, not documentation
   * of a specific clean-up on a specific date, so nothing here is captioned as
   * evidence and no case, mission or location is attached to them. The sample
   * data rules in PROJECT_RULES apply to photographs too.
   */
  photo: {
    field: "/photos/founder-field.jpg",
    hero: "/photos/founder-hero.jpg",
    /** WebP, because it is the only common format that keeps the alpha channel small. */
    cutout: "/photos/founder-cutout.webp",
  },
} as const;

export const BUILDER = {
  name: "Erick Cabal",
  url: "https://erickcabal.com",
  studio: "Erick Cabal Web Studio",
  brand: "Enclave",
} as const;

/**
 * The project is a design build. Every screen carries sample data, and that must
 * never be mistaken for a real environmental record. This flag drives the visible
 * demonstration banner, and it is deliberately not an environment variable: the
 * banner has to be removed by an intentional code change when real data arrives,
 * not switched off by whoever last edited a Vercel setting.
 */
export const IS_DEMO = true;

export const DEMO_NOTICE = {
  short: "Sample data",
  long:
    "Every case, mission, count and organisation shown on this site is sample data created to demonstrate the design. None of it is a real environmental report.",
} as const;

export const NAV = [
  { href: "/learn", label: "Learn" },
  { href: "/report", label: "Report" },
  { href: "/map", label: "EARTH Map" },
  { href: "/act", label: "Missions" },
  { href: "/track", label: "Track" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_NAV = [
  {
    heading: "The five functions",
    links: [
      { href: "/learn", label: "Learn" },
      { href: "/report", label: "Report" },
      { href: "/connect", label: "Connect" },
      { href: "/act", label: "Act" },
      { href: "/track", label: "Track" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { href: "/map", label: "The EARTH Map" },
      { href: "/cases", label: "All cases" },
      { href: "/score", label: "EARTH Score" },
      { href: "/learn/earth-kids", label: "EARTH Kids" },
      { href: "/ambassadors", label: "EARTH Ambassadors" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { href: "/report", label: "Report a concern" },
      { href: "/get-involved", label: "Volunteer" },
      { href: "/connect", label: "Partner with us" },
      { href: "/ambassadors", label: "Become an ambassador" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "The platform",
    links: [
      { href: "/about", label: "About EARTHLINK" },
      { href: "/about#how-it-works", label: "How it works" },
      { href: "/privacy", label: "Privacy notice" },
      { href: "/terms", label: "Terms of use" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
] as const;

/** The five core functions from the concept document, in the concept's own order. */
export const CORE_FUNCTIONS = [
  {
    key: "learn",
    number: "01",
    name: "Learn",
    title: "Environmental education hub",
    href: "/learn",
    summary:
      "Ten topic tracks from climate change to environmental law, taught through short video, infographics and quizzes. Plus EARTH Kids, a simplified area built for children.",
    promise: "Understand the problem before you are asked to solve it.",
  },
  {
    key: "report",
    number: "02",
    name: "Report",
    title: "Community environmental reporting",
    href: "/report",
    summary:
      "Anyone can report an environmental concern from a phone. Location, photographs, category and urgency. Every report becomes a numbered EARTH case with a permanent record.",
    promise: "A documented case, not a post that scrolls away.",
  },
  {
    key: "connect",
    number: "03",
    name: "Connect",
    title: "Community action network",
    href: "/connect",
    summary:
      "A verified case is routed to the office that can actually act on it. Barangay, LGU, DENR, school, NGO or expert, with the evidence pack attached and the referral date recorded.",
    promise: "The right people receive it, and that is on the record.",
  },
  {
    key: "act",
    number: "04",
    name: "Act",
    title: "EARTH Missions",
    href: "/act",
    summary:
      "A verified case becomes a mission with a date, a place and a target. Volunteers sign up, attendance is recorded on the day, and the result is measured afterwards.",
    promise: "Advocacy becomes something you can count.",
  },
  {
    key: "track",
    number: "05",
    name: "Track",
    title: "Environmental transparency",
    href: "/track",
    summary:
      "Six public states from Reported to Monitoring, each timestamped and visible. Anyone can follow a case, and anyone can see the platform's own numbers.",
    promise: "You can check whether anything actually happened.",
  },
] as const;

/** The build phases from the September 2026 function valuation, reference EC V-2609. */
export const PHASES = [
  { number: 1, name: "EARTHLINK Advocacy Site", functions: 5, days: 12, status: "in-build" },
  { number: 2, name: "The reporting core", functions: 24, days: 64, status: "planned" },
  { number: 3, name: "Connect and Act", functions: 8, days: 20, status: "planned" },
  { number: 4, name: "Learn and EARTH Kids", functions: 7, days: 22.5, status: "planned" },
  { number: 5, name: "EARTH Score and Ambassadors", functions: 5, days: 11.5, status: "planned" },
] as const;
