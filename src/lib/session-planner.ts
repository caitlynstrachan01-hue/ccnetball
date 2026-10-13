import {
  type AgeGroupId,
  type Drill,
  type DrillCategory,
  type SessionSlotId,
} from "@/lib/drills-library-content";
import { drillSlot } from "@/lib/drills-store";

/*
 * Caitlyn's session template:
 *   Warm-up (10 min) — early movement, dynamic stretching, 2 plyometrics
 *     (one single-leg), late movement, sprints / game
 *   Ballwork / footwork / team drill (10 min) — 2–3 drills
 *   Skill #1–#4 (10–15 min each) — 3 for a typical hour, any category,
 *     usually a mix of attack and defence
 *   Match play (10 min) — half court for most teams
 */

/** One block of a session structure, before drills are chosen. */
export type BlockSpec = {
  slot: SessionSlotId;
  label: string;
  minutes: number;
};

const warmUp = (minutes: number): BlockSpec => ({
  slot: "warm-up",
  label: "Warm-up",
  minutes,
});
const ballwork = (minutes: number): BlockSpec => ({
  slot: "ball-footwork",
  label: "Ballwork / footwork / team drill",
  minutes,
});
const skill = (n: number, minutes: number): BlockSpec => ({
  slot: "skill",
  label: `Skill #${n}`,
  minutes,
});
const matchPlay = (minutes: number): BlockSpec => ({
  slot: "scrimmage",
  label: "Match play",
  minutes,
});

/** Session lengths offered up front; coaches can also type their own. */
export const SESSION_LENGTHS = [45, 60, 90] as const;
export const DEFAULT_SESSION_MINUTES = 60;
export const MAX_SKILLS = 4;

/** Warm-up, ballwork and match play take 10 minutes each. */
const FIXED_MINUTES = 30;

/** How many 10–15 minute skills fit — 45 min → 1, 60 → 3, 90 → 4. */
export function recommendedSkills(totalMinutes: number) {
  const spare = totalMinutes - FIXED_MINUTES;
  return Math.max(1, Math.min(MAX_SKILLS, Math.round(spare / 12)));
}

/** The suggested structure for a session of this length. */
export function structureFor(totalMinutes: number): BlockSpec[] {
  const skills = recommendedSkills(totalMinutes);
  const spare = Math.max(totalMinutes - FIXED_MINUTES, skills * 5);
  const each = Math.floor(spare / skills);
  const extra = spare - each * skills;
  return [
    warmUp(10),
    ballwork(10),
    ...Array.from({ length: skills }, (_, i) =>
      skill(i + 1, each + (i < extra ? 1 : 0)),
    ),
    matchPlay(10),
  ];
}

/** Re-number skill blocks after one is added or removed. */
export function renumberSkills(blocks: BlockSpec[]): BlockSpec[] {
  let n = 0;
  return blocks.map((b) =>
    b.slot === "skill" ? { ...b, label: `Skill #${++n}` } : b,
  );
}

/** Which drills can fill a block. Skills are open to every category. */
export function candidateSlots(slot: SessionSlotId): SessionSlotId[] {
  switch (slot) {
    case "ball-footwork":
    case "team-drill":
      return ["ball-footwork", "team-drill"];
    case "skill":
      return ["skill", "ball-footwork", "team-drill"];
    default:
      return [slot];
  }
}

/** The warm-up is built from these parts, matched on drill tags. */
export const WARM_UP_PARTS = [
  {
    id: "early-movement",
    label: "Early movement",
    tags: ["early movement"],
    count: 1,
  },
  {
    id: "dynamic-stretching",
    label: "Dynamic stretching",
    tags: ["dynamic stretching"],
    count: 1,
  },
  {
    id: "plyometrics",
    label: "Plyometrics",
    tags: ["plyometrics", "single leg"],
    count: 2,
  },
  {
    id: "late-movement",
    label: "Late movement",
    tags: ["late movement"],
    count: 1,
  },
  {
    id: "sprints-game",
    label: "Sprints / game",
    tags: ["sprints", "warm-up game"],
    count: 1,
  },
] as const;

/** Tags the admin page suggests so drills slot into the template. */
export const SUGGESTED_TAGS: Partial<Record<SessionSlotId, string[]>> = {
  "warm-up": [
    "early movement",
    "dynamic stretching",
    "plyometrics",
    "single leg",
    "late movement",
    "sprints",
    "warm-up game",
  ],
  scrimmage: ["half court", "match play"],
  skill: ["attack", "defence", "half court", "match play"],
};

