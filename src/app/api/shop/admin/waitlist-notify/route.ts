import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBackInStockNotification } from "@/lib/shop-order-email";

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
  const productId = body?.productId;
  if (!productId) {
    return NextResponse.json(
      { error: "productId is required." },
      { status: 400 },
    );
  }

  const { data: product } = await supabase
    .from("shop_physical_products")
    .select("id, slug, name, stock")
    .eq("id", productId)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  if (product.stock <= 0) {
    return NextResponse.json(
      {
        error:
          "Add stock to this product first — people only want to hear from you once there's something to buy.",
      },
      { status: 400 },
    );
  }

  const { data: entries, error: fetchError } = await supabase
    .from("shop_waitlist")
    .select("id, email, name")
    .eq("product_id", productId)
    .is("notified_at", null);
  if (fetchError) {
    console.error("waitlist-notify fetch failed:", fetchError);
    return NextResponse.json(
      { error: "Could not read the waitlist." },
      { status: 500 },
    );
  }

  let sent = 0;
  const failures: string[] = [];
  for (const entry of entries ?? []) {
    try {
      await sendBackInStockNotification({
        email: entry.email,
        name: entry.name,
        productName: product.name,
        productSlug: product.slug,
      });
      await supabase
        .from("shop_waitlist")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", entry.id);
      sent += 1;
    } catch (err) {
      console.error("waitlist-notify send failed:", entry.email, err);
      failures.push(entry.email);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    failures,
  });
}
