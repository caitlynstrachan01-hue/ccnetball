import Link from "next/link";
import Stripe from "stripe";
import { CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPriceCents } from "@/lib/shop-physical";

/**
 * Confirm the payment straight from Stripe when the parent lands here, and mark
 * the registration paid if it is. The webhook is the primary path in production;
 * this is an idempotent backstop so confirmation never depends on the webhook
 * arriving (and so local testing works without webhook forwarding).
 */
async function reconcilePayment(
  sessionId: string,
  supabase: ReturnType<typeof createAdminClient>,
): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return;
  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (
      session.payment_status !== "paid" ||
      session.metadata?.trial_registration !== "true"
    ) {
      return;
    }
    const participantId = session.metadata.participant_id;
    if (!participantId) return;
    const { data: p } = await supabase
      .from("trial_participants")
      .select("id, status")
      .eq("id", participantId)
      .maybeSingle();
    if (!p || p.status === "paid") return; // idempotent
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    await supabase
      .from("trial_participants")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent: paymentIntentId,
      })
      .eq("id", participantId);
  } catch (err) {
    console.error("Trial success reconcile failed:", err);
  }
}

export const dynamic = "force-dynamic";
export const metadata = {
  title: "You're registered — CC Netball Trials",
  robots: { index: false, follow: false },
};

export default async function TrialSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; pid?: string }>;
}) {
  const { session_id, pid } = await searchParams;

  let playerName: string | null = null;
  let divisionName: string | null = null;
  let trialName: string | null = null;
  let amountCents: number | null = null;

  if (session_id || pid) {
    const supabase = createAdminClient();
    if (session_id) await reconcilePayment(session_id, supabase);
    const query = supabase
      .from("trial_participants")
      .select("first_name, last_name, amount_cents, trial_id, age_group_id");
    const { data: p } = session_id
      ? await query.eq("stripe_session_id", session_id).maybeSingle()
      : await query.eq("id", pid!).maybeSingle();

    if (p) {
      playerName = `${p.first_name} ${p.last_name}`;
      amountCents = p.amount_cents;
      const [{ data: trial }, { data: division }] = await Promise.all([
        supabase.from("trials").select("name").eq("id", p.trial_id).maybeSingle(),
        supabase
          .from("trial_age_groups")
          .select("name")
          .eq("id", p.age_group_id)
          .maybeSingle(),
      ]);
      trialName = trial?.name ?? null;
      divisionName = division?.name ?? null;
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          You&apos;re registered!
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {playerName ? (
            <>
              <span className="font-semibold text-foreground">{playerName}</span>{" "}
              is registered{divisionName ? ` for ${divisionName}` : ""}
              {trialName ? ` — ${trialName}` : ""}. A confirmation has been sent
              to your email.
            </>
          ) : (
            <>Your registration is confirmed. A confirmation has been emailed to you.</>
          )}
        </p>

        {amountCents !== null && amountCents > 0 && (
          <div className="mt-8 w-full rounded-2xl border border-border/70 bg-card p-6 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Paid
            </p>
            <p className="mt-1 font-display text-xl font-bold">
              {formatPriceCents(amountCents)}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
        >
          Back to CC Netball
        </Link>
      </div>
    </section>
  );
}
