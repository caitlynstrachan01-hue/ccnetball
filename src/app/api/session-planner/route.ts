import { NextResponse } from "next/server";
import {
  AGE_GROUPS,
  SESSION_SLOTS,
  ageGroupLabel,
  type AgeGroupId,
} from "@/lib/drills-library-content";
import {
  getLibraryAccess,
  loadDrillCategories,
} from "@/lib/drills-store.server";
import {
  PROGRESS_OPTIONS,
  buildCatalog,
  matchPlan,
  totalMinutes,
  type CatalogDrill,
  type PlanBlock,
  type PlannerRequest,
  type SavedPlan,
  type SessionPlan,
} from "@/lib/session-planner";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
const AGE_IDS = new Set<string>(AGE_GROUPS.map((a) => a.id));
const SLOT_IDS = new Set<string>(SESSION_SLOTS.map((s) => s.id));

function parseRequest(body: unknown): PlannerRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.ageGroup !== "string" || !AGE_IDS.has(b.ageGroup)) return null;
  if (!Array.isArray(b.blocks) || b.blocks.length === 0 || b.blocks.length > 12)
    return null;
  const blocks = b.blocks.flatMap((raw) => {
    const r = raw as Record<string, unknown>;
    if (typeof r.slot !== "string" || !SLOT_IDS.has(r.slot)) return [];
    return [
      {
        slot: r.slot as PlanBlock["slot"],
        label: String(r.label ?? "").slice(0, 60),
        minutes: Math.max(1, Math.min(90, Number(r.minutes) || 10)),
      },
    ];
  });
  if (blocks.length === 0) return null;
  const progress = PROGRESS_OPTIONS.some((p) => p.id === b.progress)
    ? (b.progress as PlannerRequest["progress"])
    : null;
  return {
    brief: String(b.brief ?? "").slice(0, 2000),
    ageGroup: b.ageGroup as AgeGroupId,
    squad: String(b.squad ?? "").slice(0, 200),
    blocks,
    previousPlanId:
      typeof b.previousPlanId === "string" ? b.previousPlanId : null,
    progress,
    progressNote: String(b.progressNote ?? "").slice(0, 1000),
  };
}

function describeDrill(c: CatalogDrill) {
  const d = c.drill;
  return {
    key: c.key,
    slot: c.slot,
    category: c.categoryName,
    title: d.title,
    level: d.level,
    minutes: d.durationMinutes,
    focus: d.focus || undefined,
    tags: d.tags?.length ? d.tags : undefined,
    description: d.description?.slice(0, 300) || undefined,
    harder: d.makeItHarder?.slice(0, 3),
  };
}

function describePlan(p: SavedPlan, catalogByKey: Map<string, CatalogDrill>) {
  return {
    date: p.created_at.slice(0, 10),
    brief: p.brief,
    blocks: p.plan.blocks.map((b) => ({
      block: b.label,
      drill: b.drillKey ? (catalogByKey.get(b.drillKey)?.drill.title ?? b.drillKey) : null,
      drillKey: b.drillKey,
      focus: b.coachingFocus,
    })),
    nextTime: p.plan.nextTime,
  };
}

const PLAN_TOOL = {
  name: "submit_session_plan",
  description: "Submit the finished netball session plan.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short session title, max 8 words." },
      summary: {
        type: "string",
        description: "2–3 sentences for the coach: the theme and how the session builds.",
      },
      blocks: {
        type: "array",
        description: "Exactly one entry per requested block, in the same order.",
        items: {
          type: "object",
          properties: {
            drillKey: {
              type: ["string", "null"],
              description: "Key of a library drill whose slot matches the block, or null if none fit.",
            },
            coachingFocus: {
              type: "string",
              description: "One or two coaching cues for this block, pitched at the age group.",
            },
            why: {
              type: "string",
              description: "One sentence on why this drill, linking to the brief or last session.",
            },
          },
          required: ["drillKey", "coachingFocus", "why"],
        },
      },
      nextTime: {
        type: "string",
        description: "1–2 sentences on how the next session could layer on this one.",
      },
    },
    required: ["title", "summary", "blocks", "nextTime"],
  },
} as const;

