import "server-only";
import { Resend } from "resend";

const APP_URL = "https://www.ccnetball.com";
const COURT_PLANNER_URL = `${APP_URL}/court-planner`;
const COMPETITION_BUILDER_URL = `${APP_URL}/competition-builder`;

function fromAddress(): string {
  return (
    process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>"
  );
}

function replyToAddress(): string {
  return process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";
}

function firstNameFrom(name: string | null | undefined): string {
  if (!name) return "there";
  const first = name.trim().split(/\s+/)[0];
  return first || "there";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrettyDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// --- Shared HTML shell ----------------------------------------------------
function wrapHtml(opts: { heading: string; bodyHtml: string }): string {
  return `
  <div style="font-family:Inter,Helvetica,Arial,sans-serif;background:#FFF7F4;padding:28px 0;color:#1A0E14">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 10px 30px -12px rgba(215,37,75,0.18);overflow:hidden;border:1px solid #F3DED1">
      <div style="background:linear-gradient(135deg,#E91E63,#D7254B);padding:20px 28px;color:#fff">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85">CC Netball</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;letter-spacing:-0.01em">${escapeHtml(opts.heading)}</h1>
      </div>
      <div style="padding:24px 28px;font-size:15px;line-height:1.6;color:#1A0E14">
        ${opts.bodyHtml}
        <p style="margin:28px 0 0;font-size:14px;color:#1A0E14">Kind regards,<br/><b>The CC Netball Team</b></p>
      </div>
    </div>
  </div>`;
}

// --- 1. Court Planner welcome --------------------------------------------
export async function sendCourtPlannerWelcomeEmail(opts: {
  customerEmail: string;
  customerName: string | null;
  expiresAt: string;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("Court Drawing welcome email (no RESEND_API_KEY):", opts);
    return;
  }

  const firstName = firstNameFrom(opts.customerName);
  const expiry = formatPrettyDate(opts.expiresAt);
  const subject = "You're in — Netball Court - Drawing is ready";

  const text = [
    `Hi ${firstName},`,
    ``,
    `Welcome aboard and congratulations on your Netball Court - Drawing subscription.`,
    ``,
    `Your access is live right now. Here's what you need to know:`,
    ``,
    `Signed in as: ${opts.customerEmail}`,
    `Expires: ${expiry}`,
    ``,
    `Launch the app: ${COURT_PLANNER_URL}`,
    ``,
    `Open it on your phone or iPad and start drawing drills, set plays or quick quarter-time feedback.`,
    ``,
    `Any issues — a lost password, a question about the app, or anything else — just reply to this email and we'll sort it.`,
    ``,
    `Kind regards,`,
    `The CC Netball Team`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 14px">Hi ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;font-weight:600">Welcome aboard and congratulations on your Netball Court - Drawing subscription.</p>
    <p style="margin:0 0 16px">Your access is live right now. Here&apos;s what you need to know:</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:18px">
      <tr><td style="padding:6px 0;color:#6B5560">Signed in as</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.customerEmail)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">Expires</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(expiry)}</td></tr>
    </table>
    <p style="margin:0 0 20px"><a href="${COURT_PLANNER_URL}" style="display:inline-block;background:#E91E63;color:#fff;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px;text-decoration:none">Launch the app →</a></p>
    <p style="margin:0 0 16px">Open it on your phone or iPad and start drawing drills, set plays or quick quarter-time feedback.</p>
    <p style="margin:0">Any issues — a lost password, a question about the app, or anything else — just <b>reply to this email</b> and we&apos;ll sort it.</p>
  `;

  const resend = new Resend(RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: fromAddress(),
      to: opts.customerEmail,
      replyTo: replyToAddress(),
      subject,
      text,
      html: wrapHtml({ heading: "You're in", bodyHtml }),
    });
  } catch (err) {
    console.error("Court Drawing welcome email failed:", err);
  }
}

// --- 2. Competition Builder welcome --------------------------------------
export async function sendCompetitionBuilderWelcomeEmail(opts: {
  customerEmail: string;
  customerName: string | null;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log(
      "Competition Builder welcome email (no RESEND_API_KEY):",
      opts,
    );
    return;
  }

  const firstName = firstNameFrom(opts.customerName);
  const subject = "Your Competition Builder licence is active";

  const text = [
    `Hi ${firstName},`,
    ``,
    `Welcome aboard and congratulations on your Competition Builder licence.`,
    ``,
    `Your licence is live right now. Here's what you need to know:`,
    ``,
    `Signed in as: ${opts.customerEmail}`,
    `Covers: one competition — valid up until that competition's start date`,
    ``,
    `Open Competition Builder: ${COMPETITION_BUILDER_URL}`,
    ``,
    `Give it your courts, timeslots, teams and start date, and let it build your fixture. Add your rules in plain English and the draw works around them, not against them.`,
    ``,
    `Any issues — a lost password, a tricky rule, or a last-minute change to your draw — just reply to this email and we'll sort it.`,
    ``,
    `Kind regards,`,
    `The CC Netball Team`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 14px">Hi ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;font-weight:600">Welcome aboard and congratulations on your Competition Builder licence.</p>
    <p style="margin:0 0 16px">Your licence is live right now. Here&apos;s what you need to know:</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:18px">
      <tr><td style="padding:6px 0;color:#6B5560">Signed in as</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.customerEmail)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">Covers</td><td style="padding:6px 0;font-weight:600;text-align:right">One competition — valid to its start date</td></tr>
    </table>
    <p style="margin:0 0 20px"><a href="${COMPETITION_BUILDER_URL}" style="display:inline-block;background:#E91E63;color:#fff;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px;text-decoration:none">Open Competition Builder →</a></p>
    <p style="margin:0 0 16px">Give it your courts, timeslots, teams and start date, and let it build your fixture. Add your rules in plain English and the draw works around them, not against them.</p>
    <p style="margin:0">Any issues — a lost password, a tricky rule, or a last-minute change to your draw — just <b>reply to this email</b> and we&apos;ll sort it.</p>
  `;

  const resend = new Resend(RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: fromAddress(),
      to: opts.customerEmail,
      replyTo: replyToAddress(),
      subject,
      text,
      html: wrapHtml({ heading: "Your licence is active", bodyHtml }),
    });
  } catch (err) {
    console.error("Competition Builder welcome email failed:", err);
  }
}

// --- 3. Trial registration -----------------------------------------------
export async function sendTrialRegistrationEmail(opts: {
  parentEmail: string;
  parentName: string | null;
  participantFirstName: string;
  participantFullName: string;
  ageGroupName: string;
  trialName: string;
  whenText: string;
  venueText: string;
  clubContactEmail: string;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("Trial registration email (no RESEND_API_KEY):", opts);
    return;
  }

  const firstName = firstNameFrom(opts.parentName);
  const subject = `${opts.trialName} — ${opts.participantFirstName} is registered`;

  const text = [
    `Hi ${firstName},`,
    ``,
    `You have registered ${opts.participantFirstName} for ${opts.trialName}.`,
    ``,
    `TRIAL INFORMATION`,
    `Participant: ${opts.participantFullName}`,
    `Age group: ${opts.ageGroupName}`,
    `Trial: ${opts.trialName}`,
    `When: ${opts.whenText}`,
    `Where: ${opts.venueText}`,
    `Club/Association contact: ${opts.clubContactEmail}`,
    ``,
    `Any issues — Please contact your club and/or association directly for general queries including cancellations and refunds.`,
    ``,
    `Kind regards,`,
    `The CC Netball Team`,
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 14px">Hi ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 20px">You have registered <b>${escapeHtml(opts.participantFirstName)}</b> for <b>${escapeHtml(opts.trialName)}</b>.</p>
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.14em;color:#E91E63;text-transform:uppercase">Trial information</p>
    <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:18px">
      <tr><td style="padding:6px 0;color:#6B5560">Participant</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.participantFullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">Age group</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.ageGroupName)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">Trial</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.trialName)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">When</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.whenText)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">Where</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.venueText)}</td></tr>
      <tr><td style="padding:6px 0;color:#6B5560">Club/Association contact</td><td style="padding:6px 0;font-weight:600;text-align:right">${escapeHtml(opts.clubContactEmail)}</td></tr>
    </table>
    <p style="margin:0">Any issues — Please contact your club and/or association directly for general queries including cancellations and refunds.</p>
  `;

  const resend = new Resend(RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: fromAddress(),
      to: opts.parentEmail,
      replyTo: replyToAddress(),
      subject,
      text,
      html: wrapHtml({ heading: "Registration confirmed", bodyHtml }),
    });
  } catch (err) {
    console.error("Trial registration email failed:", err);
  }
}
