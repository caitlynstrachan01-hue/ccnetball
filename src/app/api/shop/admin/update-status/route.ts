import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RESOLUTIONS = ["refunded", "cancelled", "collected-in-person"] as const;
type Resolution = (typeof RESOLUTIONS)[number];

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
  const orderId: string | undefined = body?.orderId;
  const resolution: Resolution | undefined = body?.resolution;
  if (
    !orderId ||
    !resolution ||
    !(RESOLUTIONS as readonly string[]).includes(resolution)
  ) {
    return NextResponse.json(
      { error: "Order id and a valid resolution are required." },
      { status: 400 },
    );
  }

  let update: Record<string, unknown>;
  if (resolution === "refunded") {
    update = { status: "refunded" };
  } else if (resolution === "cancelled") {
    update = { status: "cancelled" };
  } else {
    update = {
      status: "fulfilled",
      tracking_number: "COLLECTED IN PERSON",
      shipped_at: new Date().toISOString(),
    };
  }

  const { error: updateError } = await supabase
    .from("shop_orders")
    .update(update)
    .eq("id", orderId);
  if (updateError) {
    console.error("update-status failed:", updateError);
    return NextResponse.json(
      { error: "Could not update the order." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
