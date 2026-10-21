import type { DrillCategory } from "@/lib/drills-library-content";
import { bunnyEmbedUrl } from "@/lib/bunny.server";
import { checkDevice } from "@/lib/device-limit.server";
import {
  BUNNY_PREFIX,
  DRILL_ROW_COLUMN_SETS,
  DRILL_VIDEO_BUCKET,
  mergeDrills,
  type DrillRow,
} from "@/lib/drills-store";
import type { SupabaseClient } from "@supabase/supabase-js";
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
    return await loadFromDatabase(createAdminClient(), includeUnpublished);
  } catch (error) {
    // Service-role key missing or wrong on the server — read through the
    // viewer's own session instead (row-level security still applies).
    console.error("Drills: service-role load failed, using session", error);
  }
  try {
    return await loadFromDatabase(await createClient(), includeUnpublished);
  } catch (error) {
    // Never take the library down — fall back to the built-in drill list.
    console.error("Failed to load drills from Supabase", error);
    return mergeDrills([]);
  }
}

async function loadFromDatabase(
  admin: SupabaseClient,
  includeUnpublished: boolean,
): Promise<DrillCategory[]> {
  const select = (columns: string) => {
    const query = admin.from("drills").select(columns);
    // Hidden rows must still load so they can knock out built-in drills.
    return includeUnpublished
      ? query
      : query.or("published.eq.true,hidden.eq.true");
  };
  // Try the newest columns first; an older database (missing column, 42703)
  // falls back to the previous set.
  let { data: rows, error } = await select(DRILL_ROW_COLUMN_SETS[0]);
  for (const columns of DRILL_ROW_COLUMN_SETS.slice(1)) {
    if (error?.code !== "42703") break;
    ({ data: rows, error } = await select(columns));
  }
  if (error) throw error;
  const drillRows = (rows ?? []) as unknown as DrillRow[];

  const videoUrls: Record<string, string> = {};
  for (const r of drillRows) {
    if (r.video_path?.startsWith(BUNNY_PREFIX)) {
      const url = bunnyEmbedUrl(r.video_path.slice(BUNNY_PREFIX.length), SIGNED_URL_TTL);
      if (url) videoUrls[r.video_path] = url;
    }
  }

  // Older uploads that went to Supabase Storage, plus drill pictures.
  const paths = drillRows
    .flatMap((r) => [r.video_path, r.image_path])
    .filter((p): p is string => !!p && !p.startsWith(BUNNY_PREFIX));

  if (paths.length) {
    const { data: signed } = await admin.storage
      .from(DRILL_VIDEO_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) videoUrls[s.path] = s.signedUrl;
    }
  }

  // Skill-sheet PDFs — signed as downloads so they save rather than open.
  const pdfPaths = drillRows
    .map((r) => r.pdf_path)
    .filter((p): p is string => !!p);
  if (pdfPaths.length) {
    const { data: signed } = await admin.storage
      .from(DRILL_VIDEO_BUCKET)
      .createSignedUrls(pdfPaths, SIGNED_URL_TTL, { download: true });
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
  if (!user)
    return {
      supabase,
      user: null,
      isAdmin: false,
      hasSubscription: false,
      deviceRevoked: false,
      hasAccess: false,
    };

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

  // Members are limited to DEVICE_LIMIT devices; a device signed out because
  // they signed in elsewhere loses access here (admins are exempt).
  const deviceRevoked =
    !isAdmin && hasSubscription
      ? (await checkDevice(supabase, user.id)) === "revoked"
      : false;

  return {
    supabase,
    user,
    isAdmin,
    hasSubscription,
    deviceRevoked,
    hasAccess: isAdmin || (hasSubscription && !deviceRevoked),
  };
}
