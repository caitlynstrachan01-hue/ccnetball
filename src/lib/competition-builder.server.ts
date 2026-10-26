import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Competition,
  CompetitionCourt,
  CompetitionDivision,
  CompetitionLicence,
  CompetitionTeam,
  CompetitionTimeslot,
  FillMode,
} from "./competition-builder";

type CompetitionRow = {
  id: string;
  owner_user_id: string;
  licence_id: string;
  name: string;
  start_date: string;
  rounds_home_and_away: number;
  has_finals: boolean;
  fill_mode: string;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};

function toCompetition(row: CompetitionRow): Competition {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    licenceId: row.licence_id,
    name: row.name,
    startDate: row.start_date,
    roundsHomeAndAway: row.rounds_home_and_away,
    hasFinals: row.has_finals,
    fillMode: row.fill_mode as FillMode,
    lockedAt: row.locked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMyCompetitions(): Promise<Competition[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("competitions")
    .select(
      "id, owner_user_id, licence_id, name, start_date, rounds_home_and_away, has_finals, fill_mode, locked_at, created_at, updated_at",
    )
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listMyCompetitions failed:", error);
    return [];
  }
  return (data as CompetitionRow[]).map(toCompetition);
}

export async function listMyUnusedLicences(): Promise<CompetitionLicence[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("competition_licences")
    .select(
      "id, user_id, purchased_at, consumed_by_competition_id, consumed_at",
    )
    .eq("user_id", user.id)
    .is("consumed_by_competition_id", null)
    .order("purchased_at", { ascending: true });
  if (error) {
    console.error("listMyUnusedLicences failed:", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    purchasedAt: row.purchased_at,
    consumedByCompetitionId: row.consumed_by_competition_id,
    consumedAt: row.consumed_at,
  }));
}

export async function getCompetition(id: string): Promise<{
  competition: Competition;
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  divisions: CompetitionDivision[];
  teams: CompetitionTeam[];
} | null> {
  const supabase = await createClient();
  const { data: compRow, error: compError } = await supabase
    .from("competitions")
    .select(
      "id, owner_user_id, licence_id, name, start_date, rounds_home_and_away, has_finals, fill_mode, locked_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (compError || !compRow) return null;

  const [courts, timeslots, divisions, teams] = await Promise.all([
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
      .from("competition_divisions")
      .select("id, competition_id, name, ordinal, locked_court_id")
      .eq("competition_id", id)
      .order("ordinal", { ascending: true }),
    supabase
      .from("competition_teams")
      .select("id, competition_id, name, division_id")
      .eq("competition_id", id)
      .order("name", { ascending: true }),
  ]);

  return {
    competition: toCompetition(compRow as CompetitionRow),
    courts: (courts.data ?? []).map((r) => ({
      id: r.id,
      competitionId: r.competition_id,
      name: r.name,
      ordinal: r.ordinal,
    })),
    timeslots: (timeslots.data ?? []).map((r) => ({
      id: r.id,
      competitionId: r.competition_id,
      label: r.label,
      startsAtMinutes: r.starts_at_minutes,
      ordinal: r.ordinal,
    })),
    divisions: (divisions.data ?? []).map((r) => ({
      id: r.id,
      competitionId: r.competition_id,
      name: r.name,
      ordinal: r.ordinal,
      lockedCourtId: r.locked_court_id,
    })),
    teams: (teams.data ?? []).map((r) => ({
      id: r.id,
      competitionId: r.competition_id,
      name: r.name,
      divisionId: r.division_id,
    })),
  };
}

export async function isCompetitionBuilderAccessAllowed(): Promise<{
  user: { id: string; email: string | null } | null;
  isAdmin: boolean;
  unusedLicenceCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, isAdmin: false, unusedLicenceCount: 0 };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.is_admin === true;
  const licences = await listMyUnusedLicences();
  return {
    user: { id: user.id, email: user.email ?? null },
    isAdmin,
    unusedLicenceCount: licences.length,
  };
}
