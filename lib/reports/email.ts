import "server-only";
import { CATEGORY_META, URGENCY_META } from "@/lib/taxonomy";
import { SITE } from "@/lib/constants";
import type { EvidenceUpload, StoredReport } from "@/lib/reports/types";

/**
 * The notification email, through Resend's HTTP API with plain fetch.
 *
 * Every filed report is emailed to REPORTS_TO_EMAIL with all of its fields and
 * the photographs attached, so the founder sees it within seconds and can reply
 * to the reporter directly. This is the "reports reach me" half of the request.
 *
 * Email is deliberately the LAST step and its failure is non-fatal: by the time
 * it runs, the report is already saved and numbered. A mail outage must not
 * turn a filed report into an error screen. The failure is logged instead.
 *
 * Until EARTHLINK has its own domain verified in Resend, the sending address
 * must be Resend's onboarding address, and Resend will only deliver it to the
 * email address that owns the Resend account. That is a Resend rule, not ours.
 */

const KEY_VAR = "RESEND_API_KEY";
const TO_VAR = "REPORTS_TO_EMAIL";

/** Not a secret, so a default is fine. Replace once a domain is verified. */
const DEFAULT_FROM = "EARTHLINK Reports <onboarding@resend.dev>";

export function emailConfigured(): boolean {
  return Boolean(process.env[KEY_VAR] && process.env[TO_VAR]);
}

export interface EmailOutcome {
  sent: boolean;
  reason?: string;
}

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function reportEmailText(report: StoredReport, evidenceLinks: string[]): string {
  const where = [report.barangay, report.municipality, report.province].filter(Boolean).join(", ");
  const reporter = report.anonymous
    ? "Anonymous (the reporter asked not to be identified)"
    : [report.reporterName || "Name not given", report.reporterContact || "No contact given"].join(" / ");

  const lines = [
    `${report.caseNumber}: ${report.title}`,
    "",
    `Category:   ${CATEGORY_META[report.category].label}`,
    `Urgency:    ${URGENCY_META[report.urgency].label}`,
    `Observed:   ${report.observedOn}`,
    `Filed:      ${report.createdAt}`,
    `Where:      ${where} (${report.region})`,
    report.landmark ? `Landmark:   ${report.landmark}` : null,
    `Pin:        ${report.lat.toFixed(5)}, ${report.lng.toFixed(5)} (${report.locationSource === "device" ? "from the reporter's device" : "municipality centre from the gazetteer"})`,
    `Map:        https://www.google.com/maps?q=${report.lat.toFixed(5)},${report.lng.toFixed(5)}`,
    "",
    "What was reported",
    report.description,
    "",
    `Reporter:   ${reporter}`,
    "",
    `Public case page: ${SITE.url}/cases/${report.caseNumber.toLowerCase()}`,
    "",
    evidenceLinks.length > 0
      ? ["Evidence (links valid for 7 days, files also attached):", ...evidenceLinks].join("\n")
      : "No photographs were attached.",
    "",
    "The reporter's name and contact details are in this email only. They are not on the public page.",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export interface PlainEmail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}

/** One call to Resend. Every email on the site goes through here. */
export async function sendPlainEmail(mail: PlainEmail): Promise<EmailOutcome> {
  const key = process.env[KEY_VAR];
  if (!key) return { sent: false, reason: `${KEY_VAR} is not set` };
  const from = process.env.FROM_EMAIL || DEFAULT_FROM;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      ...(mail.attachments && mail.attachments.length > 0 ? { attachments: mail.attachments } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { sent: false, reason: `Resend ${response.status}: ${text.slice(0, 200)}` };
  }
  return { sent: true };
}

export async function sendReportEmail(
  report: StoredReport,
  evidence: EvidenceUpload[],
  evidenceLinks: string[],
): Promise<EmailOutcome> {
  const to = process.env[TO_VAR];
  if (!to) return { sent: false, reason: `${TO_VAR} is not set` };

  const attachments = evidence.map((file, i) => ({
    filename: `${report.caseNumber}-${i + 1}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`,
    content: toBase64(file.bytes),
  }));

  return sendPlainEmail({
    to,
    subject: `New EARTH report ${report.caseNumber}: ${report.title}`,
    text: reportEmailText(report, evidenceLinks),
    ...(report.reporterContact && report.reporterContact.includes("@") ? { replyTo: report.reporterContact } : {}),
    attachments,
  });
}
