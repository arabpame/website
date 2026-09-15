"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { findPlace, nearestPlace, regionAt, withinPhilippines } from "@/lib/places";
import { sendReportEmail } from "@/lib/reports/email";
import { getReportStore } from "@/lib/reports/storage";
import type { EvidenceUpload, NewReport } from "@/lib/reports/types";
import { CASE_CATEGORIES, URGENCY_LEVELS, type CaseCategory, type Urgency } from "@/lib/types";

/**
 * File a report. This is the one write path on the site.
 *
 * Order matters:
 *   1. validate everything again on the server, never trusting the browser
 *   2. resolve the location to a pin the map can draw
 *   3. rate limit by IP, so one person cannot flood the map
 *   4. save the report, which assigns the case number
 *   5. store the photographs against that number
 *   6. email the founder, with the photographs attached
 *   7. tell Next which pages now have a new case on them
 *
 * A failure at 4 or 5 is an error the reporter sees, because nothing was filed.
 * A failure at 6 is logged and the reporter still gets their case number,
 * because by then the report exists and is on the map.
 */

export interface ReportResult {
  ok: boolean;
  caseNumber?: string;
  slug?: string;
  /** Field errors keyed by the form's field ids, so the form can show them in place. */
  errors?: Record<string, string>;
  /** When the whole submission could not be accepted. */
  message?: string;
  emailSent?: boolean;
}

const LIMITS = {
  files: 10,
  fileBytes: 2_500_000,
  totalBytes: 3_800_000,
  perHour: 5,
  title: 120,
  description: 4000,
  name: 120,
  contact: 160,
  place: 80,
  landmark: 200,
};

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const UNAVAILABLE =
  "Reporting is temporarily unavailable, so nothing was filed. Please try again later, or contact your barangay or city environment office directly.";

function text(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t) && t >= Date.parse("2000-01-01") && t <= Date.now() + 86_400_000;
}

async function requesterHash(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  // Hashed so the raw address is never stored. The purpose is rate limiting only.
  return createHash("sha256").update(`earthlink-report:${ip}`).digest("hex").slice(0, 32);
}

