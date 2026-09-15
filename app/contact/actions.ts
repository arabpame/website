"use server";

import { sendPlainEmail } from "@/lib/reports/email";

/**
 * The enquiry form. Validated again here, then emailed to CONTACT_TO_EMAIL, or
 * to REPORTS_TO_EMAIL when the contact address is not set separately.
 */

export interface ContactResult {
  ok: boolean;
  message?: string;
}

const TOPICS: Record<string, string> = {
  volunteer: "Volunteering",
  partner: "Partnership or referrals",
  school: "School or teaching",
  ambassador: "EARTH Ambassador programme",
  media: "Media or speaking",
  other: "General enquiry",
};

function text(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function sendEnquiry(form: FormData): Promise<ContactResult> {
  // Honeypot: a bot gets a success screen and nothing is sent.
  if (text(form, "website", 500)) return { ok: true };

  const topic = TOPICS[text(form, "topic", 20)] ?? TOPICS.other;
  const name = text(form, "name", 120);
  const email = text(form, "email", 160);
  const organisation = text(form, "organisation", 160);
  const message = text(form, "message", 4000);

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 20) {
    return { ok: false, message: "Check the form: a name, a valid email address and a message of at least 20 characters are needed." };
  }

  const to = process.env.CONTACT_TO_EMAIL || process.env.REPORTS_TO_EMAIL;
  if (!to) {
    console.error("An enquiry was submitted but CONTACT_TO_EMAIL and REPORTS_TO_EMAIL are both unset.");
    return {
      ok: false,
      message: "Messages cannot be sent right now. Please email us directly instead.",
    };
  }

  const body = [
    `Topic:        ${topic}`,
    `From:         ${name} <${email}>`,
    organisation ? `Organisation: ${organisation}` : null,
    "",
    message,
    "",
    "Reply to this email to answer them directly.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const outcome = await sendPlainEmail({
    to,
    subject: `EARTHLINK enquiry (${topic}) from ${name}`,
    text: body,
    replyTo: email,
  });

  if (!outcome.sent) {
    console.error(`An enquiry from ${email} could not be sent: ${outcome.reason}`);
    return { ok: false, message: "The message could not be sent just now. Please try again in a few minutes, or email us directly." };
  }
  return { ok: true };
}
