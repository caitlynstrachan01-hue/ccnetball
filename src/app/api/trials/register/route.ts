import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getTrialBySlug } from "@/lib/trials.server";
import { POSITIONS, computeFee, type Position } from "@/lib/trial-fees";

export const runtime = "nodejs";

type Body = {
  slug?: string;
  divisionId?: string;
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

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const slug = clean(body.slug);
  const divisionId = clean(body.divisionId);
  const first = clean(body.first);
  const last = clean(body.last);
  const dob = clean(body.dob);
  const parentName = clean(body.parentName);
  const parentEmail = clean(body.parentEmail);
  const emergencyName = clean(body.emergencyName);
  const emergencyPhone = clean(body.emergencyPhone);
  const history = clean(body.history);
  const medical = clean(body.medical) || "None";
  const positions = (Array.isArray(body.positions) ? body.positions : [])
    .map((p) => clean(p))
    .filter((p): p is Position => (POSITIONS as readonly string[]).includes(p));

  // Validation (mirror the client, but authoritative here).
  if (!slug || !divisionId) {
    return NextResponse.json(
      { error: "Missing trial or age group." },
      { status: 400 },
    );
  }
  if (!first || !last) {
    return NextResponse.json(
      { error: "Please enter the player's first name and surname." },
      { status: 400 },
    );
  }
  if (positions.length !== 2) {
    return NextResponse.json(
      { error: "Please choose exactly two preferred positions." },
      { status: 400 },
    );
  }
  if (!history) {
    return NextResponse.json(
      { error: "Please add some playing history." },
      { status: 400 },
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(parentEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid parent/guardian email." },
      { status: 400 },
    );
  }
  if (!emergencyName || emergencyPhone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { error: "An emergency contact name and number are required." },
      { status: 400 },
    );
  }

  // Load the trial + division as the server source of truth.
  const trial = await getTrialBySlug(slug);
  if (!trial) {
    return NextResponse.json({ error: "Trial not found." }, { status: 404 });
  }
  if (!(trial.registrationOpen && trial.status === "open")) {
    return NextResponse.json(
      { error: "Registration is not open for this trial." },
      { status: 400 },
    );
  }
  const division = trial.divisions.find((d) => d.id === divisionId);
  if (!division) {
    return NextResponse.json(
      { error: "That age group is no longer available." },
      { status: 400 },
    );
  }

  const fee = computeFee({
    feeCents: division.feeCents,
    additionalFees: division.additionalFees,
    associationPaysFees: division.associationPaysFees,
  });

  const admin = createAdminClient();

  // Assign the next stable player number within this division (shown on trial
  // documents when de-identified). Numbers don't shift if someone cancels.
  const { data: lastNum } = await admin
    .from("trial_participants")
    .select("player_number")
    .eq("age_group_id", division.id)
    .not("player_number", "is", null)
    .order("player_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const playerNumber = ((lastNum?.player_number as number) ?? 0) + 1;

  // Insert the pending registration (service role — RLS bypassed after our
  // own validation; the public never writes here directly).
  const insert = await admin
    .from("trial_participants")
    .insert({
      trial_id: trial.id,
      age_group_id: division.id,
      player_number: playerNumber,
      status: "pending",
      first_name: first,
      last_name: last,
      dob: dob || null,
      position_1: positions[0],
      position_2: positions[1],
      playing_history: history,
      medical,
      parent_name: parentName || null,
      parent_email: parentEmail,
      emergency_name: emergencyName,
      emergency_phone: emergencyPhone,
      amount_cents: fee.total,
      fee_breakdown: fee,
    })
    .select("id")
    .single();

  if (insert.error || !insert.data) {
    console.error("Trial registration insert failed:", insert.error);
    return NextResponse.json(
      { error: "Could not save your registration. Please try again." },
      { status: 500 },
    );
  }
  const participantId = insert.data.id as string;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.ccnetball.com";

  // Free registration (association covers the fee, no add-ons): mark it paid
  // immediately — no Stripe needed. The club is invoiced for the CC fee later.
  if (fee.total === 0) {
    await admin
      .from("trial_participants")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", participantId);
    return NextResponse.json({
      url: `${siteUrl}/trials/success?pid=${participantId}`,
    });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Payments are not configured — please try again shortly." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeKey);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (fee.platformToParticipant > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        unit_amount: fee.platformToParticipant,
        product_data: { name: "CC Netball trial registration" },
      },
    });
  }
  for (const addon of fee.addons) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        unit_amount: addon.amount_cents,
        product_data: { name: addon.label },
      },
    });
  }
  if (fee.surcharge > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        unit_amount: fee.surcharge,
        product_data: { name: "Card surcharge" },
      },
    });
  }

  const metadata = {
    trial_registration: "true",
    participant_id: participantId,
    trial_id: trial.id,
    trial_slug: trial.slug,
    division_id: division.id,
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: parentEmail,
      success_url: `${siteUrl}/trials/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/trials/cancelled?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
      payment_intent_data: { metadata },
    });
  } catch (err) {
    console.error("Trial Stripe session failed:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }

  await admin
    .from("trial_participants")
    .update({ stripe_session_id: session.id })
    .eq("id", participantId);

  return NextResponse.json({ url: session.url });
}
