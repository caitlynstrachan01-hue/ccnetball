import { Resend } from "resend";
import { formatPriceCents } from "./shop-physical";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  postal_line1: string;
  postal_line2: string | null;
  postal_suburb: string;
  postal_state: string;
  postal_postcode: string;
  postal_country: string;
  billing_same_as_postal: boolean;
  billing_line1: string | null;
  billing_line2: string | null;
  billing_suburb: string | null;
  billing_state: string | null;
  billing_postcode: string | null;
  billing_country: string | null;
  items: Array<{
    product_id: string;
    slug: string;
    name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }>;
  subtotal_cents: number;
  postage_type: "standard" | "express";
  postage_cents: number;
  gst_cents: number;
  total_cents: number;
};

type ShippedPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  postageType: "standard" | "express";
  trackingNumber: string;
  postalLine1: string;
  postalLine2: string | null;
  postalSuburb: string;
  postalState: string;
  postalPostcode: string;
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAddress(opts: {
  line1: string;
  line2?: string | null;
  suburb: string;
  state: string;
  postcode: string;
  country?: string | null;
}): string {
  const parts = [
    opts.line1,
    opts.line2 || null,
    `${opts.suburb} ${opts.state} ${opts.postcode}`,
    opts.country || "Australia",
  ].filter(Boolean) as string[];
  return parts.join(", ");
}

export async function sendBackInStockNotification(opts: {
  email: string;
  name: string | null;
  productName: string;
  productSlug: string;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("Back-in-stock email (no RESEND_API_KEY):", opts.email);
    return;
  }

  const FROM =
    process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
  const BCC = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

  const url = `https://www.ccnetball.com/shop/${opts.productSlug}`;
  const firstName = (opts.name?.split(" ")[0] || "").trim();
  const greeting = firstName ? `Hi ${firstName},` : "Good news!";
  const subject = `Back in stock — ${opts.productName}`;

  const text = [
    greeting,
    ``,
    `Good news — the ${opts.productName} is back in stock at CC Netball.`,
    ``,
    `You asked us to let you know, so here we are. Jump in before it sells out again:`,
    url,
    ``,
    `Caitlyn & the CC Netball team`,
    `ccnetball.com`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1F36;line-height:1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ee;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(26,31,54,0.06);">
          <tr>
            <td style="padding:32px 28px 24px;background:linear-gradient(135deg,#E63B7A,#FFB4A2);color:#ffffff;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">CC Netball</p>
              <h1 style="margin:0;font-size:26px;font-weight:800;line-height:1.2;">It&apos;s back!</h1>
              <p style="margin:10px 0 0;font-size:15px;font-weight:500;opacity:0.95;">The item you were waiting for is in stock again.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:16px;">${escape(greeting)}</p>
              <p style="margin:14px 0 0;font-size:16px;">Good news — the <strong>${escape(opts.productName)}</strong> is back in stock at CC Netball.</p>
              <p style="margin:14px 0 0;font-size:14px;color:#1A1F36;">You asked us to let you know, so here we are. Jump in before it sells out again.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;">
              <a href="${url}" style="display:inline-block;background:#E63B7A;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;font-size:14px;">Grab yours now</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;font-size:14px;">
              <p style="margin:0;font-weight:600;">Caitlyn & the CC Netball team</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 20px;background:#f6f4ee;border-top:1px solid #e5e7eb;font-size:11px;color:#6B7280;text-align:center;">
              <a href="https://ccnetball.com" style="color:#E63B7A;text-decoration:none;font-weight:600;">ccnetball.com</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: opts.email,
    bcc: BCC,
    replyTo: BCC,
    subject,
    text,
    html,
  });
}

