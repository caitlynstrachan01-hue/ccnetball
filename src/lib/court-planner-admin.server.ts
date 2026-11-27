import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export type AdminCourtPlannerRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  purchasedAt: string;
  expiresAt: string;
  amountCents: number;
  currency: string;
  lastSeenAt: string | null;
  lastSeenCountry: string | null;
  lastSeenCity: string | null;
  lastAlertedCountry: string | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
};

type Row = {
  id: string;
  user_id: string;
  purchased_at: string;
  expires_at: string;
  amount_cents: number;
  currency: string;
  last_seen_at: string | null;
  last_seen_country: string | null;
  last_seen_city: string | null;
  last_alerted_country: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
};

export async function listCourtPlannerAccess(): Promise<AdminCourtPlannerRow[]> {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("court_planner_access")
    .select(
      "id, user_id, purchased_at, expires_at, amount_cents, currency, last_seen_at, last_seen_country, last_seen_city, last_alerted_country, suspended_at, suspended_reason",
    )
    .order("purchased_at", { ascending: false });

  if (error) {
    console.error("listCourtPlannerAccess failed:", error);
    return [];
  }

  const typedRows = (rows ?? []) as Row[];
  const userIds = Array.from(new Set(typedRows.map((r) => r.user_id)));
  const emails = await fetchUserEmails(userIds);

  return typedRows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userEmail: emails.get(r.user_id) ?? null,
    purchasedAt: r.purchased_at,
    expiresAt: r.expires_at,
    amountCents: r.amount_cents,
    currency: r.currency,
    lastSeenAt: r.last_seen_at,
    lastSeenCountry: r.last_seen_country,
    lastSeenCity: r.last_seen_city,
    lastAlertedCountry: r.last_alerted_country,
    suspendedAt: r.suspended_at,
    suspendedReason: r.suspended_reason,
  }));
}

async function fetchUserEmails(
  userIds: string[],
): Promise<Map<string, string | null>> {
  if (userIds.length === 0) return new Map();
  const admin = createAdminClient();
  const out = new Map<string, string | null>();
  for (const id of userIds) {
    try {
      const { data } = await admin.auth.admin.getUserById(id);
      out.set(id, data.user?.email ?? null);
    } catch {
      out.set(id, null);
    }
  }
  return out;
}
