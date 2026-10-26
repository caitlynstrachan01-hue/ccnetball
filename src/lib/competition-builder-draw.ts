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

export type RuleViolation = {
  ruleId: string;
  plainEnglish: string;
};

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
  violations?: RuleViolation[];
};

export type GenerateDrawInput = {
  teams: CompetitionTeam[];
  divisions: CompetitionDivision[];
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  rules: Rule[];
  totalRounds: number; // if 0, pick a sensible default per division
};

export type RuleOutcome = {
  ruleId: string;
  plainEnglish: string;
  ruleType: string;
  contributedToUnplaced: number;
};

export type GenerateDrawResult = {
  games: GeneratedGame[];
  issues: string[];
  ruleOutcomes: RuleOutcome[];
};

export type DrawSuggestion = {
  severity: "info" | "warning" | "action";
  headline: string;
  detail?: string;
  options: string[];
};

export type DrawAnalysis = {
  cellsPerRound: number;
  totalMatchesPerRound: number;
  utilizationPct: number;
  divisions: Array<{
    divisionId: string;
    name: string;
    teamCount: number;
    matchesPerRound: number;
    hasBye: boolean;
  }>;
  suggestions: DrawSuggestion[];
};

/**
 * Pre-flight analysis the organiser sees before generating the draw.
 * Reports cell capacity vs. match demand, flags divisions with odd team
 * counts, and suggests concrete swaps that would eliminate byes or
 * better use the court × timeslot cells they've set up.
 */
