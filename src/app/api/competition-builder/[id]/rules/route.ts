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

  const { data, error } = await r.supabase
    .from("competition_rules")
    .insert({
      competition_id: id,
      rule_type: ruleType,
      params: ruleParams,
      plain_english: plainEnglish,
    })
    .select("id")
    .single();
  if (error)
    return NextResponse.json(
      { error: "Could not save rule.", detail: error.message },
      { status: 500 },
    );
  return NextResponse.json({ id: data.id, plainEnglish });
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
