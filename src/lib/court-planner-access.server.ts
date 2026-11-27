import "server-only";
import { headers } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sendNewCountryAlert } from "@/lib/court-planner-alerts.server";

export type CourtPlannerAccess = {
  id: string;
  expiresAt: string;
  purchasedAt: string;
  daysRemaining: number;
  suspended: boolean;
  suspendedReason: string | null;
};

/**
 * Returns the active access row for the signed-in user, or null if
 * they're not signed in or have never bought. Also updates last-seen
 * location and fires a new-country alert email when appropriate.
 *
 * A suspended access row is still returned (with `suspended: true`) so
 * the caller can show the "Your access is suspended" page rather than
 * silently redirecting to the shop.
 */
export async function getCourtPlannerAccess(): Promise<CourtPlannerAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("court_planner_access")
    .select(
      "id, expires_at, purchased_at, suspended_at, suspended_reason, last_alerted_country",
    )
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  // Record current location + alert on new country (fire-and-forget).
  await recordAccessActivity({
    accessId: data.id,
    userId: user.id,
    userEmail: user.email ?? null,
    previousAlertedCountry: data.last_alerted_country,
    purchasedAt: data.purchased_at,
  });

  const expires = new Date(data.expires_at).getTime();
  const daysRemaining = Math.max(
    0,
    Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return {
    id: data.id,
    expiresAt: data.expires_at,
    purchasedAt: data.purchased_at,
    daysRemaining,
    suspended: data.suspended_at !== null,
    suspendedReason: data.suspended_reason,
  };
}

async function recordAccessActivity(opts: {
  accessId: string;
  userId: string;
  userEmail: string | null;
  previousAlertedCountry: string | null;
  purchasedAt: string;
}): Promise<void> {
  try {
    const hdrs = await headers();
    // Vercel-populated geolocation headers.
    const country = hdrs.get("x-vercel-ip-country");
    const city = hdrs.get("x-vercel-ip-city");

    const admin = createAdminClient();
    const now = new Date().toISOString();

    const update: Record<string, unknown> = { last_seen_at: now };
    if (country) update.last_seen_country = country;
    if (city) update.last_seen_city = decodeURIComponent(city);

    const isNewCountry =
      country && country !== opts.previousAlertedCountry;

    if (isNewCountry) {
      update.last_alerted_country = country;
    }

    await admin
      .from("court_planner_access")
      .update(update)
      .eq("id", opts.accessId);

    if (isNewCountry && country) {
      await sendNewCountryAlert({
        accessId: opts.accessId,
        userEmail: opts.userEmail,
        newCountry: country,
        newCity: city ? decodeURIComponent(city) : null,
        previousCountry: opts.previousAlertedCountry,
        purchasedAt: opts.purchasedAt,
      });
    }
  } catch (err) {
    // Never let geo/alert failure block app access.
    console.error("Court Planner activity record failed:", err);
  }
}
