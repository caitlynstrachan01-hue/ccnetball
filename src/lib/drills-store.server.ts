import type { DrillCategory } from "@/lib/drills-library-content";
import {
  DRILL_ROW_COLUMNS,
  DRILL_VIDEO_BUCKET,
  mergeDrills,
  type DrillRow,
} from "@/lib/drills-store";
import { createAdminClient, createClient } from "@/lib/supabase/server";

/** Seconds a member's video link stays valid. */
const SIGNED_URL_TTL = 60 * 60 * 6;

/**
 * Load saved drills plus signed video links. Call only after the viewer's
 * access has been checked — this uses the service-role client.
 */
export async function loadDrillCategories({
  includeUnpublished = false,
} = {}): Promise<DrillCategory[]> {
  try {
    return await loadFromDatabase(includeUnpublished);
  } catch (error) {
    // Never take the library down — fall back to the built-in drill list.
    console.error("Failed to load drills from Supabase", error);
    return mergeDrills([]);
  }
}

async function loadFromDatabase(
  includeUnpublished: boolean,
): Promise<DrillCategory[]> {
  const admin = createAdminClient();

  let query = admin.from("drills").select(DRILL_ROW_COLUMNS);
  // Hidden rows must still load so they can knock out built-in drills.
  if (!includeUnpublished) query = query.or("published.eq.true,hidden.eq.true");
  const { data: rows, error } = await query;
  if (error) throw error;
  const drillRows: DrillRow[] = rows ?? [];

  const paths = drillRows
    .map((r) => r.video_path)
    .filter((p): p is string => Boolean(p));

  const videoUrls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await admin.storage
      .from(DRILL_VIDEO_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) videoUrls[s.path] = s.signedUrl;
    }
  }

  return mergeDrills(drillRows, videoUrls);
}

/** Who is viewing and whether they can open the members library. */
export async function getLibraryAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false, hasAccess: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.is_admin === true;

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("product_slug", "drills-library")
    .eq("status", "active")
    .maybeSingle();
  const hasSubscription =
    Boolean(entitlement) &&
    (!entitlement?.expires_at || new Date(entitlement.expires_at) > new Date());

  return {
    supabase,
    user,
    isAdmin,
    hasSubscription,
    hasAccess: isAdmin || hasSubscription,
  };
}
