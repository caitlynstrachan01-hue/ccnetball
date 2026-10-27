"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatPriceCents } from "@/lib/shop-physical";
import {
  POSITIONS,
  POSITION_NAMES,
  computeFee,
  type Position,
} from "@/lib/trial-fees";
import type { TrialPublic } from "@/lib/trial-types";

type FieldErrors = Partial<Record<string, string>>;

export function RegistrationForm({ trial }: { trial: TrialPublic }) {
  const [divisionId, setDivisionId] = useState(trial.divisions[0]?.id ?? "");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState("");
  const [medical, setMedical] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const division = useMemo(
    () => trial.divisions.find((d) => d.id === divisionId) ?? trial.divisions[0],
    [trial.divisions, divisionId],
  );

  const fee = useMemo(
    () =>
      division
        ? computeFee({
            feeCents: division.feeCents,
            additionalFees: division.additionalFees,
            associationPaysFees: division.associationPaysFees,
          })
        : null,
    [division],
  );

  function togglePosition(p: Position) {
    setPositions((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= 2) return prev;
      return [...prev, p];
    });
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!divisionId) next.division = "Please choose an age group.";
    if (!first.trim()) next.first = "First name is needed.";
    if (!last.trim()) next.last = "Surname is needed.";
    if (!dob) next.dob = "Date of birth is needed.";
    if (positions.length !== 2)
      next.positions = "Please pick exactly two preferred positions.";
    if (!history.trim()) next.history = "Please add some playing history.";
    if (!/^\S+@\S+\.\S+$/.test(parentEmail))
      next.parentEmail = "Enter a valid parent/guardian email.";
    if (!emergencyName.trim())
      next.emergencyName = "An emergency contact name is required.";
    if (!emergencyPhone.trim() || emergencyPhone.replace(/\D/g, "").length < 8)
      next.emergencyPhone = "Enter an emergency contact number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/trials/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: trial.slug,
          divisionId,
          first,
          last,
          dob,
          positions,
          history,
          medical,
          parentName,
          parentEmail,
          emergencyName,
          emergencyPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Registration could not be started.");
      }
      window.location.href = data.url;
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  }

  const payable = fee ? fee.total > 0 : true;

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        {/* Age group */}
        <fieldset className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Age group
          </legend>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Which age group are you trialling for?
              <span className="ml-0.5 text-primary">*</span>
            </span>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {trial.divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.division && (
              <p className="mt-1 text-xs text-destructive">{errors.division}</p>
            )}
          </label>
          {division && division.sessions.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Sessions:{" "}
              {division.sessions
                .map((s) =>
                  [s.session_date, s.start_time && `${s.start_time}`, s.venue]
                    .filter(Boolean)
                    .join(" · "),
                )
                .join("  /  ")}
            </p>
          )}
        </fieldset>

        {/* Player */}
        <fieldset className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Player details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" value={first} onChange={setFirst} error={errors.first} required />
            <TextField label="Surname" value={last} onChange={setLast} error={errors.last} required />
          </div>
          <TextField label="Date of birth" type="date" value={dob} onChange={setDob} error={errors.dob} required />

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Preferred playing positions — pick exactly two
              <span className="ml-0.5 text-primary">*</span>
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {POSITIONS.map((p) => {
                const selected = positions.includes(p);
                const disabled = !selected && positions.length >= 2;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => togglePosition(p)}
                    disabled={disabled}
                    className={`rounded-xl border px-2 py-2.5 text-center transition ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : disabled
                          ? "cursor-not-allowed border-border/60 opacity-40"
                          : "border-border/70 hover:border-primary/40"
                    }`}
                  >
                    <span className="block text-sm font-bold">{p}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {POSITION_NAMES[p]}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.positions && (
              <p className="mt-1 text-xs text-destructive">{errors.positions}</p>
            )}
          </div>

          <TextField
            label="Playing history"
            value={history}
            onChange={setHistory}
            error={errors.history}
            required
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Medical conditions / injury history
            </span>
            <textarea
              value={medical}
              onChange={(e) => setMedical(e.target.value)}
              placeholder="Asthma, allergies, current or past injuries, medications… (write 'None' if not applicable)"
              className="mt-1 min-h-20 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </fieldset>

        {/* Guardian + emergency */}
        <fieldset className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Guardian &amp; emergency contact
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Parent / guardian name" value={parentName} onChange={setParentName} />
            <TextField label="Parent / guardian email" type="email" value={parentEmail} onChange={setParentEmail} error={errors.parentEmail} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Emergency contact name" value={emergencyName} onChange={setEmergencyName} error={errors.emergencyName} required />
            <TextField label="Emergency contact number" type="tel" value={emergencyPhone} onChange={setEmergencyPhone} error={errors.emergencyPhone} required />
          </div>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-5">
        <div className="sticky top-24 rounded-3xl border border-border/70 bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Registration
          </p>
          <p className="mt-1 font-display text-lg font-bold">{division?.name}</p>

          {fee && (
            <div className="mt-4 space-y-2 text-sm">
              {fee.associationPays ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>CC Netball fee</span>
                  <span>covered by club</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CC Netball fee</span>
                  <span className="font-semibold">
                    {formatPriceCents(fee.platformToParticipant)}
                  </span>
                </div>
              )}
              {fee.addons.map((a) => (
                <div key={a.label} className="flex justify-between">
                  <span className="text-muted-foreground">{a.label}</span>
                  <span className="font-semibold">
                    {formatPriceCents(a.amount_cents)}
                  </span>
                </div>
              ))}
              {fee.surcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card surcharge</span>
                  <span className="font-semibold">
                    {formatPriceCents(fee.surcharge)}
                  </span>
                </div>
              )}
              <div className="flex items-end justify-between border-t border-border/70 pt-3">
                <span className="font-display text-base font-bold">
                  {payable ? "You pay" : "Total"}
                </span>
                <span className="font-display text-xl font-extrabold text-primary">
                  {formatPriceCents(fee.total)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting
              ? "Starting…"
              : payable
                ? "Pay & register"
                : "Register"}
          </button>
          {serverError && (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {payable
              ? "You'll be redirected to Stripe to pay securely."
              : "No payment required — your club covers this registration."}
          </p>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Your details are used only for this trial and deleted after it
            finishes.
          </p>
        </div>
      </aside>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
