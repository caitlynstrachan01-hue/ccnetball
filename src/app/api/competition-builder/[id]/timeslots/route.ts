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
  const label = body?.label?.trim();
  if (!label)
    return NextResponse.json(
      { error: "A timeslot label is required." },
      { status: 400 },
    );
  const startsAtMinutes =
    typeof body?.startsAtMinutes === "number" ? body.startsAtMinutes : null;

  const { data: existing } = await r.supabase
    .from("competition_timeslots")
    .select("ordinal")
    .eq("competition_id", id)
    .order("ordinal", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrdinal = (existing?.ordinal ?? -1) + 1;

  const { data, error } = await r.supabase
    .from("competition_timeslots")
    .insert({
      competition_id: id,
      label,
      starts_at_minutes: startsAtMinutes,
      ordinal: nextOrdinal,
    })
    .select("id")
    .single();
  if (error)
    return NextResponse.json(
      { error: "Could not add timeslot.", detail: error.message },
      { status: 500 },
    );
  return NextResponse.json({ id: data.id });
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
  const timeslotId = searchParams.get("timeslotId");
  if (!timeslotId)
    return NextResponse.json(
      { error: "timeslotId is required." },
      { status: 400 },
    );

  const { error } = await r.supabase
    .from("competition_timeslots")
    .delete()
    .eq("competition_id", id)
    .eq("id", timeslotId);
  if (error)
    return NextResponse.json(
      { error: "Could not remove timeslot." },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}
