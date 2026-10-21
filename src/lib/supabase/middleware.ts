import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Same name as DEVICE_COOKIE in device-limit.server.ts (kept here to stay edge-safe). */
const DEVICE_COOKIE = "ccn_device";

export async function updateSession(request: NextRequest) {
  // Give every browser a stable device id so members' device limit works.
  // Set on the request too, so pages rendering this request can read it.
  let newDeviceId: string | null = null;
  if (!request.cookies.get(DEVICE_COOKIE)) {
    newDeviceId = crypto.randomUUID();
    request.cookies.set(DEVICE_COOKIE, newDeviceId);
  }
  const withDevice = (response: NextResponse) => {
    if (newDeviceId) {
      response.cookies.set(DEVICE_COOKIE, newDeviceId, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 400,
      });
    }
    return response;
  };

  // Defensive: if env vars are missing for any reason, skip auth work
  // rather than 500 the whole site.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return withDevice(NextResponse.next({ request }));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh the session (rotates the access token if it's about to expire).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /account, /admin/* and /library — force sign-in first.
  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/account") ||
    path.startsWith("/admin/") ||
    path === "/library" ||
    path.startsWith("/library/");

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return withDevice(NextResponse.redirect(redirectUrl));
  }

  return withDevice(supabaseResponse);
}
