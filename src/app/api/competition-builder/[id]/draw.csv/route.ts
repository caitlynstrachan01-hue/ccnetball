import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function csvEscape(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Please sign in.", { status: 401 });

  const { data: comp } = await supabase
    .from("competitions")
    .select("owner_user_id, name")
    .eq("id", id)
    .maybeSingle();
  if (!comp) return new NextResponse("Not found.", { status: 404 });
  if (comp.owner_user_id !== user.id)
    return new NextResponse("Not your competition.", { status: 403 });

  const [gamesRes, teamsRes, courtsRes, slotsRes, divsRes] = await Promise.all([
    supabase
      .from("competition_fixture_games")
      .select(
        "round_number, court_id, timeslot_id, team_a_id, team_b_id, is_bye, created_at",
      )
      .eq("competition_id", id)
      .order("round_number", { ascending: true }),
    supabase
      .from("competition_teams")
      .select("id, name, division_id")
      .eq("competition_id", id),
    supabase
      .from("competition_courts")
      .select("id, name, ordinal")
      .eq("competition_id", id)
      .order("ordinal", { ascending: true }),
    supabase
      .from("competition_timeslots")
      .select("id, label, ordinal")
      .eq("competition_id", id)
      .order("ordinal", { ascending: true }),
    supabase
      .from("competition_divisions")
      .select("id, name")
      .eq("competition_id", id),
  ]);

  const teamName = (id: string | null) =>
    teamsRes.data?.find((t) => t.id === id)?.name ?? "";
  const courtName = (id: string | null) =>
    courtsRes.data?.find((c) => c.id === id)?.name ?? "";
  const slotLabel = (id: string | null) =>
    slotsRes.data?.find((s) => s.id === id)?.label ?? "";
  const divName = (teamId: string | null) => {
    const t = teamsRes.data?.find((x) => x.id === teamId);
    if (!t?.division_id) return "";
    return divsRes.data?.find((d) => d.id === t.division_id)?.name ?? "";
  };

  const header = [
    "Round",
    "Division",
    "Court",
    "Timeslot",
    "Home",
    "Away",
    "Bye",
  ].join(",");

  const rows = (gamesRes.data ?? []).map((g) => {
    const line = [
      String(g.round_number),
      csvEscape(divName(g.team_a_id)),
      csvEscape(courtName(g.court_id)),
      csvEscape(slotLabel(g.timeslot_id)),
      csvEscape(teamName(g.team_a_id)),
      csvEscape(teamName(g.team_b_id)),
      g.is_bye ? "Yes" : "",
    ];
    return line.join(",");
  });

  const csv = [header, ...rows].join("\n") + "\n";
  const filename = `${comp.name.replace(/[^a-z0-9]+/gi, "-")}-fixture.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
