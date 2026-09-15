import { PageHeader } from "@/components/sections/PageHeader";
import { LastReviewed, LegalBody, LegalList, LegalSection } from "@/components/sections/Legal";
import { CONTACT } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Accessibility",
  description:
    "How EARTHLINK Philippines is built to be usable by everyone, what standard it targets, what is known to fall short, and how to tell us about a barrier.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Accessibility"
        title="Accessibility statement"
        lead="A platform for citizen environmental reporting is worth very little if part of the citizenry cannot use it. This page says what has been done, what has been tested, and what is still short."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Accessibility", href: "/accessibility" },
        ]}
      />

      <LegalBody>
        <LegalSection heading="The standard">
          <p>
            EARTHLINK targets WCAG 2.2 Level AA. That is the level most global regulation actually
            requires, and it is a meaningful bar rather than a badge.
          </p>
        </LegalSection>

        <LegalSection heading="What has been done">
          <LegalList
            items={[
              "Every colour pair used in the interface has been measured against its WCAG target rather than assumed. 53 pairs are computed automatically and the build fails if any of them drops below its threshold.",
              "Colour is never the only carrier of meaning. Every case status has a label, a position on a six-segment rail and a colour. Every map category has a label, a distinct icon shape and a colour. The interface still works in greyscale.",
              "Pages are server-rendered, so the content, including every case on the map, is present without JavaScript.",
              "Motion is decorative only, and the whole site respects prefers-reduced-motion through a blanket rule that covers hover transitions as well as animations.",
              "Text can be zoomed to 200 percent and the layout works from 320 pixels wide.",
              "Every form field has a visible label, never a placeholder standing in for one. Errors are described in words with a suggested fix, and are announced to screen readers.",
              "A skip-to-content link, landmark regions, and a visible focus ring that is never removed.",
              "Touch targets are at least 44 pixels.",
              "Headings run in order with one h1 per page.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="The map, specifically">
          <p>
            An interactive map is one of the hardest things to make accessible, and pins inside an SVG
            are effectively unreachable by keyboard and screen reader.
          </p>
          <p>
            So the map is not the only representation of that data. Every case shown on the map is also
            published directly beneath it as a real list of links, with the same category, status,
            location and date. That list is the primary representation for anyone not using a mouse, not
            a fallback bolted on afterwards.
          </p>
        </LegalSection>

        <LegalSection heading="What is known to fall short">
          <p>Stated plainly, because an accessibility statement that claims perfection is worthless.</p>
          <LegalList
            items={[
              "The site has been tested with automated tooling and by keyboard. It has not yet been tested by people who use screen readers daily, and that testing is worth more than everything above it.",
              "The map pins themselves are not individually keyboard-focusable. The parallel list covers the same information, but selecting a pin to see its detail card is currently a pointer interaction.",
              "The site is in English only. A large part of the intended audience would be better served in Filipino, and in Cebuano, Ilocano, Hiligaynon and others. Translation is not yet scheduled and that is a real limitation of the platform, not only of its accessibility.",
              "Lesson content is not written yet, so its readability, captions and transcripts cannot be assessed.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="Tell us about a barrier">
          <p>
            If something on this site stopped you doing what you came to do, we want to know, and we
            will fix it rather than explain it.
          </p>
          <p>
            Write to{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-medium text-brand-primary underline underline-offset-2"
            >
              {CONTACT.email}
            </a>{" "}
            with the page, what you were trying to do, and what happened. If you use assistive
            technology, telling us which one helps a great deal.
          </p>
        </LegalSection>

        <LastReviewed date="14 September 2026" />
      </LegalBody>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Accessibility", path: "/accessibility" },
        ])}
      />
    </>
  );
}
