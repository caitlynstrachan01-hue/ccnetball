/**
 * Fixture generator — pure data in, pure data out.
 * Takes the teams, divisions, courts, timeslots and rules; returns a
 * round-by-round assignment of games to court × timeslot cells plus a
 * list of games it couldn't place and why.
 */
import type {
  CompetitionCourt,
  CompetitionDivision,
  CompetitionTeam,
  CompetitionTimeslot,
  Rule,
} from "./competition-builder";

export type GeneratedGame = {
  round: number;
  divisionId: string;
  teamAId: string | null;
  teamBId: string | null;
  isBye: boolean;
  courtId: string | null;
  timeslotId: string | null;
  unplaced?: boolean;
  reason?: string;
};

export type GenerateDrawInput = {
  teams: CompetitionTeam[];
  divisions: CompetitionDivision[];
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  rules: Rule[];
  totalRounds: number; // if 0, pick a sensible default per division
};

export type GenerateDrawResult = {
  games: GeneratedGame[];
  issues: string[];
};

type Pairing = {
  round: number;
  divisionId: string;
  teamAId: string | null;
  teamBId: string | null;
  isBye: boolean;
};

/** Circle-method round-robin — one cycle rotates everyone past a fixed team. */
function roundRobinPairings(
  divisionId: string,
  teams: CompetitionTeam[],
  totalRounds: number,
): Pairing[] {
  if (teams.length < 2) return [];

  const BYE = "__bye__";
  const working: Array<CompetitionTeam | { id: typeof BYE }> = [...teams];
  if (working.length % 2 === 1) working.push({ id: BYE });

  const roundsPerCycle = working.length - 1;
  const half = working.length / 2;
  const pairings: Pairing[] = [];

  const arr = working.slice();

  for (let r = 0; r < totalRounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[arr.length - 1 - i];
      if (a.id === BYE) {
        pairings.push({
          round: r + 1,
          divisionId,
          teamAId: b.id,
          teamBId: null,
          isBye: true,
        });
      } else if (b.id === BYE) {
        pairings.push({
          round: r + 1,
          divisionId,
          teamAId: a.id,
          teamBId: null,
          isBye: true,
        });
      } else {
        // Alternate "home" team each full cycle so the pair doesn't always
        // appear in the same order on the printed fixture.
        const flipHome = Math.floor(r / roundsPerCycle) % 2 === 1;
        pairings.push({
          round: r + 1,
          divisionId,
          teamAId: flipHome ? b.id : a.id,
          teamBId: flipHome ? a.id : b.id,
          isBye: false,
        });
      }
    }
    // Rotate — fix index 0, rotate the rest clockwise.
    const first = arr[0];
    const rest = arr.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    arr.length = 0;
    arr.push(first, ...rest);
  }

  return pairings;
}

function defaultRounds(teams: CompetitionTeam[]): number {
  // One complete single round-robin as the baseline.
  if (teams.length <= 1) return 0;
  return teams.length % 2 === 0 ? teams.length - 1 : teams.length;
}

