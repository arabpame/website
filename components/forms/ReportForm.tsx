"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { fileReport, type ReportResult } from "@/app/report/actions";
import { CategoryIcon } from "@/components/ui/Primitives";
import { CATEGORY_META, CATEGORY_ORDER, URGENCY_META } from "@/lib/taxonomy";
import { URGENCY_LEVELS, type CaseCategory, type Urgency } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The report intake form.
 *
 * Four steps, in the order a person actually notices a problem: what it is,
 * where it is, what it looks like, and who is reporting. Every step validates
 * before the next one opens, with errors written as text and a suggested fix.
 *
 * On the last step the form posts to the fileReport Server Action, which
 * validates everything again, saves the report, stores the photographs, emails
 * the founder and refreshes the map. The reporter gets their case number and a
 * link to the public case page.
 *
 * Photographs are resized in the browser before upload. Phones produce 4 to 12
 * MB images, the function that receives the form is capped at 4 MB, and a
 * 1600-pixel JPEG is more than enough evidence.
 */

const STEPS = [
  { key: "what", label: "What you saw" },
  { key: "where", label: "Where it is" },
  { key: "evidence", label: "Evidence" },
  { key: "you", label: "About you" },
] as const;

const MAX_FILES = 10;
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

interface Photo {
  id: string;
  file: File;
  previewUrl: string;
  originalBytes: number;
}

interface DeviceLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

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
  anonymous: false,
  name: "",
  contact: "",
  consent: false,
};

/** Which step each server-side field error belongs to, so the form can jump there. */
const FIELD_STEP: Record<string, number> = {
  category: 0,
  title: 0,
  description: 0,
  observedOn: 0,
  urgency: 0,
  barangay: 1,
  municipality: 1,
  province: 1,
  files: 2,
  contact: 3,
  consent: 3,
};

