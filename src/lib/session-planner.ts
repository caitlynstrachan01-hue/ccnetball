import {
  type AgeGroupId,
  type Drill,
  type DrillCategory,
  type SessionSlotId,
} from "@/lib/drills-library-content";
import { drillSlot } from "@/lib/drills-store";

/** One block of a session structure, before drills are chosen. */
export type BlockSpec = {
  slot: SessionSlotId;
  label: string;
  minutes: number;
};

export type StructurePreset = {
  id: string;
  label: string;
  blocks: BlockSpec[];
};

const warmUp = (minutes: number): BlockSpec => ({ slot: "warm-up", label: "Warm-up", minutes });
const ballFootwork = (minutes: number): BlockSpec => ({ slot: "ball-footwork", label: "Ball work / footwork", minutes });
const teamDrill = (minutes: number): BlockSpec => ({ slot: "team-drill", label: "Team drill", minutes });
const skill = (n: number, minutes: number): BlockSpec => ({ slot: "skill", label: `Skill #${n}`, minutes });
const scrimmage = (minutes: number): BlockSpec => ({ slot: "scrimmage", label: "Scrimmage / half court", minutes });

/** Prefilled structures — the number of skills grows with session length. */
export const STRUCTURE_PRESETS: StructurePreset[] = [
  {
    id: "45",
    label: "45 min · 1 skill",
    blocks: [warmUp(8), ballFootwork(10), skill(1, 15), scrimmage(12)],
  },
  {
    id: "60",
    label: "60 min · 2 skills",
    blocks: [warmUp(10), ballFootwork(10), teamDrill(10), skill(1, 10), skill(2, 10), scrimmage(10)],
  },
  {
    id: "75",
    label: "75 min · 3 skills",
    blocks: [warmUp(10), ballFootwork(10), teamDrill(10), skill(1, 12), skill(2, 12), skill(3, 12), scrimmage(9)],
  },
  {
    id: "90",
    label: "90 min · 4 skills",
    blocks: [warmUp(10), ballFootwork(10), teamDrill(10), skill(1, 12), skill(2, 12), skill(3, 12), skill(4, 12), scrimmage(12)],
  },
];

/** Re-number skill blocks after one is added or removed. */
export function renumberSkills(blocks: BlockSpec[]): BlockSpec[] {
  let n = 0;
  return blocks.map((b) => (b.slot === "skill" ? { ...b, label: `Skill #${++n}` } : b));
}

export type PlanBlock = BlockSpec & {
  /** "category/drill", or null when the library has nothing suitable yet. */
  drillKey: string | null;
  coachingFocus: string;
  why: string;
};

export type SessionPlan = {
  title: string;
  summary: string;
  blocks: PlanBlock[];
  /** How the next session could layer on this one. */
  nextTime: string;
  /** "ai" when Claude built it, "matcher" for the built-in fallback. */
  source: "ai" | "matcher";
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
  plan: SessionPlan & { progress?: Progress | null; progressNote?: string };
  created_at: string;
};

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

const STOP_WORDS = new Set(
  "a an and are as at be but by for from get has have i in into is it its me my of on or our so that the their them they this to want we with work working need needs more on".split(" "),
);

function words(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

const LEVEL_FIT: Record<AgeGroupId, Record<Drill["level"], number>> = {
  netsetgo: { Beginner: 2, Intermediate: 0, Advanced: -3 },
  junior: { Beginner: 1, Intermediate: 1.5, Advanced: -0.5 },
  senior: { Beginner: 0, Intermediate: 1, Advanced: 1.5 },
};

/**
 * Built-in matcher — used when the AI isn't configured or fails. Scores each
 * drill against the coach's brief, the age group and the previous session.
 */
export function matchPlan(
  req: PlannerRequest,
  catalog: CatalogDrill[],
  previous: SavedPlan | null,
): SessionPlan {
  const briefWords = new Set(words(`${req.brief} ${req.progressNote ?? ""}`));
  const prevKeys = new Set(
    previous?.plan.blocks.filter((b) => b.slot === "skill").map((b) => b.drillKey) ?? [],
  );
  const used = new Set<string>();

  const score = (c: CatalogDrill) => {
    const d = c.drill;
    const haystack = words(
      [d.title, d.focus, d.description ?? "", c.categoryName, ...(d.tags ?? [])].join(" "),
    );
    let s = haystack.filter((w) => briefWords.has(w)).length * 2;
    s += (d.tags ?? []).filter((t) => briefWords.has(t)).length * 2;
    s += LEVEL_FIT[req.ageGroup][d.level] ?? 0;
    if (d.videoUrl) s += 0.5;
    if (prevKeys.has(c.key)) {
      if (req.progress === "more-time") s += 4;
      else if (req.progress === "new") s -= 4;
    }
    return s;
  };

  const blocks: PlanBlock[] = req.blocks.map((spec) => {
    const options = catalog
      .filter((c) => c.slot === spec.slot && !used.has(c.key))
      .map((c) => ({ c, s: score(c) }))
      .sort((a, b) => b.s - a.s);
    const pick = options[0]?.c;
    if (pick) used.add(pick.key);
    return {
      ...spec,
      drillKey: pick?.key ?? null,
      coachingFocus: pick?.drill.focus
        ? `Focus on ${pick.drill.focus.toLowerCase()}.`
        : "",
      why: pick
        ? prevKeys.has(pick.key) && req.progress === "more-time"
          ? "Repeated from last session so the athletes can consolidate it."
          : "Best match in the library for your brief and age group."
        : "No drills in the library for this part of the session yet.",
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

export function totalMinutes(blocks: { minutes: number }[]) {
  return blocks.reduce((sum, b) => sum + (Number(b.minutes) || 0), 0);
}
