import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { ArrowLink, Eyebrow } from "@/components/ui/Primitives";
import { CONTACT } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact",
  description:
    "Get in touch with EARTHLINK Philippines about volunteering, partnerships, schools, the ambassador programme or media.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        lead="For anything that is not an environmental report. If you have seen a problem, the report form gets it into the system properly and it takes about five minutes."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            <aside className="lg:col-span-5">
              <div className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-2xl border border-brand-line bg-brand-surface p-6">
                  <Eyebrow>Direct</Eyebrow>
                  <dl className="mt-5 space-y-5">
                    <div>
                      <dt className="text-xs text-brand-ink/55">General enquiries</dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${CONTACT.email}`}
                          className="font-data text-sm text-brand-primary underline underline-offset-2 hover:text-brand-deep"
                        >
                          {CONTACT.email}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-brand-ink/55">Partnerships and referrals</dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${CONTACT.partnersEmail}`}
                          className="font-data text-sm text-brand-primary underline underline-offset-2 hover:text-brand-deep"
                        >
                          {CONTACT.partnersEmail}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-brand-ink/55">Case enquiries</dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${CONTACT.reportsEmail}`}
                          className="font-data text-sm text-brand-primary underline underline-offset-2 hover:text-brand-deep"
                        >
                          {CONTACT.reportsEmail}
                        </a>
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-6 border-t border-brand-line pt-5 text-xs leading-relaxed text-brand-ink/55">
                    A telephone number and postal address will be published once the organisation is
                    formally registered. These email addresses are not live yet.
                  </p>
                </div>

                <div className="rounded-2xl border border-status-reported/25 bg-status-reported/[0.05] p-5">
                  <p className="text-sm font-bold text-status-reported-text">
                    This is not an emergency service
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                    For a fire, a chemical spill, a collapse or anything threatening life, contact your
                    barangay, your local disaster risk reduction office or 911 first.
                  </p>
                </div>

                <div className="rounded-2xl border border-brand-line bg-brand-paper p-5">
                  <p className="text-sm font-bold text-brand-deep">Seen an environmental problem?</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                    Use the report form instead. It captures the location, category and evidence in the
                    form that the receiving office actually needs, and it gives you a case number.
                  </p>
                  <ArrowLink href="/report" className="mt-4">
                    Report a concern
                  </ArrowLink>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
