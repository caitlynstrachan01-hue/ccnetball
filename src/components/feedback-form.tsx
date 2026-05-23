"use client";

import { useState } from "react";
import { Send, CheckCircle2, Star } from "lucide-react";
import { PROGRAMS } from "@/lib/site-content";

const SESSION_OPTIONS = PROGRAMS.filter((p) => !p.hidden).map((p) => p.name);

export function FeedbackForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enjoyment, setEnjoyment] = useState(0);
  const [expectations, setExpectations] = useState(0);
  const [overall, setOverall] = useState(0);
  const [publicConsent, setPublicConsent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!enjoyment || !expectations || !overall) {
      setError("Please leave a star rating for each of the three questions.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(formData);
    payload.enjoyment = enjoyment;
    payload.expectations = expectations;
    payload.overall = overall;
    payload.publicConsent = publicConsent;

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please email us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-12 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <h3 className="mt-4 font-display text-2xl font-bold">
          Thank you for your feedback
        </h3>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Caitlyn reads every response — your input helps her make every
          session better.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border/70 bg-card p-8 md:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required />
        <Field label="Email (optional)" name="email" type="email" />
      </div>

      <div className="mt-5">
        <SelectField
          label="Which session did you attend?"
          name="session"
          required
          options={SESSION_OPTIONS}
        />
      </div>

      <StarsRow
        label="Did you enjoy the session?"
        value={enjoyment}
        onChange={setEnjoyment}
        className="mt-8"
      />
      <StarsRow
        label="Did the session meet your expectations?"
        value={expectations}
        onChange={setExpectations}
        className="mt-8"
      />
      <StarsRow
        label="Overall rating"
        value={overall}
        onChange={setOverall}
        className="mt-8"
      />

      <label className="mt-10 block">
        <span className="text-sm font-semibold text-foreground/90">
          Your review
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          Tell us about your experience — what stood out, what you learned, who
          you&apos;d recommend it to. If you tick the box below, this comment
          is what we&apos;ll share on the CC Netball website and social media.
        </p>
        <textarea
          name="review"
          rows={5}
          placeholder="What stood out about the session?"
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background p-4 transition hover:border-primary/50">
        <input
          type="checkbox"
          name="publicConsent"
          checked={publicConsent}
          onChange={(e) => setPublicConsent(e.target.checked)}
          className="mt-1 size-5 shrink-0 cursor-pointer rounded border-border accent-[var(--brand-raspberry,#c2185b)]"
        />
        <span className="text-sm leading-relaxed text-foreground/90">
          I&apos;m happy for this review to be shared on the CC Netball website
          and social media.
        </span>
      </label>

      {publicConsent && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Field
            label="Reviewer's name (as you'd like it shown publicly)"
            name="displayName"
            required
            placeholder="e.g. Sarah M. or Sarah Martin"
          />
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Submit feedback"}
        <Send className="size-4" />
      </button>
    </form>
  );
}

function StarsRow({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const labels = ["", "Poor", "Below average", "Good", "Very good", "Excellent"];

  return (
    <div className={className}>
      <p className="text-sm font-semibold text-foreground/90">
        {label}
        <span className="ml-1 text-primary">*</span>
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= display;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className="rounded-full p-1 transition hover:scale-110"
            >
              <Star
                className={`size-8 transition ${
                  active
                    ? "fill-[var(--brand-raspberry,#c2185b)] text-[var(--brand-raspberry,#c2185b)]"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          );
        })}
        {display > 0 && (
          <span className="ml-3 text-sm font-medium text-muted-foreground">
            {labels[display]}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground/90">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground/90">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="" disabled>
          Choose a session
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
