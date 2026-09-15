"use client";

import { useState } from "react";
import { CATEGORY_META, CATEGORY_ORDER, URGENCY_META } from "@/lib/taxonomy";
import { URGENCY_LEVELS, type CaseCategory, type Urgency } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

/**
 * The report intake form.
 *
 * PHASE 1 SCOPE. This is the complete designed flow, fully interactive, with real
 * validation and real state. It does NOT submit anywhere, because there is no
 * backend yet: the submit step shows exactly what the confirmation will look like
 * and says plainly that nothing was sent.
 *
 * That honesty is deliberate. A form that silently discards a genuine
 * environmental report would be worse than no form, and someone will try this on
 * the live design build.
 *
 * Phase 2 replaces handleSubmit with a Server Action that validates with zod,
 * rate limits by IP, checks a Turnstile token, writes the case, then sends mail.
 * Nothing else in this component needs to change.
 *
 * Four steps, in the order a person actually notices a problem: what it is, where
 * it is, what it looks like, and who is reporting.
 */

const STEPS = [
  { key: "what", label: "What you saw" },
  { key: "where", label: "Where it is" },
  { key: "evidence", label: "Evidence" },
  { key: "you", label: "About you" },
] as const;

interface FormState {
  category: CaseCategory | null;
  title: string;
  description: string;
  observedOn: string;
  urgency: Urgency;
  barangay: string;
  municipality: string;
  province: string;
  landmark: string;
  useLocation: boolean;
  files: string[];
  anonymous: boolean;
  name: string;
  contact: string;
  consent: boolean;
}

const EMPTY: FormState = {
  category: null,
  title: "",
  description: "",
  observedOn: "",
  urgency: "moderate",
  barangay: "",
  municipality: "",
  province: "",
  landmark: "",
  useLocation: false,
  files: [],
  anonymous: false,
  name: "",
  contact: "",
  consent: false,
};