export function analyzeDraw(input: {
  teams: CompetitionTeam[];
  divisions: CompetitionDivision[];
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  rules?: Rule[];
}): DrawAnalysis {
  const { teams, divisions, courts, timeslots } = input;
  const rules = input.rules ?? [];
  const cellsPerRound = courts.length * timeslots.length;

  const divisionAnalysis = divisions.map((d) => {
    const t = teams.filter((x) => x.divisionId === d.id);
    const matches = Math.floor(t.length / 2);
    return {
      divisionId: d.id,
      name: d.name,
      teamCount: t.length,
      matchesPerRound: matches,
      hasBye: t.length % 2 === 1,
    };
  });

  const totalMatchesPerRound = divisionAnalysis.reduce(
    (s, d) => s + d.matchesPerRound,
    0,
  );
  const utilizationPct =
    cellsPerRound === 0 ? 0 : Math.min(100, Math.round(
      (totalMatchesPerRound / cellsPerRound) * 100,
    ));

  const suggestions: DrawSuggestion[] = [];

  // Capacity suggestions — demand vs cells.
  if (cellsPerRound === 0) {
    suggestions.push({
      severity: "action",
      headline: "You haven't set up any match cells yet.",
      detail:
        "No games can be placed until there's at least one court × timeslot cell.",
      options: [
        "Add at least 1 court on Step 1.",
        "Add at least 1 timeslot on Step 1.",
      ],
    });
  } else if (totalMatchesPerRound > cellsPerRound) {
    const short = totalMatchesPerRound - cellsPerRound;
    const extraCourts = timeslots.length > 0 ? Math.ceil(short / timeslots.length) : short;
    const extraSlots = courts.length > 0 ? Math.ceil(short / courts.length) : short;
    const options: string[] = [];
    options.push(
      `Add ${extraCourts} more court${extraCourts === 1 ? "" : "s"} on Step 1 (${extraCourts * timeslots.length} extra cells per round).`,
    );
    options.push(
      `Add ${extraSlots} more timeslot${extraSlots === 1 ? "" : "s"} on Step 1 (${extraSlots * courts.length} extra cells per round).`,
    );
    // Mixed option — e.g. +1 court AND +1 timeslot.
    const mixedCourt = 1;
    const mixedSlot = Math.max(
      1,
      Math.ceil((short - timeslots.length) / Math.max(1, courts.length + 1)),
    );
    if (
      (courts.length + mixedCourt) * (timeslots.length + mixedSlot) >=
      totalMatchesPerRound
    ) {
      options.push(
        `Add 1 court AND ${mixedSlot} timeslot${mixedSlot === 1 ? "" : "s"} on Step 1 to balance the growth.`,
      );
    }
    // Reduce demand by trimming the largest division.
    const largest = divisionAnalysis.reduce(
      (a, b) => (b.teamCount > a.teamCount ? b : a),
      divisionAnalysis[0] ?? { name: "", teamCount: 0 },
    );
    if (largest && largest.teamCount > 2) {
      options.push(
        `Move ${short * 2} team${short * 2 === 1 ? "" : "s"} out of ${largest.name} (currently ${largest.teamCount}) to another division or Unassigned — this shrinks the demand by ${short} matches per round.`,
      );
    }
    suggestions.push({
      severity: "action",
      headline: `You're short ${short} match cell${short === 1 ? "" : "s"} per round.`,
      detail: `You need ${totalMatchesPerRound} games placed each round but only have ${cellsPerRound} cells (${courts.length} courts × ${timeslots.length} timeslots).`,
      options,
    });
  } else if (totalMatchesPerRound < cellsPerRound) {
    const spare = cellsPerRound - totalMatchesPerRound;
    const options: string[] = [];
    options.push(
      `Leave it — ${spare} cell${spare === 1 ? "" : "s"} per round will sit empty but every team still plays.`,
    );
    if (courts.length > 1 && spare >= timeslots.length) {
      options.push(
        `Remove 1 court on Step 1 to tighten the schedule (${timeslots.length} fewer cells per round).`,
      );
    }
    if (timeslots.length > 1 && spare >= courts.length) {
      options.push(
        `Remove 1 timeslot on Step 1 to tighten the schedule (${courts.length} fewer cells per round).`,
      );
    }
    options.push(
      "Add more teams across the divisions so the extra cells get used.",
    );
    suggestions.push({
      severity: "info",
      headline: `${spare} match cell${spare === 1 ? "" : "s"} per round will sit empty.`,
      detail: `You've set up ${cellsPerRound} cells but only need ${totalMatchesPerRound} games.`,
      options,
    });
  }

  // Bye suggestions. Only suggest moves that genuinely IMPROVE the bye
  // situation — never recommend swaps that just trade one odd division
  // for another.
  const oddDivisions = divisionAnalysis.filter((d) => d.hasBye);
  if (oddDivisions.length >= 2) {
    const options: string[] = [];
    // Pair-wise moves between odd divisions — both become even, net -2 byes.
    for (let i = 0; i < oddDivisions.length; i++) {
      for (let j = i + 1; j < oddDivisions.length; j++) {
        const a = oddDivisions[i];
        const b = oddDivisions[j];
        options.push(
          `Move 1 team from ${a.name} (${a.teamCount}) to ${b.name} (${b.teamCount}) — both become even (${a.teamCount - 1} and ${b.teamCount + 1}). Zero byes.`,
        );
        options.push(
          `Move 1 team from ${b.name} (${b.teamCount}) to ${a.name} (${a.teamCount}) — both become even (${b.teamCount - 1} and ${a.teamCount + 1}). Zero byes.`,
        );
      }
    }
    // Add/remove within each odd division.
    for (const d of oddDivisions) {
      options.push(
        `Add 1 team to ${d.name} (go from ${d.teamCount} to ${d.teamCount + 1}).`,
      );
      options.push(
        `Remove 1 team from ${d.name} (go from ${d.teamCount} to ${d.teamCount - 1}).`,
      );
    }
    // 3-way redistribution — if the TOTAL across all current divisions is
    // even, we can create a new division and split everyone into fully
    // even groups.
    const totalTeamsInDivisions = divisionAnalysis.reduce(
      (s, d) => s + d.teamCount,
      0,
    );
    if (totalTeamsInDivisions >= 6 && totalTeamsInDivisions % 2 === 0) {
      const target = divisionAnalysis.length + 1;
      // Three equal(ish) even groups.
      const base = Math.floor(totalTeamsInDivisions / target / 2) * 2;
      const remainder = totalTeamsInDivisions - base * (target - 1);
      const splitSizes = Array(target - 1)
        .fill(base)
        .concat([remainder]);
      // If the computed sizes aren't all even (edge case), fall back to a
      // simple even-pair split.
      const allEven = splitSizes.every((s) => s % 2 === 0 && s >= 2);
      if (allEven) {
        options.push(
          `Create a new division on Step 2 and redistribute all ${totalTeamsInDivisions} teams across ${target} divisions (${splitSizes.join(" + ")} = ${totalTeamsInDivisions}). Every division ends up even — zero byes across the whole season.`,
        );
      }
    }
    suggestions.push({
      severity: "action",
      headline: `${oddDivisions.length} divisions carry a bye every round — ${oddDivisions.map((d) => `${d.name} (${d.teamCount})`).join(", ")}.`,
      detail:
        "Each has an odd team count. Pick any option below — all leave zero byes.",
      options,
    });
  } else if (oddDivisions.length === 1) {
    const d = oddDivisions[0];
    // Only suggest fixes that genuinely clear the bye. The old suggestion
    // of pulling a team from an even donor is NOT a fix — it just moves
    // the bye.
    const options: string[] = [
      `Add 1 team to ${d.name} (go from ${d.teamCount} to ${d.teamCount + 1}).`,
      `Remove 1 team from ${d.name} (go from ${d.teamCount} to ${d.teamCount - 1}).`,
    ];
    suggestions.push({
      severity: "warning",
      headline: `${d.name} has an odd team count (${d.teamCount}) — bye every round.`,
      detail:
        "The only way to clear this bye without creating another odd division is to add or remove one team.",
      options,
    });
  }

  // Teams without a division.
  const unassigned = teams.filter((t) => !t.divisionId);
  if (unassigned.length > 0) {
    const options: string[] = [
      `Drag the ${unassigned.length} unassigned team${unassigned.length === 1 ? "" : "s"} into an existing division on Step 2.`,
    ];
    if (unassigned.length >= 2) {
      options.push(
        `Create a new division (e.g. "Division ${divisions.length + 1}") on Step 2 and drop the ${unassigned.length} unassigned team${unassigned.length === 1 ? "" : "s"} into it — gives everyone a spot to play.`,
      );
    }
    options.push(`Delete them from Step 2 if they're not playing after all.`);
    if (divisions.length === 0) {
      options.unshift("Create at least one division on Step 2 first.");
    }
    suggestions.push({
      severity: "warning",
      headline: `${unassigned.length} team${unassigned.length === 1 ? "" : "s"} still in Unassigned (${unassigned
        .map((t) => t.name)
        .slice(0, 4)
        .join(", ")}${unassigned.length > 4 ? "…" : ""}).`,
      detail: "Unassigned teams won't be in the draw.",
      options,
    });
  }

  // Big single division — a split could add variety.
  const largeDivisions = divisionAnalysis.filter((d) => d.teamCount >= 10);
  if (largeDivisions.length > 0) {
    for (const d of largeDivisions) {
      const half = Math.floor(d.teamCount / 2);
      const other = d.teamCount - half;
      const splitSuggestion =
        d.teamCount % 2 === 0
          ? `Create a new division on Step 2 and move ${half} teams across (so ${d.name} has ${half}, new one has ${other}). Both stay even — zero byes, and teams play more often in a shorter cycle.`
          : `Create a new division on Step 2 and move ${other} teams across (so ${d.name} has ${half}, new one has ${other}). Smaller cycles mean every team gets more games across the season.`;
      suggestions.push({
        severity: "info",
        headline: `${d.name} is large (${d.teamCount} teams) — a split could give everyone more play.`,
        detail:
          "A single long round-robin means each pair meets once. Two shorter brackets means teams can revisit each other and play more games across the same number of rounds.",
        options: [
          `Leave ${d.name} as-is — teams play each other once in the season.`,
          splitSuggestion,
        ],
      });
    }
  }

  // Even sizing — if divisions are wildly uneven, suggest balancing moves.
  const nonEmpty = divisionAnalysis.filter((d) => d.teamCount > 0);
  if (nonEmpty.length >= 2) {
    const counts = nonEmpty.map((d) => d.teamCount);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (max - min >= 3 && oddDivisions.length === 0) {
      const biggest = nonEmpty.find((d) => d.teamCount === max)!;
      const smallest = nonEmpty.find((d) => d.teamCount === min)!;
      const options: string[] = [];
      const movable = Math.min(
        Math.floor((max - min) / 2),
        Math.max(1, (max - min - 1) / 2),
      );
      if (movable >= 1) {
        options.push(
          `Move ${movable} team${movable === 1 ? "" : "s"} from ${biggest.name} (${max}) to ${smallest.name} (${min}) — they'd be ${max - movable} and ${min + movable}, closer in size.`,
        );
      }
      options.push(
        "Leave it — the gap doesn't hurt the fixture, but bigger divisions give those teams more games.",
      );
      suggestions.push({
        severity: "info",
        headline: `Division sizes vary a lot (${min} to ${max}).`,
        detail: nonEmpty.map((d) => `${d.name}: ${d.teamCount}`).join(" · "),
        options,
      });
    }
  }

  // Rule-induced capacity checks. For each division that has a
  // division_timeslots or division_locked_court rule, compute the
  // effective cells available per round for that division and flag
  // when it's less than matches needed.
  const divisionTimeslotsRule = new Map<string, Set<string>>();
  const divisionLockedCourtRule = new Map<string, string>();
  for (const rule of rules) {
    if (rule.ruleType === "division_timeslots") {
      const p = rule.params as { divisionId: string; timeslotIds: string[] };
      divisionTimeslotsRule.set(p.divisionId, new Set(p.timeslotIds));
    }
    if (rule.ruleType === "division_locked_court") {
      const p = rule.params as { divisionId: string; courtId: string };
      divisionLockedCourtRule.set(p.divisionId, p.courtId);
    }
  }

  for (const d of divisionAnalysis) {
    const slotCount = divisionTimeslotsRule.has(d.divisionId)
      ? divisionTimeslotsRule.get(d.divisionId)!.size
      : timeslots.length;
    const courtCount = divisionLockedCourtRule.has(d.divisionId) ? 1 : courts.length;
    const effectiveCells = slotCount * courtCount;
    if (
      d.matchesPerRound > 0 &&
      effectiveCells > 0 &&
      d.matchesPerRound > effectiveCells
    ) {
      const options: string[] = [];
      if (divisionTimeslotsRule.has(d.divisionId)) {
        options.push(
          `Add more timeslots to the "${d.name} only plays at…" rule in Step 4 (needs at least ${Math.ceil(d.matchesPerRound / courtCount)}).`,
        );
        options.push(
          `Remove the "${d.name} only plays at…" rule entirely in Step 4.`,
        );
      }
      if (divisionLockedCourtRule.has(d.divisionId)) {
        options.push(
          `Remove the "${d.name} always plays on…" rule so it can use every court.`,
        );
      }
      options.push(
        `Trim ${d.name} to ${effectiveCells * 2} team${effectiveCells * 2 === 1 ? "" : "s"} so matches/round (${effectiveCells}) fits the rule's cells.`,
      );
      suggestions.push({
        severity: "action",
        headline: `${d.name} rules give only ${effectiveCells} cell${effectiveCells === 1 ? "" : "s"} per round, but it needs ${d.matchesPerRound}.`,
        detail: `${slotCount} allowed timeslot${slotCount === 1 ? "" : "s"} × ${courtCount} allowed court${courtCount === 1 ? "" : "s"} = ${effectiveCells} slots. Games will be left unplaced each round.`,
        options,
      });
    }
  }

  // Always offer an "add a division" assessment so the organiser sees it
  // considered and knows whether it would move the needle or not.
  if (nonEmpty.length >= 1) {
    const totalTeamsInDivisions = divisionAnalysis.reduce(
      (s, d) => s + d.teamCount,
      0,
    );
    const target = divisions.length + 1;
    const addDivOptions: string[] = [];
    let addDivHeadline = "Would adding another division help?";
    let addDivDetail = "";
    const totalEven = totalTeamsInDivisions % 2 === 0;
    const totalOdd = !totalEven;

    if (oddDivisions.length >= 2 && totalEven && target >= 2) {
      const perDiv = Math.floor(totalTeamsInDivisions / target / 2) * 2;
      const last =
        totalTeamsInDivisions - perDiv * (target - 1);
      const sizes = Array(target - 1).fill(perDiv).concat([last]);
      const allEven = sizes.every((s) => s % 2 === 0 && s >= 2);
      addDivDetail = `Yes — your ${totalTeamsInDivisions} teams total could be redistributed across ${target} divisions to clear every bye.`;
      if (allEven) {
        addDivOptions.push(
          `Create a new division on Step 2 and redistribute everyone into ${sizes.join(" + ")} = ${totalTeamsInDivisions}. All even, zero byes.`,
        );
      }
      addDivOptions.push(
        `A new division doesn't just fix the odd division it draws from — it changes the team distribution across every division together, so plan the split as a whole-of-competition move.`,
      );
    } else if (oddDivisions.length === 1 && totalOdd) {
      addDivDetail = `Not for byes. Your total team count (${totalTeamsInDivisions}) is odd, so at least one division will carry a bye no matter how you split the teams. Adding or removing a team is the only way to clear the bye.`;
      addDivOptions.push(
        `Add 1 team overall (to reach ${totalTeamsInDivisions + 1}, an even count) so a split into even-size divisions becomes possible.`,
      );
      addDivOptions.push(
        `Remove 1 team overall (to reach ${totalTeamsInDivisions - 1}, an even count) so a split into even-size divisions becomes possible.`,
      );
    } else if (nonEmpty.some((d) => d.teamCount >= 10)) {
      addDivDetail = `Byes aren't the issue here, but adding another division could be worth it for match variety. A single long round-robin only pairs each team once; two shorter brackets lets teams revisit each other across the same rounds.`;
      for (const d of nonEmpty.filter((x) => x.teamCount >= 10)) {
        const half = Math.floor(d.teamCount / 2);
        addDivOptions.push(
          `Split ${d.name} into two divisions (${half} + ${d.teamCount - half} = ${d.teamCount}) for more focused play.`,
        );
      }
      addDivOptions.push(
        `Leave the current structure — fewer, bigger divisions means every team plays every other team at least once in the season.`,
      );
    } else {
      addDivDetail = `Not needed right now. ${
        oddDivisions.length === 0
          ? `All divisions are even, so byes aren't a problem. `
          : ""
      }Divisions are a reasonable size, so a split wouldn't change byes or match counts materially.`;
      addDivOptions.push(
        `Leave the structure as-is — adding a division now would redistribute teams across every division together, not just add to one, and your current math is fine.`,
      );
      addDivOptions.push(
        `Add a division anyway if you want more focused brackets (e.g. a dedicated beginners' or seniors' division).`,
      );
    }

    suggestions.push({
      severity: "info",
      headline: addDivHeadline,
      detail: addDivDetail,
      options: addDivOptions,
    });
  }

  if (
    suggestions.filter((s) => s.severity === "action" || s.severity === "warning").length === 0 &&
    cellsPerRound > 0 &&
    totalMatchesPerRound > 0
  ) {
    const activeRules = rules.length;
    suggestions.unshift({
      severity: "info",
      headline: "Everything looks tidy — ready to build.",
      detail: `${totalMatchesPerRound} matches a round into ${cellsPerRound} cells, no divisions with byes, no unassigned teams${activeRules > 0 ? `, ${activeRules} rule${activeRules === 1 ? "" : "s"} active and workable` : ""}.`,
      options: [],
    });
  }

  return {
    cellsPerRound,
    totalMatchesPerRound,
    utilizationPct,
    divisions: divisionAnalysis,
    suggestions,
  };
}

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
  // Track which rule contributed to each unplaced game so we can report
  // "I did my best — rule X cost you N games" afterwards.
  const ruleContributions = new Map<string, number>();

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
  const sharedGroups: Array<{ ruleId: string; teams: Set<string> }> = [];
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
        sharedGroups.push({
          ruleId: rule.id,
          teams: new Set(p.teamIds as string[]),
        });
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
      // division_locked_court is applied below alongside legacy
      // division.lockedCourtId.
    }
  }

  // Divisions can be locked to a court either via the legacy
  // divisions.locked_court_id column (deprecated UI) OR via a
  // division_locked_court rule. The rule wins if both are present.
  const divisionLockedCourt = new Map<string, string | null>(
    divisions.map((d) => [d.id, d.lockedCourtId] as const),
  );
  for (const rule of rules) {
    if (rule.ruleType === "division_locked_court") {
      const p = rule.params as { divisionId: string; courtId: string };
      divisionLockedCourt.set(p.divisionId, p.courtId);
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

    // Order most-constrained first: count how many (court × timeslot) cells
    // each pairing could legally go in, given every rule and whatever's
    // already locked by division. Fewer options → placed first, so a
    // pairing with 2 valid slots doesn't lose them to a pairing that could
    // go anywhere.
    function countValidCells(p: Pairing): number {
      if (p.isBye) return Number.MAX_SAFE_INTEGER;
      const divAllow = divisionAllowed.get(p.divisionId);
      const forcedCourt = divisionLockedCourt.get(p.divisionId);
      const candidates = forcedCourt
        ? courts.filter((c) => c.id === forcedCourt)
        : courts;
      const reqA = p.teamAId ? required.get(p.teamAId) : undefined;
      const reqB = p.teamBId ? required.get(p.teamBId) : undefined;
      let count = 0;
      for (const slot of timeslots) {
        if (divAllow && !divAllow.has(slot.id)) continue;
        if (reqA && !reqA.has(slot.id)) continue;
        if (reqB && !reqB.has(slot.id)) continue;
        if (
          (p.teamAId && forbidden.get(p.teamAId)?.has(slot.id)) ||
          (p.teamBId && forbidden.get(p.teamBId)?.has(slot.id))
        )
          continue;
        for (const c of candidates) {
          if (courtClosed.get(c.id)?.has(r)) continue;
          count += 1;
        }
      }
      return count;
    }
    const scored = roundPairings
      .map((p) => ({ p, options: countValidCells(p) }))
      .sort((a, b) => a.options - b.options)
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
            !(pairing.teamAId && g.teams.has(pairing.teamAId)) &&
            !(pairing.teamBId && g.teams.has(pairing.teamBId))
          )
            continue;
          for (const [teamId, atSlot] of teamAtTimeslot) {
            if (
              g.teams.has(teamId) &&
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
        // Soft-constraint pass. The strict pass couldn't fit this pairing
        // anywhere — rather than drop it, find the cell that violates the
        // fewest rules and place it there with a note. Only truly fall
        // back to "unplaced" when every cell is physically taken.
        let bestCell: {
          slot: CompetitionTimeslot;
          court: CompetitionCourt;
          violations: RuleViolation[];
        } | null = null;

        for (const slot of timeslots) {
          for (const court of courts) {
            const cellKey = `${court.id}:${slot.id}`;
            if (cellTaken.has(cellKey)) continue;
            const violations: RuleViolation[] = [];

            if (allowedForDivision && !allowedForDivision.has(slot.id)) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "division_timeslots" &&
                  (rr.params as { divisionId: string }).divisionId ===
                    pairing.divisionId,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            if (pairing.teamAId && forbidden.get(pairing.teamAId)?.has(slot.id)) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "team_timeslot_forbidden" &&
                  (rr.params as { teamId: string }).teamId === pairing.teamAId,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            if (pairing.teamBId && forbidden.get(pairing.teamBId)?.has(slot.id)) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "team_timeslot_forbidden" &&
                  (rr.params as { teamId: string }).teamId === pairing.teamBId,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            const reqA = pairing.teamAId ? required.get(pairing.teamAId) : null;
            if (reqA && !reqA.has(slot.id)) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "team_timeslot_required" &&
                  (rr.params as { teamId: string }).teamId === pairing.teamAId,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            const reqB = pairing.teamBId ? required.get(pairing.teamBId) : null;
            if (reqB && !reqB.has(slot.id)) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "team_timeslot_required" &&
                  (rr.params as { teamId: string }).teamId === pairing.teamBId,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            if (courtClosed.get(court.id)?.has(r)) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "court_closed_round" &&
                  (rr.params as { courtId: string; roundNumber: number }).courtId ===
                    court.id &&
                  (rr.params as { courtId: string; roundNumber: number })
                    .roundNumber === r,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            if (forcedCourtId && court.id !== forcedCourtId) {
              const rule = rules.find(
                (rr) =>
                  rr.ruleType === "division_locked_court" &&
                  (rr.params as { divisionId: string }).divisionId ===
                    pairing.divisionId,
              );
              if (rule)
                violations.push({
                  ruleId: rule.id,
                  plainEnglish: rule.plainEnglish,
                });
            }
            // teams_different_times — shared-time partner already here?
            for (const g of sharedGroups) {
              if (
                !(pairing.teamAId && g.teams.has(pairing.teamAId)) &&
                !(pairing.teamBId && g.teams.has(pairing.teamBId))
              )
                continue;
              let hit = false;
              for (const [teamId, atSlot] of teamAtTimeslot) {
                if (
                  g.teams.has(teamId) &&
                  atSlot === slot.id &&
                  teamId !== pairing.teamAId &&
                  teamId !== pairing.teamBId
                ) {
                  hit = true;
                  break;
                }
              }
              if (hit) {
                const rule = rules.find((rr) => rr.id === g.ruleId);
                if (rule)
                  violations.push({
                    ruleId: rule.id,
                    plainEnglish: rule.plainEnglish,
                  });
                break;
              }
            }

            if (
              bestCell === null ||
              violations.length < bestCell.violations.length
            ) {
              bestCell = { slot, court, violations };
              if (violations.length === 0) break;
            }
          }
          if (bestCell && bestCell.violations.length === 0) break;
        }

        if (bestCell) {
          const cellKey = `${bestCell.court.id}:${bestCell.slot.id}`;
          cellTaken.add(cellKey);
          if (pairing.teamAId)
            teamAtTimeslot.set(pairing.teamAId, bestCell.slot.id);
          if (pairing.teamBId)
            teamAtTimeslot.set(pairing.teamBId, bestCell.slot.id);
          for (const v of bestCell.violations) {
            ruleContributions.set(
              v.ruleId,
              (ruleContributions.get(v.ruleId) ?? 0) + 1,
            );
          }
          games.push({
            round: r,
            divisionId: pairing.divisionId,
            teamAId: pairing.teamAId,
            teamBId: pairing.teamBId,
            isBye: false,
            courtId: bestCell.court.id,
            timeslotId: bestCell.slot.id,
            violations: bestCell.violations,
          });
          if (bestCell.violations.length > 0) {
            issues.push(
              `Round ${r} — ${teamName(teams, pairing.teamAId)} v ${teamName(teams, pairing.teamBId)} placed on ${bestCell.court.name} at ${bestCell.slot.label} with ${bestCell.violations.length} rule compromise${bestCell.violations.length === 1 ? "" : "s"}: ${bestCell.violations.map((v) => `"${v.plainEnglish}"`).join("; ")}`,
            );
          }
          placed = true;
          continue;
        }

        // Only truly unplaced if every cell is physically taken.
        // Work out WHICH rule blocked every available slot, so we can
        // tell the organiser something useful.
        const reasons = new Set<string>();
        const blamedRuleIds = new Set<string>();
        for (const slot of timeslots) {
          const slotLabel = slot.label;
          if (allowedForDivision && !allowedForDivision.has(slot.id)) {
            const rule = rules.find(
              (rr) =>
                rr.ruleType === "division_timeslots" &&
                (rr.params as { divisionId: string }).divisionId ===
                  pairing.divisionId,
            );
            if (rule) blamedRuleIds.add(rule.id);
            reasons.add(
              `${nameOf(divisions, pairing.divisionId)} is restricted to timeslots that don't include ${slotLabel} (rule: "Division only plays at certain timeslots").`,
            );
            continue;
          }
          const reqA = pairing.teamAId
            ? required.get(pairing.teamAId)
            : undefined;
          const reqB = pairing.teamBId
            ? required.get(pairing.teamBId)
            : undefined;
          if (reqA && !reqA.has(slot.id)) {
            const rule = rules.find(
              (rr) =>
                rr.ruleType === "team_timeslot_required" &&
                (rr.params as { teamId: string }).teamId === pairing.teamAId,
            );
            if (rule) blamedRuleIds.add(rule.id);
            reasons.add(
              `${teamName(teams, pairing.teamAId)} has a required-timeslot rule that excludes ${slotLabel}.`,
            );
            continue;
          }
          if (reqB && !reqB.has(slot.id)) {
            const rule = rules.find(
              (rr) =>
                rr.ruleType === "team_timeslot_required" &&
                (rr.params as { teamId: string }).teamId === pairing.teamBId,
            );
            if (rule) blamedRuleIds.add(rule.id);
            reasons.add(
              `${teamName(teams, pairing.teamBId)} has a required-timeslot rule that excludes ${slotLabel}.`,
            );
            continue;
          }
          if (
            (pairing.teamAId &&
              forbidden.get(pairing.teamAId)?.has(slot.id)) ||
            (pairing.teamBId &&
              forbidden.get(pairing.teamBId)?.has(slot.id))
          ) {
            const rule = rules.find(
              (rr) =>
                rr.ruleType === "team_timeslot_forbidden" &&
                ((rr.params as { teamId: string }).teamId === pairing.teamAId ||
                  (rr.params as { teamId: string }).teamId === pairing.teamBId),
            );
            if (rule) blamedRuleIds.add(rule.id);
            reasons.add(
              `A forbidden-timeslot rule blocks ${slotLabel} for one of the teams in this game.`,
            );
            continue;
          }
          // All cells on this slot taken (common case) — note it only
          // if nothing more specific explained the failure.
          const slotFull = candidateCourts.every((c) =>
            cellTaken.has(`${c.id}:${slot.id}`),
          );
          if (slotFull) {
            reasons.add(
              `${slotLabel} is already full (every court at that slot is used by another game this round).`,
            );
          }
        }
        for (const id of blamedRuleIds) {
          ruleContributions.set(id, (ruleContributions.get(id) ?? 0) + 1);
        }

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
            reasons.size > 0
              ? Array.from(reasons).join(" ")
              : "No court × timeslot combination satisfied every rule for this game.",
        });
        const headline = `Round ${r} — ${teamName(teams, pairing.teamAId)} v ${teamName(teams, pairing.teamBId)} (${nameOf(divisions, pairing.divisionId)}) couldn't be placed`;
        issues.push(
          reasons.size > 0
            ? `${headline}: ${Array.from(reasons).join(" ")}`
            : `${headline} under the current rules.`,
        );
      }
    }
  }

  const ruleOutcomes: RuleOutcome[] = rules.map((rule) => ({
    ruleId: rule.id,
    plainEnglish: rule.plainEnglish,
    ruleType: rule.ruleType,
    contributedToUnplaced: ruleContributions.get(rule.id) ?? 0,
  }));

  return { games, issues, ruleOutcomes };
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

function teamName(
  teams: CompetitionTeam[],
  id: string | null,
): string {
  if (!id) return "(bye)";
  return teams.find((t) => t.id === id)?.name ?? "(removed team)";
}
