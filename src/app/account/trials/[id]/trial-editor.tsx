"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

export type EditorTrial = {
  id: string;
  slug: string;
  name: string;
  club: string;
  club_email: string;
  display_mode: "number" | "initial_surname" | "first_initial";
  status: string;
  registration_open: boolean;
  divisions: {
    key: string;
    id?: string;
    name: string;
    additionalFees: { label: string; amount_cents: number }[];
    associationPaysFees: boolean;
  }[];
  sessions: {
    divisionKey: string;
    session_date: string;
    start_time: string;
    end_time: string;
    venue: string;
  }[];
};

type Fee = { label: string; amount: string }; // amount in dollars (string)
type Division = {
  key: string;
  id?: string;
  name: string;
  fees: Fee[];
  associationPaysFees: boolean;
};
type Session = {
  key: string;
  divisionKey: string;
  session_date: string;
  start_time: string;
  end_time: string;
  venue: string;
};

const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function TrialEditor({ initial }: { initial: EditorTrial }) {
  const [name, setName] = useState(initial.name);
  const [club, setClub] = useState(initial.club);
  const [email, setEmail] = useState(initial.club_email);
  const [displayMode, setDisplayMode] = useState(initial.display_mode);
  const [open, setOpen] = useState(
    initial.registration_open && initial.status === "open",
  );

  const [divisions, setDivisions] = useState<Division[]>(
    initial.divisions.map((d) => ({
      key: d.key,
      id: d.id,
      name: d.name,
      associationPaysFees: d.associationPaysFees,
      fees: d.additionalFees.map((f) => ({
        label: f.label,
        amount: (f.amount_cents / 100).toFixed(2),
      })),
    })),
  );
  const [sessions, setSessions] = useState<Session[]>(
    initial.sessions.map((s) => ({ key: newKey(), ...s })),
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Build the absolute link only after mount, so server and first client
  // render agree (avoids a hydration mismatch on window.location).
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const link = `${origin}/trials/${initial.slug}`;

  // ---- division helpers ----
  function addDivision() {
    setDivisions((d) => [
      ...d,
      { key: newKey(), name: "", fees: [], associationPaysFees: false },
    ]);
  }
  function removeDivision(key: string) {
    setDivisions((d) => d.filter((x) => x.key !== key));
    setSessions((s) => s.filter((x) => x.divisionKey !== key));
  }
  function patchDivision(key: string, patch: Partial<Division>) {
    setDivisions((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }
  function addFee(key: string) {
    setDivisions((d) =>
      d.map((x) =>
        x.key === key
          ? { ...x, fees: [...x.fees, { label: "", amount: "" }] }
          : x,
      ),
    );
  }
  function patchFee(key: string, i: number, patch: Partial<Fee>) {
    setDivisions((d) =>
      d.map((x) =>
        x.key === key
          ? {
              ...x,
              fees: x.fees.map((f, j) => (j === i ? { ...f, ...patch } : f)),
            }
          : x,
      ),
    );
  }
  function removeFee(key: string, i: number) {
    setDivisions((d) =>
      d.map((x) =>
        x.key === key ? { ...x, fees: x.fees.filter((_, j) => j !== i) } : x,
      ),
    );
  }

  // ---- session helpers ----
  function addSession() {
    setSessions((s) => [
      ...s,
      {
        key: newKey(),
        divisionKey: divisions[0]?.key ?? "",
        session_date: "",
        start_time: "",
        end_time: "",
        venue: "",
      },
    ]);
  }
  function patchSession(key: string, patch: Partial<Session>) {
    setSessions((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }
  function removeSession(key: string) {
    setSessions((s) => s.filter((x) => x.key !== key));
  }

  async function save() {
    setError(null);
    setSaved(false);
    if (!name.trim() || !club.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please complete the trial name, club and a valid email.");
      return;
    }
    if (open && divisions.length === 0) {
      setError("Add at least one age group before opening registration.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/trials/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          trial: {
            id: initial.id,
            name,
            club,
            club_email: email,
            display_mode: displayMode,
            status: open ? "open" : "draft",
            registration_open: open,
          },
          divisions: divisions.map((d) => ({
            key: d.key,
            id: d.id,
            name: d.name,
            associationPaysFees: d.associationPaysFees,
            additionalFees: d.fees.map((f) => ({
              label: f.label,
              amount_cents: Math.round((parseFloat(f.amount) || 0) * 100),
            })),
          })),
          sessions: sessions.map((s) => ({
            divisionKey: s.divisionKey,
            session_date: s.session_date,
            start_time: s.start_time,
            end_time: s.end_time,
            venue: s.venue,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Save failed.");
      setSaved(true);
      // Reload so new division ids come back for subsequent edits.
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/account/trials"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Your trials
        </Link>
        <Link
          href={`/account/trials/${initial.id}/run`}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
        >
          Run the trial →
        </Link>
      </div>

      {/* Trial details */}
      <section className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
        <h2 className="font-display text-lg font-bold">Trial details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Trial name" value={name} onChange={setName} />
          <Text label="Club / association" value={club} onChange={setClub} />
        </div>
        <Text label="Contact email" type="email" value={email} onChange={setEmail} />
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            How should players appear on trial documents?
          </span>
          <select
            value={displayMode}
            onChange={(e) =>
              setDisplayMode(
                e.target.value as "number" | "initial_surname" | "first_initial",
              )
            }
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="number">By player number — e.g. #24 (most private)</option>
            <option value="initial_surname">First initial + surname — e.g. S.Smith</option>
            <option value="first_initial">First name + surname initial — e.g. Sally.S</option>
          </select>
        </label>
      </section>

      {/* Divisions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Age groups &amp; fees</h2>
          <button
            type="button"
            onClick={addDivision}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40"
          >
            <Plus className="size-4" /> Add age group
          </button>
        </div>
        {divisions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            No age groups yet — add one (e.g. Under 14) to start.
          </p>
        )}
        {divisions.map((d) => (
          <div key={d.key} className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Text
                  label="Age group / division"
                  value={d.name}
                  onChange={(v) => patchDivision(d.key, { name: v })}
                  placeholder="e.g. Under 14"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDivision(d.key)}
                className="mb-1 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                title="Remove age group"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="rounded-xl bg-background p-3 text-xs text-muted-foreground">
              CC Netball fee: <span className="font-semibold text-foreground">$2.20</span> per player.
            </div>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={d.associationPaysFees}
                onChange={(e) =>
                  patchDivision(d.key, { associationPaysFees: e.target.checked })
                }
                className="mt-0.5 size-4"
              />
              <span>
                Our club/association <b>covers the $2.20</b> for this division
                (players aren&apos;t charged it — we&apos;re invoiced at the end).
              </span>
            </label>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Extra fees passed on to each player (optional)
                </span>
                <button
                  type="button"
                  onClick={() => addFee(d.key)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  <Plus className="size-3.5" /> Add fee
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {d.fees.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={f.label}
                      onChange={(e) => patchFee(d.key, i, { label: e.target.value })}
                      placeholder="e.g. Umpires"
                      className="flex-1 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">$</span>
                      <input
                        value={f.amount}
                        onChange={(e) => patchFee(d.key, i, { amount: e.target.value })}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="w-20 rounded-lg border border-border/70 bg-background px-2 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFee(d.key, i)}
                      className="rounded-lg p-2 text-muted-foreground transition hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Sessions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Sessions</h2>
          <button
            type="button"
            onClick={addSession}
            disabled={divisions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 disabled:opacity-50"
          >
            <Plus className="size-4" /> Add session
          </button>
        </div>
        {sessions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            Add the trial dates — each session is one night for one age group.
          </p>
        )}
        {sessions.map((s) => (
          <div key={s.key} className="grid items-end gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Age group</span>
              <select
                value={s.divisionKey}
                onChange={(e) => patchSession(s.key, { divisionKey: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border/70 bg-background px-2 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {divisions.map((d) => (
                  <option key={d.key} value={d.key}>{d.name || "(unnamed)"}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Date</span>
              <input
                type="date"
                value={s.session_date}
                onChange={(e) => patchSession(s.key, { session_date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border/70 bg-background px-2 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Time</span>
              <input
                value={s.start_time}
                onChange={(e) => patchSession(s.key, { start_time: e.target.value })}
                placeholder="5:30 pm"
                className="mt-1 w-full rounded-lg border border-border/70 bg-background px-2 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Venue</span>
              <input
                value={s.venue}
                onChange={(e) => patchSession(s.key, { venue: e.target.value })}
                placeholder="Court / stadium"
                className="mt-1 w-full rounded-lg border border-border/70 bg-background px-2 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => removeSession(s.key)}
              className="mb-1 rounded-lg p-2 text-muted-foreground transition hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </section>

      {/* Registration link + open toggle */}
      <section className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
        <h2 className="font-display text-lg font-bold">Registration</h2>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={open}
            onChange={(e) => setOpen(e.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <b>Open for registration.</b> Turn this on when you&apos;re ready for
            players to sign up. Off keeps it as a draft.
          </span>
        </label>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Player registration link
          </span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2">
            <code className="flex-1 truncate text-sm text-primary">{link}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-border/70 px-2.5 py-1.5 text-xs font-semibold transition hover:border-primary/40"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Players can register here once the trial is open and saved.
          </p>
        </div>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-lg backdrop-blur">
        {error && <p className="mr-auto text-xs text-destructive">{error}</p>}
        {saved && !error && (
          <p className="mr-auto inline-flex items-center gap-1 text-xs text-primary">
            <Check className="size-4" /> Saved
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving…" : "Save trial"}
        </button>
      </div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
