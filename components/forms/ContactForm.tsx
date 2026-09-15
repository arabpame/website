"use client";

import { useState, useTransition } from "react";
import { sendEnquiry } from "@/app/contact/actions";
import { cn } from "@/lib/utils";

/**
 * The general enquiry form.
 *
 * Validated here, validated again on the server, then emailed to the EARTHLINK
 * inbox through the sendEnquiry Server Action with the sender as reply-to.
 *
 * Three routed forms (enquiry, volunteer, partner) are one component with a
 * topic selector rather than three near-identical forms, because three copies of
 * a form is three places for validation to drift apart.
 */

const TOPICS = [
  { key: "volunteer", label: "I want to volunteer", to: "Volunteer coordinator" },
  { key: "partner", label: "Partnership or referrals", to: "Partnerships" },
  { key: "school", label: "School or teaching", to: "Education team" },
  { key: "ambassador", label: "EARTH Ambassador programme", to: "Youth programme" },
  { key: "media", label: "Media or speaking", to: "Communications" },
  { key: "other", label: "Something else", to: "General enquiries" },
] as const;

type TopicKey = (typeof TOPICS)[number]["key"];

export function ContactForm({ defaultTopic = "other" }: { defaultTopic?: TopicKey }) {
  const [topic, setTopic] = useState<TopicKey>(defaultTopic);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot. A real person never fills this in, because it is hidden from them.
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = TOPICS.find((t) => t.key === topic)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name so we know who we are replying to.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      next.email = "Enter a valid email address, for example juan@example.com.";
    if (message.trim().length < 20)
      next.message = "Tell us a little more, at least 20 characters, so we can route this to the right person.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const data = new FormData();
    data.set("website", website);
    data.set("topic", topic);
    data.set("name", name);
    data.set("email", email);
    data.set("organisation", organisation);
    data.set("message", message);
    setFailure(null);

    startTransition(async () => {
      try {
        const outcome = await sendEnquiry(data);
        if (outcome.ok) setSent(true);
        else setFailure(outcome.message ?? "The message could not be sent. Please try again.");
      } catch {
        setFailure("The message could not be sent. Check your connection and try again.");
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-signal">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-brand-ink" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </div>
        <h2 className="mt-5 text-display-md">Message sent</h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-ink/75">
          Your message has gone to {selected.to}. Replies come from the EARTHLINK inbox to the email
          address you gave, usually within a few days.
        </p>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMessage("");
          }}
          className="btn-outline mt-7"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft">
      <fieldset>
        <legend className="text-sm font-semibold text-brand-deep">What is this about?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <label
              key={t.key}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-colors",
                topic === t.key
                  ? "border-brand-primary bg-brand-primary/[0.06]"
                  : "border-brand-line hover:border-brand-primary/40",
              )}
            >
              <input
                type="radio"
                name="topic"
                value={t.key}
                checked={topic === t.key}
                onChange={() => setTopic(t.key)}
                className="h-4 w-4 shrink-0 accent-[#0E6B55]"
              />
              <span className="text-sm font-medium text-brand-ink">{t.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-brand-ink/65">Routed to {selected.to}.</p>
      </fieldset>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-brand-deep">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={fieldClass(!!errors.name)}
          />
          <FieldError error={errors.name} />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-brand-deep">
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={fieldClass(!!errors.email)}
          />
          <FieldError error={errors.email} />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="contact-org" className="block text-sm font-semibold text-brand-deep">
          Organisation, school or barangay
        </label>
        <p className="mt-1 text-xs text-brand-ink/70">Optional.</p>
        <input
          id="contact-org"
          type="text"
          value={organisation}
          onChange={(e) => setOrganisation(e.target.value)}
          autoComplete="organization"
          className={fieldClass(false)}
        />
      </div>

      <div className="mt-6">
        <label htmlFor="contact-message" className="block text-sm font-semibold text-brand-deep">
          Your message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={fieldClass(!!errors.message)}
        />
        <FieldError error={errors.message} />
      </div>

      {/*
        Honeypot. Hidden from people, visible to naive bots. Never `display: none`
        alone, which sophisticated bots check for, and always aria-hidden and
        tabIndex -1 so a screen reader user never lands in it.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {failure ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-status-reported/40 bg-status-reported/[0.07] p-4 text-sm leading-relaxed text-status-reported-text"
        >
          {failure}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-brand-line pt-6">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Sending..." : "Send message"}
        </button>
        <p className="text-xs leading-relaxed text-brand-ink/65">
          Handled under the Data Privacy Act of 2012. Never shared or sold.
        </p>
      </div>

      <div aria-live="polite" className="sr-only">
        {Object.keys(errors).length > 0
          ? `${Object.keys(errors).length} fields need attention before this can be sent.`
          : ""}
      </div>
    </form>
  );
}

function fieldClass(hasError: boolean) {
  return cn(
    "mt-2.5 w-full rounded-xl border bg-white px-4 py-3 text-brand-ink transition-colors placeholder:text-brand-ink/35",
    hasError ? "border-status-reported" : "border-brand-line focus:border-brand-primary",
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-status-reported-text">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.8v3.6M8 11h.01" />
      </svg>
      {error}
    </p>
  );
}
