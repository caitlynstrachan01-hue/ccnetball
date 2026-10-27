import { createClient } from "@/lib/supabase/server";
import type { AdditionalFee } from "@/lib/trial-fees";
import type {
  TrialPublic,
  TrialDivision,
  TrialSession,
} from "@/lib/trial-types";

export type { TrialPublic, TrialDivision, TrialSession };

/** Load a trial + its divisions + sessions for the public registration page.
 *  Uses the anon client — RLS allows reading these non-personal rows. */
export async function getTrialBySlug(slug: string): Promise<TrialPublic | null> {
  const supabase = await createClient();

  const { data: trial } = await supabase
    .from("trials")
    .select("id, slug, name, club, registration_open, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!trial) return null;

  const [{ data: groups }, { data: sessions }] = await Promise.all([
    supabase
      .from("trial_age_groups")
      .select("id, name, fee_cents, additional_fees, association_pays_fees, sort_order")
      .eq("trial_id", trial.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("trial_sessions")
      .select("id, age_group_id, session_date, start_time, end_time, venue, sort_order")
      .eq("trial_id", trial.id)
      .order("sort_order", { ascending: true }),
  ]);

  const divisions: TrialDivision[] = (groups ?? []).map((g) => ({
    id: g.id as string,
    name: g.name as string,
    feeCents: (g.fee_cents as number) ?? 220,
    additionalFees: ((g.additional_fees as AdditionalFee[]) ?? []).filter(Boolean),
    associationPaysFees: Boolean(g.association_pays_fees),
    sessions: (sessions ?? [])
      .filter((s) => s.age_group_id === g.id)
      .map((s) => ({
        id: s.id as string,
        session_date: s.session_date as string,
        start_time: (s.start_time as string) ?? null,
        end_time: (s.end_time as string) ?? null,
        venue: (s.venue as string) ?? null,
      })),
  }));

  return {
    id: trial.id as string,
    slug: trial.slug as string,
    name: trial.name as string,
    club: trial.club as string,
    registrationOpen: Boolean(trial.registration_open),
    status: trial.status as string,
    divisions,
  };
}
