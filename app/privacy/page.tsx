import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { LastReviewed, LegalBody, LegalList, LegalSection } from "@/components/sections/Legal";
import { CONTACT } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy notice",
  description:
    "How EARTHLINK handles personal information under the Data Privacy Act of 2012, including reporting anonymously and withholding your identity.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="Privacy notice"
        lead="Written under the Data Privacy Act of 2012 (RA 10173). In plain language, because a privacy notice nobody can read protects nobody."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Privacy", href: "/privacy" },
        ]}
      />

      <LegalBody>

        <LegalSection heading="Who is responsible">
          <p>
            EARTHLINK Philippines is the personal information controller for the data described here.
            Until the organisation is formally registered, enquiries go to{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-medium text-brand-primary underline underline-offset-2"
            >
              {CONTACT.email}
            </a>
            . A registered address and a named Data Protection Officer will be published here as soon as
            the organisation is registered.
          </p>
        </LegalSection>

        <LegalSection heading="What we collect, and why">
          <p>Only what a case actually needs to be verified and acted on.</p>
          <LegalList
            items={[
              "The content of your report: what you saw, where, when, the category and how urgent you judged it.",
              "The location of the concern. This is the location of the problem, not of you, unless you choose to use location detection while standing at the site.",
              "Photographs or video you attach. Please avoid including identifiable people who have not agreed to appear.",
              "Your name and contact details, only if you provide them. Both are optional and a report without them is treated exactly the same.",
            ]}
          />
          <p>
            We do not collect government identification numbers, financial information, health
            information or anything about your political or religious views. There is no reason for an
            environmental reporting platform to hold any of it.
          </p>
        </LegalSection>

        <LegalSection heading="Reporting anonymously">
          <p>
            You can file a report without giving a name or any contact details. The case still receives
            a number and appears publicly like any other. You will not receive direct updates, because
            there is nowhere to send them, but you can follow the case on its public page.
          </p>
          <p>
            You can also give your details and separately ask that your identity be withheld. That
            request is honoured in everything published and in everything sent to a government agency.
            Your details are then used only to send you updates.
          </p>
        </LegalSection>

        <LegalSection heading="What becomes public">
          <p>
            The description of the concern, its category, its location to barangay level, the date
            observed, the evidence, the status history and the measured result are all published on the
            case page. That is the point of the platform: a case nobody can see is not transparency.
          </p>
          <p>
            Your name, email address and phone number are never published, and are never included in what
            is sent to an agency unless you have explicitly asked for them to be.
          </p>
        </LegalSection>

        <LegalSection heading="Who we share it with">
          <LegalList
            items={[
              "The government office a verified case is referred to, which receives the case content and the evidence, and your identity only if you asked for it to be included.",
              "Partner organisations in the action network, limited to cases in their own area of responsibility.",
              "Service providers that host the platform and send its email, under contract and only for that purpose.",
            ]}
          />
          <p>We do not sell personal information, and we do not share it for advertising.</p>
        </LegalSection>

        <LegalSection heading="How long we keep it">
          <p>
            Case records are kept permanently, because the value of the platform is the long record. A
            case that could be deleted would be a case an interested party could have deleted.
          </p>
          <p>
            Personal contact details are kept while a case is open and for two years afterwards, then
            removed. The case itself remains, without them.
          </p>
        </LegalSection>

        <LegalSection heading="Your rights under RA 10173">
          <p>The Data Privacy Act gives you the right to:</p>
          <LegalList
            items={[
              "Be informed about what is collected and why, which is what this notice is for.",
              "Access the personal information we hold about you.",
              "Correct it if it is inaccurate.",
              "Object to processing, and withdraw consent.",
              "Have your personal information erased or blocked where it is no longer necessary.",
              "Data portability, meaning a copy in a usable electronic format.",
              "Damages, if you suffer because of a violation of your rights.",
            ]}
          />
          <p>
            To exercise any of these, write to{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-medium text-brand-primary underline underline-offset-2"
            >
              {CONTACT.email}
            </a>
            . You also have the right to complain to the National Privacy Commission.
          </p>
          <p>
            One limit worth being clear about: erasing your personal details does not erase the case.
            The environmental record stays, without anything identifying you.
          </p>
        </LegalSection>

        <LegalSection heading="Children">
          <p>
            The EARTH Kids area does not collect any information about children. Children do not create
            accounts, and there is no comment field, no messaging and no way for a stranger to contact a
            child through this platform. Sessions are run by a teacher or a guardian from their own
            device.
          </p>
          <p>
            Anyone under 18 applying to the EARTH Ambassador programme needs written guardian consent
            before the application is processed.
          </p>
        </LegalSection>

        <LegalSection heading="Security">
          <p>
            Personal information is transmitted over an encrypted connection and access is restricted to
            people who need it to verify and route cases. Every action taken on a case is recorded in an
            audit trail, including who took it.
          </p>
          <p>
            No system is perfectly secure. If a breach affects your personal information, you and the
            National Privacy Commission will be notified within 72 hours of discovery, as the law
            requires.
          </p>
        </LegalSection>

        <LegalSection heading="Cookies and analytics">
          <p>
            This site currently sets no cookies and runs no analytics or tracking of any kind. If that
            changes, this notice is updated first, and anything beyond what is strictly necessary will
            ask for your consent before it runs.
          </p>
        </LegalSection>

        <LegalSection heading="Changes">
          <p>
            Material changes to this notice will be announced on the site before they take effect. The
            date below records when it was last reviewed.
          </p>
        </LegalSection>

        <LastReviewed date="14 September 2026" />

        <p className="text-sm text-brand-ink/70">
          See also the{" "}
          <Link href="/terms" className="font-medium text-brand-primary underline underline-offset-2">
            terms of use
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
          { name: "Privacy", path: "/privacy" },
        ])}
      />
    </>
  );
}
