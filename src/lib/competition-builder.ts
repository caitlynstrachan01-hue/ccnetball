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

export type CompetitionLicence = {
  id: string;
  userId: string;
  purchasedAt: string;
  consumedByCompetitionId: string | null;
  consumedAt: string | null;
};

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
