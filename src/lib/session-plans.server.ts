import { createAdminClient } from "@/lib/supabase/server";
import { normaliseBlocks, type SavedPlan } from "@/lib/session-planner";

const COLUMNS = "id, title, brief, age_group, duration_minutes, plan, created_at";

export type ReviewPlan = SavedPlan & {
  recommended: boolean;
  coach: string;
};

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
