import type { DrillCategory } from "@/lib/drills-library-content";
import {
  DRILL_ROW_COLUMNS,
  DRILL_VIDEO_BUCKET,
  mergeDrills,
  type DrillRow,
} from "@/lib/drills-store";
import { createAdminClient } from "@/lib/supabase/server";

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
  if (!includeUnpublished) query = query.eq("published", true);
  const { data: rows } = await query;
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
