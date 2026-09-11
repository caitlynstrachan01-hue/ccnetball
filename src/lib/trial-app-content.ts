export type Position =
  | "GS" | "GA" | "WA" | "C" | "WD" | "GD" | "GK";

export const ALL_POSITIONS: Position[] = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];

export type SampleTrial = {
  name: string;
  club: string;
  date: string;
  venue: string;
  courts: number;
  ageGroup: string;
  maxPlayers: number;
  feePerParticipant: number;
  additionalFees: { label: string; amount: number }[];
  feeAbsorbedByClub: boolean;
  shareUrl: string;
};

export const SAMPLE_TRIAL: SampleTrial = {
  name: "2027 Under-15 Rep Trials",
  club: "Underwood Netball Association",
  date: "Wednesday 3 Feb 2027, 5:30 pm – 8:00 pm",
  venue: "Underwood Netball Complex — Court 1 & 2",
  courts: 2,
  ageGroup: "Under 15",
  maxPlayers: 32,
  feePerParticipant: 15,
  additionalFees: [
    { label: "Independent selectors", amount: 4 },
    { label: "Umpires", amount: 3 },
    { label: "Court hire", amount: 2 },
  ],
  feeAbsorbedByClub: false,
  shareUrl: "ccnetball.com/trials/underwood-u15-2027",
};

export type SamplePlayer = {
  name: string;
  age: number;
  club: string;
  positions: Position[];
  attended: boolean;
  rating?: number; // 1–5, filled by selectors on the night
  notes?: string;
};

export const SAMPLE_PLAYERS: SamplePlayer[] = [
  { name: "Amelia Chen",       age: 14, club: "Underwood",   positions: ["GS", "GA"],  attended: true,  rating: 5, notes: "Composed under pressure, high shooting %." },
  { name: "Sophie Nguyen",     age: 14, club: "Underwood",   positions: ["GA", "WA"],  attended: true,  rating: 4 },
  { name: "Isla Martin",       age: 15, club: "Sunnybank",   positions: ["WA", "C"],   attended: true,  rating: 5, notes: "Strong court vision, great feed timing." },
  { name: "Charlotte Reilly",  age: 14, club: "Beenleigh",   positions: ["C", "WD"],   attended: true,  rating: 4 },
  { name: "Mia Anderson",      age: 15, club: "Underwood",   positions: ["WD", "GD"],  attended: true,  rating: 4, notes: "Consistent defensive pressure." },
  { name: "Grace Davies",      age: 14, club: "MacGregor",   positions: ["GD", "GK"],  attended: true,  rating: 5 },
  { name: "Ruby Patel",        age: 14, club: "Sunnybank",   positions: ["GK", "GD"],  attended: true,  rating: 4 },
  { name: "Olivia Smith",      age: 15, club: "Underwood",   positions: ["GS"],        attended: true,  rating: 3 },
  { name: "Emma Wilson",       age: 14, club: "Beenleigh",   positions: ["GA", "WA"],  attended: true,  rating: 4 },
  { name: "Zoe Bailey",        age: 14, club: "Underwood",   positions: ["WA", "C"],   attended: true,  rating: 3 },
  { name: "Chloe Henderson",   age: 15, club: "MacGregor",   positions: ["C"],         attended: true,  rating: 4 },
  { name: "Hannah Costa",      age: 14, club: "Underwood",   positions: ["WD"],        attended: true,  rating: 3 },
  { name: "Layla Barros",      age: 15, club: "Sunnybank",   positions: ["GD", "WD"],  attended: true,  rating: 4 },
  { name: "Ava Thompson",      age: 14, club: "Underwood",   positions: ["GK"],        attended: true,  rating: 3 },
  { name: "Poppy Walsh",       age: 15, club: "Beenleigh",   positions: ["GS", "GA"],  attended: false, notes: "Illness — deferred to Week 2 trial." },
  { name: "Freya O'Brien",     age: 14, club: "MacGregor",   positions: ["WA"],        attended: true,  rating: 3 },
  { name: "Bella Rodriguez",   age: 14, club: "Underwood",   positions: ["C", "WA"],   attended: true,  rating: 4 },
  { name: "Willow Tanaka",     age: 15, club: "Sunnybank",   positions: ["WD", "C"],   attended: true,  rating: 3 },
  { name: "Elsie Papadopoulos",age: 14, club: "Underwood",   positions: ["GD"],        attended: true,  rating: 3 },
  { name: "Harper Singh",      age: 15, club: "Beenleigh",   positions: ["GK", "GD"],  attended: true,  rating: 4 },
];

export type SampleTeam = {
  name: string;
  players: { name: string; position: Position }[];
};

// Populated by the mock allocator — one team per court, balanced by position.
export const SAMPLE_TEAMS: SampleTeam[] = [
  {
    name: "Team A — Court 1",
    players: [
      { name: "Amelia Chen",         position: "GS" },
      { name: "Emma Wilson",         position: "GA" },
      { name: "Isla Martin",         position: "WA" },
      { name: "Charlotte Reilly",    position: "C" },
      { name: "Hannah Costa",        position: "WD" },
      { name: "Grace Davies",        position: "GD" },
      { name: "Ava Thompson",        position: "GK" },
    ],
  },
  {
    name: "Team B — Court 1",
    players: [
      { name: "Sophie Nguyen",       position: "GS" },
      { name: "Olivia Smith",        position: "GA" },
      { name: "Freya O'Brien",       position: "WA" },
      { name: "Chloe Henderson",     position: "C" },
      { name: "Mia Anderson",        position: "WD" },
      { name: "Elsie Papadopoulos",  position: "GD" },
      { name: "Ruby Patel",          position: "GK" },
    ],
  },
  {
    name: "Team C — Court 2",
    players: [
      { name: "Zoe Bailey",          position: "GS" },
      { name: "Bella Rodriguez",     position: "GA" },
      { name: "Willow Tanaka",       position: "WA" },
      { name: "Layla Barros",        position: "C" },
      { name: "Harper Singh",        position: "WD" },
      // spares
    ],
  },
];
