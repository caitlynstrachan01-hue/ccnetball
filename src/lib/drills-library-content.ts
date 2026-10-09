/** Age-group labels a drill can be tagged with (1–3 per drill). */
export const AGE_GROUPS = [
  { id: "netsetgo", label: "NetSetGo", range: "U6–U10" },
  { id: "junior", label: "Junior", range: "U11–U13" },
  { id: "senior", label: "Senior", range: "U14–Open" },
] as const;

export type AgeGroupId = (typeof AGE_GROUPS)[number]["id"];

/** Where a drill fits in a training session — drives the session planner. */
export const SESSION_SLOTS = [
  { id: "warm-up", label: "Warm-up" },
  { id: "ball-footwork", label: "Ball work / footwork" },
  { id: "team-drill", label: "Team drill" },
  { id: "skill", label: "Skill" },
  { id: "scrimmage", label: "Scrimmage / half court" },
  { id: "cool-down", label: "Cool-down" },
] as const;

export type SessionSlotId = (typeof SESSION_SLOTS)[number]["id"];

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
  /** Where the uploaded video lives in the drill-videos storage bucket. */
  videoPath?: string;
  equipment?: string;
  groupSize?: string;
  /** Free-form tags Caitlyn creates, e.g. "leads", "timing". */
  tags?: string[];
  /** Which age groups the drill suits. Empty = not set yet (treated as all). */
  ageGroups?: AgeGroupId[];
  /** How execution changes for each age group. */
  ageNotes?: Partial<Record<AgeGroupId, string>>;
  /** Overrides the category's default session slot. */
  sessionSlot?: SessionSlotId;
  /** Added through the admin page rather than this file. */
  custom?: boolean;
};

export type DrillCategory = {
  slug: string;
  name: string;
  short: string;
  drills: Drill[];
  /** Override the numeric count shown in the tab/badge (e.g. "50+" for a demo of a larger category). */
  displayCount?: string;
  /** Where drills in this category usually sit in a session. */
  defaultSlot: SessionSlotId;
};

