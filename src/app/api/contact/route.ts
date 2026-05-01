import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, program, message } = body ?? {};

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // TODO: wire to Supabase + email notification once Supabase project is provisioned.
  console.log("Contact submission:", { name, email, phone, program, message });

  return NextResponse.json({ ok: true });
}
