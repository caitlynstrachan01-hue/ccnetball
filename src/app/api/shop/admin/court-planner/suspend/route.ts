import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_admin !== true) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const accessId: string | undefined = body?.accessId;
  const action: string | undefined = body?.action;
  const reason: string | undefined = body?.reason;

  if (!accessId || (action !== "suspend" && action !== "reactivate")) {
    return NextResponse.json(
      { error: "accessId and a valid action are required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const update =
    action === "suspend"
      ? {
          suspended_at: new Date().toISOString(),
          suspended_reason: reason?.trim() || null,
          suspended_by: user.id,
        }
      : {
          suspended_at: null,
          suspended_reason: null,
          suspended_by: null,
        };

  const { error } = await admin
    .from("court_planner_access")
    .update(update)
    .eq("id", accessId);

  if (error) {
    console.error("Court Planner suspend/reactivate failed:", error);
    return NextResponse.json(
      { error: "Could not update the access row." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
