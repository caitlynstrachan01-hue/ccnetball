export type FillMode = "even" | "maximum_play";

export type Competition = {
  id: string;
  ownerUserId: string;
  licenceId: string;
  name: string;
  startDate: string; // ISO date
  roundsHomeAndAway: number;
  hasFinals: boolean;
  fillMode: FillMode;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompetitionCourt = {
  id: string;
  competitionId: string;
  name: string;
  ordinal: number;
};

export type CompetitionTimeslot = {
  id: string;
  competitionId: string;
  label: string;
  startsAtMinutes: number | null;
  ordinal: number;
};

export type CompetitionDivision = {
  id: string;
  competitionId: string;
  name: string;
  ordinal: number;
  lockedCourtId: string | null;
};

export type CompetitionTeam = {
  id: string;
  competitionId: string;
  name: string;
  divisionId: string | null;
};

export type FixtureGame = {
  id: string;
  roundNumber: number;
  courtId: string | null;
  timeslotId: string | null;
  teamAId: string | null;
  teamBId: string | null;
  isBye: boolean;
};

export type CompetitionLicence = {
  id: string;
  userId: string;
  purchasedAt: string;
  consumedByCompetitionId: string | null;
  consumedAt: string | null;
};

/**
 * Rules — the plain-English constraints the fixture must honour.
 * Params shapes are per-type; the UI composes the plain-English text when
 * a rule is created and we persist that alongside params for easy display.
 */
export type RuleType =
  | "team_timeslot_required"
  | "team_timeslot_forbidden"
  | "teams_different_times"
  | "court_closed_round"
  | "division_timeslots"
  | "division_locked_court"
  | "team_bye_round";

export type RuleParams =
  | { type: "team_timeslot_required"; teamId: string; timeslotIds: string[] }
  | { type: "team_timeslot_forbidden"; teamId: string; timeslotIds: string[] }
  | { type: "teams_different_times"; teamIds: string[] }
  | { type: "court_closed_round"; courtId: string; roundNumber: number }
  | { type: "division_timeslots"; divisionId: string; timeslotIds: string[] }
  | { type: "division_locked_court"; divisionId: string; courtId: string }
  | { type: "team_bye_round"; teamId: string; roundNumber: number };

export type Rule = {
  id: string;
  competitionId: string;
  ruleType: RuleType;
  params: Omit<RuleParams, "type">;
  plainEnglish: string;
  createdAt: string;
};

export const RULE_TYPE_LABELS: Record<
  RuleType,
  { label: string; help: string }
> = {
  team_timeslot_required: {
    label: "A team can only play at certain timeslots",
    help: "e.g. the Lions can only play at 8:30 AM.",
  },
  team_timeslot_forbidden: {
    label: "A team can never play at certain timeslots",
    help: "e.g. the Falcons can never play before 10:00 AM.",
  },
  teams_different_times: {
    label: "Two or more teams can never play at the same time",
    help: "Use this whenever teams share a person across the season — a shared coach, a shared umpire who also plays, or a player who rotates between two teams. Applies to every round.",
  },
  court_closed_round: {
    label: "A court is out of play for one round",
    help: "e.g. Court 2 is closed in round 7.",
  },
  division_timeslots: {
    label: "A division only plays at certain timeslots",
    help: "e.g. Division 1 only plays in the early timeslots.",
  },
  division_locked_court: {
    label: "A division must play on a specific court",
    help: "Every game in that division is scheduled on the chosen court for the season.",
  },
  team_bye_round: {
    label: "A specific team has a bye in a nominated round",
    help: "Use for a team that can't play one week.",
  },
};

export function renderRulePlainEnglish(
  ruleType: RuleType,
  params: Omit<RuleParams, "type">,
  context: {
    teams: Array<{ id: string; name: string }>;
    timeslots: Array<{ id: string; label: string }>;
    courts: Array<{ id: string; name: string }>;
    divisions: Array<{ id: string; name: string }>;
  },
): string {
  const teamName = (id: string) =>
    context.teams.find((t) => t.id === id)?.name ?? "(removed team)";
  const timeslotLabel = (id: string) =>
    context.timeslots.find((t) => t.id === id)?.label ?? "(removed timeslot)";
  const courtName = (id: string) =>
    context.courts.find((c) => c.id === id)?.name ?? "(removed court)";
  const divisionName = (id: string) =>
    context.divisions.find((d) => d.id === id)?.name ?? "(removed division)";
  const list = (items: string[]) =>
    items.length <= 1
      ? items[0] ?? ""
      : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];

  switch (ruleType) {
    case "team_timeslot_required": {
      const p = params as { teamId: string; timeslotIds: string[] };
      return `${teamName(p.teamId)} can only play at ${list(
        p.timeslotIds.map(timeslotLabel),
      )}.`;
    }
    case "team_timeslot_forbidden": {
      const p = params as { teamId: string; timeslotIds: string[] };
      return `${teamName(p.teamId)} can never play at ${list(
        p.timeslotIds.map(timeslotLabel),
      )}.`;
    }
    case "teams_different_times": {
      const p = params as { teamIds: string[] };
      return `${list(p.teamIds.map(teamName))} must never be scheduled at the same time.`;
    }
    case "court_closed_round": {
      const p = params as { courtId: string; roundNumber: number };
      return `${courtName(p.courtId)} is out of play in round ${p.roundNumber}.`;
    }
    case "division_timeslots": {
      const p = params as { divisionId: string; timeslotIds: string[] };
      return `${divisionName(p.divisionId)} only plays at ${list(
        p.timeslotIds.map(timeslotLabel),
      )}.`;
    }
    case "division_locked_court": {
      const p = params as { divisionId: string; courtId: string };
      return `${divisionName(p.divisionId)} always plays on ${courtName(p.courtId)}.`;
    }
    case "team_bye_round": {
      const p = params as { teamId: string; roundNumber: number };
      return `${teamName(p.teamId)} has a bye in round ${p.roundNumber}.`;
    }
  }
}

export const FILL_MODE_LABELS: Record<FillMode, { label: string; detail: string }> =
  {
    even: {
      label: "Even",
      detail: "Whole cycles only — every pair of teams meets the same number of times. Leftover rounds become byes.",
    },
    maximum_play: {
      label: "Maximum play",
      detail: "Fills every round. Some pairs meet one extra time. Byes kept to a minimum.",
    },
  };
