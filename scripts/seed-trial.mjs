// Seed a sample trial for testing. Run with:
//   node --env-file=.env.local scripts/seed-trial.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SLUG = "demo-trials-2027";

async function main() {
  // Clean any previous seed (cascades to divisions/sessions/participants).
  await db.from("trials").delete().eq("slug", SLUG);

  const { data: trial, error: tErr } = await db
    .from("trials")
    .insert({
      slug: SLUG,
      name: "Demo Netball Club Trials 2027",
      club: "Demo Netball Club",
      club_email: "manager@demonetball.com.au",
      status: "open",
      registration_open: true,
      display_mode: "number",
      retention_months: 3,
    })
    .select("id")
    .single();
  if (tErr) throw tErr;

  const { data: divisions, error: dErr } = await db
    .from("trial_age_groups")
    .insert([
      {
        trial_id: trial.id,
        name: "Under 14",
        sort_order: 1,
        fee_cents: 220,
        additional_fees: [
          { label: "Umpires", amount_cents: 500 },
          { label: "Court hire", amount_cents: 300 },
        ],
        association_pays_fees: false, // participant pays — used for the Stripe test
      },
      {
        trial_id: trial.id,
        name: "Under 16",
        sort_order: 2,
        fee_cents: 220,
        additional_fees: [],
        association_pays_fees: true, // club covers — FREE to the player (no Stripe)
      },
    ])
    .select("id, name");
  if (dErr) throw dErr;

  const u14 = divisions.find((d) => d.name === "Under 14");
  const u16 = divisions.find((d) => d.name === "Under 16");

  const { error: sErr } = await db.from("trial_sessions").insert([
    {
      trial_id: trial.id,
      age_group_id: u14.id,
      session_date: "2027-02-03",
      start_time: "5:30 pm",
      end_time: "7:00 pm",
      venue: "Demo Stadium — Court 1",
      sort_order: 1,
    },
    {
      trial_id: trial.id,
      age_group_id: u16.id,
      session_date: "2027-02-10",
      start_time: "5:30 pm",
      end_time: "7:00 pm",
      venue: "Demo Stadium — Court 2",
      sort_order: 1,
    },
  ]);
  if (sErr) throw sErr;

  console.log("Seeded trial:", SLUG);
  console.log("Registration URL: /trials/" + SLUG);
  console.log("  - Under 14: participant pays ($2.20 + umpires $5 + court hire $3 + surcharge)");
  console.log("  - Under 16: FREE to player (club covers) — testable without Stripe");
}

main().catch((e) => {
  console.error("Seed failed:", e.message || e);
  process.exit(1);
});
