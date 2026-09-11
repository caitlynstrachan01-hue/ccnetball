"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Check,
  ClipboardList,
  Copy,
  Download,
  MapPin,
  Printer,
  Send,
  Share2,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  SAMPLE_GAMES,
  SAMPLE_PLAYERS,
  SAMPLE_TRIAL,
  type SamplePlayer,
  type Position,
} from "@/lib/trial-app-content";

type StepKey =
  | "create"
  | "registrations"
  | "attendance"
  | "teams"
  | "team-building"
  | "export";

const STEPS: { key: StepKey; label: string; icon: typeof Users }[] = [
  { key: "create",          label: "1. Create trial",   icon: Sparkles },
  { key: "registrations",   label: "2. Registrations",  icon: Send },
  { key: "attendance",      label: "3. Attendance",     icon: UserCheck },
  { key: "teams",           label: "4. Team allocation", icon: Users },
  { key: "team-building",   label: "5. Team building",  icon: ClipboardList },
  { key: "export",          label: "6. Export",         icon: Download },
];

export function TrialAppPreview() {
  const [step, setStep] = useState<StepKey>("create");
  const [players, setPlayers] = useState<SamplePlayer[]>(SAMPLE_PLAYERS);
  const [copied, setCopied] = useState(false);

  const attendedCount = players.filter((p) => p.attended).length;
  const totalFee =
    SAMPLE_TRIAL.feePerParticipant +
    SAMPLE_TRIAL.additionalFees.reduce((s, f) => s + f.amount, 0);

  function toggleAttendance(index: number) {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, attended: !p.attended } : p,
      ),
    );
  }

  function handleCopyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(`https://${SAMPLE_TRIAL.shareUrl}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  function handleExportCsv() {
    const header = ["Name", "Age", "Club", "Preferred positions", "Attended"];
    const rows = players.map((p) => [
      p.name,
      String(p.age),
      p.club,
      p.positions.join(";"),
      p.attended ? "Yes" : "No",
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    if (typeof window !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${SAMPLE_TRIAL.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  function goToStep(next: StepKey) {
    setStep(next);
  }

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 md:p-6">
      {/* EXPORT / PRINT BAR */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Every screen exports and prints for your association.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
          >
            <Printer className="size-3.5" /> Print
          </button>
        </div>
      </div>

      {/* STEPPER */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 p-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = s.key === step;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(s.key)}
                className={
                  active
                    ? "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                    : "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                }
              >
                <Icon className="size-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-6">
        {step === "create" && (
          <CreateTrialStep totalFee={totalFee} />
        )}
        {step === "registrations" && (
          <RegistrationsStep
            players={players}
            onCopyLink={handleCopyLink}
            copied={copied}
          />
        )}
        {step === "attendance" && (
          <AttendanceStep
            players={players}
            attendedCount={attendedCount}
            onToggle={toggleAttendance}
            onPopulate={() => goToStep("teams")}
          />
        )}
        {step === "teams" && <TeamsStep />}
        {step === "team-building" && <TeamBuildingStep players={players} />}
        {step === "export" && (
          <ExportStep
            players={players}
            attendedCount={attendedCount}
            totalFee={totalFee}
          />
        )}
      </div>

      {/* NAV */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={() =>
            setStep(STEPS[Math.max(0, currentIndex - 1)].key)
          }
          disabled={currentIndex === 0}
          className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Back
        </button>
        <p className="text-xs text-muted-foreground">
          Step {currentIndex + 1} of {STEPS.length}
        </p>
        <button
          type="button"
          onClick={() =>
            setStep(STEPS[Math.min(STEPS.length - 1, currentIndex + 1)].key)
          }
          disabled={currentIndex === STEPS.length - 1}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* DATA RETENTION FOOTER */}
      <p className="mt-4 rounded-xl bg-muted/40 px-4 py-3 text-[11px] italic text-muted-foreground">
        Participant data is stored securely for the trial and is permanently
        deleted 1 month after the last trial day. Exports and prints are yours
        to keep.
      </p>
    </div>
  );
}

// ==========================================================================
// STEP 1 — Create trial
// ==========================================================================
function CreateTrialStep({ totalFee }: { totalFee: number }) {
  return (
    <div>
      <StepHeading
        eyebrow="Step 1"
        title="Set up the trial"
        blurb="Fill in the details once — the app handles registration, attendance, teams, and export from here."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Basics */}
          <div className="grid gap-4 rounded-2xl border border-border/70 bg-background p-6 sm:grid-cols-2">
            <Field label="Trial name" value={SAMPLE_TRIAL.name} />
            <Field label="Club / Association" value={SAMPLE_TRIAL.club} />
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Age groups
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SAMPLE_TRIAL.ageGroups.map((ag) => (
                  <span
                    key={ag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {ag}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] italic text-muted-foreground">
                Clubs can add more age groups any time.
              </p>
            </div>
            <Field
              label="Teams to select (per age group)"
              value={
                SAMPLE_TRIAL.teamsToSelect === "all"
                  ? "Include all players"
                  : `${SAMPLE_TRIAL.teamsToSelect} teams`
              }
            />
            <Field label="Player capacity" value="Unlimited" />
          </div>

          {/* Schedule */}
          <div className="mt-5 rounded-2xl border border-border/70 bg-background p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Schedule
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add as many sessions as you like per age group — each
                  session runs on its own night.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {SAMPLE_TRIAL.schedule.length} sessions
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {SAMPLE_TRIAL.schedule.map((s, i) => (
                <li
                  key={`${s.date}-${s.ageGroup}-${i}`}
                  className="grid gap-2 rounded-xl bg-muted/40 px-4 py-3 text-sm sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-4"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{s.date}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.timeSlot}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/80">
                      <MapPin className="size-3.5 text-primary" />
                      {s.venue}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:justify-self-end">
                    {s.ageGroup}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              Each session sets its own venue — different nights can run at
              different courts.
            </p>
          </div>

          {/* Fees */}
          <div className="mt-5 rounded-2xl border border-border/70 bg-background p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Fees
            </p>

            <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    ${SAMPLE_TRIAL.feePerParticipant.toFixed(2)}{" "}
                    <span className="font-normal text-muted-foreground">
                      per participant
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    CC Netball — platform fee
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Base
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Additional charges
              </p>
              <ul className="mt-3 space-y-2">
                {SAMPLE_TRIAL.additionalFees.map((f) => (
                  <li
                    key={f.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      ${f.amount.toFixed(0)}
                    </span>
                    <span className="flex-1 pl-3 font-medium text-foreground/90">
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] italic text-muted-foreground">
                Add any amount to pass a charge through to participants.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background p-4 transition hover:border-primary/40 hover:bg-muted/40">
              <input
                type="checkbox"
                defaultChecked={SAMPLE_TRIAL.associationPaysFees}
                className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-border accent-[var(--brand-raspberry,#c2185b)]"
              />
              <span className="text-sm text-foreground/90">
                <span className="block font-semibold">
                  Tick this box if your Club/Association will cover the cost
                  of the participant registration.
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {SAMPLE_TRIAL.associationPaysFees
                    ? "One invoice generated after trials for total participants × CC Netball fee."
                    : "Each participant pays the CC Netball fee on registration."}
                </span>
              </span>
            </label>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl bg-[#0b3d91] p-6 text-white shadow-lg shadow-[#0b3d91]/25">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-90">
              Total per participant
            </p>
            <p className="mt-2 font-display text-5xl font-extrabold">
              ${totalFee.toFixed(2)}
            </p>
            <p className="mt-4 text-sm opacity-90">
              {SAMPLE_TRIAL.associationPaysFees
                ? "The association is invoiced after trials — participants pay nothing on registration."
                : "Paid by each participant on registration."}
            </p>

            <div className="mt-6 space-y-2 border-t border-white/20 pt-5 text-sm">
              <MiniLine
                label="CC Netball platform fee"
                value={`$${SAMPLE_TRIAL.feePerParticipant.toFixed(2)}`}
              />
              {SAMPLE_TRIAL.additionalFees.map((f) => (
                <MiniLine
                  key={f.label}
                  label={f.label}
                  value={`+$${f.amount.toFixed(2)}`}
                />
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

// ==========================================================================
// STEP 2 — Registrations
// ==========================================================================
function RegistrationsStep({
  players,
  onCopyLink,
  copied,
}: {
  players: SamplePlayer[];
  onCopyLink: () => void;
  copied: boolean;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Step 2"
        title="Send the link, watch registrations roll in"
        blurb="Share this link with your clubs and rep pathway list. Players register themselves — no spreadsheet chasing."
      />

      <div className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Public registration link
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
            {SAMPLE_TRIAL.shareUrl}
          </code>
          <button
            type="button"
            onClick={onCopyLink}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:scale-[1.03]"
          >
            {copied ? (
              <>
                <Check className="size-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy link
              </>
            )}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
          >
            <Share2 className="size-3.5" /> Send to clubs
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Registered" value={players.length.toString()} />
        <MetricCard
          label="Age groups"
          value={SAMPLE_TRIAL.ageGroups.length.toString()}
        />
        <MetricCard
          label={
            SAMPLE_TRIAL.associationPaysFees
              ? "Invoiceable so far"
              : "Fees collected"
          }
          value={`$${(players.length * (SAMPLE_TRIAL.feePerParticipant + SAMPLE_TRIAL.additionalFees.reduce((s, f) => s + f.amount, 0))).toFixed(2)}`}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border/70 bg-background">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
          <p className="text-sm font-bold">Registered players</p>
          <p className="text-xs text-muted-foreground">
            {players.length} registrations
          </p>
        </div>
        <ul className="divide-y divide-border/60">
          {players.slice(0, 8).map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {p.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Age {p.age} · {p.club}
                </p>
              </div>
              <PositionsChips positions={p.positions} />
            </li>
          ))}
        </ul>
        <div className="border-t border-border/60 px-5 py-3 text-center text-xs text-muted-foreground">
          + {players.length - 8} more registrations
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// STEP 3 — Attendance
// ==========================================================================
function AttendanceStep({
  players,
  attendedCount,
  onToggle,
  onPopulate,
}: {
  players: SamplePlayer[];
  attendedCount: number;
  onToggle: (index: number) => void;
  onPopulate: () => void;
}) {
  const days = SAMPLE_TRIAL.schedule;
  const [dayIndex, setDayIndex] = useState(
    Math.min(1, days.length - 1), // default to Under 15 day for the demo
  );
  const activeDay = days[dayIndex];
  const isDemoDay = activeDay.ageGroup === "Under 15";

  const [showPrompt, setShowPrompt] = useState(false);
  const [slotChoice, setSlotChoice] = useState<"custom" | "fair">("fair");
  const [customSlots, setCustomSlots] = useState<number>(4);

  return (
    <div>
      <StepHeading
        eyebrow="Step 3"
        title="Attendance registry — day by day"
        blurb="Open the registry on your phone at the courts. If the trial runs across several days, tick players in for each day separately."
      />

      {/* Day tabs */}
      {days.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {days.map((s, i) => {
            const active = i === dayIndex;
            return (
              <button
                key={`${s.date}-${s.ageGroup}`}
                type="button"
                onClick={() => setDayIndex(i)}
                className={
                  active
                    ? "inline-flex flex-col items-start gap-0.5 rounded-2xl bg-primary px-4 py-2 text-left text-xs font-semibold text-primary-foreground"
                    : "inline-flex flex-col items-start gap-0.5 rounded-2xl border border-border/70 bg-background px-4 py-2 text-left text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                }
              >
                <span className="text-[11px] uppercase tracking-[0.18em] opacity-90">
                  Day {i + 1} · {s.ageGroup}
                </span>
                <span
                  className={
                    active ? "text-[11px] opacity-90" : "text-[11px] text-muted-foreground"
                  }
                >
                  {s.date.replace(", 2027", "")}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {activeDay.ageGroup} · {activeDay.date}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Time slot: <strong>{activeDay.timeSlot}</strong> · Venue:{" "}
          <strong>{activeDay.venue}</strong>
        </p>
      </div>

      {isDemoDay ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Attending" value={attendedCount.toString()} />
            <MetricCard
              label="No-shows"
              value={(players.length - attendedCount).toString()}
            />
            <MetricCard
              label="Registered for this day"
              value={players.length.toString()}
            />
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {players.map((p, i) => (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => onToggle(i)}
                  className={
                    p.attended
                      ? "flex w-full items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-left transition"
                      : "flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 text-left transition hover:bg-muted"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        p.attended
                          ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          : "flex size-8 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground"
                      }
                    >
                      {p.attended ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Age {p.age} · {p.club}
                      </p>
                    </div>
                  </div>
                  <PositionsChips positions={p.positions} compact />
                </button>
              </li>
            ))}
          </ul>

          {!showPrompt ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Attendance for {activeDay.ageGroup} locked in.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hit Populate — the app allocates {activeDay.ageGroup}{" "}
                  games automatically and places players in their two
                  preferred positions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrompt(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.03]"
              >
                <Zap className="size-4" />
                Populate teams
              </button>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-foreground">
                    How many time slots are available tonight?
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This tells the algorithm how many games to build for{" "}
                    {activeDay.ageGroup} at {activeDay.venue}.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {/* Option 1 — custom */}
                <label
                  className={
                    slotChoice === "custom"
                      ? "flex cursor-pointer flex-col gap-3 rounded-xl border-2 border-primary bg-background p-4 transition"
                      : "flex cursor-pointer flex-col gap-3 rounded-xl border-2 border-border/60 bg-background p-4 transition hover:border-primary/40"
                  }
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="slotChoice"
                      value="custom"
                      checked={slotChoice === "custom"}
                      onChange={() => setSlotChoice("custom")}
                      className="mt-0.5 size-4 accent-[var(--brand-raspberry,#c2185b)]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Option 1 — Type a specific number
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        You know exactly how many time slots you have on the
                        courts tonight.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={customSlots}
                      onChange={(e) =>
                        setCustomSlots(Math.max(1, Number(e.target.value) || 1))
                      }
                      onFocus={() => setSlotChoice("custom")}
                      className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-xs text-muted-foreground">
                      time slots
                    </span>
                  </div>
                </label>

                {/* Option 2 — fair rotation */}
                <label
                  className={
                    slotChoice === "fair"
                      ? "flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-primary bg-background p-4 transition"
                      : "flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-border/60 bg-background p-4 transition hover:border-primary/40"
                  }
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="slotChoice"
                      value="fair"
                      checked={slotChoice === "fair"}
                      onChange={() => setSlotChoice("fair")}
                      className="mt-0.5 size-4 accent-[var(--brand-raspberry,#c2185b)]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Option 2 — Fair rotation
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Enough for every player to play both preferred
                        positions twice. The app works out the fairest number
                        for you.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onPopulate}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.03]"
                >
                  <Zap className="size-4" />
                  Populate now
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="rounded-full border border-border/70 bg-background px-5 py-2.5 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                >
                  Back
                </button>
                <p className="text-xs text-muted-foreground">
                  {slotChoice === "custom"
                    ? `Building ${customSlots} games for tonight.`
                    : "The app will calculate the fairest number for tonight."}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-background p-8 text-center">
          <p className="font-semibold text-foreground">
            No registrations yet for {activeDay.ageGroup}.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Registrations appear here as players sign up for this age group.
            Once the trial day starts, tick players in and hit Populate.
          </p>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// STEP 4 — Team allocation
// ==========================================================================
const BLANK_POSITIONS: Position[] = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];

function isOutOfPosition(
  playerName: string,
  assigned: Position,
): boolean {
  const player = SAMPLE_PLAYERS.find((p) => p.name === playerName);
  if (!player) return false;
  return !player.positions.includes(assigned);
}

function exportTeamsCsv(ageGroup: string) {
  const header = ["Age group", "Game", "Team", "Position", "Player"];
  const rows: string[][] = [];

  // Auto-populated games from the allocator.
  for (const game of SAMPLE_GAMES) {
    for (const team of game.teams) {
      for (const p of team.lineup) {
        rows.push([ageGroup, game.name, team.label, p.position, p.name]);
      }
    }
    for (const b of game.bench) {
      rows.push([ageGroup, game.name, "Bench", "-", b]);
    }
  }

  // Two blank forms for selectors — every slot empty for them to fill in.
  for (const label of ["Selector Game 1 · Blank", "Selector Game 2 · Blank"]) {
    for (const team of ["Team A", "Team B"]) {
      for (const pos of BLANK_POSITIONS) {
        rows.push([ageGroup, label, team, pos, ""]);
      }
    }
  }

  const csv = [header, ...rows]
    .map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  if (typeof window !== "undefined") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-allocation-${ageGroup.toLowerCase().replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

function TeamsStep() {
  const ageGroups = SAMPLE_TRIAL.ageGroups;
  const [ageGroupIndex, setAgeGroupIndex] = useState(
    Math.min(1, ageGroups.length - 1), // default to U15 in the demo
  );
  const currentAgeGroup = ageGroups[ageGroupIndex];
  const isDemoAgeGroup = currentAgeGroup === "Under 15";
  const sessionsInAgeGroup = SAMPLE_TRIAL.schedule.filter(
    (s) => s.ageGroup === currentAgeGroup,
  ).length;

  const outOfPositionCount = SAMPLE_GAMES.reduce(
    (sum, g) =>
      sum +
      g.teams.reduce(
        (t, team) =>
          t +
          team.lineup.filter((p) => isOutOfPosition(p.name, p.position))
            .length,
        0,
      ),
    0,
  );

  return (
    <div>
      <StepHeading
        eyebrow="Step 4"
        title="Team allocation — one view per age group"
        blurb="Switch between age groups with the tabs below. Each view shows the auto-populated games for that age group, plus two blank games at the end of every session for selectors to match specific players head-to-head."
      />

      {/* Age group switcher */}
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-2">
        {ageGroups.map((ag, i) => {
          const active = i === ageGroupIndex;
          return (
            <button
              key={ag}
              type="button"
              onClick={() => setAgeGroupIndex(i)}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                  : "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-background"
              }
            >
              {ag}
              <span
                className={
                  active
                    ? "rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold"
                    : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                }
              >
                {
                  SAMPLE_TRIAL.schedule.filter((s) => s.ageGroup === ag)
                    .length
                }{" "}
                session
                {SAMPLE_TRIAL.schedule.filter((s) => s.ageGroup === ag)
                  .length === 1
                  ? ""
                  : "s"}
              </span>
            </button>
          );
        })}
      </div>

      {isDemoAgeGroup ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Showing games for <strong>{currentAgeGroup}</strong> —{" "}
              {sessionsInAgeGroup} session{sessionsInAgeGroup === 1 ? "" : "s"}
              . Team allocations rotate between sessions.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportTeamsCsv(currentAgeGroup)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:scale-[1.03]"
              >
                <Download className="size-3.5" /> Export teams
              </button>
              <button
                type="button"
                onClick={() =>
                  typeof window !== "undefined" && window.print()
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
              >
                <Printer className="size-3.5" /> Print
              </button>
            </div>
          </div>
          <p className="mt-1 text-[11px] italic text-muted-foreground">
            Exports include both auto-populated games <em>and</em> two blank
            forms for selectors to fill in by hand.
          </p>

          {/* Rules cheatsheet */}
          <div className="mt-4 grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-xs sm:grid-cols-2">
            <div>
              <p className="font-bold text-foreground">Allowed cross-overs</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• GA covers WA when short</li>
                <li>• C or WA covers WD</li>
                <li>• GD covers WD</li>
                <li>• A player who picks WA + WD as their two preferred can play C</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-foreground">Never allowed</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• GK or GD in a shooting position (GS / GA) — too specific</li>
              </ul>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
                <AlertTriangle className="size-3.5" />
                {outOfPositionCount} out-of-position placement
                {outOfPositionCount === 1 ? "" : "s"} across the auto games —
                highlighted below.
              </p>
            </div>
          </div>

          {/* Court time note */}
          <div className="mt-4 rounded-2xl bg-primary/5 px-4 py-3 text-xs text-foreground/80">
            <strong className="text-primary">Court time is balanced.</strong>{" "}
            Because most squads have more midcourters than shooters or
            defenders, each midcourter usually plays fewer games while
            shooters and defenders run more. The algorithm rotates
            midcourters through games so nobody sits out for too long.
          </div>

          <div className="mt-6 space-y-6">
            {SAMPLE_GAMES.map((game) => (
              <GameCard
                key={game.name}
                game={game}
                currentAgeGroup={currentAgeGroup}
                otherAgeGroups={ageGroups.filter((a) => a !== currentAgeGroup)}
              />
            ))}

            {/* Two blank games for selectors */}
            <SelectorGameCard label="Selector Game 1 · Blank" />
            <SelectorGameCard label="Selector Game 2 · Blank" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03]"
            >
              Regenerate games
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-5 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
            >
              Swap two players
            </button>
            <p className="text-xs text-muted-foreground">
              Selectors have final say — swap manually any time.
            </p>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-background p-10 text-center">
          <p className="font-semibold text-foreground">
            Teams not yet populated for {currentAgeGroup}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Once attendance is captured for the {currentAgeGroup} trial, hit
            Populate on the Attendance step to generate games for this age
            group.
          </p>
        </div>
      )}
    </div>
  );
}

function GameCard({
  game,
  currentAgeGroup,
  otherAgeGroups,
}: {
  game: (typeof SAMPLE_GAMES)[number];
  currentAgeGroup: string;
  otherAgeGroups: string[];
}) {
  const [movePlayer, setMovePlayer] = useState<string | null>(null);
  const [movedNote, setMovedNote] = useState<string | null>(null);

  function handleMove(name: string, targetAgeGroup: string) {
    setMovedNote(`${name} moved from ${currentAgeGroup} to ${targetAgeGroup}.`);
    setMovePlayer(null);
    setTimeout(() => setMovedNote(null), 3000);
  }

  return (
    <article className="rounded-2xl border border-border/70 bg-background p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
        <p className="font-display text-lg font-bold">{game.name}</p>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {game.teams[0].lineup.length} vs {game.teams[1].lineup.length}
        </span>
      </div>

      {movedNote && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
          {movedNote}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {game.teams.map((team) => (
          <div key={team.label} className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {team.label}
            </p>
            <ul className="mt-3 space-y-1.5">
              {team.lineup.map((p) => {
                const oop = isOutOfPosition(p.name, p.position);
                const menuOpen = movePlayer === `${game.name}-${team.label}-${p.name}`;
                return (
                  <li
                    key={`${team.label}-${p.position}`}
                    className={
                      oop
                        ? "relative rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm"
                        : "relative rounded-lg bg-background px-3 py-2 text-sm"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          oop
                            ? "inline-flex min-w-9 justify-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white"
                            : "inline-flex min-w-9 justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
                        }
                      >
                        {p.position}
                      </span>
                      <span className="flex-1 font-medium text-foreground">
                        {p.name}
                      </span>
                      {oop && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          <AlertTriangle className="size-3" /> OOP
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setMovePlayer(
                            menuOpen
                              ? null
                              : `${game.name}-${team.label}-${p.name}`,
                          )
                        }
                        aria-label={`Move ${p.name} to another age group`}
                        className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-primary"
                      >
                        <ArrowUpDown className="size-3.5" />
                      </button>
                    </div>
                    {menuOpen && (
                      <div className="absolute right-3 top-full z-10 mt-1 w-56 rounded-xl border border-border/70 bg-card p-2 text-xs shadow-lg">
                        <p className="px-2 pb-2 font-semibold text-muted-foreground">
                          Move {p.name} to
                        </p>
                        {otherAgeGroups.map((ag) => (
                          <button
                            key={ag}
                            type="button"
                            onClick={() => handleMove(p.name, ag)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left font-semibold text-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <ArrowUpDown className="size-3" />
                            {ag}
                          </button>
                        ))}
                        {otherAgeGroups.length === 0 && (
                          <p className="px-2 py-1 text-muted-foreground">
                            No other age groups available.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setMovePlayer(null)}
                          className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-muted-foreground transition hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {game.bench.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Bench this game:
          </p>
          {game.bench.map((name) => (
            <span
              key={`${game.name}-bench-${name}`}
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/80"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function SelectorGameCard({ label }: { label: string }) {
  return (
    <article className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 border-b border-primary/20 pb-4">
        <div>
          <p className="font-display text-lg font-bold">{label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Selectors fill this one — pick specific match-ups.
          </p>
        </div>
        <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
          Selector control
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(["Team A", "Team B"] as const).map((label) => (
          <div key={label} className="rounded-xl bg-background p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {label}
            </p>
            <ul className="mt-3 space-y-1.5">
              {BLANK_POSITIONS.map((pos) => (
                <li
                  key={`${label}-${pos}`}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 bg-background px-3 py-2 text-sm"
                >
                  <span className="inline-flex min-w-9 justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {pos}
                  </span>
                  <span className="flex-1 text-xs italic text-muted-foreground">
                    Drag a player in…
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

// ==========================================================================
// STEP 5 — Team building view (drag-and-drop)
// ==========================================================================
type TeamKey = "teamA" | "teamB" | "teamC";
type SectionKey = "shooters" | "midcourt" | "defenders";
type TeamBucket = Record<SectionKey, string[]>;
type BuilderState = {
  available: string[];
  teamA: TeamBucket;
  teamB: TeamBucket;
  teamC: TeamBucket;
};

const TEAM_KEYS: TeamKey[] = ["teamA", "teamB", "teamC"];
const TEAM_LABELS: Record<TeamKey, string> = {
  teamA: "Team A",
  teamB: "Team B",
  teamC: "Team C",
};
const SECTION_LABELS: Record<SectionKey, string> = {
  shooters: "Shooters",
  midcourt: "Midcourt",
  defenders: "Defenders",
};

function emptyBucket(): TeamBucket {
  return { shooters: [], midcourt: [], defenders: [] };
}

function TeamBuildingStep({ players }: { players: SamplePlayer[] }) {
  const attending = players.filter((p) => p.attended);
  const [state, setState] = useState<BuilderState>(() => ({
    available: attending.map((p) => p.name),
    teamA: emptyBucket(),
    teamB: emptyBucket(),
    teamC: emptyBucket(),
  }));
  const [dragOver, setDragOver] = useState<string | null>(null);

  const byName = new Map(attending.map((p) => [p.name, p]));

  function movePlayer(
    name: string,
    target: { team: TeamKey | "available"; section?: SectionKey },
  ) {
    setState((prev) => {
      const next: BuilderState = {
        available: prev.available.filter((n) => n !== name),
        teamA: {
          shooters: prev.teamA.shooters.filter((n) => n !== name),
          midcourt: prev.teamA.midcourt.filter((n) => n !== name),
          defenders: prev.teamA.defenders.filter((n) => n !== name),
        },
        teamB: {
          shooters: prev.teamB.shooters.filter((n) => n !== name),
          midcourt: prev.teamB.midcourt.filter((n) => n !== name),
          defenders: prev.teamB.defenders.filter((n) => n !== name),
        },
        teamC: {
          shooters: prev.teamC.shooters.filter((n) => n !== name),
          midcourt: prev.teamC.midcourt.filter((n) => n !== name),
          defenders: prev.teamC.defenders.filter((n) => n !== name),
        },
      };
      if (target.team === "available") {
        next.available.push(name);
      } else if (target.section) {
        next[target.team][target.section].push(name);
      }
      return next;
    });
  }

  function handleDrop(
    e: React.DragEvent,
    target: { team: TeamKey | "available"; section?: SectionKey },
  ) {
    e.preventDefault();
    setDragOver(null);
    const name = e.dataTransfer.getData("text/plain");
    if (!name) return;
    movePlayer(name, target);
  }

  function handleReset() {
    setState({
      available: attending.map((p) => p.name),
      teamA: emptyBucket(),
      teamB: emptyBucket(),
      teamC: emptyBucket(),
    });
  }

  return (
    <div>
      <StepHeading
        eyebrow="Step 5"
        title="Team building — drag players into the team you want"
        blurb="Every attending player sits on the right. Drag them into Team A, B or C — into Shooters, Midcourt or Defenders. Selectors have final say."
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
        >
          Reset — move everyone back
        </button>
        <p className="text-xs text-muted-foreground">
          {state.available.length} player{state.available.length === 1 ? "" : "s"} still in the pool.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* TEAMS (left) */}
        <div className="space-y-5 lg:col-span-8">
          {TEAM_KEYS.map((teamKey) => {
            const bucket = state[teamKey];
            const total =
              bucket.shooters.length +
              bucket.midcourt.length +
              bucket.defenders.length;
            return (
              <article
                key={teamKey}
                className="rounded-2xl border border-border/70 bg-background p-5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <p className="font-display text-lg font-bold">
                    {TEAM_LABELS[teamKey]}
                  </p>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {total} player{total === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(["shooters", "midcourt", "defenders"] as SectionKey[]).map(
                    (section) => {
                      const dropKey = `${teamKey}-${section}`;
                      const isHover = dragOver === dropKey;
                      const items = bucket[section];
                      return (
                        <div
                          key={section}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(dropKey);
                          }}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={(e) =>
                            handleDrop(e, { team: teamKey, section })
                          }
                          className={
                            isHover
                              ? "min-h-32 rounded-xl border-2 border-dashed border-primary bg-primary/10 p-3 transition"
                              : "min-h-32 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-3 transition"
                          }
                        >
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                            {SECTION_LABELS[section]}
                          </p>
                          <ul className="mt-2 space-y-1.5">
                            {items.length === 0 ? (
                              <li className="rounded-md bg-background/60 px-2 py-1.5 text-[11px] italic text-muted-foreground">
                                Drop players here…
                              </li>
                            ) : (
                              items.map((name) => {
                                const p = byName.get(name);
                                if (!p) return null;
                                return (
                                  <li
                                    key={name}
                                    draggable
                                    onDragStart={(e) =>
                                      e.dataTransfer.setData(
                                        "text/plain",
                                        name,
                                      )
                                    }
                                    className="cursor-grab rounded-md bg-background px-2 py-1.5 text-xs shadow-sm transition active:cursor-grabbing"
                                  >
                                    <p className="font-semibold text-foreground">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] font-semibold text-primary">
                                      {p.positions.join(", ")}
                                    </p>
                                  </li>
                                );
                              })
                            )}
                          </ul>
                        </div>
                      );
                    },
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* AVAILABLE PLAYERS (right) */}
        <aside className="lg:col-span-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver("available");
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, { team: "available" })}
            className={
              dragOver === "available"
                ? "sticky top-24 rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-5 transition"
                : "sticky top-24 rounded-2xl border border-border/70 bg-background p-5"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Players
              </p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {state.available.length}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Drag any player into a team.
            </p>
            <ul className="mt-3 max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
              {state.available.length === 0 && (
                <li className="rounded-lg bg-muted/40 px-3 py-3 text-center text-xs italic text-muted-foreground">
                  Every player is in a team. Drag them back here to un-assign.
                </li>
              )}
              {state.available.map((name) => {
                const p = byName.get(name);
                if (!p) return null;
                return (
                  <li
                    key={name}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", name)
                    }
                    className="flex cursor-grab items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-sm shadow-sm transition hover:bg-muted active:cursor-grabbing"
                  >
                    <span>
                      <span className="block font-semibold text-foreground">
                        {p.name}
                      </span>
                      <span className="text-[11px] font-semibold text-primary">
                        {p.positions.join(", ")}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==========================================================================
// STEP 6 — Export
// ==========================================================================
function ExportStep({
  players,
  attendedCount,
  totalFee,
}: {
  players: SamplePlayer[];
  attendedCount: number;
  totalFee: number;
}) {
  const associationPays = SAMPLE_TRIAL.associationPaysFees;
  const invoiceable = attendedCount * SAMPLE_TRIAL.feePerParticipant;

  return (
    <div>
      <StepHeading
        eyebrow="Step 6"
        title="Save everything or send it on"
        blurb="Download the raw data, print the team-building sheet for selectors, and — if the association picked up the platform fees — generate the invoice."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ExportCard
          title="Full trial data (CSV)"
          hint="Every player, position, attendance and team allocation."
          cta="Download CSV"
        />
        <ExportCard
          title="Team-building sheet (PDF)"
          hint="One page per age group listing every selected team."
          cta="Download PDF"
        />
        <ExportCard
          title={
            associationPays
              ? "Invoice (association pays)"
              : "Committee summary (email)"
          }
          hint={
            associationPays
              ? `Auto-generated for ${attendedCount} attending × $${SAMPLE_TRIAL.feePerParticipant.toFixed(2)} = $${invoiceable.toFixed(2)}.`
              : "Attendance, revenue, no-shows and headline stats."
          }
          cta={associationPays ? "Generate invoice" : "Send email"}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border/70 bg-background p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          At a glance
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <SummaryStat label="Registered" value={players.length.toString()} />
          <SummaryStat label="Attended" value={attendedCount.toString()} />
          <SummaryStat
            label="Age groups"
            value={SAMPLE_TRIAL.ageGroups.length.toString()}
          />
          <SummaryStat
            label={associationPays ? "Invoice total" : "Revenue collected"}
            value={`$${(associationPays ? invoiceable : players.length * totalFee).toFixed(2)}`}
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Shared bits
// ==========================================================================
function StepHeading({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h3>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{blurb}</p>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex items-start gap-2 text-sm font-semibold text-foreground">
        {icon && <span className="mt-0.5 text-primary">{icon}</span>}
        <span>{value}</span>
      </div>
    </div>
  );
}

function MiniLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="opacity-90">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold text-foreground">
        {value}
      </p>
    </div>
  );
}

function PositionsChips({
  positions,
  compact,
}: {
  positions: Position[];
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {positions.map((p) => (
        <span
          key={p}
          className={
            compact
              ? "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
              : "rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary"
          }
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function ExportCard({
  title,
  hint,
  cta,
}: {
  title: string;
  hint: string;
  cta: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-background p-5">
      <p className="font-display text-base font-bold leading-snug">{title}</p>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:scale-[1.03]"
      >
        <Download className="size-3.5" />
        {cta}
      </button>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
        {value}
      </p>
    </div>
  );
}
