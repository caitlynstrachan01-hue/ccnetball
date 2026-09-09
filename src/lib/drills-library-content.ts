export type Drill = {
  slug: string;
  title: string;
  durationMinutes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  focus: string;
};

export type DrillCategory = {
  slug: string;
  name: string;
  short: string;
  drills: Drill[];
};

// Sample data — replace with your real categories, drills and order.
export const DRILL_CATEGORIES: DrillCategory[] = [
  {
    slug: "warm-up",
    name: "Warm-Up & Activation",
    short: "Prime the body for high-quality training.",
    drills: [
      { slug: "dynamic-mobility", title: "Dynamic mobility flow", durationMinutes: 6, level: "Beginner", focus: "Movement prep" },
      { slug: "ball-handling", title: "Ball handling routine", durationMinutes: 8, level: "Beginner", focus: "Ball feel" },
      { slug: "court-patterns", title: "Court movement patterns", durationMinutes: 7, level: "Intermediate", focus: "Footwork" },
      { slug: "partner-passing", title: "Partner passing warm-up", durationMinutes: 10, level: "Beginner", focus: "Passing" },
      { slug: "full-body-activation", title: "Full-body activation", durationMinutes: 6, level: "Beginner", focus: "Activation" },
    ],
  },
  {
    slug: "attacking",
    name: "Attacking Plays",
    short: "Entries, movement, and pressure attacks.",
    drills: [
      { slug: "centre-pass-basics", title: "Centre pass entry basics", durationMinutes: 12, level: "Beginner", focus: "Set plays" },
      { slug: "advanced-centre-pass", title: "Advanced centre pass patterns", durationMinutes: 15, level: "Advanced", focus: "Set plays" },
      { slug: "circle-edge-movement", title: "Circle edge movement", durationMinutes: 10, level: "Intermediate", focus: "Movement" },
      { slug: "two-way-splits", title: "Two-way splits", durationMinutes: 9, level: "Intermediate", focus: "Movement" },
      { slug: "overloads-diagonals", title: "Overloads and diagonals", durationMinutes: 12, level: "Advanced", focus: "Space creation" },
      { slug: "fast-break-transitions", title: "Fast-break transitions", durationMinutes: 14, level: "Advanced", focus: "Transition" },
      { slug: "set-pieces-from-base", title: "Set pieces from the base", durationMinutes: 11, level: "Intermediate", focus: "Set plays" },
      { slug: "attacking-under-pressure", title: "Attacking under pressure", durationMinutes: 13, level: "Advanced", focus: "Pressure" },
    ],
  },
  {
    slug: "defending",
    name: "Defensive Systems",
    short: "One-on-one work through full-court systems.",
    drills: [
      { slug: "one-on-one-fundamentals", title: "One-on-one defence fundamentals", durationMinutes: 11, level: "Beginner", focus: "Fundamentals" },
      { slug: "tracking-boxing-out", title: "Tracking and boxing out", durationMinutes: 10, level: "Intermediate", focus: "Positioning" },
      { slug: "zone-press", title: "Zone press", durationMinutes: 14, level: "Advanced", focus: "Team defence" },
      { slug: "half-court-trap", title: "Half-court trap", durationMinutes: 12, level: "Advanced", focus: "Team defence" },
      { slug: "deflection-technique", title: "Deflection technique", durationMinutes: 9, level: "Intermediate", focus: "Hands" },
      { slug: "rebound-positioning", title: "Rebound positioning", durationMinutes: 8, level: "Intermediate", focus: "Circle work" },
      { slug: "defensive-transitions", title: "Defensive transitions", durationMinutes: 11, level: "Advanced", focus: "Transition" },
    ],
  },
  {
    slug: "shooting",
    name: "Shooting",
    short: "From base technique to contested shots.",
    drills: [
      { slug: "base-technique", title: "Base shooting technique", durationMinutes: 10, level: "Beginner", focus: "Technique" },
      { slug: "movement-in-circle", title: "Movement in the circle", durationMinutes: 11, level: "Intermediate", focus: "Circle movement" },
      { slug: "contested-shots", title: "Contested shots", durationMinutes: 12, level: "Advanced", focus: "Pressure" },
      { slug: "high-post-feed", title: "High-post feed patterns", durationMinutes: 10, level: "Intermediate", focus: "Feeding" },
      { slug: "rebound-plays", title: "Rebound plays", durationMinutes: 9, level: "Intermediate", focus: "Rebounding" },
      { slug: "under-pressure-reps", title: "Under-pressure repetitions", durationMinutes: 13, level: "Advanced", focus: "Pressure" },
    ],
  },
  {
    slug: "footwork",
    name: "Footwork & Athleticism",
    short: "The foundation everything else is built on.",
    drills: [
      { slug: "landing-technique", title: "Landing technique", durationMinutes: 8, level: "Beginner", focus: "Landings" },
      { slug: "change-of-direction", title: "Change of direction", durationMinutes: 10, level: "Intermediate", focus: "Agility" },
      { slug: "pivot-and-turn", title: "Pivot and turn", durationMinutes: 7, level: "Beginner", focus: "Footwork" },
      { slug: "split-step", title: "Split step timing", durationMinutes: 9, level: "Intermediate", focus: "Reactivity" },
      { slug: "sprint-mechanics", title: "Sprint mechanics", durationMinutes: 10, level: "Intermediate", focus: "Speed" },
    ],
  },
  {
    slug: "small-sided-games",
    name: "Small-Sided Games",
    short: "Game-realistic reps in condensed space.",
    drills: [
      { slug: "3v3-half-court", title: "3v3 half-court", durationMinutes: 15, level: "Intermediate", focus: "Game reps" },
      { slug: "4v4-transition", title: "4v4 transition game", durationMinutes: 18, level: "Advanced", focus: "Transition" },
      { slug: "circle-only-battles", title: "Circle-only battles", durationMinutes: 12, level: "Intermediate", focus: "Circle work" },
      { slug: "fast-scoring", title: "Fast-scoring scenarios", durationMinutes: 14, level: "Advanced", focus: "Decision-making" },
    ],
  },
  {
    slug: "cool-down",
    name: "Cool-Down & Recovery",
    short: "Finish the session properly.",
    drills: [
      { slug: "static-stretches", title: "Static stretches", durationMinutes: 8, level: "Beginner", focus: "Recovery" },
      { slug: "recovery-breathing", title: "Recovery breathing", durationMinutes: 5, level: "Beginner", focus: "Nervous system" },
      { slug: "reflection-routine", title: "Reflection routine", durationMinutes: 5, level: "Beginner", focus: "Mental" },
    ],
  },
];

export const TOTAL_DRILL_COUNT = DRILL_CATEGORIES.reduce(
  (sum, c) => sum + c.drills.length,
  0,
);
