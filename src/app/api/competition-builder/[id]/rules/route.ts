import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  renderRulePlainEnglish,
  type RuleType,
} from "@/lib/competition-builder";

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

const VALID_TYPES: RuleType[] = [
  "team_timeslot_required",
  "team_timeslot_forbidden",
  "teams_different_times",
  "court_closed_round",
  "division_timeslots",
  "division_locked_court",
  "team_bye_round",
];

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
  const ruleType = body?.ruleType as RuleType | undefined;
  const ruleParams = body?.params;
  if (!ruleType || !VALID_TYPES.includes(ruleType))
    return NextResponse.json(
      { error: "A valid rule type is required." },
      { status: 400 },
    );
  if (!ruleParams || typeof ruleParams !== "object")
    return NextResponse.json(
      { error: "Rule parameters are required." },
      { status: 400 },
    );

  const [teamsRes, slotsRes, courtsRes, divsRes] = await Promise.all([
    r.supabase
      .from("competition_teams")
      .select("id, name")
      .eq("competition_id", id),
    r.supabase
      .from("competition_timeslots")
      .select("id, label")
      .eq("competition_id", id),
    r.supabase
      .from("competition_courts")
      .select("id, name")
      .eq("competition_id", id),
    r.supabase
      .from("competition_divisions")
      .select("id, name")
      .eq("competition_id", id),
  ]);

  const plainEnglish = renderRulePlainEnglish(ruleType, ruleParams, {
    teams: teamsRes.data ?? [],
    timeslots: slotsRes.data ?? [],
    courts: courtsRes.data ?? [],
    divisions: divsRes.data ?? [],
  });

  // Default a new rule to the lowest priority (largest number) so existing
  // rules keep their rank. The admin can drag it up afterwards.
  const { data: maxRow } = await r.supabase
    .from("competition_rules")
    .select("priority")
    .eq("competition_id", id)
    .order("priority", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  const nextPriority = (maxRow?.priority ?? 0) + 1;

  const { data, error } = await r.supabase
    .from("competition_rules")
    .insert({
      competition_id: id,
      rule_type: ruleType,
      params: ruleParams,
      plain_english: plainEnglish,
      priority: nextPriority,
    })
    .select("id")
    .single();
  if (error)
    return NextResponse.json(
      { error: "Could not save rule.", detail: error.message },
      { status: 500 },
    );
  return NextResponse.json({
    id: data.id,
    plainEnglish,
    priority: nextPriority,
  });
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
  const orderedIds = body?.orderedIds;
  if (!Array.isArray(orderedIds) || orderedIds.some((x) => typeof x !== "string"))
    return NextResponse.json(
      { error: "orderedIds must be an array of rule ids in priority order." },
      { status: 400 },
    );

  // Verify every id belongs to this competition before we touch anything.
  const { data: existing } = await r.supabase
    .from("competition_rules")
    .select("id")
    .eq("competition_id", id);
  const existingIds = new Set((existing ?? []).map((row) => row.id));
  for (const rid of orderedIds) {
    if (!existingIds.has(rid))
      return NextResponse.json(
        { error: "A rule in the new order does not belong to this competition." },
        { status: 400 },
      );
  }

  // Write priorities in sequence. One-at-a-time is fine — only a handful of
  // rules per competition in practice.
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await r.supabase
      .from("competition_rules")
      .update({ priority: i + 1 })
      .eq("competition_id", id)
      .eq("id", orderedIds[i]);
    if (error)
      return NextResponse.json(
        { error: "Could not reorder rules.", detail: error.message },
        { status: 500 },
      );
  }
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
  const ruleId = searchParams.get("ruleId");
  if (!ruleId)
    return NextResponse.json(
      { error: "ruleId is required." },
      { status: 400 },
    );

  const { error } = await r.supabase
    .from("competition_rules")
    .delete()
    .eq("competition_id", id)
    .eq("id", ruleId);
  if (error)
    return NextResponse.json(
      { error: "Could not remove rule." },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}