export function ReportForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  /**
   * Validation per step. Errors are identified in text with a suggestion for
   * fixing them, never by colour alone. WCAG 3.3.1 and 3.3.3.
   */
  function validate(index: number): boolean {
    const next: Record<string, string> = {};

    if (index === 0) {
      if (!form.category) next.category = "Choose the category that fits best. If unsure, pick the closest one.";
      if (form.title.trim().length < 8)
        next.title = "Give the concern a short title, at least 8 characters. For example, waste dumped along the creek.";
      if (form.description.trim().length < 30)
        next.description = "Describe what you saw in at least 30 characters. What is happening, and since when.";
      if (!form.observedOn) next.observedOn = "Enter the date you saw this. An approximate date is fine.";
    }

    if (index === 1) {
      if (!form.useLocation) {
        if (!form.barangay.trim()) next.barangay = "Enter the barangay, or switch on location detection above.";
        if (!form.municipality.trim())
          next.municipality = "Enter the city or municipality, or switch on location detection above.";
        if (!form.province.trim()) next.province = "Enter the province, or switch on location detection above.";
      }
    }

    if (index === 3) {
      if (!form.anonymous && form.contact.trim() && !form.contact.includes("@") && !/\d{7}/.test(form.contact)) {
        next.contact = "Enter either an email address or a mobile number so we can send you updates.";
      }
      if (!form.consent)
        next.consent = "Tick the box to confirm you agree to how this report will be handled. It is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return <SubmittedPanel form={form} onReset={() => { setForm(EMPTY); setStep(0); setSubmitted(false); }} />;
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface shadow-soft">
      {/* Step rail. Position is carried by number and label as well as by fill. */}
      <div className="border-b border-brand-line p-5 sm:p-6">
        <ol className="flex flex-wrap gap-x-5 gap-y-2">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-data text-[0.6875rem] font-bold",
                  i < step
                    ? "bg-brand-primary text-white"
                    : i === step
                      ? "bg-brand-signal text-brand-ink"
                      : "bg-brand-paper text-brand-ink/45 ring-1 ring-inset ring-brand-line",
                )}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  i === step ? "text-brand-deep" : "text-brand-ink/50",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-5 sm:p-6">
        {/* Step 1: what */}
        {step === 0 ? (
          <div className="space-y-6">
            <Field
              label="What kind of problem is it?"
              hint="Seven categories. They decide which office the case is routed to."
              error={errors.category}
              id="category"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORY_ORDER.map((key) => {
                  const meta = CATEGORY_META[key];
                  const active = form.category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("category", key)}
                      aria-pressed={active}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200",
                        active
                          ? "border-brand-primary bg-brand-primary/[0.06] ring-1 ring-brand-primary"
                          : "border-brand-line bg-brand-paper hover:border-brand-primary/40",
                      )}
                    >
                      <span className={meta.textClass}>
                        <CategoryIcon category={key} />
                      </span>
                      <span className="text-xs font-semibold leading-tight text-brand-deep">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {form.category ? (
                <p className="mt-3 text-xs leading-relaxed text-brand-ink/60">
                  {CATEGORY_META[form.category].covers}
                </p>
              ) : null}
            </Field>

            <Field label="Give it a short title" error={errors.title} id="title">
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Waste dumped along the creek easement"
                className={inputClass(!!errors.title)}
              />
            </Field>

            <Field
              label="Describe what you saw"
              hint="What is happening, how long it has been going on, and who it affects."
              error={errors.description}
              id="description"
            >
              <textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Sacks of household waste have been building up along the creek for about three weeks. The channel is narrower than it was and the rains start next month."
                className={inputClass(!!errors.description)}
              />
              <p className="mt-1.5 text-right font-data text-[0.6875rem] text-brand-ink/45">
                {form.description.trim().length} characters
              </p>
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="When did you see it?" error={errors.observedOn} id="observedOn">
                <input
                  id="observedOn"
                  type="date"
                  value={form.observedOn}
                  onChange={(e) => set("observedOn", e.target.value)}
                  className={inputClass(!!errors.observedOn)}
                />
              </Field>

              <Field label="How urgent is it?" id="urgency">
                <div className="space-y-2">
                  {URGENCY_LEVELS.map((level) => (
                    <label
                      key={level}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                        form.urgency === level
                          ? "border-brand-primary bg-brand-primary/[0.06]"
                          : "border-brand-line hover:border-brand-primary/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={form.urgency === level}
                        onChange={() => set("urgency", level)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E6B55]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-brand-deep">
                          {URGENCY_META[level].label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-brand-ink/60">
                          {URGENCY_META[level].note}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        ) : null}

        {/* Step 2: where */}
        {step === 1 ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-brand-line bg-brand-paper p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.useLocation}
                  onChange={(e) => set("useLocation", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E6B55]"
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-deep">
                    Use my current location
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-brand-ink/65">
                    Detects your coordinates and fills in the barangay and municipality. Only do this if
                    you are at the site. In the finished platform your browser asks permission first.
                  </span>
                </span>
              </label>

              {form.useLocation ? (
                <div className="mt-4 rounded-lg border border-brand-primary/25 bg-white p-3">
                  <p className="font-data text-[0.6875rem] text-brand-primary">
                    14.4590 N, 120.9366 E
                  </p>
                  <p className="mt-1 text-xs text-brand-ink/60">
                    Barangay San Isidro, Bacoor, Cavite. Sample coordinates for the demonstration.
                  </p>
                </div>
              ) : null}
            </div>

            <p className="text-sm text-brand-ink/65">
              Or enter the location yourself. If you do not know the barangay, the nearest landmark is
              enough for the verification team to find it.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Barangay" error={errors.barangay} id="barangay">
                <input
                  id="barangay"
                  type="text"
                  value={form.barangay}
                  onChange={(e) => set("barangay", e.target.value)}
                  disabled={form.useLocation}
                  className={inputClass(!!errors.barangay)}
                />
              </Field>
              <Field label="City or municipality" error={errors.municipality} id="municipality">
                <input
                  id="municipality"
                  type="text"
                  value={form.municipality}
                  onChange={(e) => set("municipality", e.target.value)}
                  disabled={form.useLocation}
                  className={inputClass(!!errors.municipality)}
                />
              </Field>
            </div>

            <Field label="Province" error={errors.province} id="province">
              <input
                id="province"
                type="text"
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                disabled={form.useLocation}
                className={inputClass(!!errors.province)}
              />
            </Field>

            <Field
              label="Nearest landmark"
              hint="Optional, but it is often the fastest way for someone to find the exact spot."
              id="landmark"
            >
              <input
                id="landmark"
                type="text"
                value={form.landmark}
                onChange={(e) => set("landmark", e.target.value)}
                placeholder="Behind the covered court, along the creek"
                className={inputClass(false)}
              />
            </Field>
          </div>
        ) : null}

        {/* Step 3: evidence */}
        {step === 2 ? (
          <div className="space-y-6">
            <Field
              label="Photographs or video"
              hint="Up to 10 files. Photographs from different dates at the same spot are the most useful evidence there is."
              id="files"
            >
              <div className="rounded-xl border-2 border-dashed border-brand-line bg-brand-paper p-8 text-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mx-auto h-8 w-8 text-brand-ink/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 16V4m0 0L8 8m4-4 4 4M3 15v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3" />
                </svg>
                <p className="mt-3 text-sm font-semibold text-brand-deep">
                  Upload is part of Phase 2
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-brand-ink/60">
                  In the finished platform you add photographs and video here, they are compressed on
                  your device before sending, and they are stored against the case permanently. This
                  design build does not store files.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "files",
                      form.files.length >= 3
                        ? []
                        : [...form.files, `sample-photo-${form.files.length + 1}.jpg`],
                    )
                  }
                  className="btn-outline mt-5 px-4 py-2 text-xs"
                >
                  {form.files.length >= 3 ? "Clear the sample files" : "Add a sample file"}
                </button>
              </div>

              {form.files.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {form.files.map((file) => (
                    <li
                      key={file}
                      className="flex items-center justify-between gap-3 rounded-lg border border-brand-line bg-white px-3 py-2"
                    >
                      <span className="truncate font-data text-xs text-brand-ink/70">{file}</span>
                      <span className="shrink-0 font-data text-[0.6875rem] text-status-resolved-text">
                        attached
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Field>

            <div className="rounded-xl border border-brand-line bg-brand-paper p-5">
              <p className="text-sm font-bold text-brand-deep">What makes evidence usable</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-ink/70">
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                  Include something in frame for scale: a person at a distance, a vehicle, a fence post.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                  Take one wide shot showing the surroundings, so the location is recognisable.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                  If the problem is recurring, photograph the same spot on different dates.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                  Never put yourself at risk. A report from a safe distance is worth more than a
                  photograph that gets you hurt.
                </li>
              </ul>
            </div>
          </div>
        ) : null}

        {/* Step 4: about you */}
        {step === 3 ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-brand-line bg-brand-paper p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(e) => set("anonymous", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E6B55]"
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-deep">
                    File this report anonymously
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-brand-ink/65">
                    Your name is not recorded and nothing is published about who filed it. The case
                    still gets a number and you can follow it on its public page. You will not receive
                    direct updates.
                  </span>
                </span>
              </label>
            </div>

            {!form.anonymous ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Your name" hint="Optional." id="name">
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                    className={inputClass(false)}
                  />
                </Field>
                <Field
                  label="Email or mobile number"
                  hint="Optional. Only used to send you updates on this case."
                  error={errors.contact}
                  id="contact"
                >
                  <input
                    id="contact"
                    type="text"
                    value={form.contact}
                    onChange={(e) => set("contact", e.target.value)}
                    autoComplete="email"
                    className={inputClass(!!errors.contact)}
                  />
                </Field>
              </div>
            ) : null}

            <Field error={errors.consent} id="consent" label="">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line p-4">
                <input
                  id="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E6B55]"
                />
                <span className="text-xs leading-relaxed text-brand-ink/75">
                  I confirm this report is truthful to the best of my knowledge, and I agree that the
                  description, location and evidence may be published on a public case page and sent to
                  the government office responsible. My personal details are handled under the Data
                  Privacy Act of 2012 and are never published.
                </span>
              </label>
            </Field>

            <div className="rounded-xl border border-brand-line bg-brand-paper p-5">
              <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
                Check before you file
              </p>
              <dl className="mt-4 space-y-2.5 text-sm">
                <Summary label="Category" value={form.category ? CATEGORY_META[form.category].label : "Not set"} />
                <Summary label="Title" value={form.title || "Not set"} />
                <Summary label="Observed" value={form.observedOn || "Not set"} />
                <Summary label="Urgency" value={URGENCY_META[form.urgency].label} />
                <Summary
                  label="Location"
                  value={
                    form.useLocation
                      ? "Detected from your device"
                      : [form.barangay, form.municipality, form.province].filter(Boolean).join(", ") || "Not set"
                  }
                />
                <Summary label="Evidence" value={form.files.length ? `${form.files.length} files` : "None attached"} />
                <Summary label="Reporter" value={form.anonymous ? "Anonymous" : form.name || "Not given"} />
              </dl>
            </div>
          </div>
        ) : null}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-6">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-outline px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <div className="flex items-center gap-4">
            <span className="font-data text-xs text-brand-ink/45">
              Step {step + 1} of {STEPS.length}
            </span>
            <button type="button" onClick={goNext} className="btn-primary px-6 py-2.5 text-sm">
              {step === STEPS.length - 1 ? "File this report" : "Continue"}
            </button>
          </div>
        </div>

        {/* Errors are announced, not only shown. */}
        <div aria-live="polite" className="sr-only">
          {Object.keys(errors).length > 0
            ? `${Object.keys(errors).length} fields need attention before you can continue.`
            : ""}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-brand-ink transition-colors placeholder:text-brand-ink/35 disabled:cursor-not-allowed disabled:bg-brand-paper disabled:text-brand-ink/40",
    hasError ? "border-status-reported" : "border-brand-line focus:border-brand-primary",
  );
}

