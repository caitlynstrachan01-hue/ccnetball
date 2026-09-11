export type Drill = {
  slug: string;
  title: string;
  durationMinutes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  focus: string;
  /** Optional written description shown under the video. */
  description?: string;
  /** Bullet list — how to make the drill easier. */
  makeItEasier?: string[];
  /** Bullet list — how to make the drill harder. */
  makeItHarder?: string[];
  /** Bullet list — alternate ways to run the drill. */
  variations?: string[];
  /** Optional uploaded video URL. */
  videoUrl?: string;
};

export type DrillCategory = {
  slug: string;
  name: string;
  short: string;
  drills: Drill[];
  /** Override the numeric count shown in the tab/badge (e.g. "50+" for a demo of a larger category). */
  displayCount?: string;
};

// Demo data — replace with your full library, ordered as you prefer.
export const DRILL_CATEGORIES: DrillCategory[] = [
  {
    slug: "warm-up",
    name: "Warm-Up",
    short: "Prime the body for high-quality training — no ball required.",
    drills: [
      { slug: "pre-activation", title: "Pre-activation", durationMinutes: 6, level: "Beginner", focus: "Activation" },
      { slug: "movement-pattern-1", title: "Movement pattern #1", durationMinutes: 5, level: "Beginner", focus: "Movement prep" },
      { slug: "movement-pattern-2", title: "Movement pattern #2", durationMinutes: 5, level: "Beginner", focus: "Movement prep" },
      { slug: "movement-pattern-3", title: "Movement pattern #3", durationMinutes: 6, level: "Intermediate", focus: "Movement prep" },
      { slug: "movement-pattern-4", title: "Movement pattern #4", durationMinutes: 6, level: "Intermediate", focus: "Movement prep" },
      { slug: "jumping-routine-1", title: "Jumping routine #1", durationMinutes: 5, level: "Beginner", focus: "Plyometrics" },
      { slug: "jumping-routine-2", title: "Jumping routine #2", durationMinutes: 6, level: "Intermediate", focus: "Plyometrics" },
      { slug: "sprint-variation-1", title: "Sprint variation #1", durationMinutes: 5, level: "Beginner", focus: "Speed" },
      { slug: "sprint-variation-2", title: "Sprint variation #2", durationMinutes: 5, level: "Beginner", focus: "Speed" },
      { slug: "sprint-variation-3", title: "Sprint variation #3", durationMinutes: 6, level: "Intermediate", focus: "Speed" },
      { slug: "sprint-variation-4", title: "Sprint variation #4", durationMinutes: 6, level: "Advanced", focus: "Speed" },
    ],
  },
  {
    slug: "ball-work",
    name: "Ball Work",
    short: "Dynamic drills, position-specific work, and a team or half-court finisher.",
    drills: [
      { slug: "dynamic-pass-and-move", title: "Dynamic pass and move", durationMinutes: 10, level: "Beginner", focus: "Ball movement" },
      { slug: "landing-and-pass", title: "Landing and pass on the move", durationMinutes: 9, level: "Intermediate", focus: "Ball movement" },
      { slug: "two-ball-reactive", title: "Two-ball reactive drill", durationMinutes: 10, level: "Intermediate", focus: "Reactivity" },
      { slug: "gs-ga-feed-patterns", title: "Position-specific — GS / GA feed patterns", durationMinutes: 12, level: "Intermediate", focus: "Position-specific" },
      { slug: "midcourt-transition-passing", title: "Position-specific — midcourt transition passing", durationMinutes: 11, level: "Intermediate", focus: "Position-specific" },
      { slug: "wa-wd-with-ball", title: "Position-specific — WA / WD movement with ball", durationMinutes: 11, level: "Intermediate", focus: "Position-specific" },
      { slug: "half-court-ball-work", title: "Team drill — half-court ball work", durationMinutes: 15, level: "Advanced", focus: "Team / half court" },
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
    displayCount: "50+",
    drills: [
      {
        slug: "split-leads",
        title: "Split leads — reading the player in front",
        durationMinutes: 10,
        level: "Intermediate",
        focus: "Leads",
        description:
          "The split lead teaches attackers to read the defender in front and drive away from them into space. Set up a passer at the transverse line and a defender-attacker pair 5m out. On the athlete's first move, they take a hard split — right or left — based on the defender's weight and angle. The pass is delivered to the space, not the athlete.",
        makeItEasier: [
          "Slow the passer's release so the athlete has more time to read the lead",
          "Have the defender show a clear preferred side so the read is obvious",
          "Reduce the space to a smaller square so decisions are simpler",
        ],
        makeItHarder: [
          "Add a live defender who can genuinely contest the pass",
          "Shrink the time the athlete has to commit to a direction",
          "Require the athlete to re-offer if the first lead is shut down",
        ],
        variations: [
          "Run the split off a body dodge instead of a stationary start",
          "Pair with a second attacker for a two-way split",
          "Progress to a 2v2 with a shooter and a feed on the circle edge",
        ],
      },
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
    displayCount: "50+",
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
