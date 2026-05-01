import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "hello@ccnetball.com";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, program, message } = body ?? {};

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `New CCNetball enquiry from ${name}${program ? ` (${program})` : ""}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          program ? `Program: ${program}` : null,
          ``,
          `Message:`,
          message,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (error) {
      console.error("Resend send failed:", error);
    }
  } else {
    console.log("Contact submission (no RESEND_API_KEY set):", {
      name,
      email,
      phone,
      program,
      message,
    });
  }

  return NextResponse.json({ ok: true });
}