export async function fileReport(form: FormData): Promise<ReportResult> {
  // Honeypot. A person never sees this field. A bot that fills it gets a
  // success screen and learns nothing, and nothing is stored.
  if (text(form, "website", 500)) return { ok: true };

  const store = getReportStore();
  if (!store) {
    console.error("A report was submitted but no report store is configured.");
    return { ok: false, message: UNAVAILABLE };
  }

  const errors: Record<string, string> = {};

  // --- 1. Validate -------------------------------------------------------

  const category = text(form, "category", 20) as CaseCategory;
  if (!CASE_CATEGORIES.includes(category)) errors.category = "Choose the category that fits best.";

  const title = text(form, "title", LIMITS.title);
  if (title.length < 8) errors.title = "Give the concern a short title, at least 8 characters.";

  const description = text(form, "description", LIMITS.description);
  if (description.length < 30) errors.description = "Describe what you saw in at least 30 characters.";

  const observedOn = text(form, "observedOn", 10);
  if (!isIsoDate(observedOn)) errors.observedOn = "Enter the date you saw this. An approximate date is fine.";

  const urgency = text(form, "urgency", 20) as Urgency;
  if (!URGENCY_LEVELS.includes(urgency)) errors.urgency = "Choose how urgent this is.";

  const anonymous = form.get("anonymous") === "on";
  const name = anonymous ? "" : text(form, "name", LIMITS.name);
  const contact = anonymous ? "" : text(form, "contact", LIMITS.contact);
  if (contact && !contact.includes("@") && !/\d{7}/.test(contact)) {
    errors.contact = "Enter either an email address or a mobile number so we can send you updates.";
  }
  if (form.get("consent") !== "on") {
    errors.consent = "Tick the box to confirm you agree to how this report will be handled. It is required.";
  }

  // --- 2. Location -------------------------------------------------------

  const barangay = text(form, "barangay", LIMITS.place);
  const landmark = text(form, "landmark", LIMITS.landmark);
  const typedMunicipality = text(form, "municipality", LIMITS.place);
  const typedProvince = text(form, "province", LIMITS.place);
  const deviceLat = Number.parseFloat(text(form, "lat", 20));
  const deviceLng = Number.parseFloat(text(form, "lng", 20));
  const hasDevice = Number.isFinite(deviceLat) && Number.isFinite(deviceLng);

  let location: Pick<NewReport, "municipality" | "province" | "region" | "lat" | "lng" | "locationSource"> | null =
    null;

  if (hasDevice) {
    const region = withinPhilippines(deviceLat, deviceLng) ? regionAt(deviceLat, deviceLng) : undefined;
    const nearest = nearestPlace(deviceLat, deviceLng);
    if (!region || !nearest || nearest.km > 40) {
      errors.municipality =
        "Your device's location is outside the Philippines or at sea. Switch off location detection and type the place instead.";
    } else {
      location = {
        municipality: nearest.place.name,
        province: nearest.place.province,
        region,
        lat: Number(deviceLat.toFixed(5)),
        lng: Number(deviceLng.toFixed(5)),
        locationSource: "device",
      };
    }
  } else {
    if (!typedMunicipality) errors.municipality = "Enter the city or municipality, or switch on location detection.";
    if (!typedProvince) errors.province = "Enter the province, or switch on location detection.";
    if (typedMunicipality && typedProvince) {
      const place = findPlace(typedMunicipality, typedProvince);
      if (!place) {
        errors.municipality =
          "We could not find that city or municipality in that province. Check the spelling of both, or switch on location detection.";
      } else {
        location = {
          municipality: place.name,
          province: place.province,
          region: place.region,
          lat: place.lat,
          lng: place.lng,
          locationSource: "place",
        };
      }
    }
  }

  // --- Photographs ---------------------------------------------------------

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > LIMITS.files) errors.files = `Attach up to ${LIMITS.files} photographs.`;
  let total = 0;
  for (const file of files) {
    total += file.size;
    if (!ALLOWED_TYPES.has(file.type)) errors.files = "Only JPEG, PNG and WebP photographs can be attached.";
    if (file.size > LIMITS.fileBytes) errors.files = "One of the photographs is too large. Each must be under 2.5 MB.";
  }
  if (total > LIMITS.totalBytes) errors.files = "The photographs together are too large. Remove one or two and try again.";

  if (Object.keys(errors).length > 0 || !location) return { ok: false, errors };

  // --- 3. Rate limit -------------------------------------------------------

  const ipHash = await requesterHash();
  try {
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    if ((await store.countSince(ipHash, hourAgo)) >= LIMITS.perHour) {
      return {
        ok: false,
        message:
          "Several reports have been filed from your connection in the last hour. Please wait a while before filing another.",
      };
    }
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { ok: false, message: UNAVAILABLE };
  }

  // --- 4 and 5. Save, then store the photographs ---------------------------

  const evidence: EvidenceUpload[] = [];
  for (const file of files) {
    evidence.push({ bytes: new Uint8Array(await file.arrayBuffer()), type: file.type });
  }

  const report: NewReport = {
    category,
    title,
    description,
    observedOn,
    urgency,
    barangay,
    landmark,
    ...location,
    status: "reported",
    anonymous,
    reporterName: name || null,
    reporterContact: contact || null,
    ipHash,
  };

  let stored;
  let storedEvidence;
  try {
    stored = await store.insert(report);
    storedEvidence = await store.attachEvidence(stored.id, stored.caseNumber, evidence);
  } catch (err) {
    console.error("Filing a report failed:", err);
    return {
      ok: false,
      message:
        "We could not save your report just now, so nothing was filed. Please try again in a few minutes. If it keeps failing, contact your barangay or city environment office directly.",
    };
  }

  // --- 6. Email the founder ------------------------------------------------

  let emailSent = false;
  try {
    const links = await store.signedUrls(storedEvidence, 7 * 86_400);
    const outcome = await sendReportEmail(stored, evidence, links);
    emailSent = outcome.sent;
    if (!outcome.sent) console.warn(`Report ${stored.caseNumber} was saved but the email was not sent: ${outcome.reason}`);
  } catch (err) {
    console.error(`Report ${stored.caseNumber} was saved but the email failed:`, err);
  }

  // --- 7. Refresh every page that lists cases ------------------------------

  const slug = stored.caseNumber.toLowerCase();
  for (const path of ["/", "/map", "/cases", "/track", `/cases/${slug}`, "/sitemap.xml"]) {
    revalidatePath(path);
  }

  return { ok: true, caseNumber: stored.caseNumber, slug, emailSent };
}
