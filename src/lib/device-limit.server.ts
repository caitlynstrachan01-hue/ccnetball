import { cookies, headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Cookie holding this browser's device id (set by the middleware). */
export const DEVICE_COOKIE = "ccn_device";

/** How many devices a member can be signed in on at once. Admins are exempt. */
export const DEVICE_LIMIT = 2;

type DeviceRow = {
  id: string;
  device_id: string;
  last_seen_at: string;
  revoked_at: string | null;
};

/** Only refresh last_seen_at this often, to keep page loads cheap. */
const TOUCH_AFTER_MS = 10 * 60 * 1000;

/**
 * Check (and record) the device a member is using.
 *
 * - `fresh`: they've just signed in here — this device becomes active and,
 *   if that puts them over the limit, their least recently used device is
 *   signed out.
 * - otherwise: a known active device passes; a device that was signed out
 *   because of the limit returns "revoked".
 *
 * Fails open (returns "ok") if the table isn't there yet or anything errors,
 * so a database hiccup never locks out a paying member.
 */
export async function checkDevice(
  supabase: SupabaseClient,
  userId: string,
  { fresh = false }: { fresh?: boolean } = {},
): Promise<"ok" | "revoked"> {
  try {
    const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value;
    if (!deviceId) return "ok";

    const { data, error } = await supabase
      .from("member_devices")
      .select("id, device_id, last_seen_at, revoked_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false });
    if (error) return "ok";
    const devices = (data ?? []) as DeviceRow[];
    const current = devices.find((d) => d.device_id === deviceId);
    const now = new Date().toISOString();

    if (current && !fresh) {
      if (current.revoked_at) return "revoked";
      if (Date.now() - new Date(current.last_seen_at).getTime() > TOUCH_AFTER_MS) {
        await supabase.from("member_devices").update({ last_seen_at: now }).eq("id", current.id);
      }
      return "ok";
    }

    // New device, or a fresh sign-in on a known one: make it active.
    const h = await headers();
    const { error: upsertError } = await supabase.from("member_devices").upsert(
      {
        user_id: userId,
        device_id: deviceId,
        user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        last_seen_at: now,
        revoked_at: null,
      },
      { onConflict: "user_id,device_id" },
    );
    if (upsertError) return "ok";

    // Over the limit? Sign out the least recently used other devices.
    const others = devices.filter((d) => d.device_id !== deviceId && !d.revoked_at);
    const excess = others.slice(DEVICE_LIMIT - 1);
    if (excess.length) {
      await supabase
        .from("member_devices")
        .update({ revoked_at: now })
        .in("id", excess.map((d) => d.id));
    }
    return "ok";
  } catch {
    return "ok";
  }
}
