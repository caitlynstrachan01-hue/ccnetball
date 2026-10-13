import { createAdminClient } from "@/lib/supabase/server";
import { normaliseBlocks, type SavedPlan } from "@/lib/session-planner";

const COLUMNS = "id, title, brief, age_group, duration_minutes, plan, created_at";

export type ReviewPlan = SavedPlan & {
  recommended: boolean;
  coach: string;
};

/**
 * Plans Caitlyn has recommended, safe to show any member: the original
 * coach's brief, notes and identity are stripped.
 */
export async function loadRecommendedPlans(): Promise<SavedPlan[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("session_plans")
      .select(COLUMNS)
      .eq("recommended", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return ((data ?? []) as SavedPlan[]).map((p) => ({
      id: p.id,
      title: p.title,
      brief: null,
      age_group: p.age_group,
      duration_minutes: p.duration_minutes,
      created_at: p.created_at,
      plan: {
        title: p.plan.title,
        summary: p.plan.summary,
        nextTime: p.plan.nextTime,
        source: p.plan.source,
        fullMatch: p.plan.fullMatch,
        blocks: normaliseBlocks(p.plan.blocks).map((b) => ({
          ...b,
          why: "",
        })),
      },
    }));
  } catch (error) {
    // Database without migration 0005 yet — just show none.
    console.error("Failed to load recommended plans", error);
    return [];
  }
}

/** Every member's saved plans, newest first, for Caitlyn to review. */
export async function loadPlansForReview(): Promise<ReviewPlan[]> {
  const admin = createAdminClient();
  const [{ data: plans, error }, { data: profiles }] = await Promise.all([
    admin
      .from("session_plans")
      .select(`${COLUMNS}, recommended, user_id`)
      .order("created_at", { ascending: false })
      .limit(200),
    admin.from("profiles").select("id, email, full_name"),
  ]);
  if (error) throw error;
  const names = new Map<string, string>(
    (profiles ?? []).map((p: { id: string; email: string | null; full_name: string | null }) => [
      p.id,
      p.full_name || p.email || "Coach",
    ]),
  );
  return ((plans ?? []) as (SavedPlan & { recommended: boolean; user_id: string })[]).map(
    ({ user_id, ...p }) => ({
      ...p,
      plan: { ...p.plan, blocks: normaliseBlocks(p.plan.blocks) },
      coach: names.get(user_id) ?? "Coach",
    }),
  );
}