export async function sendShopOrderShippedNotification(
  payload: ShippedPayload,
): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("Shipped notification (no RESEND_API_KEY):", payload.orderNumber);
    return;
  }

  const FROM =
    process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
  const BCC = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

  const isExpress = payload.postageType === "express";
  const postageLabel = isExpress
    ? "Australia Post Express"
    : "Australia Post Standard";
  const eta = isExpress ? "2-4 business days" : "6-10 business days";

  const trackUrl = `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(
    payload.trackingNumber,
  )}`;

  const firstName =
    payload.customerName.split(" ")[0] || payload.customerName;

  const subject = isExpress
    ? `Your CC Netball order is on its way (express)! — ${payload.orderNumber}`
    : `Your CC Netball order is on its way! — ${payload.orderNumber}`;

  const text = [
    `Hi ${firstName},`,
    ``,
    `Great news — your CC Netball order has been shipped${isExpress ? " express" : ""} today.`,
    ``,
    `Order number: ${payload.orderNumber}`,
    `Sent via: ${postageLabel}`,
    `Tracking number: ${payload.trackingNumber}`,
    `Track your parcel: ${trackUrl}`,
    ``,
    `You can expect it to arrive in ${eta} — a little longer if you're in a rural or regional area.`,
    ``,
    `Thanks again for supporting a small Australian business.`,
    ``,
    `Kind regards,`,
    `The CC Netball team`,
    `ccnetball.com`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1F36;line-height:1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(26,31,54,0.06);">
            <tr>
              <td style="padding:32px 28px 24px;background:linear-gradient(135deg,#E63B7A,#FFB4A2);color:#ffffff;text-align:center;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">CC Netball · ${isExpress ? "Express" : "Standard"} Post</p>
                <h1 style="margin:0;font-size:26px;font-weight:800;line-height:1.2;">On its way, ${escape(firstName)}!</h1>
                <p style="margin:10px 0 0;font-size:15px;font-weight:500;opacity:0.95;">Your order has been shipped${isExpress ? " express" : ""} today.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
                  <tr><td style="padding:6px 0;color:#6B7280;width:160px;">Order number</td><td style="padding:6px 0;font-weight:700;">${escape(payload.orderNumber)}</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280;">Sent via</td><td style="padding:6px 0;font-weight:600;">${escape(postageLabel)}</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280;">Tracking number</td><td style="padding:6px 0;font-weight:700;letter-spacing:0.5px;">${escape(payload.trackingNumber)}</td></tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 4px;">
                <a href="${trackUrl}" style="display:inline-block;background:#E63B7A;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Track your parcel</a>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 4px;">
                <p style="margin:0;font-size:14px;color:#1A1F36;">You can expect it to arrive in <strong>${eta}</strong> — a little longer if you&apos;re in a rural or regional area.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;">
                <p style="margin:0;font-size:14px;">Thanks again for supporting a small Australian business.</p>
                <p style="margin:18px 0 0;font-size:14px;">Kind regards,</p>
                <p style="margin:2px 0 0;font-size:14px;font-weight:600;">The CC Netball team</p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 20px;background:#f6f4ee;border-top:1px solid #e5e7eb;font-size:11px;color:#6B7280;text-align:center;">
                <a href="https://ccnetball.com" style="color:#E63B7A;text-decoration:none;font-weight:600;">ccnetball.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: payload.customerEmail,
    bcc: BCC,
    replyTo: BCC,
    subject,
    text,
    html,
  });
}

