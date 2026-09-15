import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, ButtonLink, CategoryIcon, SectionHeading } from "@/components/ui/Primitives";
import { CATEGORY_META, PARTNER_TYPE_LABELS } from "@/lib/taxonomy";
import { getPartners, getReferralStats } from "@/lib/store";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import type { PartnerType } from "@/lib/types";

/**
 * Cases can change in the database without a deploy (a report deleted, a status
 * edited), so this page also rebuilds itself every five minutes. A new report
 * still appears at once, through revalidatePath in the Server Action.
 */
export const revalidate = 300;

export const metadata = pageMeta({
  title: "The action network",
  description:
    "The LGUs, national agencies, barangays, schools, organisations and experts that receive verified EARTHLINK cases, and what each of them can act on.",
  path: "/connect",
});

const GROUP_ORDER: PartnerType[] = [
  "national-agency",
  "lgu",
  "barangay",
  "ngo",
  "youth",
  "school",
  "expert",
  "company",
];

export default async function ConnectPage() {
  const [partners, referral] = await Promise.all([getPartners(), getReferralStats()]);

  const grouped = GROUP_ORDER.map((type) => ({
    type,
    label: PARTNER_TYPE_LABELS[type] ?? type,
    items: partners.filter((p) => p.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Connect"
        title="A report is only useful if it reaches someone who can act"
        lead="A verified case is routed to the office responsible for that area and that category, with the evidence pack attached and the referral date recorded. The date matters as much as the referral."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Connect", href: "/connect" },
        ]}
      >
        <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
          {[
            { label: "Organisations in the network", value: String(partners.length) },
            { label: "Referrals sent", value: String(referral.received) },
            { label: "Acknowledged", value: `${referral.acknowledgedRate}%` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <dt className="order-2 mt-1 text-[0.6875rem] leading-tight text-brand-paper/60">{item.label}</dt>
              <dd className="order-1 font-data text-xl font-bold text-brand-signal">{item.value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* How routing works */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="How routing works"
            title="Category and location decide who receives it"
            lead="Not a general inbox. A waste case in Bacoor goes to the Bacoor city environment office. A reef case in El Nido goes to the municipal tourism and environment office and to the regional DENR. The routing is the product."
            className="max-w-2xl"
          />

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Verified first",
                detail:
                  "Nothing is referred until the community has corroborated it and the verification team has confirmed it is real and accurately described.",
              },
              {
                step: "02",
                title: "Matched by category and area",
                detail:
                  "The seven categories map to the offices with the mandate for each. Location decides which of those offices, down to the barangay where that is the right level.",
              },
              {
                step: "03",
                title: "Sent with the evidence pack",
                detail:
                  "Photographs, dates, coordinates, the number of separate reporters and the community validations, in a form an office can act on without doing the work again.",
              },
              {
                step: "04",
                title: "The date is recorded publicly",
                detail:
                  "Referral sent, and acknowledgement received or not received. This is the part that makes the difference, and it is the part nobody else publishes.",
              },
            ].map((item, i) => (
              <li
                key={item.step}
                className="reveal rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-soft"
                data-reveal-index={i}
              >
                <p className="font-data text-xs font-medium tracking-eyebrow text-brand-primary">
                  {item.step}
                </p>
                <h3 className="mt-4 text-base font-bold leading-snug text-brand-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The directory */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="The directory"
            title="Who is in the network"
            className="max-w-2xl"
          />

          <div className="mt-12 space-y-12">
            {grouped.map((group) => (
              <div key={group.type}>
                <h3 className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
                  {group.label}
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((partner) => (
                    <div
                      key={partner.slug}
                      className="reveal flex flex-col rounded-2xl border border-brand-line bg-brand-paper p-5"
                    >
                      <p className="text-sm font-bold leading-snug text-brand-deep">{partner.name}</p>
                      <p className="mt-1.5 text-xs text-brand-ink/65">{partner.coverage}</p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {partner.handles.map((cat) => (
                          <span
                            key={cat}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ring-1 ring-inset ${CATEGORY_META[cat].chipClass}`}
                            title={CATEGORY_META[cat].label}
                          >
                            <CategoryIcon category={cat} className="h-3 w-3" />
                            {CATEGORY_META[cat].label}
                          </span>
                        ))}
                      </div>

                      <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-brand-line pt-4 text-center">
                        <div className="flex flex-col">
                          <dt className="order-2 text-[0.6875rem] text-brand-ink/65">Received</dt>
                          <dd className="order-1 font-data text-sm font-bold text-brand-deep">
                            {partner.casesReceived}
                          </dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="order-2 text-[0.6875rem] text-brand-ink/65">Acknowledged</dt>
                          <dd className="order-1 font-data text-sm font-bold text-status-progress-text">
                            {partner.casesAcknowledged}
                          </dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="order-2 text-[0.6875rem] text-brand-ink/65">Resolved</dt>
                          <dd className="order-1 font-data text-sm font-bold text-status-resolved-text">
                            {partner.casesResolved}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>


          <ArrowLink href="/track" className="mt-8">
            See response rates on the transparency dashboard
          </ArrowLink>
        </div>
      </section>

      {/* Join */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                onInk
                eyebrow="For institutions"
                title="Join the network"
                lead="A partner account lets an office see, claim and respond to cases in its own area, without an email chain and without anyone having to chase it."
              />
              <ButtonLink href="/contact" variant="signal" className="mt-8">
                Talk to us about partnering
              </ButtonLink>
            </div>

            <ul className="space-y-5">
              {[
                {
                  title: "You see only your area",
                  detail:
                    "A barangay sees its barangay. A city office sees its city. A regional office sees its region. Nobody is asked to read a national inbox.",
                },
                {
                  title: "The evidence arrives with the case",
                  detail:
                    "Photographs, dates, coordinates and the number of separate reporters. Your staff do not repeat the fieldwork that a resident already did.",
                },
                {
                  title: "You can respond in public",
                  detail:
                    "Acknowledge, claim, update or close, and the public sees it on the case. An office that is doing the work gets visible credit for it, which is currently rare.",
                },
                {
                  title: "It is not an accusation",
                  detail:
                    "The dashboard measures the platform as much as it measures anyone else. A case that sits for sixty days is usually a capacity problem, and publishing that is how capacity gets funded.",
                },
              ].map((item) => (
                <li key={item.title} className="border-l-2 border-brand-signal/30 pl-5">
                  <p className="text-sm font-bold text-brand-signal">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-paper/70">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Connect", path: "/connect" },
        ])}
      />
    </>
  );
}