// Demo data — replace with your full library, ordered as you prefer.
export const DRILL_CATEGORIES: DrillCategory[] = [
  {
    slug: "warm-up",
    defaultSlot: "warm-up",
    name: "Warm-Up",
    short: "Prime the body for high-quality training — no ball required.",
    displayCount: "42",
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
    defaultSlot: "ball-footwork",
    name: "Ball Work",
    short: "Dynamic drills, position-specific work, and a team or half-court finisher.",
    displayCount: "25",
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
    defaultSlot: "ball-footwork",
    name: "Footwork",
    short: "The foundation everything else is built on.",
    displayCount: "19",
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
    defaultSlot: "skill",
    name: "Attacking Drills",
    short: "Leads, re-offers, and pressure attacks.",
    displayCount: "20",
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
    defaultSlot: "skill",
    name: "Defending Drills",
    short: "One-on-one work through to reading the intercept.",
    displayCount: "20",
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
    defaultSlot: "skill",
    name: "Centre Pass - Attack",
    short: "Structures for when your team has the centre pass.",
    displayCount: "15",
    drills: [
      { slug: "basic-cp-entry", title: "Basic centre pass entry", durationMinutes: 10, level: "Beginner", focus: "Set plays" },
      { slug: "two-way-cp-split", title: "Two-way centre pass split", durationMinutes: 11, level: "Intermediate", focus: "Set plays" },
      { slug: "overload-cp", title: "Overload centre pass", durationMinutes: 12, level: "Intermediate", focus: "Space creation" },
      { slug: "advanced-cp-rotations", title: "Advanced patterns with rotations", durationMinutes: 14, level: "Advanced", focus: "Set plays" },
    ],
  },
  {
    slug: "defence-centre-pass",
    defaultSlot: "skill",
    name: "Centre Pass - Defence",
    short: "Structures for when the opposition has the centre pass.",
    displayCount: "12",
    drills: [
      { slug: "match-up-cp-defence", title: "Match-up centre pass defence", durationMinutes: 10, level: "Beginner", focus: "Team defence" },
      { slug: "zone-press-cp", title: "Zone press on centre pass", durationMinutes: 12, level: "Intermediate", focus: "Team defence" },
      { slug: "defending-the-wa", title: "Defending the WA", durationMinutes: 10, level: "Intermediate", focus: "One-on-one" },
      { slug: "reading-second-phase", title: "Reading second-phase movement", durationMinutes: 12, level: "Advanced", focus: "Reading play" },
    ],
  },
  {
    slug: "team-drills",
    defaultSlot: "team-drill",
    name: "Team Drills",
    short: "Whole-squad drills to run at training.",
    displayCount: "17",
    drills: [
      { slug: "windmill", title: "Windmill", durationMinutes: 12, level: "Intermediate", focus: "Whole team" },
      { slug: "clover", title: "Clover", durationMinutes: 12, level: "Intermediate", focus: "Whole team" },
      { slug: "milk-shake", title: "Milk Shake", durationMinutes: 10, level: "Intermediate", focus: "Whole team" },
      { slug: "6-point-drill", title: "6 Point Drill", durationMinutes: 14, level: "Advanced", focus: "Whole team" },
      { slug: "3-person-weave-with-defence", title: "3-Person Weave with Defence", durationMinutes: 12, level: "Advanced", focus: "Whole team" },
    ],
  },
  {
    slug: "shooting",
    defaultSlot: "skill",
    name: "Shooting",
    short: "From base technique through to contested shots.",
    displayCount: "15",
    drills: [
      { slug: "base-technique", title: "Base shooting technique", durationMinutes: 10, level: "Beginner", focus: "Technique" },
      { slug: "movement-in-circle", title: "Movement in the circle", durationMinutes: 11, level: "Intermediate", focus: "Circle movement" },
      { slug: "contested-shots", title: "Contested shots", durationMinutes: 12, level: "Advanced", focus: "Pressure" },
      { slug: "high-post-feed", title: "High-post feed patterns", durationMinutes: 10, level: "Intermediate", focus: "Feeding" },
      { slug: "rebound-plays", title: "Rebound plays", durationMinutes: 9, level: "Intermediate", focus: "Rebounding" },
    ],
  },
  {
    slug: "scrimmage",
    defaultSlot: "scrimmage",
    name: "Scrimmage & Half Court",
    short: "Game-like finishers that put the session's skills under pressure.",
    drills: [
      { slug: "half-court-scrimmage", title: "Half-court scrimmage", durationMinutes: 12, level: "Intermediate", focus: "Match play" },
      { slug: "conditioned-match-play", title: "Conditioned match play", durationMinutes: 15, level: "Intermediate", focus: "Match play" },
    ],
  },
  {
    slug: "recovery",
    defaultSlot: "cool-down",
    name: "Recovery",
    short: "Cool-downs, mobility and recovery routines to finish the session.",
    displayCount: "15",
    drills: [
      { slug: "static-stretches", title: "Static stretch routine", durationMinutes: 8, level: "Beginner", focus: "Flexibility" },
      { slug: "recovery-breathing", title: "Recovery breathing", durationMinutes: 5, level: "Beginner", focus: "Nervous system" },
      { slug: "foam-roller", title: "Foam roller routine", durationMinutes: 10, level: "Beginner", focus: "Soft tissue" },
      { slug: "reflection-routine", title: "Session reflection", durationMinutes: 5, level: "Beginner", focus: "Mental" },
    ],
  },
];

export function slotLabel(id: SessionSlotId) {
  return SESSION_SLOTS.find((s) => s.id === id)?.label ?? id;
}

export function ageGroupLabel(id: AgeGroupId) {
  const g = AGE_GROUPS.find((a) => a.id === id);
  return g ? `${g.label} (${g.range})` : id;
}

export const TOTAL_DRILL_COUNT = DRILL_CATEGORIES.reduce(
  (sum, c) => sum + c.drills.length,
  0,
);