export type PlanDrill = {
  /** "category/drill", or "custom-…" for a drill the coach wrote themselves. */
  key: string;
  /** Warm-up part label, e.g. "Plyometrics (single leg)". */
  part?: string;
  /** A coach's own drill, not from the library. */
  custom?: { title: string; notes: string; drawingPath?: string };
};

export type PlanBlock = BlockSpec & {
  drills: PlanDrill[];
  coachingFocus: string;
  why: string;
};

export type SessionPlan = {
  title: string;
  summary: string;
  blocks: PlanBlock[];
  /** How the next session could layer on this one. */
  nextTime: string;
  /** Claude, the built-in matcher, or built by the coach themselves. */
  source: "ai" | "matcher" | "coach";
};

export type Progress = "more-time" | "progress" | "new";

export const PROGRESS_OPTIONS: { id: Progress; label: string }[] = [
  { id: "more-time", label: "They need more time on it" },
  { id: "progress", label: "Mostly there — progress it" },
  { id: "new", label: "Ready for something new" },
];

export type PlannerRequest = {
  brief: string;
  ageGroup: AgeGroupId;
  squad?: string;
  blocks: BlockSpec[];
  /** Legacy — match play now always suggests half court first. */
  fullMatch?: boolean;
  /** Training date (YYYY-MM-DD) and start time (HH:MM), for the printout. */
  sessionDate?: string;
  startTime?: string;
  previousPlanId?: string | null;
  progress?: Progress | null;
  progressNote?: string;
};

export type SavedPlan = {
  id: string;
  title: string;
  brief: string | null;
  age_group: string | null;
  duration_minutes: number | null;
  plan: SessionPlan & {
    progress?: Progress | null;
    progressNote?: string;
    fullMatch?: boolean;
    sessionDate?: string;
    startTime?: string;
  };
  created_at: string;
};

/** Plans saved before blocks held several drills had one drillKey each. */
export function normaliseBlocks(blocks: PlanBlock[]): PlanBlock[] {
  return blocks.map((b) => {
    if (Array.isArray(b.drills)) return b;
    const legacy = (b as unknown as { drillKey?: string | null }).drillKey;
    return { ...b, drills: legacy ? [{ key: legacy }] : [] };
  });
}

/** A drill flattened with everything the planner needs to choose it. */
export type CatalogDrill = {
  key: string;
  slot: SessionSlotId;
  categoryName: string;
  drill: Drill;
};

/** Every visible drill that suits the age group (untagged drills suit all). */
export function buildCatalog(
  categories: DrillCategory[],
  ageGroup: AgeGroupId,
): CatalogDrill[] {
  return categories.flatMap((cat) =>
    cat.drills
      .filter((d) => !d.ageGroups?.length || d.ageGroups.includes(ageGroup))
      .map((d) => ({
        key: `${cat.slug}/${d.slug}`,
        slot: drillSlot(d, cat),
        categoryName: cat.name,
        drill: d,
      })),
  );
}

export function hasTag(c: CatalogDrill, tag: string) {
  return (c.drill.tags ?? []).some((t) => t.toLowerCase() === tag);
}

const STOP_WORDS = new Set(
  "a an and are as at be but by for from get has have i in into is it its me my of on or our so that the their them they this to want we with work working need needs more on".split(
    " ",
  ),
);

