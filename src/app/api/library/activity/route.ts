import { NextResponse } from "next/server";
import { getLibraryAccess } from "@/lib/drills-store.server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Members' library activity: star / unstar a drill, or record a video play.
 * Writes go through the member's own session (row-level security).
 */
export async function POST(request: Request) {
  const { supabase, user, hasAccess, isAdmin } = await getLibraryAccess();
  if (!user || !hasAccess)
    return NextResponse.json({ error: "Members only." }, { status: 403 });

  const { type, drillId } = (await request.json().catch(() => ({}))) as {
    type?: string;
    drillId?: string;
  };
  if (!drillId || !UUID.test(drillId))
    return NextResponse.json({ error: "Unknown drill." }, { status: 400 });

  if (type === "view") {
    // Caitlyn's own viewing would skew the report.
    if (isAdmin) return NextResponse.json({ ok: true, skipped: true });
    const { error } = await supabase
      .from("drill_views")
      .insert({ user_id: user.id, drill_id: drillId });
    if (error) console.error("Drill view not recorded", error);
    return NextResponse.json({ ok: !error });
  }

  if (type === "favourite") {
    const { error } = await supabase
      .from("drill_favourites")
      .upsert(
        { user_id: user.id, drill_id: drillId },
        { onConflict: "user_id,drill_id", ignoreDuplicates: true },
      );
    if (error)
      return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "unfavourite") {
    const { error } = await supabase
      .from("drill_favourites")
      .delete()
      .eq("user_id", user.id)
      .eq("drill_id", drillId);
    if (error)
      return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
