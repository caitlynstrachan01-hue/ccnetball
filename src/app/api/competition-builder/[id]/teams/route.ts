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

/**
 * POST — accepts either { name } for one team, or { names: string[] } for
 * bulk add. Duplicate names (per competition) are silently skipped.
 */
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
  const divisionId: string | null = body?.divisionId ?? null;

  const incomingNames = Array.isArray(body?.names)
    ? (body.names as unknown[]).filter(
        (n): n is string => typeof n === "string" && n.trim().length > 0,
      )
    : typeof body?.name === "string" && body.name.trim()
      ? [body.name as string]
      : [];
  if (incomingNames.length === 0) {
    return NextResponse.json(
      { error: "At least one team name is required." },
      { status: 400 },
    );
  }

  const cleaned = incomingNames.map((n) => n.trim());
  const unique = Array.from(new Set(cleaned));

  const rows = unique.map((name) => ({
    competition_id: id,
    name,
    division_id: divisionId,
  }));
  const { data, error } = await r.supabase
    .from("competition_teams")
    .upsert(rows, { onConflict: "competition_id,name", ignoreDuplicates: true })
    .select("id, name");
  if (error)
    return NextResponse.json(
      { error: "Could not add teams.", detail: error.message },
      { status: 500 },
    );
  return NextResponse.json({ added: data ?? [] });
}

/**
 * PATCH — rename or reassign a team to a division (or null to unassign).
 */
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
  const teamId = body?.teamId;
  if (!teamId)
    return NextResponse.json(
      { error: "teamId is required." },
      { status: 400 },
    );
  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim())
    update.name = body.name.trim();
  if ("divisionId" in (body ?? {}))
    update.division_id = body.divisionId || null;
  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });

  const { error } = await r.supabase
    .from("competition_teams")
    .update(update)
    .eq("competition_id", id)
    .eq("id", teamId);
  if (error)
    return NextResponse.json(
      { error: "Could not update team.", detail: error.message },
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
  const teamId = searchParams.get("teamId");
  if (!teamId)
    return NextResponse.json(
      { error: "teamId is required." },
      { status: 400 },
    );

  const { error } = await r.supabase
    .from("competition_teams")
    .delete()
    .eq("competition_id", id)
    .eq("id", teamId);
  if (error)
    return NextResponse.json(
      { error: "Could not remove team." },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}
