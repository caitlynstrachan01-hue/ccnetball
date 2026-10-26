import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Create a new competition. During the build phase, admins can create
 * without a paid licence — a free "admin bypass" licence is generated
 * on the fly. Non-admins must have an unused competition_licence row.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const startDate = body?.startDate;
  if (!name || !startDate) {
    return NextResponse.json(
      { error: "A competition name and start date are needed." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.is_admin === true;

  // Find an unused licence; admins get an on-the-fly free one so they
  // can build and iterate without paying.
  let licenceId: string | null = null;
  const { data: unused } = await supabase
    .from("competition_licences")
    .select("id")
    .eq("user_id", user.id)
    .is("consumed_by_competition_id", null)
    .order("purchased_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (unused) {
    licenceId = unused.id;
  } else if (isAdmin) {
    const { data: adminLic, error: licError } = await supabase
      .from("competition_licences")
      .insert({
        user_id: user.id,
        amount_cents: 0,
        currency: "aud",
      })
      .select("id")
      .single();
    if (licError || !adminLic) {
      console.error("admin licence grant failed:", licError);
      return NextResponse.json(
        { error: "Could not grant admin licence." },
        { status: 500 },
      );
    }
    licenceId = adminLic.id;
  } else {
    return NextResponse.json(
      {
        error:
          "You don't have a licence yet. Buy a Competition Builder licence from the shop first.",
      },
      { status: 403 },
    );
  }

  const { data: comp, error: compError } = await supabase
    .from("competitions")
    .insert({
      licence_id: licenceId,
      owner_user_id: user.id,
      name,
      start_date: startDate,
    })
    .select("id")
    .single();
  if (compError || !comp) {
    console.error("competition create failed:", compError);
    return NextResponse.json(
      {
        error: "Could not create the competition.",
        detail: compError?.message,
      },
      { status: 500 },
    );
  }

  await supabase
    .from("competition_licences")
    .update({
      consumed_by_competition_id: comp.id,
      consumed_at: new Date().toISOString(),
    })
    .eq("id", licenceId);

  return NextResponse.json({ id: comp.id });
}
