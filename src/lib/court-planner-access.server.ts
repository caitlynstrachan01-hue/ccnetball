import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CourtPlannerAccess = {
  expiresAt: string;
  purchasedAt: string;
  daysRemaining: number;
};

/**
 * Returns the active access row for the signed-in user, or null if
 * they're not signed in, have never bought, or their access has expired.
 */
export async function getCourtPlannerAccess(): Promise<CourtPlannerAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("court_planner_access")
    .select("expires_at, purchased_at")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const expires = new Date(data.expires_at).getTime();
  const daysRemaining = Math.max(
    0,
    Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  return {
    expiresAt: data.expires_at,
    purchasedAt: data.purchased_at,
    daysRemaining,
  };
}
