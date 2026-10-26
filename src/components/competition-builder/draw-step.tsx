"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import type {
  CompetitionCourt,
  CompetitionDivision,
  CompetitionTeam,
  CompetitionTimeslot,
  FixtureGame,
  Rule,
} from "@/lib/competition-builder";
import { analyzeDraw } from "@/lib/competition-builder-draw";

type Props = {
  competitionId: string;
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  divisions: CompetitionDivision[];
  teams: CompetitionTeam[];
  rules: Rule[];
  fixtureGames: FixtureGame[];
};

export function DrawStep({
  competitionId,
  courts,
  timeslots,
  divisions,
  teams,
  rules,
  fixtureGames,
}: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<{
    totalGames: number;
    unplaced: number;
    issues: string[];
    ruleOutcomes: Array<{
      ruleId: string;
      plainEnglish: string;
      ruleType: string;
      contributedToUnplaced: number;
    }>;
  } | null>(null);

  const teamName = (id: string | null) =>
    id ? (teams.find((t) => t.id === id)?.name ?? "(removed)") : "";
  const courtName = (id: string | null) =>
    id ? (courts.find((c) => c.id === id)?.name ?? "(removed)") : "";
  const slotLabel = (id: string | null) =>
    id ? (timeslots.find((s) => s.id === id)?.label ?? "(removed)") : "";
  const divisionNameForTeam = (id: string | null) => {
    const t = teams.find((x) => x.id === id);
    if (!t?.divisionId) return "";
    return divisions.find((d) => d.id === t.divisionId)?.name ?? "";
  };

  const roundNumbers = useMemo(() => {
    const nums = new Set<number>();
    for (const g of fixtureGames) nums.add(g.roundNumber);
    return Array.from(nums).sort((a, b) => a - b);
  }, [fixtureGames]);

  const byRoundThenSlot = useMemo(() => {
    const map = new Map<number, Map<string, FixtureGame[]>>();
    for (const g of fixtureGames) {
      if (!map.has(g.roundNumber)) map.set(g.roundNumber, new Map());
      const slot = g.timeslotId ?? "__none__";
      if (!map.get(g.roundNumber)!.has(slot))
        map.get(g.roundNumber)!.set(slot, []);
      map.get(g.roundNumber)!.get(slot)!.push(g);
    }
    return map;
  }, [fixtureGames]);

  async function generate() {
    setGenerating(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch(
        `/api/competition-builder/${competitionId}/generate-draw`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate the draw.");
      setReport({
        totalGames: data.totalGames,
        unplaced: data.unplaced,
        issues: data.issues ?? [],
        ruleOutcomes: data.ruleOutcomes ?? [],
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate =
    teams.length >= 2 &&
    divisions.length > 0 &&
    courts.length > 0 &&
    timeslots.length > 0;

  const analysis = useMemo(
    () => analyzeDraw({ teams, divisions, courts, timeslots, rules }),
    [teams, divisions, courts, timeslots, rules],
  );

  // Fingerprint of the current inputs. Fixture rows store a snapshot of
  // what the inputs looked like at build time via totalGames; if that
  // snapshot no longer matches, we treat the saved fixture as stale.
  const inputsFingerprint = useMemo(
    () =>
      JSON.stringify({
        c: courts.map((x) => x.id).sort(),
        s: timeslots.map((x) => x.id).sort(),
        d: divisions.map((x) => ({ id: x.id, lc: x.lockedCourtId })),
        t: teams.map((x) => ({ id: x.id, d: x.divisionId })),
      }),
    [courts, timeslots, divisions, teams],
  );

  // When the inputs change, the stale "generate report" headline shouldn't
  // keep showing. Clear it so the UI only ever shows a report that matches
  // the current state.
  const lastFingerprint = useRef(inputsFingerprint);
  useEffect(() => {
    if (lastFingerprint.current !== inputsFingerprint) {
      lastFingerprint.current = inputsFingerprint;
      setReport(null);
    }
  }, [inputsFingerprint]);

  // The saved fixture is "stale" if the inputs today could reasonably
  // produce a different draw — courts, timeslots, teams or divisions
  // changed since the fixture was built. We approximate by watching
  // whether the current pre-flight math matches what the saved fixture
  // actually contains.
  const fixtureIsStale = useMemo(() => {
    if (fixtureGames.length === 0) return false;
    const liveGames = fixtureGames.filter((g) => !g.isBye);
    // Expect the live games to involve only current teams and sit on
    // current court × timeslot cells. Anything referencing a now-removed
    // court/timeslot/team means we edited after building.
    const teamIds = new Set(teams.map((t) => t.id));
    const courtIds = new Set(courts.map((c) => c.id));
    const slotIds = new Set(timeslots.map((s) => s.id));
    for (const g of liveGames) {
      if (g.teamAId && !teamIds.has(g.teamAId)) return true;
      if (g.teamBId && !teamIds.has(g.teamBId)) return true;
      if (g.courtId && !courtIds.has(g.courtId)) return true;
      if (g.timeslotId && !slotIds.has(g.timeslotId)) return true;
    }
    // If the number of games doesn't match what a fresh build would need
    // (per round × rounds), the inputs likely changed.
    const roundsInFixture = new Set(fixtureGames.map((g) => g.roundNumber))
      .size;
    const expectedPerRound = analysis.totalMatchesPerRound;
    const expectedBynesPerRound = analysis.divisions.filter(
      (d) => d.hasBye,
    ).length;
    const expectedTotal =
      (expectedPerRound + expectedBynesPerRound) * roundsInFixture;
    return expectedTotal !== fixtureGames.length;
  }, [fixtureGames, teams, courts, timeslots, analysis]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">The draw</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Generate the full season fixture from your teams, divisions,
            courts, timeslots and rules. Every rule you added in Step 4 is
            applied as the draw is built, not patched afterwards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fixtureGames.length > 0 && (
            <a
              href={`/api/competition-builder/${competitionId}/draw.csv`}
              className="inline-flex items-center gap-2 rounded-full border border-primary bg-background px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              <Download className="size-4" /> Export CSV
            </a>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={generating || !canGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generating
              ? "Building…"
              : fixtureGames.length > 0
                ? "Regenerate draw"
                : "Generate draw"}
          </button>
        </div>
      </div>

      {!canGenerate && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Needed before you can build the draw: at least 1 court, 1 timeslot,
          1 division, and 2 teams in a division. Fill those in on Steps 1 and
          2.
        </div>
      )}

      <PreflightPanel analysis={analysis} />

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {report && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            report.unplaced === 0
              ? "border-primary/30 bg-primary/5"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          <p className="flex items-center gap-2 font-display text-base font-bold">
            {report.unplaced === 0 ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <AlertTriangle className="size-5 text-amber-600" />
            )}
            {report.unplaced === 0
              ? `Done — all ${report.totalGames} games placed across every round.`
              : `${report.totalGames - report.unplaced} of ${report.totalGames} games placed. ${report.unplaced} couldn't fit under your current courts, timeslots and rules.`}
          </p>
          {report.ruleOutcomes.length > 0 && (
            <div className="mt-3 border-t border-amber-200/60 pt-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/70">
                How your rules fared
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {report.ruleOutcomes.map((r) => (
                  <li key={r.ruleId} className="flex items-start gap-2">
                    {r.contributedToUnplaced === 0 ? (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    ) : (
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-700" />
                    )}
                    <span>
                      <span className="font-semibold">{r.plainEnglish}</span>{" "}
                      {r.contributedToUnplaced === 0 ? (
                        <span className="text-foreground/70">— honoured on every game.</span>
                      ) : (
                        <span className="text-amber-900">
                          — I did my best to accommodate it, but it cost{" "}
                          <strong>{r.contributedToUnplaced}</strong> game
                          {r.contributedToUnplaced === 1 ? "" : "s"} that
                          couldn&apos;t be placed.
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.issues.length > 0 && (
            <details className="mt-3 border-t border-amber-200/60 pt-3">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-foreground/70">
                Game-by-game explanations ({report.issues.length})
              </summary>
              <ul className="mt-2 list-disc pl-6 text-xs text-amber-900">
                {report.issues.slice(0, 20).map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
                {report.issues.length > 20 && (
                  <li>…and {report.issues.length - 20} more.</li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}

      {fixtureGames.length === 0 || fixtureIsStale ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background p-10 text-center">
          <Sparkles className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-bold">
            {fixtureIsStale
              ? "The previous draw was cleared."
              : "No draw generated yet."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {fixtureIsStale ? (
              <>
                You edited courts, timeslots, teams or divisions since the
                last draw was built. Review the Pre-flight check above, then
                hit <strong>Generate draw</strong> to rebuild.
              </>
            ) : (
              <>
                Hit <strong>Generate draw</strong> to build the full season
                fixture.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {roundNumbers.map((round) => {
            const slots =
              byRoundThenSlot.get(round) ?? new Map<string, FixtureGame[]>();
            return (
              <section
                key={round}
                className="overflow-hidden rounded-2xl border border-border/70 bg-background"
              >
                <header className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-3">
                  <p className="font-display text-sm font-bold">
                    Round {round}
                  </p>
                </header>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left">
                        <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Timeslot
                        </th>
                        {courts.map((court) => (
                          <th
                            key={court.id}
                            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                          >
                            {court.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeslots.map((slot) => {
                        const slotGames = slots.get(slot.id) ?? [];
                        return (
                          <tr
                            key={slot.id}
                            className="border-b border-border/40 last:border-0"
                          >
                            <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                              {slot.label}
                            </td>
                            {courts.map((court) => {
                              const game = slotGames.find(
                                (g) => g.courtId === court.id,
                              );
                              return (
                                <td
                                  key={court.id}
                                  className="px-4 py-3 align-top"
                                >
                                  {game ? (
                                    <div>
                                      <p className="font-semibold">
                                        {teamName(game.teamAId)}{" "}
                                        <span className="text-muted-foreground">
                                          v
                                        </span>{" "}
                                        {teamName(game.teamBId)}
                                      </p>
                                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {divisionNameForTeam(game.teamAId)}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderByes(fixtureGames, round, divisions, teamName)}
                {renderUnplaced(
                  fixtureGames,
                  round,
                  teamName,
                  divisionNameForTeam,
                  courtName,
                  slotLabel,
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PreflightPanel({
  analysis,
}: {
  analysis: ReturnType<typeof analyzeDraw>;
}) {
  const needsAttention = analysis.suggestions.some(
    (s) => s.severity === "action" || s.severity === "warning",
  );

  return (
    <section className="rounded-2xl border border-border/70 bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/40 px-5 py-3">
        <p className="flex items-center gap-2 font-display text-sm font-bold">
          <Lightbulb className="size-4 text-primary" />
          Pre-flight check
        </p>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">
            {analysis.totalMatchesPerRound}
          </strong>{" "}
          matches / round into{" "}
          <strong className="text-foreground">
            {analysis.cellsPerRound}
          </strong>{" "}
          cells ({analysis.utilizationPct}% used)
        </p>
      </header>

      <div className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Divisions
          </p>
          {analysis.divisions.length === 0 ? (
            <p className="mt-2 text-xs italic text-muted-foreground">
              Add divisions in Step 2.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {analysis.divisions.map((d) => (
                <li
                  key={d.divisionId}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.teamCount} teams · {d.matchesPerRound} matches
                    {d.hasBye && (
                      <span className="ml-1 font-semibold text-amber-700">
                        · bye each round
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Suggestions
          </p>
          {analysis.suggestions.length === 0 ? (
            <p className="mt-2 text-xs italic text-muted-foreground">
              Nothing to report yet.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {analysis.suggestions.map((s, i) => (
                <li
                  key={i}
                  className={`rounded-xl border p-3 text-xs ${
                    s.severity === "action"
                      ? "border-primary/30 bg-primary/5"
                      : s.severity === "warning"
                        ? "border-amber-300 bg-amber-50"
                        : "border-border/70 bg-card"
                  }`}
                >
                  <p className="font-semibold">
                    {s.severity === "action" && (
                      <Sparkles className="mr-1 inline size-3 text-primary" />
                    )}
                    {s.severity === "warning" && (
                      <AlertTriangle className="mr-1 inline size-3 text-amber-700" />
                    )}
                    {s.headline}
                  </p>
                  {s.detail && (
                    <p className="mt-1 text-foreground/80">{s.detail}</p>
                  )}
                  {s.options.length > 0 && (
                    <>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Options
                      </p>
                      <ul className="mt-1 space-y-1">
                        {s.options.map((opt, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-1.5 text-foreground/90"
                          >
                            <span className="mt-0.5 text-primary">•</span>
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {needsAttention && (
        <p className="border-t border-border/60 px-5 py-3 text-xs italic text-muted-foreground">
          You can still Generate the draw — these are advice, not blockers.
          Go back to Step 1 or 2 if you want to apply any of the suggestions
          first.
        </p>
      )}
    </section>
  );
}

function renderByes(
  games: FixtureGame[],
  round: number,
  divisions: CompetitionDivision[],
  teamName: (id: string | null) => string,
) {
  const byes = games.filter((g) => g.roundNumber === round && g.isBye);
  if (byes.length === 0) return null;
  return (
    <div className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
      <strong className="font-semibold text-foreground">Byes:</strong>{" "}
      {byes
        .map((g) => {
          const divisionName =
            divisions.find((d) => {
              const t = games.find((x) => x.id === g.id);
              return t && d.id === g.courtId; // noop safeguard
            })?.name ?? "";
          void divisionName;
          return teamName(g.teamAId);
        })
        .join(", ")}
    </div>
  );
}

function renderUnplaced(
  games: FixtureGame[],
  round: number,
  teamName: (id: string | null) => string,
  divisionNameForTeam: (id: string | null) => string,
  _courtName: (id: string | null) => string,
  _slotLabel: (id: string | null) => string,
) {
  const unplaced = games.filter(
    (g) =>
      g.roundNumber === round &&
      !g.isBye &&
      (g.courtId === null || g.timeslotId === null),
  );
  if (unplaced.length === 0) return null;
  return (
    <div className="border-t border-amber-300 bg-amber-50 px-5 py-3 text-xs text-amber-900">
      <strong className="font-semibold">Couldn&apos;t place:</strong>{" "}
      {unplaced
        .map(
          (g) =>
            `${teamName(g.teamAId)} v ${teamName(g.teamBId)} (${divisionNameForTeam(g.teamAId)})`,
        )
        .join("; ")}
    </div>
  );
}
