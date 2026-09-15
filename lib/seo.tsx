import type { Metadata } from "next";
import { CONTACT, FOUNDER, SITE } from "@/lib/constants";

/**
 * Page metadata and JSON-LD, built here rather than hand-written per route.
 *
 * Titles under 60 characters, descriptions under 155. scripts/qa-check.mjs
 * enforces both, and enforces that every route exports metadata at all.
 */

/**
 * The title template appends " | EARTHLINK", which is 12 characters, so a page
 * title has 48 to play with before the whole thing passes 60 and Google truncates
 * it in the results page.
 */
const TITLE_SUFFIX_LENGTH = " | EARTHLINK".length;
export const MAX_PAGE_TITLE = 60 - TITLE_SUFFIX_LENGTH;
export const MAX_DESCRIPTION = 155;

/**
 * Trim to a length, at a word boundary, without a trailing comma or period.
 *
 * Cutting mid-word is worse than cutting short: a case page title read
 * "Household waste dumped along the creek ea" before this existed.
 */
export function trim(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s,.;:]+$/, "");
}

export function pageMeta({
  title,
  description,
  path = "/",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE.url}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      url,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

/** Everything that belongs on the organisation itself. */
export function organisationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    slogan: SITE.tagline,
    description: SITE.description,
    email: CONTACT.email,
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      image: `${SITE.url}${FOUNDER.photo.hero}`,
    },
    areaServed: {
      "@type": "Country",
      name: "Philippines",
    },
    knowsAbout: [
      "Environmental protection",
      "Waste management",
      "Marine conservation",
      "Climate change education",
      "Citizen environmental reporting",
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "en-PH",
    description: SITE.description,
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function courseJsonLd(track: { title: string; summary: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: track.title,
    description: track.summary,
    url: `${SITE.url}/learn/${track.slug}`,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

/**
 * Renders a JSON-LD block.
 *
 * The content is built from our own constants and never from user input, so
 * serialising it is safe. The `<` escape guards against a future data source that
 * is not.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
