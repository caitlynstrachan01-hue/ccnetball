import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    program,
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
    !program ||
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

  const PROGRAM_LABELS: Record<string, string> = {
    "1on1": "1-on-1 / 2-on-1 Training ($160 AUD — pay on confirmation)",
    "small-group": "Small Group Training ($60 AUD per athlete — pay on confirmation)",
    team: "Team Training ($250 AUD — pay on confirmation)",
    "video-analysis": "Video Game Analysis ($200 AUD — paid at booking)",
    online: "Online Mentoring ($160 AUD — paid at booking)",
    "coach-the-coaches": "Coach the Coaches ($80 AUD per coach, min 4 — pay on confirmation)",
  };
  const programLabel = PROGRAM_LABELS[String(program)] || String(program);

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: parentEmail,
        subject: `New CCNetball booking — ${athleteName} (age ${athleteAge}) — ${programLabel.split(" (")[0]}`,
        text: [
          `--- Program ---`,
          programLabel,
          ``,
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
