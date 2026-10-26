import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDraw } from "@/lib/competition-builder-draw";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { data: comp, error: compErr } = await supabase
    .from("competitions")
    .select("owner_user_id, rounds_home_and_away, fill_mode")
    .eq("id", id)
    .maybeSingle();
  if (compErr || !comp)
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (comp.owner_user_id !== user.id)
    return NextResponse.json({ error: "Not your competition." }, { status: 403 });

  const [teamsRes, divsRes, courtsRes, slotsRes, rulesRes] = await Promise.all([
    supabase
      .from("competition_teams")
      .select("id, competition_id, name, division_id")
      .eq("competition_id", id),
    supabase
      .from("competition_divisions")
      .select("id, competition_id, name, ordinal, locked_court_id")
      .eq("competition_id", id)
      .order("ordinal", { ascending: true }),
    supabase
      .from("competition_courts")
      .select("id, competition_id, name, ordinal")
      .eq("competition_id", id)
      .order("ordinal", { ascending: true }),
    supabase
      .from("competition_timeslots")
      .select("id, competition_id, label, starts_at_minutes, ordinal")
      .eq("competition_id", id)
      .order("ordinal", { ascending: true }),
    supabase
      .from("competition_rules")
      .select("id, competition_id, rule_type, params, plain_english, created_at")
      .eq("competition_id", id),
  ]);

  const teams = (teamsRes.data ?? []).map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    name: r.name,
    divisionId: r.division_id,
  }));
  const divisions = (divsRes.data ?? []).map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    name: r.name,
    ordinal: r.ordinal,
    lockedCourtId: r.locked_court_id,
  }));
  const courts = (courtsRes.data ?? []).map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    name: r.name,
    ordinal: r.ordinal,
  }));
  const timeslots = (slotsRes.data ?? []).map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    label: r.label,
    startsAtMinutes: r.starts_at_minutes,
    ordinal: r.ordinal,
  }));
  const rules = (rulesRes.data ?? []).map((r) => ({
    id: r.id,
    competitionId: r.competition_id,
    ruleType: r.rule_type,
    params: r.params,
    plainEnglish: r.plain_english,
    createdAt: r.created_at,
  }));

  const result = generateDraw({
    teams,
    divisions,
    courts,
    timeslots,
    // Rules are passed through directly — the generator uses the typed Rule
    // shape from the lib and only reads ruleType + params.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rules: rules as any,
    totalRounds: comp.rounds_home_and_away ?? 0,
  });

  // Replace any existing generated fixture; a redraw always wipes the
  // previous attempt first so stale cells never confuse the display.
  await supabase
    .from("competition_fixture_games")
    .delete()
    .eq("competition_id", id);

  if (result.games.length > 0) {
    const rows = result.games.map((g) => ({
      competition_id: id,
      round_number: g.round,
      court_id: g.courtId,
      timeslot_id: g.timeslotId,
      team_a_id: g.teamAId,
      team_b_id: g.teamBId,
      is_bye: g.isBye,
    }));
    const { error: insErr } = await supabase
      .from("competition_fixture_games")
      .insert(rows);
    if (insErr) {
      console.error("fixture insert failed:", insErr);
      return NextResponse.json(
        {
          error: "Draw was generated but could not be saved.",
          detail: insErr.message,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    totalGames: result.games.length,
    unplaced: result.games.filter((g) => g.unplaced).length,
    issues: result.issues,
    ruleOutcomes: result.ruleOutcomes,
  });
}
