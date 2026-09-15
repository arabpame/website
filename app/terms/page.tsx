import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { LastReviewed, LegalBody, LegalList, LegalSection } from "@/components/sections/Legal";
import { CONTACT, IS_DEMO } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms of use",
  description:
    "The rules for using EARTHLINK Philippines: what you may report, what happens to what you submit, and the limits of what this platform can do.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Terms"
        title="Terms of use"
        lead="What you can expect from this platform, and what it expects from you. Short, because rules nobody reads protect nobody."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Terms", href: "/terms" },
        ]}
      />

      <LegalBody>
        {IS_DEMO ? (
          <div className="rounded-2xl border border-status-referred/30 bg-status-referred/[0.07] p-5">
            <p className="text-sm font-bold text-status-referred-text">Design build</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/75">
              EARTHLINK is in its Phase 1 design build. Nothing submitted through this site is stored,
              sent or acted on, and every case, mission and organisation shown is sample data. These
              terms describe how the platform will operate once it is live.
            </p>
          </div>
        ) : null}

        <LegalSection heading="What EARTHLINK is">
          <p>
            A platform for documenting environmental concerns in the Philippines, routing verified cases
            to the offices with the authority to act on them, and publishing what happens next.
          </p>
        </LegalSection>

        <LegalSection heading="What EARTHLINK is not">
          <LegalList
            items={[
              "It is not an emergency service. For anything threatening life, contact your barangay, your local disaster office or 911 first.",
              "It is not a government agency and it has no enforcement power. It cannot compel any office to act, issue a citation, or impose a penalty.",
              "It is not a legal service. Nothing here is legal advice, and filing a case is not the same as filing a formal complaint under any law.",
              "It is not a substitute for reporting a crime to the authorities.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="Using the platform honestly">
          <p>When you file a report you confirm it is truthful to the best of your knowledge. Do not:</p>
          <LegalList
            items={[
              "File a report you know to be false, or submit evidence from somewhere else presented as the reported location.",
              "Use the platform to harass, defame or pursue a dispute with a neighbour, a business or an official.",
              "Submit photographs or video of identifiable people who have not agreed to appear, unless they are the subject of the environmental concern itself.",
              "Attempt to overwhelm the platform with automated or repeated submissions.",
            ]}
          />
          <p>
            Reports that appear to be any of the above are rejected at verification and are not
            published. Repeated abuse can lead to a block.
          </p>
        </LegalSection>

        <LegalSection heading="What happens to what you submit">
          <p>
            You keep ownership of your photographs and video. By submitting them you give EARTHLINK
            permission to publish them on the case page, include them in the evidence pack sent to a
            government office, and use them in case studies and reporting about the platform, with
            attribution where you have asked for it.
          </p>
          <p>
            You can withdraw that permission for future use at any time. Material already sent to a
            government office as part of a referral cannot be recalled from that office.
          </p>
        </LegalSection>

        <LegalSection heading="Accuracy of what is published">
          <p>
            Case content is supplied by members of the public and verified as far as is reasonably
            possible. Verification means the concern is real and accurately described. It is not a legal
            finding, and it is not an allegation against any named person or company.
          </p>
          <p>
            Response figures for partner organisations record what was received and acknowledged through
            this platform only. An office may well have acted on something without telling us, and where
            we learn that, the record is corrected.
          </p>
          <p>
            If you believe something published about a case is inaccurate, write to{" "}
            <a
              href={`mailto:${CONTACT.reportsEmail}`}
              className="font-medium text-brand-primary underline underline-offset-2"
            >
              {CONTACT.reportsEmail}
            </a>
            . Corrections are added to the case history rather than replacing what was there, so the
            correction itself is part of the public record.
          </p>
        </LegalSection>

        <LegalSection heading="Your safety">
          <p>
            Never put yourself at risk to gather evidence. Do not confront anyone, do not enter private
            land, and do not document illegal activity at close range. A report filed from a safe
            distance is worth more than any photograph.
          </p>
          <p>
            You can always ask for your identity to be withheld, and that request is honoured in
            everything published and in everything sent to an agency.
          </p>
        </LegalSection>

        <LegalSection heading="Availability">
          <p>
            The platform is provided as it is. We aim to keep it available and accurate, but we do not
            guarantee uninterrupted service, and we are not liable for loss arising from it being
            unavailable or from a case not receiving a response.
          </p>
        </LegalSection>

        <LegalSection heading="Governing law">
          <p>
            These terms are governed by the laws of the Republic of the Philippines.
          </p>
        </LegalSection>

        <LastReviewed date="14 September 2026" />

        <p className="text-sm text-brand-ink/60">
          See also the{" "}
          <Link href="/privacy" className="font-medium text-brand-primary underline underline-offset-2">
            privacy notice
          </Link>{" "}
          and the{" "}
          <Link
            href="/accessibility"
            className="font-medium text-brand-primary underline underline-offset-2"
          >
            accessibility statement
          </Link>
          .
        </p>
      </LegalBody>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ])}
      />
    </>
  );
}
