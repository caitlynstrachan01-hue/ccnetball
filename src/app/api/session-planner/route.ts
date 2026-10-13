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
import { createAdminClient } from "@/lib/supabase/server";
import {
  PROGRESS_OPTIONS,
  WARM_UP_PARTS,
  buildCatalog,
  candidateSlots,
  matchPlan,
  normaliseBlocks,
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
    fullMatch: b.fullMatch === true,
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
    ageGroups: d.ageGroups?.length ? d.ageGroups : "all",
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
    builtBy: p.plan.source === "coach" ? "the coach themselves" : "the planner",
    blocks: normaliseBlocks(p.plan.blocks).map((b) => ({
      block: b.label,
      minutes: b.minutes,
      drills: b.drills.map((d) => ({
        key: d.key,
        title: d.custom?.title || catalogByKey.get(d.key)?.drill.title || d.key,
        coachsOwnDrill: d.custom ? d.custom.notes || true : undefined,
        part: d.part,
      })),
      focus: b.coachingFocus || undefined,
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
            drills: {
              type: "array",
              description:
                "Library drills for this block, in running order. Warm-up: one per warm-up part. Ballwork/footwork/team drill: 2–3. Skill and match play: exactly 1. Empty if nothing in the library fits.",
              items: {
                type: "object",
                properties: {
                  key: { type: "string", description: "Drill key from the library." },
                  part: {
                    type: "string",
                    description: "Warm-up only: which part this drill covers, e.g. 'Plyometrics (single leg)'.",
                  },
                },
                required: ["key"],
              },
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
          required: ["drills", "coachingFocus", "why"],
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

const SYSTEM_PROMPT = `You are Caitlyn Strachan's session-planning assistant for CC Netball. Caitlyn is a former Australian Diamond and elite coach.
Build a training session for a netball coach using ONLY drills from the supplied library (match on each drill's key).

Caitlyn's session template — follow it:
- Warm-up (~10 min) made of short parts in this order: ${WARM_UP_PARTS.map((p) => `${p.label}${p.id === "plyometrics" ? " (2 drills, one must be single-leg)" : ""}`).join(", ")}. Warm-up drills are tagged with their part (e.g. "early movement", "plyometrics", "single leg"); skip a part if nothing is tagged for it.
- Ballwork / footwork / team drill (~10 min): 2–3 drills from ball-footwork or team-drill slots.
- Skills (10–15 min each): one drill per skill block, from ANY category (attack, defence, ballwork, footwork or team drills). Usually a mix of attack and defence unless the brief says otherwise. A typical one-hour session has 3 skills.
- Match play (~10 min): most teams can't play a full match, so use a half-court drill unless the coach says they can play a full match.

Who you're helping: most coaches are new or fairly inexperienced. They want quality, not super-hard drills, and to develop their athletes across the season. Prefer clear, achievable drills pitched at the age group, and use the coaching focus to give simple, practical cues.
Read the coach's brief carefully. Never reuse a drill within a session.
If building on a previous session: when athletes need more time, repeat or lightly vary those skills; when they're mostly there, progress them; when they're ready for something new, layer a related next skill rather than an unrelated one. Coaches' own sessions show what they like to run — learn from them. Avoid repeating recent drills unless consolidation is the point.
Caitlyn's own example sessions, when given, show the standard to aim for.
Australian English, warm and expert tone.`;

/** Caitlyn's own and recommended sessions — the planner's worked examples. */
async function loadExamplePlans(excludeUserId: string): Promise<SavedPlan[]> {
  try {
    const admin = createAdminClient();
    const { data: admins } = await admin
      .from("profiles")
      .select("id")
      .eq("is_admin", true);
    const ids = (admins ?? [])
      .map((a: { id: string }) => a.id)
      .filter((id: string) => id !== excludeUserId);
    // Caitlyn's own sessions plus coaches' plans she has recommended.
    const filters = ["recommended.eq.true"];
    if (ids.length) filters.push(`user_id.in.(${ids.join(",")})`);
    const { data, error } = await admin
      .from("session_plans")
      .select("id, title, brief, age_group, duration_minutes, plan, created_at")
      .or(filters.join(","))
      .neq("user_id", excludeUserId)
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) throw error;
    return ((data ?? []) as SavedPlan[]).map((p) => ({ ...p, brief: null }));
  } catch {
    return [];
  }
}

async function askClaude(
  req: PlannerRequest,
  catalog: CatalogDrill[],
  previous: SavedPlan[],
  previousChosen: SavedPlan | null,
  examples: SavedPlan[],
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
    matchPlay: req.fullMatch ? "They can play a full match" : "Half court (no full match available)",
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
    caitlynsExampleSessions: examples.length
      ? examples.map((p) => describePlan(p, catalogByKey))
      : undefined,
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
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
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
    const slots = candidateSlots(spec.slot);
    const max = spec.slot === "warm-up" ? 7 : spec.slot === "ball-footwork" ? 3 : 1;
    const drills = (Array.isArray(out.drills) ? out.drills : [])
      .flatMap((d: { key?: unknown; part?: unknown }) => {
        const pick = typeof d?.key === "string" ? catalogByKey.get(d.key) : undefined;
        if (!pick || !slots.includes(pick.slot) || used.has(pick.key)) return [];
        used.add(pick.key);
        return [{ key: pick.key, part: typeof d.part === "string" ? d.part.slice(0, 60) : undefined }];
      })
      .slice(0, max);
    return {
      ...spec,
      drills,
      coachingFocus: String(out.coachingFocus ?? ""),
      why: String(out.why ?? ""),
    };
  });

  // Fill any block the AI left empty with the built-in matcher's choice.
  const fallback = matchPlan(
    req,
    catalog.filter((c) => !used.has(c.key)),
    previousChosen,
  );
  blocks.forEach((b, i) => {
    if (b.drills.length === 0 && fallback.blocks[i]?.drills.length) {
      b.drills = fallback.blocks[i].drills;
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
  const previous = ((previousRows ?? []) as SavedPlan[]).map((p) => ({
    ...p,
    plan: { ...p.plan, blocks: normaliseBlocks(p.plan.blocks) },
  }));
  const previousChosen = req.previousPlanId
    ? (previous.find((p) => p.id === req.previousPlanId) ?? null)
    : null;

  const catalog = buildCatalog(categories, req.ageGroup);

  let plan: SessionPlan | null = null;
  try {
    const examples = process.env.ANTHROPIC_API_KEY
      ? await loadExamplePlans(user.id)
      : [];
    plan = await askClaude(req, catalog, previous, previousChosen, examples);
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
      plan: {
        ...plan,
        progress: req.progress,
        progressNote: req.progressNote,
        fullMatch: req.fullMatch,
      },
    })
    .select("id, title, brief, age_group, duration_minutes, plan, created_at")
    .single();

  if (error) {
    console.error("Failed to save session plan", error);
    return NextResponse.json({ plan, saved: null });
  }
  return NextResponse.json({ plan, saved });
}
