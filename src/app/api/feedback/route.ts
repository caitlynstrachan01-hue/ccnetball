import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    name,
    email,
    session,
    enjoyment,
    expectations,
    overall,
    review,
    publicConsent,
    displayName,
  } = body ?? {};

  if (!name || !session || !enjoyment || !expectations || !overall) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email || undefined,
        subject: `New CCNetball feedback — ${name} — overall ${overall}/5`,
        text: [
          `--- Reviewer ---`,
          `Name: ${name}`,
          email ? `Email: ${email}` : null,
          `Session: ${session}`,
          ``,
          `--- Ratings ---`,
          `Enjoyment:    ${stars(enjoyment)}  (${enjoyment}/5)`,
          `Expectations: ${stars(expectations)}  (${expectations}/5)`,
          `Overall:      ${stars(overall)}  (${overall}/5)`,
          ``,
          `--- Review ---`,
          review || "(no comment provided)",
          ``,
          `--- Sharing ---`,
          publicConsent
            ? `YES — happy for this review to be shared publicly.`
            : `No — this review is private.`,
          publicConsent && displayName ? `Display name: ${displayName}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (error) {
      console.error("Resend send failed:", error);
    }
  } else {
    console.log("Feedback submission (no RESEND_API_KEY set):", body);
  }

  return NextResponse.json({ ok: true });
}
