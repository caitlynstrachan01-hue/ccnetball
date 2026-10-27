import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { POSITIONS, computeFee, type Position } from "@/lib/trial-fees";

export const runtime = "nodejs";

type AdditionalFee = { label: string; amount_cents: number };
type DivisionIn = {
  key: string;
  id?: string;
  name: string;
  additionalFees: AdditionalFee[];
  associationPaysFees: boolean;
};
type SessionIn = {
  divisionKey: string;
  session_date: string;
  start_time?: string | null;
  end_time?: string | null;
  venue?: string | null;
};
type ManualIn = {
  age_group_id?: string;
  first?: string;
  last?: string;
  dob?: string;
  positions?: string[];
  history?: string;
  medical?: string;
  parentName?: string;
  parentEmail?: string;
  emergencyName?: string;
  emergencyPhone?: string;
};
type Body = {
  action?: "create" | "save" | "manual-add";
  trial?: {
    id?: string;
    name?: string;
    club?: string;
    club_email?: string;
    display_mode?: string;
    status?: string;
    registration_open?: boolean;
  };
  divisions?: DivisionIn[];
  sessions?: SessionIn[];
  manual?: ManualIn;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
function rand(n: number): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + n);
}
function cleanFees(list: unknown): AdditionalFee[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((f) => ({
      label: typeof f?.label === "string" ? f.label.trim() : "",
      amount_cents: Math.max(0, Math.round(Number(f?.amount_cents) || 0)),
    }))
    .filter((f) => f.label && f.amount_cents > 0);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // ---- CREATE a blank trial -------------------------------------------------
  if (body.action === "create") {
    const name = (body.trial?.name || "").trim();
    const club = (body.trial?.club || "").trim();
    const email = (body.trial?.club_email || "").trim();
    if (!name || !club) {
      return NextResponse.json(
        { error: "Please enter a trial name and your club/association name." },
        { status: 400 },
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid contact email." },
        { status: 400 },
      );
    }

    const base = slugify(`${club}-${name}`) || "trial";
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const slug = `${base}-${rand(4)}`;
      const { data, error } = await supabase
        .from("trials")
        .insert({
          owner_user_id: user.id,
          slug,
          name,
          club,
          club_email: email,
          status: "draft",
          registration_open: false,
        })
        .select("id")
        .single();
      if (!error && data) {
        return NextResponse.json({ id: data.id });
      }
      lastErr = error;
      // 23505 = unique violation on slug — retry with a new suffix.
      if (error?.code !== "23505") break;
    }
    console.error("Create trial failed:", lastErr);
    return NextResponse.json(
      { error: "Could not create the trial. Please try again." },
      { status: 500 },
    );
  }

  // ---- SAVE an existing trial (details + divisions + sessions) --------------
  if (body.action === "save") {
    const t = body.trial;
    if (!t?.id) {
      return NextResponse.json({ error: "Missing trial." }, { status: 400 });
    }

    // Ownership check (RLS also enforces this).
    const { data: owned } = await supabase
      .from("trials")
      .select("id")
      .eq("id", t.id)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (!owned) {
      return NextResponse.json({ error: "Trial not found." }, { status: 404 });
    }

    // Update trial details.
    const up = await supabase
      .from("trials")
      .update({
        name: (t.name || "").trim(),
        club: (t.club || "").trim(),
        club_email: (t.club_email || "").trim(),
        display_mode: (["number", "initial_surname", "first_initial"] as const).includes(
          t.display_mode as "number" | "initial_surname" | "first_initial",
        )
          ? t.display_mode
          : "number",
        status:
          t.status && ["draft", "open", "closed", "finalised"].includes(t.status)
            ? t.status
            : "draft",
        registration_open: Boolean(t.registration_open),
        updated_at: new Date().toISOString(),
      })
      .eq("id", t.id);
    if (up.error) {
      console.error("Update trial failed:", up.error);
      return NextResponse.json(
        { error: "Could not save trial details." },
        { status: 500 },
      );
    }

    const incoming = Array.isArray(body.divisions) ? body.divisions : [];
    const keyToId = new Map<string, string>();

    // Existing divisions for this trial.
    const { data: existing } = await supabase
      .from("trial_age_groups")
      .select("id")
      .eq("trial_id", t.id);
    const existingIds = new Set((existing ?? []).map((d) => d.id as string));
    const keptIds = new Set<string>();

    // Update existing, insert new.
    for (const d of incoming) {
      const name = (d.name || "").trim();
      if (!name) continue;
      const payload = {
        name,
        additional_fees: cleanFees(d.additionalFees),
        association_pays_fees: Boolean(d.associationPaysFees),
      };
      if (d.id && existingIds.has(d.id)) {
        await supabase.from("trial_age_groups").update(payload).eq("id", d.id);
        keyToId.set(d.key, d.id);
        keptIds.add(d.id);
      } else {
        const ins = await supabase
          .from("trial_age_groups")
          .insert({ trial_id: t.id, fee_cents: 220, ...payload })
          .select("id")
          .single();
        if (ins.data) keyToId.set(d.key, ins.data.id as string);
      }
    }

    // Delete divisions the club removed — but only if they have no participants.
    for (const id of existingIds) {
      if (keptIds.has(id)) continue;
      const { count } = await supabase
        .from("trial_participants")
        .select("id", { count: "exact", head: true })
        .eq("age_group_id", id);
      if ((count ?? 0) === 0) {
        await supabase.from("trial_age_groups").delete().eq("id", id);
      }
    }

    // Sessions: replace all for this trial (sessions have no dependents).
    await supabase.from("trial_sessions").delete().eq("trial_id", t.id);
    const sessionRows = (Array.isArray(body.sessions) ? body.sessions : [])
      .map((s, i) => {
        const ageGroupId = keyToId.get(s.divisionKey);
        if (!ageGroupId || !s.session_date) return null;
        return {
          trial_id: t.id!,
          age_group_id: ageGroupId,
          session_date: s.session_date,
          start_time: s.start_time || null,
          end_time: s.end_time || null,
          venue: s.venue || null,
          sort_order: i + 1,
        };
      })
      .filter(Boolean);
    if (sessionRows.length) {
      await supabase.from("trial_sessions").insert(sessionRows as object[]);
    }

    return NextResponse.json({ ok: true });
  }

  // ---- MANUAL-ADD a player (entered by the club, billed to the club) --------
  if (body.action === "manual-add") {
    const m = body.manual;
    const divisionId = (m?.age_group_id || "").trim();
    const first = (m?.first || "").trim();
    const last = (m?.last || "").trim();
    const positions = (Array.isArray(m?.positions) ? m!.positions : [])
      .map((p) => String(p).trim())
      .filter((p): p is Position => (POSITIONS as readonly string[]).includes(p));
    if (!divisionId || !first || !last) {
      return NextResponse.json(
        { error: "Please enter the player's name and age group." },
        { status: 400 },
      );
    }
    if (positions.length !== 2) {
      return NextResponse.json(
        { error: "Please choose the player's two preferred positions." },
        { status: 400 },
      );
    }

    // Verify the caller owns the division's trial, and read its fees.
    const { data: div } = await supabase
      .from("trial_age_groups")
      .select("id, trial_id, fee_cents, additional_fees, association_pays_fees")
      .eq("id", divisionId)
      .maybeSingle();
    if (!div) {
      return NextResponse.json({ error: "Age group not found." }, { status: 404 });
    }
    const { data: owned } = await supabase
      .from("trials")
      .select("id")
      .eq("id", div.trial_id)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (!owned) {
      return NextResponse.json({ error: "Trial not found." }, { status: 404 });
    }

    // A manual player is always billed to the club: the $2.20 + any add-ons for
    // this division are what the club owes (no card, no surcharge).
    const fee = computeFee({
      feeCents: (div.fee_cents as number) ?? 220,
      additionalFees: (div.additional_fees as { label: string; amount_cents: number }[]) ?? [],
      associationPaysFees: true, // never charge the (non-existent) card
    });
    const addonsTotal = fee.addonsTotal;
    const billedToClub = ((div.fee_cents as number) ?? 220) + addonsTotal;

    const admin = createAdminClient();
    // Next player number within the division.
    const { data: lastNum } = await admin
      .from("trial_participants")
      .select("player_number")
      .eq("age_group_id", divisionId)
      .not("player_number", "is", null)
      .order("player_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const playerNumber = ((lastNum?.player_number as number) ?? 0) + 1;

    const ins = await admin
      .from("trial_participants")
      .insert({
        trial_id: div.trial_id,
        age_group_id: divisionId,
        player_number: playerNumber,
        status: "manual",
        manual_entry: true,
        first_name: first,
        last_name: last,
        dob: (m?.dob || "").trim() || null,
        position_1: positions[0],
        position_2: positions[1],
        playing_history: (m?.history || "").trim() || null,
        medical: (m?.medical || "").trim() || "None",
        parent_name: (m?.parentName || "").trim() || null,
        parent_email: (m?.parentEmail || "").trim() || null,
        emergency_name: (m?.emergencyName || "").trim() || null,
        emergency_phone: (m?.emergencyPhone || "").trim() || null,
        amount_cents: billedToClub,
        fee_breakdown: { ...fee, billedToClub, manual: true },
      })
      .select(
        "id, age_group_id, player_number, first_name, last_name, position_1, position_2, status, manual_entry, draft_team, draft_bucket, purged",
      )
      .single();
    if (ins.error || !ins.data) {
      console.error("Manual-add failed:", ins.error);
      return NextResponse.json({ error: "Could not add the player." }, { status: 500 });
    }
    return NextResponse.json({ participant: ins.data, billedToClub });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
