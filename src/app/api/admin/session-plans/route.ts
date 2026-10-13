import { NextResponse } from "next/server";
import { getLibraryAccess } from "@/lib/drills-store.server";
import { createAdminClient } from "@/lib/supabase/server";

/** Star (or un-star) a coach's plan as a private good example. */
export async function PATCH(request: Request) {
  const { isAdmin } = await getLibraryAccess();
  if (!isAdmin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    recommended?: boolean;
    title?: string;
  };
  if (!body.id) return NextResponse.json({ error: "Missing plan." }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.recommended === "boolean") patch.recommended = body.recommended;
  if (typeof body.title === "string" && body.title.trim())
    patch.title = body.title.trim().slice(0, 80);

  const { error } = await createAdminClient()
    .from("session_plans")
    .update(patch)
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