async function askClaude(
  req: PlannerRequest,
  catalog: CatalogDrill[],
  previous: SavedPlan[],
  previousChosen: SavedPlan | null,
): Promise<SessionPlan | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const catalogByKey = new Map(catalog.map((c) => [c.key, c]));
  const progressLabel = PROGRESS_OPTIONS.find((p) => p.id === req.progress)?.label;

  const prompt = {
    coachBrief: req.brief || "(no brief given — build a balanced session)",
    ageGroup: ageGroupLabel(req.ageGroup),
    squad: req.squad || undefined,
    totalMinutes: totalMinutes(req.blocks),
    blocks: req.blocks.map((b) => ({ label: b.label, slot: b.slot, minutes: b.minutes })),
    buildingOn: previousChosen
      ? {
          session: describePlan(previousChosen, catalogByKey),
          howAthletesWent: progressLabel ?? "not stated",
          coachNote: req.progressNote || undefined,
        }
      : undefined,
    recentSessions: previous
      .filter((p) => p.id !== previousChosen?.id)
      .slice(0, 4)
      .map((p) => describePlan(p, catalogByKey)),
    library: catalog.map(describeDrill),
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system:
        "You are Caitlyn Strachan's session-planning assistant for CC Netball. Caitlyn is a former Australian Diamond and elite coach. " +
        "Build a training session for a netball coach using ONLY drills from the supplied library. " +
        "Each block must use a drill whose slot matches the block's slot; never reuse a drill within a session. " +
        "Read the coach's brief carefully and choose skills that serve it, pitched at the age group. " +
        "If building on a previous session: when athletes need more time, repeat or lightly vary those skills; when they're mostly there, pick drills that progress them; when they're ready for something new, layer a related next skill rather than an unrelated one. " +
        "Avoid repeating drills from recent sessions unless consolidation is the point. Australian English, warm and expert tone.",
      tools: [PLAN_TOOL],
      tool_choice: { type: "tool", name: PLAN_TOOL.name },
      messages: [{ role: "user", content: JSON.stringify(prompt) }],
    }),
  });
  if (!res.ok) {
    console.error("Session planner AI error", res.status, await res.text());
    return null;
  }
  const json = await res.json();
  const input = json.content?.find(
    (c: { type: string }) => c.type === "tool_use",
  )?.input;
  if (!input || !Array.isArray(input.blocks)) return null;

  // Trust the AI's words, but verify every drill it picked.
  const used = new Set<string>();
  const blocks: PlanBlock[] = req.blocks.map((spec, i) => {
    const out = input.blocks[i] ?? {};
    const pick = typeof out.drillKey === "string" ? catalogByKey.get(out.drillKey) : undefined;
    const valid = pick && pick.slot === spec.slot && !used.has(pick.key);
    if (valid) used.add(pick.key);
    return {
      ...spec,
      drillKey: valid ? pick.key : null,
      coachingFocus: String(out.coachingFocus ?? ""),
      why: String(out.why ?? ""),
    };
  });

  // Fill any gaps the AI left with the built-in matcher's choice.
  const fallback = matchPlan(
    req,
    catalog.filter((c) => !used.has(c.key)),
    previousChosen,
  );
  blocks.forEach((b, i) => {
    if (!b.drillKey && fallback.blocks[i]?.drillKey) {
      b.drillKey = fallback.blocks[i].drillKey;
      if (!b.why) b.why = fallback.blocks[i].why;
    }
  });

  return {
    title: String(input.title ?? "Session plan").slice(0, 80),
    summary: String(input.summary ?? ""),
    blocks,
    nextTime: String(input.nextTime ?? ""),
    source: "ai",
  };
}

export async function POST(request: Request) {
  const { supabase, user, hasAccess } = await getLibraryAccess();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasAccess)
    return NextResponse.json(
      { error: "The session planner is part of the Drills Library membership." },
      { status: 403 },
    );

  const req = parseRequest(await request.json().catch(() => null));
  if (!req)
    return NextResponse.json({ error: "Please pick an age group and session structure." }, { status: 400 });

  const [categories, { data: previousRows }] = await Promise.all([
    loadDrillCategories(),
    supabase
      .from("session_plans")
      .select("id, title, brief, age_group, duration_minutes, plan, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);
  const previous: SavedPlan[] = previousRows ?? [];
  const previousChosen = req.previousPlanId
    ? (previous.find((p) => p.id === req.previousPlanId) ?? null)
    : null;

  const catalog = buildCatalog(categories, req.ageGroup);

  let plan: SessionPlan | null = null;
  try {
    plan = await askClaude(req, catalog, previous, previousChosen);
  } catch (error) {
    console.error("Session planner AI failed", error);
  }
  plan ??= matchPlan(req, catalog, previousChosen);

  const { data: saved, error } = await supabase
    .from("session_plans")
    .insert({
      user_id: user.id,
      title: plan.title,
      brief: req.brief || null,
      age_group: req.ageGroup,
      duration_minutes: totalMinutes(req.blocks),
      plan: { ...plan, progress: req.progress, progressNote: req.progressNote },
    })
    .select("id, title, brief, age_group, duration_minutes, plan, created_at")
    .single();

  if (error) {
    console.error("Failed to save session plan", error);
    return NextResponse.json({ plan, saved: null });
  }
  return NextResponse.json({ plan, saved });
}