export async function sendShopOrderCustomerConfirmation(
  order: OrderRow,
): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("Customer confirmation (no RESEND_API_KEY):", order.order_number);
    return;
  }

  const FROM =
    process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
  const BCC = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

  const postageLabel =
    order.postage_type === "express" ? "Express post" : "Standard post";

  const postalAddress = formatAddress({
    line1: order.postal_line1,
    line2: order.postal_line2,
    suburb: order.postal_suburb,
    state: order.postal_state,
    postcode: order.postal_postcode,
    country: order.postal_country,
  });

  const subject = `Thanks for your order — ${order.order_number}`;

  const text = [
    `Hi ${order.customer_name.split(" ")[0] || order.customer_name},`,
    ``,
    `Thanks so much for your order with CC Netball — this email confirms your payment has been received.`,
    ``,
    `Order number: ${order.order_number}`,
    ``,
    `--- Items ---`,
    ...order.items.map(
      (i) =>
        `${i.quantity} × ${i.name}  @ ${formatPriceCents(i.unit_price_cents)}  = ${formatPriceCents(i.line_total_cents)}`,
    ),
    ``,
    `Subtotal: ${formatPriceCents(order.subtotal_cents)}`,
    `Postage (${postageLabel}): ${formatPriceCents(order.postage_cents)}`,
    `TOTAL PAID: ${formatPriceCents(order.total_cents)}`,
    ``,
    `--- Shipping to ---`,
    `${order.customer_name}`,
    `${postalAddress}`,
    ``,
    `We'll be in touch once your order has been shipped.`,
    ``,
    `Kind regards,`,
    `The CC Netball team`,
    `ccnetball.com`,
  ].join("\n");

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;font-weight:600;">${escape(i.name)}</td>
        <td style="padding:8px 0;text-align:center;color:#6B7280;">× ${i.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#6B7280;">${formatPriceCents(i.unit_price_cents)}</td>
        <td style="padding:8px 0;text-align:right;font-weight:700;">${formatPriceCents(i.line_total_cents)}</td>
      </tr>`,
    )
    .join("");

  const firstName =
    order.customer_name.split(" ")[0] || order.customer_name;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1F36;line-height:1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(26,31,54,0.06);">
            <tr>
              <td style="padding:32px 28px 24px;background:linear-gradient(135deg,#E63B7A,#FFB4A2);color:#ffffff;text-align:center;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">CC Netball</p>
                <h1 style="margin:0;font-size:26px;font-weight:800;line-height:1.2;">Thanks, ${escape(firstName)}!</h1>
                <p style="margin:10px 0 0;font-size:15px;font-weight:500;opacity:0.95;">Your order has been received and payment confirmed.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
                  <tr>
                    <td style="padding:6px 0;color:#6B7280;width:140px;">Order number</td>
                    <td style="padding:6px 0;font-weight:700;font-size:16px;color:#1A1F36;">${escape(order.order_number)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Your items</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;font-size:14px;border-collapse:collapse;">
                  ${itemRows}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 28px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
                  <tr><td style="padding:4px 0;color:#6B7280;">Subtotal</td><td style="padding:4px 0;text-align:right;">${formatPriceCents(order.subtotal_cents)}</td></tr>
                  <tr><td style="padding:4px 0;color:#6B7280;">Postage · ${escape(postageLabel)}</td><td style="padding:4px 0;text-align:right;">${formatPriceCents(order.postage_cents)}</td></tr>
                  <tr><td style="padding:12px 0 0;border-top:1px solid #e5e7eb;font-weight:700;font-size:15px;">Total paid</td><td style="padding:12px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:800;font-size:16px;color:#E63B7A;">${formatPriceCents(order.total_cents)}</td></tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Shipping to</p>
                <p style="margin:8px 0 0;font-size:14px;font-weight:600;">${escape(order.customer_name)}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#1A1F36;">${escape(postalAddress)}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;">
                <p style="margin:0;font-size:14px;color:#1A1F36;">We&apos;ll be in touch once your order has been shipped.</p>
                <p style="margin:18px 0 0;font-size:14px;">Kind regards,</p>
                <p style="margin:2px 0 0;font-size:14px;font-weight:600;">The CC Netball team</p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 20px;background:#f6f4ee;border-top:1px solid #e5e7eb;font-size:11px;color:#6B7280;text-align:center;">
                <a href="https://ccnetball.com" style="color:#E63B7A;text-decoration:none;font-weight:600;">ccnetball.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    bcc: BCC,
    replyTo: BCC,
    subject,
    text,
    html,
  });
}

export async function sendShopOrderNotification(order: OrderRow): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log("Shop order (no RESEND_API_KEY):", order.order_number);
    return;
  }

  const FROM =
    process.env.CONTACT_FROM_EMAIL || "CCNetball <noreply@ccnetball.com>";
  const TO = process.env.CONTACT_TO_EMAIL || "info.ccnetball@gmail.com";

  const itemsSummary = order.items
    .map((i) => `${i.quantity} × ${i.name}`)
    .join(", ");
  const subject = `ORDER · ${order.order_number} · ${order.customer_name} · ${itemsSummary}`;

  const postageLabel =
    order.postage_type === "express" ? "Express post" : "Standard post";

  const postalAddress = formatAddress({
    line1: order.postal_line1,
    line2: order.postal_line2,
    suburb: order.postal_suburb,
    state: order.postal_state,
    postcode: order.postal_postcode,
    country: order.postal_country,
  });

  const billingAddress = order.billing_same_as_postal
    ? "Same as delivery address"
    : formatAddress({
        line1: order.billing_line1 || "",
        line2: order.billing_line2,
        suburb: order.billing_suburb || "",
        state: order.billing_state || "",
        postcode: order.billing_postcode || "",
        country: order.billing_country,
      });

  const text = [
    `New paid order — ${order.order_number}`,
    `Customer: ${order.customer_name}`,
    `Email: ${order.customer_email}`,
    `Phone: ${order.customer_phone || "—"}`,
    ``,
    `--- Items ---`,
    ...order.items.map(
      (i) =>
        `${i.quantity} × ${i.name}  @ ${formatPriceCents(i.unit_price_cents)}  = ${formatPriceCents(i.line_total_cents)}`,
    ),
    ``,
    `Subtotal: ${formatPriceCents(order.subtotal_cents)}`,
    `Postage (${postageLabel}): ${formatPriceCents(order.postage_cents)}`,
    `TOTAL: ${formatPriceCents(order.total_cents)}`,
    ``,
    `--- Delivery ---`,
    postalAddress,
    ``,
    `--- Billing ---`,
    billingAddress,
  ].join("\n");

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;font-weight:600;">${escape(i.name)}</td>
        <td style="padding:8px 0;text-align:center;color:#6B7280;">× ${i.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#6B7280;">${formatPriceCents(i.unit_price_cents)}</td>
        <td style="padding:8px 0;text-align:right;font-weight:700;">${formatPriceCents(i.line_total_cents)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1F36;line-height:1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(26,31,54,0.06);">
            <tr>
              <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#E63B7A,#FFB4A2);color:#ffffff;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">New paid order</p>
                <h1 style="margin:0;font-size:22px;font-weight:800;line-height:1.2;">${escape(order.order_number)}</h1>
                <p style="margin:8px 0 0;font-size:15px;font-weight:600;">${escape(order.customer_name)} · ${formatPriceCents(order.total_cents)}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Items</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;font-size:14px;border-collapse:collapse;">
                  ${itemRows}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 28px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
                  <tr><td style="padding:4px 0;color:#6B7280;">Subtotal</td><td style="padding:4px 0;text-align:right;">${formatPriceCents(order.subtotal_cents)}</td></tr>
                  <tr><td style="padding:4px 0;color:#6B7280;">Postage · ${escape(postageLabel)}</td><td style="padding:4px 0;text-align:right;">${formatPriceCents(order.postage_cents)}</td></tr>
                  <tr><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;font-weight:700;">Total</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:800;color:#E63B7A;">${formatPriceCents(order.total_cents)}</td></tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 4px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Deliver to</p>
                <p style="margin:8px 0 0;font-size:14px;font-weight:600;">${escape(order.customer_name)}</p>
                <p style="margin:4px 0 0;font-size:14px;">${escape(postalAddress)}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#6B7280;">
                  <a href="mailto:${escape(order.customer_email)}" style="color:#E63B7A;text-decoration:none;">${escape(order.customer_email)}</a>
                  ${order.customer_phone ? ` · <a href="tel:${escape(order.customer_phone)}" style="color:#E63B7A;text-decoration:none;">${escape(order.customer_phone)}</a>` : ""}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 24px;">
                <p style="margin:0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#E63B7A;font-weight:700;">Billing</p>
                <p style="margin:8px 0 0;font-size:14px;">${escape(billingAddress)}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 28px 20px;background:#f6f4ee;border-top:1px solid #e5e7eb;font-size:11px;color:#6B7280;text-align:center;">
                Paid via Stripe. Stock has been decremented automatically.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: order.customer_email,
    subject,
    text,
    html,
  });
}
