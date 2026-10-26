import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendShopOrderShippedNotification } from "@/lib/shop-order-email";

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
  const orderId = body?.orderId;
  const trackingNumber = body?.trackingNumber?.trim();
  if (!orderId || !trackingNumber) {
    return NextResponse.json(
      { error: "Order id and tracking number are required." },
      { status: 400 },
    );
  }

  const { data: order, error: fetchError } = await supabase
    .from("shop_orders")
    .select(
      "id, order_number, status, customer_name, customer_email, postal_line1, postal_line2, postal_suburb, postal_state, postal_postcode, postage_type",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "paid") {
    return NextResponse.json(
      {
        error:
          "Only paid orders can be marked as shipped. (Current status: " +
          order.status +
          ")",
      },
      { status: 400 },
    );
  }

  const { error: updateError } = await supabase
    .from("shop_orders")
    .update({
      status: "fulfilled",
      tracking_number: trackingNumber,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (updateError) {
    console.error("mark-shipped update failed:", updateError);
    return NextResponse.json(
      { error: "Could not update the order." },
      { status: 500 },
    );
  }

  try {
    await sendShopOrderShippedNotification({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      postageType: order.postage_type as "standard" | "express",
      trackingNumber,
      postalLine1: order.postal_line1,
      postalLine2: order.postal_line2,
      postalSuburb: order.postal_suburb,
      postalState: order.postal_state,
      postalPostcode: order.postal_postcode,
    });
  } catch (err) {
    console.error("Shipped email failed:", err);
    return NextResponse.json(
      {
        ok: true,
        warning:
          "Order marked as shipped but the customer email failed — please email them manually.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true });
}
