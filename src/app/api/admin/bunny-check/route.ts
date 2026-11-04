import { NextResponse } from "next/server";
import { bunnyConfig, bunnyEmbedUrl } from "@/lib/bunny.server";
import { createAdminClient } from "@/lib/supabase/server";
import { getLibraryAccess } from "@/lib/drills-store.server";
import { BUNNY_PREFIX } from "@/lib/drills-store";

/**
 * Admin-only diagnostics: the Supabase service-role key, and video playback. Reports whether Bunny accepts
 * the site's signed player links — never returns the keys themselves.
 */
export async function GET() {
  const { supabase, isAdmin } = await getLibraryAccess();
  if (!isAdmin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const cfg = bunnyConfig();
  const keyInfo = (k: string | null | undefined) =>
    k
      ? { length: k.length, hasSpacesOrNewlines: /\s/.test(k), looksLikeUuid: /^[0-9a-f-]{36}$/i.test(k.trim()) }
      : "missing";

  const { data } = await supabase
    .from("drills")
    .select("title, video_path")
    .like("video_path", `${BUNNY_PREFIX}%`)
    .limit(1);
  const sample = data?.[0];
  const videoId = sample?.video_path?.slice(BUNNY_PREFIX.length);

  let video: unknown = "no Bunny video found";
  const player: Record<string, number | string> = {};
  if (cfg && videoId) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${cfg.libraryId}/videos/${videoId}`,
      { headers: { AccessKey: cfg.apiKey } },
    );
    video = res.ok
      ? (({ status, encodeProgress, length, title }) => ({ status, encodeProgress, length, title }))(await res.json())
      : `Bunny API answered ${res.status}`;

    const url = bunnyEmbedUrl(videoId, 600)!;
    for (const referer of ["https://ccnetball.com/", "https://www.ccnetball.com/", ""]) {
      const r = await fetch(url, { headers: referer ? { Referer: referer } : {} });
      const body = await r.text();
      player[referer || "no referer"] =
        `${r.status}${/404/.test(body.slice(0, 300)) ? " (404 page)" : ""}`;
    }
  }

  // The private Supabase key the shop and payments need.
  let serviceRoleKey = "missing";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { error } = await createAdminClient()
        .from("shop_orders")
        .select("id", { count: "exact", head: true });
      serviceRoleKey = error ? `rejected (${error.message})` : "works";
    } catch (e) {
      serviceRoleKey = `error (${e instanceof Error ? e.message : "unknown"})`;
    }
  }

  return NextResponse.json({
    serviceRoleKey,
    libraryId: cfg?.libraryId ?? "missing",
    apiKey: keyInfo(cfg?.apiKey),
    tokenKey: keyInfo(cfg?.tokenKey),
    sampleDrill: sample?.title ?? null,
    videoStatus: video, // Bunny status 4 = ready to play
    playerResponses: player,
  });
}