function Field({
  label,
  hint,
  error,
  id,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="block text-sm font-semibold text-brand-deep">
          {label}
        </label>
      ) : null}
      {hint ? <p className="mt-1 text-xs leading-relaxed text-brand-ink/60">{hint}</p> : null}
      <div className={label || hint ? "mt-2.5" : ""}>{children}</div>
      {error ? (
        // Identified in text with a suggested fix, never by colour alone.
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-status-reported-text">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.8v3.6M8 11h.01" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs text-brand-ink/55">{label}</dt>
      <dd className="max-w-[60%] text-right text-xs font-semibold text-brand-deep">{value}</dd>
    </div>
  );
}

/**
 * The confirmation.
 *
 * It shows the case number the reporter would receive and exactly what happens
 * next, and it says without hedging that nothing was actually filed. Anyone
 * testing this design build with a genuine concern deserves to know that.
 */
function SubmittedPanel({ form, onReset }: { form: FormState; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-signal">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-brand-ink" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12.5 9.5 18 20 6.5" />
        </svg>
      </div>

      <h2 className="mt-5 text-display-md text-brand-deep">This is what you would see</h2>

      <div className="mt-6 rounded-xl border border-brand-primary/25 bg-brand-primary/[0.05] p-5">
        <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
          Your EARTH case number
        </p>
        <p className="mt-2 font-data text-2xl font-bold tracking-tight text-brand-deep">
          EARTH-2026-0681
        </p>
        <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
          {form.title || "Your report"}. Permanent, never reused, and the reference for everything that
          happens to this case from here.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-status-referred/30 bg-status-referred/[0.07] p-5">
        <p className="text-sm font-bold text-status-referred-text">Nothing was actually filed</p>
        <p className="mt-2 text-sm leading-relaxed text-brand-ink/75">
          This is the Phase 1 design build. There is no database behind this form yet, so your report
          was not saved and not sent to anyone. If you have a real environmental concern, please contact
          your barangay or your city environment office directly.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-sm font-bold text-brand-deep">In the finished platform, next would be:</p>
        <ol className="mt-4 space-y-3">
          {[
            "A confirmation email or text with your case number, within a minute.",
            "Verification by the EARTHLINK team, usually within a week.",
            "Other reports of the same problem merged into your case.",
            "Referral to the office responsible, with your evidence attached.",
            "A public case page you can check at any time.",
          ].map((line, i) => (
            <li key={line} className="flex gap-3">
              <span className="font-data text-[0.6875rem] text-brand-ink/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-brand-ink/70">{line}</span>
            </li>
          ))}
        </ol>
      </div>

      <button type="button" onClick={onReset} className="btn-outline mt-8">
        Try the form again
      </button>
    </div>
  );
}
