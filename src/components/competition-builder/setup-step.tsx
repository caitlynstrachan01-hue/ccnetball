"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import type {
  Competition,
  CompetitionCourt,
  CompetitionTimeslot,
  FillMode,
} from "@/lib/competition-builder";
import { FILL_MODE_LABELS } from "@/lib/competition-builder";

export function SetupStep({
  competition,
  courts,
  timeslots,
  fixtureExists,
}: {
  competition: Competition;
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  fixtureExists: boolean;
}) {
  function confirmChange(what: string): boolean {
    if (!fixtureExists) return true;
    return window.confirm(
      `${what}\n\nYou've already generated a draw. This change will make it out of date — you'll need to click Regenerate draw in Step 5 to rebuild. Continue?`,
    );
  }
  const router = useRouter();

  const [name, setName] = useState(competition.name);
  const [startDate, setStartDate] = useState(competition.startDate);
  const [rounds, setRounds] = useState(competition.roundsHomeAndAway);
  const [hasFinals, setHasFinals] = useState(competition.hasFinals);
  const [fillMode, setFillMode] = useState<FillMode>(competition.fillMode);

  const [savingSetup, setSavingSetup] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const [newCourt, setNewCourt] = useState("");
  const [newTimeslot, setNewTimeslot] = useState("");
  const [newTimeslotMinutes, setNewTimeslotMinutes] = useState("");

  async function saveSetup(e: React.FormEvent) {
    e.preventDefault();
    setSetupError(null);
    setSavingSetup(true);
    try {
      const res = await fetch(
        `/api/competition-builder/${competition.id}/setup`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            startDate,
            roundsHomeAndAway: rounds,
            hasFinals,
            fillMode,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setSavedAt(new Date().toLocaleTimeString("en-AU"));
      router.refresh();
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingSetup(false);
    }
  }

  async function addCourt(e: React.FormEvent) {
    e.preventDefault();
    const name = newCourt.trim();
    if (!name) return;
    if (!confirmChange(`Add "${name}" as a new court?`)) return;
    const res = await fetch(
      `/api/competition-builder/${competition.id}/courts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      },
    );
    if (res.ok) {
      setNewCourt("");
      router.refresh();
    }
  }

  async function removeCourt(courtId: string) {
    const name = courts.find((c) => c.id === courtId)?.name ?? "this court";
    if (!confirmChange(`Remove "${name}"?`)) return;
    await fetch(
      `/api/competition-builder/${competition.id}/courts?courtId=${encodeURIComponent(courtId)}`,
      { method: "DELETE" },
    );
    router.refresh();
  }

  async function addTimeslot(e: React.FormEvent) {
    e.preventDefault();
    const label = newTimeslot.trim();
    if (!label) return;
    if (!confirmChange(`Add "${label}" as a new timeslot?`)) return;
    const startsAtMinutes = newTimeslotMinutes
      ? parseTimeToMinutes(newTimeslotMinutes)
      : null;
    const res = await fetch(
      `/api/competition-builder/${competition.id}/timeslots`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, startsAtMinutes }),
      },
    );
    if (res.ok) {
      setNewTimeslot("");
      setNewTimeslotMinutes("");
      router.refresh();
    }
  }

  async function removeTimeslot(timeslotId: string) {
    const label =
      timeslots.find((t) => t.id === timeslotId)?.label ?? "this timeslot";
    if (!confirmChange(`Remove "${label}"?`)) return;
    await fetch(
      `/api/competition-builder/${competition.id}/timeslots?timeslotId=${encodeURIComponent(timeslotId)}`,
      { method: "DELETE" },
    );
    router.refresh();
  }

  const matchCellsPerRound = courts.length * timeslots.length;

  return (
    <div className="space-y-10">
      {/* Core setup */}
      <form onSubmit={saveSetup} className="space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold">Competition basics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Give this competition a name, a start date, and tell the engine how
            you want it filled.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>
          <Field label="Start date" required>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>
          <Field
            label="Home-and-away rounds"
            help="Leave at 0 if you'll decide after setting divisions."
          >
            <input
              type="number"
              min={0}
              max={40}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>
          <Field label="Finals series?">
            <label className="mt-1 inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={hasFinals}
                onChange={(e) => setHasFinals(e.target.checked)}
                className="size-4"
              />
              Yes — add a finals series after the home-and-away rounds
            </label>
          </Field>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Fill mode
          </p>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {(Object.keys(FILL_MODE_LABELS) as FillMode[]).map((mode) => {
              const info = FILL_MODE_LABELS[mode];
              return (
                <label
                  key={mode}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    fillMode === mode
                      ? "border-primary bg-primary/5"
                      : "border-border/70 hover:border-primary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="fillMode"
                    checked={fillMode === mode}
                    onChange={() => setFillMode(mode)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-display text-sm font-bold">
                      {info.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {info.detail}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={savingSetup}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
          >
            {savingSetup ? <Loader2 className="size-4 animate-spin" /> : null}
            {savingSetup ? "Saving…" : "Save basics"}
          </button>
          {savedAt && !savingSetup && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-primary" /> Saved at{" "}
              {savedAt}
            </span>
          )}
        </div>
        {setupError && (
          <p className="text-xs text-destructive">{setupError}</p>
        )}
      </form>

      {/* Courts */}
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Courts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every court you can play on. Example names: Court 1, Court 2…
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {courts.length} courts
          </span>
        </div>

        <ul className="mt-4 space-y-2">
          {courts.map((court) => (
            <li
              key={court.id}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="size-4 text-primary" />
                {court.name}
              </span>
              <button
                type="button"
                onClick={() => removeCourt(court.id)}
                aria-label={`Remove ${court.name}`}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addCourt} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newCourt}
            onChange={(e) => setNewCourt(e.target.value)}
            placeholder="e.g. Court 1"
            className="flex-1 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-background px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <Plus className="size-4" /> Add court
          </button>
        </form>
      </section>

      {/* Timeslots */}
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Timeslots</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The repeating slots on game day. Add a label (e.g. &quot;8:30
              AM&quot;) and optionally a time.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {timeslots.length} timeslots
          </span>
        </div>

        <ul className="mt-4 space-y-2">
          {timeslots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-2.5"
            >
              <span className="text-sm font-semibold">
                {slot.label}
                {slot.startsAtMinutes !== null && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({minutesToTime(slot.startsAtMinutes)})
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => removeTimeslot(slot.id)}
                aria-label={`Remove ${slot.label}`}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addTimeslot} className="mt-3 grid gap-2 md:grid-cols-[1fr_120px_auto]">
          <input
            type="text"
            value={newTimeslot}
            onChange={(e) => setNewTimeslot(e.target.value)}
            placeholder="e.g. Round 1 — 8:30"
            className="rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="time"
            value={newTimeslotMinutes}
            onChange={(e) => setNewTimeslotMinutes(e.target.value)}
            className="rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary bg-background px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <Plus className="size-4" /> Add timeslot
          </button>
        </form>
      </section>

      {/* Round math preview */}
      <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Round arithmetic
        </p>
        <p className="mt-2 text-sm">
          <strong>{courts.length}</strong> courts × <strong>{timeslots.length}</strong> timeslots ={" "}
          <strong className="text-primary">{matchCellsPerRound}</strong> match
          cells per round.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Each match cell fits one game. When you add teams in the next step,
          the engine checks whether your team counts divide cleanly into these
          cells and flags any division that will carry a bye each round.
        </p>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  help,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {help && (
        <p className="mt-1 text-[11px] text-muted-foreground">{help}</p>
      )}
    </label>
  );
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
  return 0;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
