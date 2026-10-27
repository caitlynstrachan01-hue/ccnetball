import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RunTrial, type RunData } from "./run-trial";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Run trial — CC Netball",
  robots: { index: false, follow: false },
};

export default async function RunTrialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: trial } = await supabase
    .from("trials")
    .select("id, name, club, display_mode, status")
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!trial) notFound();

  const [{ data: groups }, { data: sessions }, { data: participants }] =
    await Promise.all([
      supabase
        .from("trial_age_groups")
        .select("id, name, sort_order, draft_team_count")
        .eq("trial_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("trial_sessions")
        .select("id, age_group_id, session_date, start_time, end_time, venue, sort_order")
        .eq("trial_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("trial_participants")
        .select(
          "id, age_group_id, player_number, first_name, last_name, position_1, position_2, status, manual_entry, draft_team, draft_bucket, purged",
        )
        .eq("trial_id", id)
        .order("player_number", { ascending: true }),
    ]);

  const sessionIds = (sessions ?? []).map((s) => s.id as string);
  const [{ data: attendance }, { data: games }] = await Promise.all([
    sessionIds.length
      ? supabase
          .from("trial_attendance")
          .select("session_id, participant_id, present")
          .in("session_id", sessionIds)
      : Promise.resolve({ data: [] as never[] }),
    sessionIds.length
      ? supabase
          .from("trial_session_games")
          .select("session_id, num_games, allow_shared, result")
          .in("session_id", sessionIds)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const data: RunData = {
    trial: {
      id: trial.id,
      name: trial.name,
      club: trial.club,
      display_mode: trial.display_mode === "initial_surname" ? "initial_surname" : "number",
      status: trial.status,
    },
    divisions: (groups ?? []).map((g) => ({
      id: g.id as string,
      name: g.name as string,
      draft_team_count: (g.draft_team_count as number) ?? 2,
    })),
    sessions: (sessions ?? []).map((s) => ({
      id: s.id as string,
      age_group_id: s.age_group_id as string,
      session_date: (s.session_date as string) ?? "",
      start_time: (s.start_time as string) ?? "",
      end_time: (s.end_time as string) ?? "",
      venue: (s.venue as string) ?? "",
    })),
    participants: (participants ?? []).map((p) => ({
      id: p.id as string,
      age_group_id: p.age_group_id as string,
      player_number: (p.player_number as number) ?? null,
      first_name: (p.first_name as string) ?? "",
      last_name: (p.last_name as string) ?? "",
      position_1: (p.position_1 as string) ?? null,
      position_2: (p.position_2 as string) ?? null,
      status: (p.status as string) ?? "pending",
      manual_entry: Boolean(p.manual_entry),
      draft_team: (p.draft_team as number) ?? null,
      draft_bucket: (p.draft_bucket as RunData["participants"][number]["draft_bucket"]) ?? null,
      purged: Boolean(p.purged),
    })),
    attendance: (attendance ?? []).map((a) => ({
      session_id: a.session_id as string,
      participant_id: a.participant_id as string,
      present: Boolean(a.present),
    })),
    games: (games ?? []).map((g) => ({
      session_id: g.session_id as string,
      num_games: (g.num_games as number) ?? 2,
      allow_shared: Boolean(g.allow_shared),
      result: g.result as RunData["games"][number]["result"],
    })),
  };

  return <RunTrial initial={data} />;
}
