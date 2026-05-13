"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, CheckCircle2, CreditCard, ArrowRight } from "lucide-react";
import {
  PROGRAM_ORDER,
  PROGRAM_PAYMENTS,
  type ProgramId,
} from "@/lib/stripe-links";

type DoneState = {
  programId: ProgramId;
  athleteName: string;
};

export function BookingForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<DoneState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(formData);
    payload.photoConsent = formData.get("photoConsent") === "on";
    payload.termsAccepted = formData.get("termsAccepted") === "on";

    const programId = String(formData.get("program") || "") as ProgramId;
    const athleteName = String(formData.get("athleteName") || "");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone({ programId, athleteName });
    } catch {
      setError("Something went wrong. Please email us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const program = PROGRAM_PAYMENTS[done.programId];
    const payNow = program?.payOnBooking;

    return (
      <div className="rounded-3xl border border-border/70 bg-card p-10 text-center md:p-12">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h3 className="mt-4 font-display text-2xl font-bold md:text-3xl">
          Booking submitted
        </h3>

        {payNow ? (
          <>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              One more step — your <strong>{program.label.split(" — ")[0]}</strong>{" "}
              session is locked in once payment is received. Click below to pay
              securely via Stripe.
            </p>
            <a
              href={program.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02]"
            >
              <CreditCard className="size-5" />
              Pay now — {program.label.split(" — ")[1]}
              <ArrowRight className="size-4" />
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              You&apos;ll receive a confirmation email once payment is complete.
            </p>
          </>
        ) : (
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Thanks. Caitlyn will confirm your session details within one
            business day, then send a secure payment link to lock it in.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border/70 bg-card p-8 md:p-10"
    >
      <SectionHeading title="Program" />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Online sessions (Video Game Analysis, Online Mentoring) require payment
        at booking. All other sessions are paid once Caitlyn confirms your time
        and location.
      </p>
      <div className="mt-5">
        <SelectField
          label="Which program are you booking?"
          name="program"
          required
          options={PROGRAM_ORDER.map((id) => ({
            value: id,
            label: PROGRAM_PAYMENTS[id].label,
          }))}
        />
      </div>

      <SectionHeading title="Parent / guardian details" className="mt-10" />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Parent name" name="parentName" required />
        <Field label="Parent email" name="parentEmail" type="email" required />
      </div>
      <div className="mt-5">
        <Field label="Parent phone (optional)" name="parentPhone" type="tel" />
      </div>

      <SectionHeading title="Athlete details" className="mt-10" />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Athlete name" name="athleteName" required />
        <Field label="Athlete age" name="athleteAge" type="number" required />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Current club / association" name="club" />
        <Field label="Playing positions" name="positions" placeholder="e.g. GS, GA" />
      </div>

      <SectionHeading title="Health" className="mt-10" />
      <TextAreaField
        label="Medical history / injury history"
        name="medical"
        placeholder="Anything Caitlyn should know — past injuries, conditions, recent surgeries, etc."
      />
      <TextAreaField
        label="Allergies"
        name="allergies"
        placeholder="Food, medication, environmental — or write 'None'."
        rows={3}
      />

      <SectionHeading title="Emergency contact" className="mt-10" />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Emergency contact name" name="emergencyName" required />
        <Field
          label="Emergency contact phone"
          name="emergencyPhone"
          type="tel"
          required
        />
      </div>

      <SectionHeading title="Photography &amp; media" className="mt-10" />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Please notify us of your preference on this form. If you change your
        mind at a later time, notification must be provided to CC Netball in
        writing.
      </p>
      <div className="mt-5">
        <CheckboxField name="photoConsent">
          I consent to CC Netball taking photos / videos of my child for
          teaching materials, promotions and marketing materials, and other
          publications on the CC Netball website and social media.
        </CheckboxField>
      </div>

      <SectionHeading title="Terms &amp; conditions" className="mt-10" />
      <div className="mt-5">
        <CheckboxField name="termsAccepted" required>
          I have read and agree to CC Netball&apos;s{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            Terms and Conditions
          </Link>
          .
        </CheckboxField>
      </div>

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
        {submitting ? "Submitting…" : "Submit booking"}
        <Send className="size-4" />
      </button>
    </form>
  );
}

function SectionHeading({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
      <div className="mt-2 h-px w-12 bg-primary" />
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
  options: { value: string; label: string }[];
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
          Choose a program
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  required = false,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-semibold text-foreground/90">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function CheckboxField({
  name,
  required = false,
  children,
}: {
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background p-4 transition hover:border-primary/50">
      <input
        type="checkbox"
        name={name}
        required={required}
        className="mt-1 size-5 shrink-0 cursor-pointer rounded border-border accent-[var(--brand-raspberry,#c2185b)]"
      />
      <span className="text-sm leading-relaxed text-foreground/90">
        {children}
        {required && <span className="ml-1 text-primary">*</span>}
      </span>
    </label>
  );
}
