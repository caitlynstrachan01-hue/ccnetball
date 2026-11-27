import "server-only";
import { Resend } from "resend";

type NewCountryAlertPayload = {
  userEmail: string | null;
  newCountry: string;
  newCity: string | null;
  previousCountry: string | null;
  purchasedAt: string;
  accessId: string;
};

export async function sendNewCountryAlert(
  payload: NewCountryAlertPayload,
): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log(
      "Court Planner new-country alert (no RESEND_API_KEY):",
      payload,
    );
    return;
  }

  const FROM =
    process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
  const TO = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

  const subject = `New sign-in location: ${payload.newCountry}`;
  const location = payload.newCity
    ? `${payload.newCity}, ${payload.newCountry}`
    : payload.newCountry;
  const previous = payload.previousCountry
    ? `Previously seen from: ${payload.previousCountry}.`
    : "This is the first recorded location on the account.";
  const adminUrl =
    "https://www.ccnetball.com/admin/court-planner#" + payload.accessId;

  const text = [
    "A Netball Court - Drawing account just signed in from a new country.",
    "",
    `Customer: ${payload.userEmail ?? "(email unavailable)"}`,
    `New location: ${location}`,
    previous,
    `Purchased: ${payload.purchasedAt}`,
    "",
    "If this looks like account sharing, open the admin page and tap Suspend:",
    adminUrl,
    "",
    "If this is just a coach travelling or on a different network, no action needed.",
  ].join("\n");

  const html = `
    <div style="font-family:Inter,Helvetica,Arial,sans-serif;background:#FFF7F4;padding:28px 0;color:#1A0E14">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 10px 30px -12px rgba(215,37,75,0.18);overflow:hidden;border:1px solid #F3DED1">
        <div style="background:linear-gradient(135deg,#E91E63,#D7254B);padding:20px 28px;color:#fff">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85">Netball Court - Drawing</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;letter-spacing:-0.01em">New sign-in location</h1>
        </div>
        <div style="padding:24px 28px">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55">
            A subscription just signed in from a country we haven't seen on it before. This is worth a quick glance to make sure the account isn't being shared.
          </p>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#6B5560">Customer</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(payload.userEmail ?? "(email unavailable)")}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560">New location</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(location)}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560">Previous country</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(payload.previousCountry ?? "First recorded")}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560">Purchased</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(payload.purchasedAt)}</td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:#6B5560">
            If it looks like account sharing, open the admin page and tap <b>Suspend</b>. If it's just a coach on holiday or on a different network, no action is needed.
          </p>
          <a href="${adminUrl}" style="display:inline-block;margin-top:18px;background:#E91E63;color:#fff;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;text-decoration:none">Open admin page →</a>
        </div>
      </div>
    </div>
  `;

  const resend = new Resend(RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Court Planner new-country alert email failed:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
