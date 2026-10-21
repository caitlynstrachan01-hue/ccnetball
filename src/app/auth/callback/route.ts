import { NextResponse } from "next/server";
import { checkDevice } from "@/lib/device-limit.server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Signing in here makes this device active (and may sign out the
      // member's least recently used device). Admins have no limit.
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.is_admin !== true) {
        await checkDevice(supabase, data.user.id, { fresh: true });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could+not+sign+you+in.+Please+try+again.`,
  );
}
