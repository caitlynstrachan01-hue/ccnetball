export type Position =
  | "GS" | "GA" | "WA" | "C" | "WD" | "GD" | "GK";

export const ALL_POSITIONS: Position[] = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];

export type TrialSession = {
  date: string;
  ageGroup: string;
  timeSlot: string;
  venue: string;
};

export type SampleTrial = {
  name: string;
  club: string;
  courts: number;
  ageGroups: string[];
  days: number;
  schedule: TrialSession[];
  /** Number of teams to be selected per age group, or 'all' to include every attending player. */
  teamsToSelect: number | "all";
  feePerParticipant: number;
  additionalFees: { label: string; amount: number }[];
  /** If true, the association is invoiced after trials for participant × fee. */
  associationPaysFees: boolean;
  shareUrl: string;
};

export const SAMPLE_TRIAL: SampleTrial = {
  name: "2027 Rep Trials",
  club: "Underwood Netball Association",
  courts: 1,
  ageGroups: ["Under 13", "Under 15"],
  days: 3,
  schedule: [
    { date: "Wednesday 3 Feb 2027",  ageGroup: "Under 13", timeSlot: "5:30 pm – 7:00 pm", venue: "Nissen Arena" },
    { date: "Wednesday 10 Feb 2027", ageGroup: "Under 15", timeSlot: "5:30 pm – 7:00 pm", venue: "Nissen Arena" },
    { date: "Friday 12 Feb 2027",    ageGroup: "Under 15", timeSlot: "5:30 pm – 7:00 pm", venue: "Beenleigh Sports Centre" },
  ],
  teamsToSelect: 3,
  feePerParticipant: 2.2,
  additionalFees: [
    { label: "Independent Selector", amount: 0 },
    { label: "Umpires", amount: 0 },
    { label: "Court hire", amount: 0 },
    { label: "Other", amount: 0 },
  ],
  associationPaysFees: false,
  shareUrl: "ccnetball.com/trials/underwood-2027",
};

export type SamplePlayer = {
  name: string;
  age: number;
  club: string;
  positions: Position[];
  attended: boolean;
};

export const SAMPLE_PLAYERS: SamplePlayer[] = [
  { name: "Amelia Chen",        age: 14, club: "Underwood",  positions: ["GS", "GA"],  attended: true  },
  { name: "Sophie Nguyen",      age: 14, club: "Underwood",  positions: ["GA", "WA"],  attended: true  },
  { name: "Isla Martin",        age: 15, club: "Sunnybank",  positions: ["WA", "C"],   attended: true  },
  { name: "Charlotte Reilly",   age: 14, club: "Beenleigh",  positions: ["C", "WD"],   attended: true  },
  { name: "Mia Anderson",       age: 15, club: "Underwood",  positions: ["WD", "GD"],  attended: true  },
  { name: "Grace Davies",       age: 14, club: "MacGregor",  positions: ["GD", "GK"],  attended: true  },
  { name: "Ruby Patel",         age: 14, club: "Sunnybank",  positions: ["GK", "GD"],  attended: true  },
  { name: "Olivia Smith",       age: 15, club: "Underwood",  positions: ["GS"],        attended: true  },
  { name: "Emma Wilson",        age: 14, club: "Beenleigh",  positions: ["GA", "WA"],  attended: true  },
  { name: "Zoe Bailey",         age: 14, club: "Underwood",  positions: ["WA", "C"],   attended: true  },
  { name: "Chloe Henderson",    age: 15, club: "MacGregor",  positions: ["C"],         attended: true  },
  { name: "Hannah Costa",       age: 14, club: "Underwood",  positions: ["WD"],        attended: true  },
  { name: "Layla Barros",       age: 15, club: "Sunnybank",  positions: ["GD", "WD"],  attended: true  },
  { name: "Ava Thompson",       age: 14, club: "Underwood",  positions: ["GK"],        attended: true  },
  { name: "Poppy Walsh",        age: 15, club: "Beenleigh",  positions: ["GS", "GA"],  attended: false },
  { name: "Freya O'Brien",      age: 14, club: "MacGregor",  positions: ["WA"],        attended: true  },
  { name: "Bella Rodriguez",    age: 14, club: "Underwood",  positions: ["C", "WA"],   attended: true  },
  { name: "Willow Tanaka",      age: 15, club: "Sunnybank",  positions: ["WD", "C"],   attended: true  },
  { name: "Elsie Papadopoulos", age: 14, club: "Underwood",  positions: ["GD"],        attended: true  },
  { name: "Harper Singh",       age: 15, club: "Beenleigh",  positions: ["GK", "GD"],  attended: true  },
];

export type SampleGameTeam = {
  label: "Team A" | "Team B";
  lineup: { position: Position; name: string }[];
};

export type SampleGame = {
  name: string;
  teams: SampleGameTeam[];
  bench: string[];
};

// Populated by the mock allocator — each game has two 7-a-side lineups
// listed goal shooter through to goalkeeper. Players rotate across games
// so every attending player gets time on court.
export const SAMPLE_GAMES: SampleGame[] = [
  {
    name: "Game 1",
    teams: [
      {
        label: "Team A",
        lineup: [
          { position: "GS", name: "Amelia Chen" },
          { position: "GA", name: "Sophie Nguyen" },
          { position: "WA", name: "Hannah Costa" },     // out of position (prefers WD)
          { position: "C",  name: "Charlotte Reilly" },
          { position: "WD", name: "Isla Martin" },      // out of position (prefers WA/C)
          { position: "GD", name: "Grace Davies" },
          { position: "GK", name: "Ava Thompson" },
        ],
      },
      {
        label: "Team B",
        lineup: [
          { position: "GS", name: "Olivia Smith" },
          { position: "GA", name: "Emma Wilson" },
          { position: "WA", name: "Freya O'Brien" },
          { position: "C",  name: "Chloe Henderson" },
          { position: "WD", name: "Mia Anderson" },
          { position: "GD", name: "Elsie Papadopoulos" },
          { position: "GK", name: "Ruby Patel" },
        ],
      },
    ],
    bench: [
      "Zoe Bailey",
      "Bella Rodriguez",
      "Willow Tanaka",
      "Layla Barros",
      "Harper Singh",
    ],
  },
  {
    name: "Game 2",
    teams: [
      {
        label: "Team A",
        lineup: [
          { position: "GS", name: "Olivia Smith" },
          { position: "GA", name: "Emma Wilson" },
          { position: "WA", name: "Zoe Bailey" },
          { position: "C",  name: "Chloe Henderson" },
          { position: "WD", name: "Mia Anderson" },
          { position: "GD", name: "Layla Barros" },
          { position: "GK", name: "Ruby Patel" },
        ],
      },
      {
        label: "Team B",
        lineup: [
          { position: "GS", name: "Amelia Chen" },
          { position: "GA", name: "Sophie Nguyen" },
          { position: "WA", name: "Bella Rodriguez" },
          { position: "C",  name: "Isla Martin" },
          { position: "WD", name: "Willow Tanaka" },
          { position: "GD", name: "Harper Singh" },
          { position: "GK", name: "Grace Davies" },
        ],
      },
    ],
    bench: [
      "Charlotte Reilly",
      "Hannah Costa",
      "Ava Thompson",
      "Freya O'Brien",
      "Elsie Papadopoulos",
    ],
  },
];
