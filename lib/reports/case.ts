import type { EarthCase } from "@/lib/types";
import type { ReportPublic } from "@/lib/reports/types";

/** The calendar date in the Philippines for an ISO timestamp, as YYYY-MM-DD. */
export function manilaDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

/**
 * A filed report, shaped as a case so that every page, the map and the sitemap
 * show it without knowing where it came from. A fresh report has exactly one
 * timeline entry, one reporter and no validations yet: the numbers say what is
 * true, not what would look good.
 */
export function reportToCase(report: ReportPublic): EarthCase {
  const reportedOn = manilaDate(report.createdAt);
  const photos = report.evidence.length;

  return {
    caseNumber: report.caseNumber,
    slug: report.caseNumber.toLowerCase(),
    title: report.title,
    category: report.category,
    status: report.status,
    urgency: report.urgency,
    observedOn: report.observedOn,
    reportedOn,
    barangay: report.barangay || "Barangay not given",
    municipality: report.municipality,
    province: report.province,
    region: report.region,
    lat: report.lat,
    lng: report.lng,
    summary: report.description,
    reportCount: 1,
    validations: 0,
    timeline: [
      {
        date: reportedOn,
        status: "reported",
        actor: "Community reporter",
        note:
          photos > 0
            ? `Report filed through the EARTHLINK website with ${photos} photograph${photos === 1 ? "" : "s"}. Awaiting verification.`
            : "Report filed through the EARTHLINK website. Awaiting verification.",
      },
    ],
    evidenceCount: photos,
    source: "report",
  };
}
