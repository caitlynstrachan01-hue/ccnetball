import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    parentName,
    parentEmail,
    parentPhone,
    athleteName,
    athleteAge,
    club,
    positions,
    medical,
    allergies,
    emergencyName,
    emergencyPhone,
    photoConsent,
    termsAccepted,
  } = body ?? {};

  if (
    !parentName ||
    !parentEmail ||
    !athleteName ||
    !athleteAge ||
    !emergencyName ||
    !emergencyPhone ||
    !termsAccepted
  ) {
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
        replyTo: parentEmail,
        subject: `New CCNetball booking — ${athleteName} (age ${athleteAge})`,
        text: [
          `--- Parent / guardian ---`,
          `Name: ${parentName}`,
          `Email: ${parentEmail}`,
          parentPhone ? `Phone: ${parentPhone}` : null,
          ``,
          `--- Athlete ---`,
          `Name: ${athleteName}`,
          `Age: ${athleteAge}`,
          club ? `Current club / association: ${club}` : null,
          positions ? `Playing positions: ${positions}` : null,
          ``,
          `--- Health ---`,
          `Medical / injury history: ${medical || "None provided"}`,
          `Allergies: ${allergies || "None provided"}`,
          ``,
          `--- Emergency contact ---`,
          `Name: ${emergencyName}`,
          `Phone: ${emergencyPhone}`,
          ``,
          `--- Consent ---`,
          `Photo / video consent: ${photoConsent ? "YES" : "No"}`,
          `Terms & Conditions accepted: ${termsAccepted ? "YES" : "No"}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (error) {
      console.error("Resend send failed:", error);
    }
  } else {
    console.log("Booking submission (no RESEND_API_KEY set):", body);
  }

  return NextResponse.json({ ok: true });
}
