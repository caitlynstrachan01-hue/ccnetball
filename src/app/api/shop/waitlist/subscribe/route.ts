import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const productId = body?.productId;
  const email = body?.email?.trim().toLowerCase();
  const name = body?.name?.trim() || null;

  if (!productId || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Need a valid email and product." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Confirm the product exists; silently no-op for unknown ids.
  const { data: product } = await supabase
    .from("shop_physical_products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle();
  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 },
    );
  }

  // Idempotent insert — unique (product_id, email) means a repeat subscribe
  // from the same person just no-ops.
  const { error } = await supabase.from("shop_waitlist").insert({
    product_id: productId,
    email,
    name,
  });
  if (error && error.code !== "23505") {
    console.error("Waitlist subscribe failed:", error);
    return NextResponse.json(
      { error: "Could not add you to the waitlist." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
