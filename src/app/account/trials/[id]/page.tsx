import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrialEditor, type EditorTrial } from "./trial-editor";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Edit trial — CC Netball",
  robots: { index: false, follow: false },
};

export default async function EditTrialPage({
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
    .select("id, slug, name, club, club_email, display_mode, status, registration_open")
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!trial) notFound();

  const [{ data: groups }, { data: sessions }] = await Promise.all([
    supabase
      .from("trial_age_groups")
      .select("id, name, additional_fees, association_pays_fees, sort_order")
      .eq("trial_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("trial_sessions")
      .select("id, age_group_id, session_date, start_time, end_time, venue, sort_order")
      .eq("trial_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const initial: EditorTrial = {
    id: trial.id,
    slug: trial.slug,
    name: trial.name,
    club: trial.club,
    club_email: trial.club_email,
    display_mode: trial.display_mode === "initial_surname" ? "initial_surname" : "number",
    status: trial.status,
    registration_open: Boolean(trial.registration_open),
    divisions: (groups ?? []).map((g) => ({
      key: g.id as string,
      id: g.id as string,
      name: g.name as string,
      additionalFees: (g.additional_fees as { label: string; amount_cents: number }[]) ?? [],
      associationPaysFees: Boolean(g.association_pays_fees),
    })),
    sessions: (sessions ?? []).map((s) => ({
      divisionKey: s.age_group_id as string,
      session_date: (s.session_date as string) ?? "",
      start_time: (s.start_time as string) ?? "",
      end_time: (s.end_time as string) ?? "",
      venue: (s.venue as string) ?? "",
    })),
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <TrialEditor initial={initial} />
    </section>
  );
}