function words(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Built-in matcher — used when the AI isn't configured or fails, and to fill
 * any gaps the AI leaves. Follows Caitlyn's template block by block.
 */
export function matchPlan(
  req: PlannerRequest,
  catalog: CatalogDrill[],
  previous: SavedPlan | null,
): SessionPlan {
  const briefWords = new Set(words(`${req.brief} ${req.progressNote ?? ""}`));
  const prevSkillKeys = new Set(
    normaliseBlocks(previous?.plan.blocks ?? [])
      .filter((b) => b.slot === "skill")
      .flatMap((b) => b.drills.map((d) => d.key)),
  );
  const used = new Set<string>();

  const score = (c: CatalogDrill) => {
    const d = c.drill;
    const haystack = words(
      [
        d.title,
        d.focus,
        d.description ?? "",
        c.categoryName,
        ...(d.tags ?? []),
      ].join(" "),
    );
    let s = haystack.filter((w) => briefWords.has(w)).length * 2;
    // Drills Caitlyn tagged for this age group beat untagged ones.
    if (d.ageGroups?.includes(req.ageGroup)) s += 1.5;
    if (d.ageNotes?.[req.ageGroup]) s += 0.5;
    if (d.videoUrl) s += 0.5;
    if (prevSkillKeys.has(c.key)) {
      if (req.progress === "more-time") s += 4;
      else if (req.progress === "new") s -= 4;
    }
    return s;
  };

  const best = (pool: CatalogDrill[], extra?: (c: CatalogDrill) => number) =>
    pool
      .filter((c) => !used.has(c.key))
      .map((c) => ({ c, s: score(c) + (extra?.(c) ?? 0) }))
      .sort((a, b) => b.s - a.s)[0]?.c;

  const take = (c: CatalogDrill | undefined, part?: string): PlanDrill[] => {
    if (!c) return [];
    used.add(c.key);
    return [{ key: c.key, part }];
  };

  const inSlots = (slot: SessionSlotId) => {
    const slots = candidateSlots(slot);
    return catalog.filter((c) => slots.includes(c.slot));
  };

  let lastSkillCategory: string | null = null;

  const blocks: PlanBlock[] = req.blocks.map((spec) => {
    const pool = inSlots(spec.slot);
    let drills: PlanDrill[] = [];

    if (spec.slot === "warm-up") {
      for (const part of WARM_UP_PARTS) {
        if (part.id === "plyometrics") {
          drills.push(
            ...take(
              best(pool.filter((c) => hasTag(c, "single leg"))),
              "Plyometrics (single leg)",
            ),
          );
          drills.push(
            ...take(
              best(pool.filter((c) => hasTag(c, "plyometrics"))),
              "Plyometrics",
            ),
          );
        } else {
          drills.push(
            ...take(
              best(pool.filter((c) => part.tags.some((t) => hasTag(c, t)))),
              part.label,
            ),
          );
        }
      }
      // Warm-up drills not tagged yet — still give the coach something.
      if (drills.length === 0) {
        for (let i = 0; i < 3; i++) drills.push(...take(best(pool)));
      }
    } else if (spec.slot === "ball-footwork" || spec.slot === "team-drill") {
      const count = spec.minutes >= 15 ? 3 : 2;
      for (let i = 0; i < count; i++) drills.push(...take(best(pool)));
    } else if (spec.slot === "scrimmage") {
      const want = req.fullMatch ? "match play" : "half court";
      drills = take(
        best(pool, (c) =>
          hasTag(c, want) ||
          c.drill.title.toLowerCase().includes(req.fullMatch ? "match" : "half")
            ? 5
            : 0,
        ),
      );
    } else if (spec.slot === "skill") {
      // Prefer real skill drills, and vary the category between skills.
      const pick = best(
        pool,
        (c) =>
          (c.slot === "skill" ? 1 : 0) -
          (c.categoryName === lastSkillCategory ? 1.5 : 0),
      );
      lastSkillCategory = pick?.categoryName ?? lastSkillCategory;
      drills = take(pick);
    } else {
      drills = take(best(pool));
    }

    const first = drills[0]
      ? catalog.find((c) => c.key === drills[0].key)
      : undefined;
    return {
      ...spec,
      drills,
      coachingFocus: first?.drill.focus
        ? `Focus on ${first.drill.focus.toLowerCase()}.`
        : "",
      why:
        drills.length === 0
          ? "No drills in the library for this part of the session yet."
          : spec.slot === "skill" &&
              first &&
              prevSkillKeys.has(first.key) &&
              req.progress === "more-time"
            ? "Repeated from last session so the athletes can consolidate it."
            : "",
    };
  });

  return {
    title: "Session plan",
    summary: req.brief.trim()
      ? `Built around: ${req.brief.trim()}`
      : "A balanced session from the CC Netball library.",
    blocks,
    nextTime:
      "Next session, keep the same skill focus and use the 'How to make it harder' progressions if the athletes handled it well.",
    source: "matcher",
  };
}

/** An empty plan in the chosen structure, for coaches building their own. */
export function blankPlan(blocks: BlockSpec[], title: string): SessionPlan {
  return {
    title,
    summary: "",
    blocks: blocks.map((b) => ({
      ...b,
      drills: [],
      coachingFocus: "",
      why: "",
    })),
    nextTime: "",
    source: "coach",
  };
}

export function totalMinutes(blocks: { minutes: number }[]) {
  return blocks.reduce((sum, b) => sum + (Number(b.minutes) || 0), 0);
}

/** "17:30" + 25 minutes → "17:55". */
export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** "17:30" → "5:30pm". */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${suffix}`;
}
