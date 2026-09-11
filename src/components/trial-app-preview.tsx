"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Copy,
  Download,
  MapPin,
  Send,
  Share2,
  Sparkles,
  UserCheck,
  Users,
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

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 md:p-6">
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
          <div className="grid gap-4 rounded-2xl border border-border/70 bg-background p-6 sm:grid-cols-2">
            <Field label="Trial name" value={SAMPLE_TRIAL.name} />
            <Field label="Club / Association" value={SAMPLE_TRIAL.club} />
            <Field label="Age group" value={SAMPLE_TRIAL.ageGroup} />
            <Field
              label="Maximum players"
              value={SAMPLE_TRIAL.maxPlayers.toString()}
            />
            <Field
              label="Date &amp; time"
              value={SAMPLE_TRIAL.date}
              icon={<CalendarDays className="size-4" />}
            />
            <Field
              label="Venue"
              value={SAMPLE_TRIAL.venue}
              icon={<MapPin className="size-4" />}
            />
            <Field
              label="Courts available"
              value={SAMPLE_TRIAL.courts.toString()}
            />
            <Field
              label="CC Netball fee (per participant)"
              value={`$${SAMPLE_TRIAL.feePerParticipant.toFixed(2)}`}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-border/70 bg-background p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Association add-ons (optional)
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Add any extras your club or association wants to pass on —
              independent selectors, umpires, court hire, or anything else.
              Leave the section blank to only charge the CC Netball fee.
            </p>
            <ul className="mt-4 space-y-2">
              {SAMPLE_TRIAL.additionalFees.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground/90">
                    {f.label}
                  </span>
                  <span className="font-semibold text-primary">
                    +${f.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl bg-gradient-to-br from-[var(--brand-raspberry)] via-primary to-[var(--brand-coral)] p-6 text-white shadow-lg shadow-primary/25">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-90">
              Total per player
            </p>
            <p className="mt-2 font-display text-4xl font-extrabold">
              ${totalFee.toFixed(2)}
            </p>
            <p className="mt-4 text-sm opacity-90">
              {SAMPLE_TRIAL.feeAbsorbedByClub
                ? "The club is absorbing this fee."
                : "Paid by each participant on registration."}
            </p>

            <div className="mt-6 space-y-2 border-t border-white/20 pt-5 text-sm">
              <MiniLine
                label="CC Netball fee"
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
          label="Max capacity"
          value={SAMPLE_TRIAL.maxPlayers.toString()}
        />
        <MetricCard
          label="Fees collected"
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
}: {
  players: SamplePlayer[];
  attendedCount: number;
  onToggle: (index: number) => void;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Step 3"
        title="Tick players in as they arrive"
        blurb="Open this on your phone at the courts — one tap per player. When you're ready, generate the teams."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Attending" value={attendedCount.toString()} />
        <MetricCard
          label="No-shows"
          value={(players.length - attendedCount).toString()}
        />
        <MetricCard label="Total registered" value={players.length.toString()} />
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
    </div>
  );
}

// ==========================================================================
// STEP 4 — Team allocation
// ==========================================================================
function TeamsStep() {
  return (
    <div>
      <StepHeading
        eyebrow="Step 4"
        title="Games generated automatically — unbiased and balanced"
        blurb="Every player is placed in their preferred position. Lineups rotate across games so every attending player gets time on court. Regenerate as often as you like."
      />

      <div className="mt-6 space-y-6">
        {SAMPLE_GAMES.map((game) => (
          <article
            key={game.name}
            className="rounded-2xl border border-border/70 bg-background p-5 md:p-6"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
              <p className="font-display text-lg font-bold">{game.name}</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {game.teams[0].lineup.length} vs {game.teams[1].lineup.length}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {game.teams.map((team) => (
                <div
                  key={team.label}
                  className="rounded-xl bg-muted/40 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {team.label}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {team.lineup.map((p) => (
                      <li
                        key={`${team.label}-${p.position}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-sm"
                      >
                        <span className="inline-flex min-w-9 justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {p.position}
                        </span>
                        <span className="flex-1 font-medium text-foreground">
                          {p.name}
                        </span>
                      </li>
                    ))}
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
        ))}
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
    </div>
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
  return (
    <div>
      <StepHeading
        eyebrow="Step 6"
        title="Save everything or send it on"
        blurb="Download the raw data, print the team-building sheet for selectors, or email the summary straight to your committee."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ExportCard
          title="Full trial data (CSV)"
          hint="Every player, position, attendance, rating and note."
          cta="Download CSV"
        />
        <ExportCard
          title="Team-building sheet (PDF)"
          hint="One page per team plus a selector-view table."
          cta="Download PDF"
        />
        <ExportCard
          title="Committee summary (email)"
          hint="Attendance, revenue, no-shows and top-rated players."
          cta="Send email"
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
            label="Revenue collected"
            value={`$${(players.length * totalFee).toFixed(2)}`}
          />
          <SummaryStat
            label="Selector rating avg"
            value={(
              players
                .filter((p) => p.rating != null)
                .reduce((s, p) => s + (p.rating ?? 0), 0) /
              players.filter((p) => p.rating != null).length
            ).toFixed(1)}
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
