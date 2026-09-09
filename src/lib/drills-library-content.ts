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

// Sample data for the demo — replace with your full library and preferred order.
export const DRILL_CATEGORIES: DrillCategory[] = [
  {
    slug: "attacking-movement",
    name: "Attacking Movement",
    short: "Leads, re-offers and reading the player in front.",
    drills: [
      {
        slug: "split-leads",
        title: "Split leads — reading the player in front",
        durationMinutes: 10,
        level: "Intermediate",
        focus: "Leads",
      },
      {
        slug: "art-of-re-offering",
        title: "The art of re-offering",
        durationMinutes: 9,
        level: "Intermediate",
        focus: "Movement",
      },
    ],
  },
  {
    slug: "defending",
    name: "Defending",
    short: "One-on-one work through to reading the intercept.",
    drills: [
      {
        slug: "1on1-early-skill-learning",
        title: "1on1 defence — early skill learning",
        durationMinutes: 8,
        level: "Beginner",
        focus: "Fundamentals",
      },
      {
        slug: "intercept-timing-beginners",
        title: "Intercept — timing for beginners",
        durationMinutes: 8,
        level: "Beginner",
        focus: "Timing",
      },
      {
        slug: "intercept-back-and-up",
        title: "Intercept — back and up",
        durationMinutes: 11,
        level: "Intermediate",
        focus: "Positioning",
      },
      {
        slug: "2on2-defence",
        title: "2on2 defence",
        durationMinutes: 12,
        level: "Intermediate",
        focus: "Team defence",
      },
    ],
  },
  {
    slug: "team-drills",
    name: "Team Drills",
    short: "Whole-squad drills to run at training.",
    drills: [
      {
        slug: "windmill",
        title: "Windmill",
        durationMinutes: 12,
        level: "Intermediate",
        focus: "Whole team",
      },
      {
        slug: "clover",
        title: "Clover",
        durationMinutes: 12,
        level: "Intermediate",
        focus: "Whole team",
      },
      {
        slug: "milk-shake",
        title: "Milk Shake",
        durationMinutes: 10,
        level: "Intermediate",
        focus: "Whole team",
      },
      {
        slug: "6-point-drill",
        title: "6 Point Drill",
        durationMinutes: 14,
        level: "Advanced",
        focus: "Whole team",
      },
      {
        slug: "3-person-weave-with-defence",
        title: "3-Person Weave with Defence",
        durationMinutes: 12,
        level: "Advanced",
        focus: "Whole team",
      },
    ],
  },
];

export const TOTAL_DRILL_COUNT = DRILL_CATEGORIES.reduce(
  (sum, c) => sum + c.drills.length,
  0,
);
