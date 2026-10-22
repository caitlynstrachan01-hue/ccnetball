import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

const PROGRAM_LABELS: Record<string, string> = {
  "1on1": "1-on-1 / 2-on-1 Training ($160 AUD — pay on confirmation)",
  "small-group": "Small Group Training ($60 AUD per athlete — pay on confirmation)",
  team: "Team Training ($300 AUD per hour — pay on confirmation)",
  "video-analysis": "Video Game Analysis ($200 AUD — paid at booking)",
  online: "Online Mentoring ($160 AUD — paid at booking)",
  "coach-the-coaches": "Coach the Coaches ($80 AUD per coach, min 4 — pay on confirmation)",
  "ballina-u10-u12": "CLINIC — Ballina School Holiday Clinic U10-U12 (paid via Cal.com at booking)",
  "ballina-u13-u15": "CLINIC — Ballina School Holiday Clinic U13-U15 (paid via Cal.com at booking)",
  "coffs-u10-u12": "CLINIC — Coffs Harbour School Holiday Clinic U10-U12 (paid via Cal.com at booking)",
  "coffs-u13-u15": "CLINIC — Coffs Harbour School Holiday Clinic U13-U15 (paid via Cal.com at booking)",
  "innisfail-u10-u12": "CLINIC — Innisfail Netball Clinic U10-U12 (paid via Cal.com at booking)",
  "innisfail-u13-u16": "CLINIC — Innisfail Netball Clinic U13-U16 (paid via Cal.com at booking)",
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  return escape(value).replace(/\r?\n/g, "<br>");
}

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

  const programLabel = PROGRAM_LABELS[String(program)] || String(program);
  const programHeadline = programLabel.split(" (")[0];

  // Subject leads with session, then athlete, so inbox previews read:
  //   "Trial App — Amelia Chen (age 14) · parent Jane Chen"
  const subject = `BOOKING · ${programHeadline} · ${athleteName} (age ${athleteAge})`;

  const text = [
    `${programHeadline}`,
    `Athlete: ${athleteName}  (age ${athleteAge})`,
    ``,
    `Program / clinic: ${programLabel}`,
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
    `Photo / video: ${photoConsent ? "YES" : "No"}`,
    `Terms & Conditions: ${termsAccepted ? "YES" : "No"}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1F36;line-height:1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(26,31,54,0.06);">
            <!-- Header: session + athlete -->
            <tr>
              <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#E63B7A,#FFB4A2);color:#ffffff;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">New booking</p>
                <h1 style="margin:0;font-size:22px;font-weight:800;line-height:1.2;">${escape(programHeadline)}</h1>
                <p style="margin:8px 0 0;font-size:17px;font-weight:700;">${escape(athleteName)} · age ${escape(String(athleteAge))}</p>
              </td>
            </tr>

            <!-- At a glance -->
            <tr>
              <td style="padding:20px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">At a glance</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;font-size:14px;">
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;width:160px;">Program / clinic</td>
                    <td style="padding:6px 0;font-weight:600;">${escape(programLabel)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;">Athlete name</td>
                    <td style="padding:6px 0;font-weight:600;">${escape(athleteName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;">Athlete age</td>
                    <td style="padding:6px 0;font-weight:600;">${escape(String(athleteAge))}</td>
                  </tr>
                  ${club ? `<tr><td style="padding:6px 0;color:#6B7280;">Club / Association</td><td style="padding:6px 0;font-weight:600;">${escape(String(club))}</td></tr>` : ""}
                  ${positions ? `<tr><td style="padding:6px 0;color:#6B7280;">Playing positions</td><td style="padding:6px 0;font-weight:600;">${escape(String(positions))}</td></tr>` : ""}
                </table>
              </td>
            </tr>

            <!-- Parent / guardian -->
            <tr>
              <td style="padding:16px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Parent or guardian</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;font-size:14px;">
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;width:160px;">Name</td>
                    <td style="padding:6px 0;font-weight:600;">${escape(parentName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;">Email</td>
                    <td style="padding:6px 0;font-weight:600;"><a href="mailto:${escape(parentEmail)}" style="color:#E63B7A;text-decoration:none;">${escape(parentEmail)}</a></td>
                  </tr>
                  ${parentPhone ? `<tr><td style="padding:6px 0;color:#6B7280;">Phone</td><td style="padding:6px 0;font-weight:600;"><a href="tel:${escape(String(parentPhone))}" style="color:#E63B7A;text-decoration:none;">${escape(String(parentPhone))}</a></td></tr>` : ""}
                </table>
              </td>
            </tr>

            <!-- Health -->
            <tr>
              <td style="padding:16px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Health</p>
                <div style="margin-top:10px;font-size:14px;">
                  <p style="margin:0 0 4px;color:#6B7280;">Medical / injury history</p>
                  <p style="margin:0 0 12px;padding:10px 12px;background:#f6f4ee;border-radius:8px;">${medical ? nl2br(String(medical)) : "<em style='color:#6B7280;'>None provided</em>"}</p>
                  <p style="margin:0 0 4px;color:#6B7280;">Allergies</p>
                  <p style="margin:0;padding:10px 12px;background:#f6f4ee;border-radius:8px;">${allergies ? nl2br(String(allergies)) : "<em style='color:#6B7280;'>None provided</em>"}</p>
                </div>
              </td>
            </tr>

            <!-- Emergency contact -->
            <tr>
              <td style="padding:16px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Emergency contact</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;font-size:14px;">
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;width:160px;">Name</td>
                    <td style="padding:6px 0;font-weight:600;">${escape(emergencyName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;">Phone</td>
                    <td style="padding:6px 0;font-weight:600;"><a href="tel:${escape(String(emergencyPhone))}" style="color:#E63B7A;text-decoration:none;">${escape(String(emergencyPhone))}</a></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Consent -->
            <tr>
              <td style="padding:16px 28px 24px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Consent</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;font-size:14px;">
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;width:260px;">Photo / video of athlete</td>
                    <td style="padding:6px 0;font-weight:700;color:${photoConsent ? "#15803d" : "#6B7280"};">${photoConsent ? "YES" : "No"}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;">Terms &amp; Conditions + Privacy Policy</td>
                    <td style="padding:6px 0;font-weight:700;color:${termsAccepted ? "#15803d" : "#dc2626"};">${termsAccepted ? "YES" : "NO"}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 28px 24px;background:#f6f4ee;border-top:1px solid #e5e7eb;font-size:11px;color:#6B7280;text-align:center;">
                Reply directly to this email to reach <strong>${escape(parentName)}</strong>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: parentEmail,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error("Resend send failed:", error);
    }
  } else {
    console.log("Booking submission (no RESEND_API_KEY set):", body);
  }

  return NextResponse.json({ ok: true });
}