export function generateDraw(input: GenerateDrawInput): GenerateDrawResult {
  const { teams, divisions, courts, timeslots, rules } = input;
  const issues: string[] = [];

  // Build pairings per division.
  const perDivisionTeams = new Map<string, CompetitionTeam[]>();
  for (const d of divisions) perDivisionTeams.set(d.id, []);
  for (const t of teams)
    if (t.divisionId) perDivisionTeams.get(t.divisionId)?.push(t);

  const totalRoundsPerDivision = new Map<string, number>();
  for (const d of divisions) {
    const t = perDivisionTeams.get(d.id) ?? [];
    totalRoundsPerDivision.set(
      d.id,
      input.totalRounds > 0 ? input.totalRounds : defaultRounds(t),
    );
  }

  const allPairings: Pairing[] = [];
  for (const d of divisions) {
    const t = perDivisionTeams.get(d.id) ?? [];
    const rounds = totalRoundsPerDivision.get(d.id) ?? 0;
    allPairings.push(...roundRobinPairings(d.id, t, rounds));
  }

  // Build rule lookups once.
  const forbidden = new Map<string, Set<string>>(); // teamId → forbidden timeslotIds
  const required = new Map<string, Set<string>>(); // teamId → required timeslotIds
  const divisionAllowed = new Map<string, Set<string>>();
  const sharedGroups: Array<Set<string>> = [];
  const courtClosed = new Map<string, Set<number>>(); // courtId → closed round numbers
  const teamByeRounds = new Map<string, Set<number>>(); // teamId → forced bye rounds

  for (const rule of rules) {
    const p = rule.params as Record<string, unknown>;
    switch (rule.ruleType) {
      case "team_timeslot_forbidden":
        setAddAll(
          forbidden,
          p.teamId as string,
          p.timeslotIds as string[],
        );
        break;
      case "team_timeslot_required":
        setAddAll(
          required,
          p.teamId as string,
          p.timeslotIds as string[],
        );
        break;
      case "division_timeslots":
        divisionAllowed.set(
          p.divisionId as string,
          new Set(p.timeslotIds as string[]),
        );
        break;
      case "teams_different_times":
        sharedGroups.push(new Set(p.teamIds as string[]));
        break;
      case "court_closed_round": {
        const courtId = p.courtId as string;
        const round = p.roundNumber as number;
        if (!courtClosed.has(courtId)) courtClosed.set(courtId, new Set());
        courtClosed.get(courtId)!.add(round);
        break;
      }
      case "team_bye_round": {
        const teamId = p.teamId as string;
        const round = p.roundNumber as number;
        if (!teamByeRounds.has(teamId)) teamByeRounds.set(teamId, new Set());
        teamByeRounds.get(teamId)!.add(round);
        break;
      }
    }
  }

  // Group pairings by round for assignment.
  const byRound = new Map<number, Pairing[]>();
  for (const p of allPairings) {
    if (!byRound.has(p.round)) byRound.set(p.round, []);
    byRound.get(p.round)!.push(p);
  }

  const games: GeneratedGame[] = [];
  const maxRound = Math.max(0, ...Array.from(byRound.keys()));

  for (let r = 1; r <= maxRound; r++) {
    const roundPairings = byRound.get(r) ?? [];
    const cellTaken = new Set<string>(); // "courtId:timeslotId"
    const teamAtTimeslot = new Map<string, string>(); // teamId → timeslotId

    // Order the hardest-to-place first (those with required timeslots, forced
    // courts via division lock, or shared-time constraints).
    const divisionLockedCourt = new Map(
      divisions.map((d) => [d.id, d.lockedCourtId] as const),
    );
    const scored = roundPairings
      .map((p) => ({
        p,
        hardness:
          (required.has(p.teamAId ?? "") ? 2 : 0) +
          (required.has(p.teamBId ?? "") ? 2 : 0) +
          (divisionLockedCourt.get(p.divisionId) ? 2 : 0) +
          (sharedGroups.some(
            (g) =>
              (p.teamAId && g.has(p.teamAId)) ||
              (p.teamBId && g.has(p.teamBId)),
          )
            ? 1
            : 0),
      }))
      .sort((a, b) => b.hardness - a.hardness)
      .map((x) => x.p);

    for (const pairing of scored) {
      // Byes carry straight through.
      if (pairing.isBye) {
        games.push({
          round: r,
          divisionId: pairing.divisionId,
          teamAId: pairing.teamAId,
          teamBId: null,
          isBye: true,
          courtId: null,
          timeslotId: null,
        });
        continue;
      }

      // Forced-bye rule for this round?
      if (
        (pairing.teamAId && teamByeRounds.get(pairing.teamAId)?.has(r)) ||
        (pairing.teamBId && teamByeRounds.get(pairing.teamBId)?.has(r))
      ) {
        games.push({
          round: r,
          divisionId: pairing.divisionId,
          teamAId: pairing.teamAId,
          teamBId: pairing.teamBId,
          isBye: false,
          courtId: null,
          timeslotId: null,
          unplaced: true,
          reason: "A team in this game has a forced bye this round.",
        });
        continue;
      }

      const forcedCourtId = divisionLockedCourt.get(pairing.divisionId);
      const candidateCourts = forcedCourtId
        ? courts.filter((c) => c.id === forcedCourtId)
        : courts;

      const allowedForDivision = divisionAllowed.get(pairing.divisionId);

      let placed = false;
      outer: for (const slot of timeslots) {
        // Division-timeslot rule
        if (allowedForDivision && !allowedForDivision.has(slot.id)) continue;
        // Both teams' timeslot constraints
        if (
          (pairing.teamAId && forbidden.get(pairing.teamAId)?.has(slot.id)) ||
          (pairing.teamBId && forbidden.get(pairing.teamBId)?.has(slot.id))
        )
          continue;
        const reqA = pairing.teamAId
          ? required.get(pairing.teamAId)
          : undefined;
        const reqB = pairing.teamBId
          ? required.get(pairing.teamBId)
          : undefined;
        if (reqA && !reqA.has(slot.id)) continue;
        if (reqB && !reqB.has(slot.id)) continue;

        // Shared-time: don't put this game at this slot if a shared teammate
        // is already there this round.
        let sharedConflict = false;
        for (const g of sharedGroups) {
          if (
            !(pairing.teamAId && g.has(pairing.teamAId)) &&
            !(pairing.teamBId && g.has(pairing.teamBId))
          )
            continue;
          for (const [teamId, atSlot] of teamAtTimeslot) {
            if (
              g.has(teamId) &&
              atSlot === slot.id &&
              teamId !== pairing.teamAId &&
              teamId !== pairing.teamBId
            ) {
              sharedConflict = true;
              break;
            }
          }
          if (sharedConflict) break;
        }
        if (sharedConflict) continue;

        for (const court of candidateCourts) {
          if (courtClosed.get(court.id)?.has(r)) continue;
          const cellKey = `${court.id}:${slot.id}`;
          if (cellTaken.has(cellKey)) continue;
          cellTaken.add(cellKey);
          if (pairing.teamAId) teamAtTimeslot.set(pairing.teamAId, slot.id);
          if (pairing.teamBId) teamAtTimeslot.set(pairing.teamBId, slot.id);
          games.push({
            round: r,
            divisionId: pairing.divisionId,
            teamAId: pairing.teamAId,
            teamBId: pairing.teamBId,
            isBye: false,
            courtId: court.id,
            timeslotId: slot.id,
          });
          placed = true;
          break outer;
        }
      }

      if (!placed) {
        games.push({
          round: r,
          divisionId: pairing.divisionId,
          teamAId: pairing.teamAId,
          teamBId: pairing.teamBId,
          isBye: false,
          courtId: null,
          timeslotId: null,
          unplaced: true,
          reason:
            "No court × timeslot combination satisfied every rule for this game.",
        });
        issues.push(
          `Round ${r} — a game in ${nameOf(divisions, pairing.divisionId)} could not be placed under the rules you've set.`,
        );
      }
    }
  }

  return { games, issues };
}

function setAddAll<K, V>(m: Map<K, Set<V>>, key: K, values: V[]) {
  if (!m.has(key)) m.set(key, new Set());
  const set = m.get(key)!;
  for (const v of values) set.add(v);
}

function nameOf(
  list: Array<{ id: string; name: string }>,
  id: string,
): string {
  return list.find((x) => x.id === id)?.name ?? "(unknown)";
}
