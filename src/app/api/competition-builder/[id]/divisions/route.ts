import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireOwner(competitionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "signin" as const, supabase };
  const { data: comp } = await supabase
    .from("competitions")
    .select("owner_user_id")
    .eq("id", competitionId)
    .maybeSingle();
  if (!comp || comp.owner_user_id !== user.id)
    return { error: "forbidden" as const, supabase };
  return { supabase };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await requireOwner(id);
  if (r.error === "signin")
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (r.error === "forbidden")
    return NextResponse.json({ error: "Not your competition." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name)
    return NextResponse.json(
      { error: "A division name is required." },
      { status: 400 },
    );

  const { data: existing } = await r.supabase
    .from("competition_divisions")
    .select("ordinal")
    .eq("competition_id", id)
    .order("ordinal", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrdinal = (existing?.ordinal ?? -1) + 1;

  const { data, error } = await r.supabase
    .from("competition_divisions")
    .insert({ competition_id: id, name, ordinal: nextOrdinal })
    .select("id")
    .single();
  if (error)
    return NextResponse.json(
      { error: "Could not add division.", detail: error.message },
      { status: 500 },
    );
  return NextResponse.json({ id: data.id });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await requireOwner(id);
  if (r.error === "signin")
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (r.error === "forbidden")
    return NextResponse.json({ error: "Not your competition." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const divisionId = body?.divisionId;
  if (!divisionId)
    return NextResponse.json(
      { error: "divisionId is required." },
      { status: 400 },
    );
  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim())
    update.name = body.name.trim();
  if ("lockedCourtId" in (body ?? {}))
    update.locked_court_id = body.lockedCourtId || null;
  if (typeof body?.ordinal === "number") update.ordinal = body.ordinal;
  if (Object.keys(update).length === 0)
    return NextResponse.json({ ok: true });

  const { error } = await r.supabase
    .from("competition_divisions")
    .update(update)
    .eq("competition_id", id)
    .eq("id", divisionId);
  if (error)
    return NextResponse.json(
      { error: "Could not update division." },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await requireOwner(id);
  if (r.error === "signin")
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (r.error === "forbidden")
    return NextResponse.json({ error: "Not your competition." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const divisionId = searchParams.get("divisionId");
  if (!divisionId)
    return NextResponse.json(
      { error: "divisionId is required." },
      { status: 400 },
    );

  // Teams in this division move back to unassigned.
  await r.supabase
    .from("competition_teams")
    .update({ division_id: null })
    .eq("competition_id", id)
    .eq("division_id", divisionId);

  const { error } = await r.supabase
    .from("competition_divisions")
    .delete()
    .eq("competition_id", id)
    .eq("id", divisionId);
  if (error)
    return NextResponse.json(
      { error: "Could not remove division." },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}
