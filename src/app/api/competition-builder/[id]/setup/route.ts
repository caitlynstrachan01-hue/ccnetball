import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim())
    update.name = body.name.trim();
  if (typeof body?.startDate === "string") update.start_date = body.startDate;
  if (typeof body?.roundsHomeAndAway === "number")
    update.rounds_home_and_away = Math.max(
      0,
      Math.floor(body.roundsHomeAndAway),
    );
  if (typeof body?.hasFinals === "boolean") update.has_finals = body.hasFinals;
  if (body?.fillMode === "even" || body?.fillMode === "maximum_play")
    update.fill_mode = body.fillMode;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true });
  }
  update.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("competitions")
    .update(update)
    .eq("id", id)
    .eq("owner_user_id", user.id);
  if (error) {
    return NextResponse.json(
      { error: "Could not save.", detail: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