export function ReportForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [device, setDevice] = useState<DeviceLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [pending, startTransition] = useTransition();
  // Honeypot. A person never sees this field.
  const [website, setWebsite] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

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
      if (form.useLocation && !device) {
        next.municipality = "Your location has not been detected yet. Wait a moment, or switch detection off and type the place.";
      }
      if (!form.useLocation) {
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
    submit();
  }

  function submit() {
    setMessage(null);
    const data = new FormData();
    data.set("website", website);
    data.set("category", form.category ?? "");
    data.set("title", form.title);
    data.set("description", form.description);
    data.set("observedOn", form.observedOn);
    data.set("urgency", form.urgency);
    data.set("barangay", form.barangay);
    data.set("landmark", form.landmark);
    if (form.useLocation && device) {
      data.set("lat", String(device.lat));
      data.set("lng", String(device.lng));
    } else {
      data.set("municipality", form.municipality);
      data.set("province", form.province);
    }
    if (form.anonymous) data.set("anonymous", "on");
    data.set("name", form.name);
    data.set("contact", form.contact);
    if (form.consent) data.set("consent", "on");
    for (const photo of photos) data.append("files", photo.file, photo.file.name);

    startTransition(async () => {
      try {
        const outcome = await fileReport(data);
        if (outcome.ok) {
          setResult(outcome);
          return;
        }
        if (outcome.errors && Object.keys(outcome.errors).length > 0) {
          setErrors(outcome.errors);
          const first = Object.keys(outcome.errors)[0] ?? "";
          setStep(FIELD_STEP[first] ?? step);
          return;
        }
        setMessage(outcome.message ?? "Something went wrong and nothing was filed. Please try again.");
      } catch {
        setMessage(
          "The report could not be sent. Check your connection and try again. Nothing was filed.",
        );
      }
    });
  }

  // --- Location -------------------------------------------------------------

  function toggleLocation(on: boolean) {
    set("useLocation", on);
    if (!on) {
      setDevice(null);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set("useLocation", false);
      setErrors((e) => ({ ...e, municipality: "This browser cannot share its location. Type the place instead." }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDevice({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLocating(false);
        setErrors((e) => {
          const next = { ...e };
          delete next.municipality;
          delete next.province;
          return next;
        });
      },
      () => {
        setLocating(false);
        set("useLocation", false);
        setErrors((e) => ({
          ...e,
          municipality: "Location permission was not given, so type the place instead.",
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  // --- Photographs ----------------------------------------------------------

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setPreparing(true);
    setErrors((e) => {
      const next = { ...e };
      delete next.files;
      return next;
    });
    const room = MAX_FILES - photos.length;
    const chosen = Array.from(list).slice(0, room);
    const added: Photo[] = [];
    for (const original of chosen) {
      if (!original.type.startsWith("image/")) continue;
      try {
        const file = await shrinkImage(original);
        added.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          originalBytes: original.size,
        });
      } catch {
        setErrors((e) => ({ ...e, files: `${original.name} could not be read as a photograph and was skipped.` }));
      }
    }
    setPhotos((p) => [...p, ...added]);
    if (list.length > room) {
      setErrors((e) => ({ ...e, files: `Up to ${MAX_FILES} photographs can be attached. The extra ones were left out.` }));
    }
    setPreparing(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((p) => {
      const gone = p.find((x) => x.id === id);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return p.filter((x) => x.id !== id);
    });
  }

  function reset() {
    for (const photo of photos) URL.revokeObjectURL(photo.previewUrl);
    setPhotos([]);
    setForm(EMPTY);
    setDevice(null);
    setErrors({});
    setMessage(null);
    setResult(null);
    setStep(0);
  }

  if (result) {
    return <SubmittedPanel result={result} title={form.title} onReset={reset} />;
  }

  const busy = pending || preparing;

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
                      : "bg-brand-paper text-brand-ink/65 ring-1 ring-inset ring-brand-line",
                )}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  i === step ? "text-brand-deep" : "text-brand-ink/65",
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
                <p className="mt-3 text-xs leading-relaxed text-brand-ink/70">
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
                maxLength={120}
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
                maxLength={4000}
                placeholder="Sacks of household waste have been building up along the creek for about three weeks. The channel is narrower than it was and the rains start next month."
                className={inputClass(!!errors.description)}
              />
              <p className="mt-1.5 text-right font-data text-[0.6875rem] text-brand-ink/65">
                {form.description.trim().length} characters
              </p>
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="When did you see it?" error={errors.observedOn} id="observedOn">
                <input
                  id="observedOn"
                  type="date"
                  value={form.observedOn}
                  max={new Date().toISOString().slice(0, 10)}
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
                        <span className="mt-0.5 block text-xs leading-snug text-brand-ink/70">
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
                  onChange={(e) => toggleLocation(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E6B55]"
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-deep">
                    Use my current location
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-brand-ink/65">
                    Your browser will ask permission, then the pin is placed where you are standing and
                    the city or municipality is filled in from it. Only do this if you are at the site.
                  </span>
                </span>
              </label>

              {form.useLocation ? (
                <div className="mt-4 rounded-lg border border-brand-primary/25 bg-white p-3" aria-live="polite">
                  {locating ? (
                    <p className="text-xs text-brand-ink/70">Detecting your location...</p>
                  ) : device ? (
                    <>
                      <p className="font-data text-[0.6875rem] text-brand-primary">
                        {device.lat.toFixed(4)} N, {device.lng.toFixed(4)} E
                      </p>
                      <p className="mt-1 text-xs text-brand-ink/70">
                        Accurate to about {Math.round(device.accuracy)} metres. The city or municipality
                        is worked out from this point when you file.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-brand-ink/70">Waiting for permission...</p>
                  )}
                </div>
              ) : null}
            </div>

            <p className="text-sm text-brand-ink/65">
              Or enter the location yourself. If you do not know the barangay, the nearest landmark is
              enough for the verification team to find it.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Barangay"
                hint={form.useLocation ? "Optional when your location is detected." : undefined}
                error={errors.barangay}
                id="barangay"
              >
                <input
                  id="barangay"
                  type="text"
                  value={form.barangay}
                  onChange={(e) => set("barangay", e.target.value)}
                  maxLength={80}
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
                  maxLength={80}
                  placeholder="Bacoor"
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
                maxLength={80}
                placeholder="Cavite. For Metro Manila cities, write Metro Manila."
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
                maxLength={200}
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
              label="Photographs"
              hint={`Up to ${MAX_FILES}. They are resized on your phone before sending, so they upload quickly even on mobile data.`}
              error={errors.files}
              id="files"
            >
              <input
                ref={fileInput}
                id="files"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                className="sr-only"
                disabled={photos.length >= MAX_FILES || preparing}
              />
              <label
                htmlFor="files"
                className={cn(
                  "block cursor-pointer rounded-xl border-2 border-dashed bg-brand-paper p-8 text-center transition-colors",
                  photos.length >= MAX_FILES
                    ? "cursor-not-allowed border-brand-line opacity-60"
                    : "border-brand-line hover:border-brand-primary/50",
                )}
              >
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
                <span className="mt-3 block text-sm font-semibold text-brand-deep">
                  {preparing ? "Preparing photographs..." : "Tap to add photographs"}
                </span>
                <span className="mx-auto mt-1.5 block max-w-sm text-xs leading-relaxed text-brand-ink/70">
                  From your camera or your gallery. JPEG, PNG or WebP.
                  {photos.length > 0 ? ` ${photos.length} of ${MAX_FILES} attached.` : ""}
                </span>
              </label>

              {photos.length > 0 ? (
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, i) => (
                    <li
                      key={photo.id}
                      className="overflow-hidden rounded-lg border border-brand-line bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.previewUrl}
                        alt={`Photograph ${i + 1} to attach`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                        <span className="font-data text-[0.6875rem] text-brand-ink/70">
                          {formatBytes(photo.file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="text-[0.6875rem] font-semibold text-status-reported-text underline-offset-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
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
                    maxLength={120}
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
                    maxLength={160}
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

            {/*
              Honeypot. Hidden from people, visible to naive bots. Never display: none
              alone, which sophisticated bots check for, and always aria-hidden and
              out of the tab order.
            */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="report-website">Website</label>
              <input
                id="report-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

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
                    form.useLocation && device
                      ? `Detected from your device${form.barangay ? `, ${form.barangay}` : ""}`
                      : [form.barangay, form.municipality, form.province].filter(Boolean).join(", ") || "Not set"
                  }
                />
                <Summary
                  label="Evidence"
                  value={photos.length ? `${photos.length} photograph${photos.length === 1 ? "" : "s"}` : "None attached"}
                />
                <Summary label="Reporter" value={form.anonymous ? "Anonymous" : form.name || "Not given"} />
              </dl>
            </div>

            {message ? (
              <div
                role="alert"
                className="rounded-xl border border-status-reported/40 bg-status-reported/[0.07] p-4 text-sm leading-relaxed text-status-reported-text"
              >
                {message}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-6">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || busy}
            className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            <span className="font-data text-[0.6875rem] text-brand-ink/65">
              Step {step + 1} of {STEPS.length}
            </span>
            <button type="button" onClick={goNext} disabled={busy} className="btn-primary disabled:opacity-60">
              {step === STEPS.length - 1 ? (pending ? "Filing..." : "File this report") : "Continue"}
            </button>
          </div>
        </div>

        {/* Errors are announced, not only shown. */}
        <div aria-live="polite" className="sr-only">
          {Object.keys(errors).length > 0
            ? `${Object.keys(errors).length} fields need attention before you can continue.`
            : pending
              ? "Filing your report."
              : ""}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * Resize a photograph on the device. Long edge capped, re-encoded as JPEG. A
 * file that is already small and already JPEG or WebP is passed through.
 */
async function shrinkImage(original: File): Promise<File> {
  const passThrough = original.size < 600_000 && /^image\/(jpeg|webp)$/.test(original.type);
  if (passThrough) return original;

  const bitmap = await createImageBitmap(original);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("encode failed");
  const name = original.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
      {hint ? <p className="mt-1 text-xs leading-relaxed text-brand-ink/70">{hint}</p> : null}
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
      <dt className="text-xs text-brand-ink/65">{label}</dt>
      <dd className="max-w-[60%] text-right text-xs font-semibold text-brand-deep">{value}</dd>
    </div>
  );
}

/**
 * The confirmation. The case number is real, assigned by the database, and the
 * link goes to the public case page that now exists for it.
 */
function SubmittedPanel({
  result,
  title,
  onReset,
}: {
  result: ReportResult;
  title: string;
  onReset: () => void;
}) {
  const href = result.slug ? `/cases/${result.slug}` : "/cases";

  return (
    <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-signal">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-brand-ink" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12.5 9.5 18 20 6.5" />
        </svg>
      </div>

      <h2 className="mt-5 text-display-md text-brand-deep">Your report is filed</h2>

      {result.caseNumber ? (
        <div className="mt-6 rounded-xl border border-brand-primary/25 bg-brand-primary/[0.05] p-5">
          <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
            Your EARTH case number
          </p>
          <p className="mt-2 font-data text-2xl font-bold tracking-tight text-brand-deep">
            {result.caseNumber}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
            {title || "Your report"}. Permanent, never reused, and the reference for everything that
            happens to this case from here. Write it down or take a screenshot.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-brand-ink/70">Thank you. Your report has been received.</p>
      )}

      <div className="mt-8">
        <p className="text-sm font-bold text-brand-deep">What happens next</p>
        <ol className="mt-4 space-y-3">
          {[
            "Your case is on the EARTH Map and in the case register now, marked Reported.",
            "The EARTHLINK team has been notified and reviews the report, usually within a week.",
            "Other reports of the same problem are merged into your case.",
            "Once verified it is referred to the office responsible, with your evidence attached.",
            "Every step is recorded on the public case page, which you can check at any time.",
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={href} className="btn-primary">
          Open the case page
        </Link>
        <Link href="/map" className="btn-outline">
          See it on the map
        </Link>
        <button type="button" onClick={onReset} className="btn-outline">
          File another report
        </button>
      </div>
    </div>
  );
}
