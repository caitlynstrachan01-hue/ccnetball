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

// Demo data — replace with your full library, ordered as you prefer.
export const DRILL_CATEGORIES: DrillCategory[] = [
  {
    slug: "warm-up",
    name: "Warm-Up",
    short: "Prime the body for high-quality training.",
    drills: [
      { slug: "dynamic-mobility", title: "Dynamic mobility flow", durationMinutes: 6, level: "Beginner", focus: "Movement prep" },
      { slug: "ball-handling-warmup", title: "Ball handling warm-up", durationMinutes: 8, level: "Beginner", focus: "Ball feel" },
      { slug: "court-movement-patterns", title: "Court movement patterns", durationMinutes: 7, level: "Intermediate", focus: "Footwork" },
      { slug: "partner-passing", title: "Partner passing warm-up", durationMinutes: 10, level: "Beginner", focus: "Passing" },
      { slug: "full-body-activation", title: "Full-body activation", durationMinutes: 6, level: "Beginner", focus: "Activation" },
    ],
  },
  {
    slug: "ball-work",
    name: "Ball Work",
    short: "Every pass, every catch, sharpened.",
    drills: [
      { slug: "two-hand-catch", title: "Two-hand catch fundamentals", durationMinutes: 8, level: "Beginner", focus: "Catching" },
      { slug: "chest-pass-technique", title: "Chest pass technique", durationMinutes: 9, level: "Beginner", focus: "Passing" },
      { slug: "shoulder-pass-under-pressure", title: "Shoulder pass under pressure", durationMinutes: 10, level: "Intermediate", focus: "Passing" },
      { slug: "lob-and-bounce", title: "Lob and bounce pass", durationMinutes: 9, level: "Intermediate", focus: "Passing" },
      { slug: "pass-and-move-tempo", title: "Pass and move with tempo", durationMinutes: 12, level: "Intermediate", focus: "Ball movement" },
    ],
  },
  {
    slug: "footwork",
    name: "Footwork",
    short: "The foundation everything else is built on.",
    drills: [
      { slug: "landing-technique", title: "Landing technique", durationMinutes: 8, level: "Beginner", focus: "Landings" },
      { slug: "change-of-direction", title: "Change of direction", durationMinutes: 10, level: "Intermediate", focus: "Agility" },
      { slug: "pivot-and-turn", title: "Pivot and turn", durationMinutes: 7, level: "Beginner", focus: "Footwork" },
      { slug: "split-step-timing", title: "Split step timing", durationMinutes: 9, level: "Intermediate", focus: "Reactivity" },
      { slug: "sprint-mechanics", title: "Sprint mechanics", durationMinutes: 10, level: "Intermediate", focus: "Speed" },
    ],
  },
  {
    slug: "attacking-drills",
    name: "Attacking Drills",
    short: "Leads, re-offers, and pressure attacks.",
    drills: [
      { slug: "split-leads", title: "Split leads — reading the player in front", durationMinutes: 10, level: "Intermediate", focus: "Leads" },
      { slug: "art-of-re-offering", title: "The art of re-offering", durationMinutes: 9, level: "Intermediate", focus: "Movement" },
      { slug: "circle-edge-movement", title: "Circle edge movement", durationMinutes: 10, level: "Intermediate", focus: "Circle work" },
      { slug: "two-way-splits", title: "Two-way splits", durationMinutes: 9, level: "Intermediate", focus: "Space creation" },
      { slug: "attacking-under-pressure", title: "Attacking under pressure", durationMinutes: 13, level: "Advanced", focus: "Pressure" },
    ],
  },
  {
    slug: "defending-drills",
    name: "Defending Drills",
    short: "One-on-one work through to reading the intercept.",
    drills: [
      { slug: "1on1-early-skill-learning", title: "1on1 defence — early skill learning", durationMinutes: 8, level: "Beginner", focus: "Fundamentals" },
      { slug: "intercept-timing-beginners", title: "Intercept — timing for beginners", durationMinutes: 8, level: "Beginner", focus: "Timing" },
      { slug: "intercept-back-and-up", title: "Intercept — back and up", durationMinutes: 11, level: "Intermediate", focus: "Positioning" },
      { slug: "2on2-defence", title: "2on2 defence", durationMinutes: 12, level: "Intermediate", focus: "Team defence" },
      { slug: "tracking-boxing-out", title: "Tracking and boxing out", durationMinutes: 10, level: "Intermediate", focus: "Positioning" },
    ],
  },
  {
    slug: "attack-centre-pass",
    name: "Attack Centre Pass Structures",
    short: "Structures for when your team has the centre pass.",
    drills: [
      { slug: "basic-cp-entry", title: "Basic centre pass entry", durationMinutes: 10, level: "Beginner", focus: "Set plays" },
      { slug: "two-way-cp-split", title: "Two-way centre pass split", durationMinutes: 11, level: "Intermediate", focus: "Set plays" },
      { slug: "overload-cp", title: "Overload centre pass", durationMinutes: 12, level: "Intermediate", focus: "Space creation" },
      { slug: "advanced-cp-rotations", title: "Advanced patterns with rotations", durationMinutes: 14, level: "Advanced", focus: "Set plays" },
    ],
  },
  {
    slug: "defence-centre-pass",
    name: "Defence Centre Pass Structures",
    short: "Structures for when the opposition has the centre pass.",
    drills: [
      { slug: "match-up-cp-defence", title: "Match-up centre pass defence", durationMinutes: 10, level: "Beginner", focus: "Team defence" },
      { slug: "zone-press-cp", title: "Zone press on centre pass", durationMinutes: 12, level: "Intermediate", focus: "Team defence" },
      { slug: "defending-the-wa", title: "Defending the WA", durationMinutes: 10, level: "Intermediate", focus: "One-on-one" },
      { slug: "reading-second-phase", title: "Reading second-phase movement", durationMinutes: 12, level: "Advanced", focus: "Reading play" },
    ],
  },
];

export const TOTAL_DRILL_COUNT = DRILL_CATEGORIES.reduce(
  (sum, c) => sum + c.drills.length,
  0,
);
