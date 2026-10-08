/**
 * Stripe price IDs for CC Netball subscription products.
 * These are safe to expose — they're identifiers, not credentials.
 */
export const STRIPE_PRICE_IDS = {
  /** Netball Drills Library — $49 AUD / month recurring subscription. */
  drillsLibrary: "price_1UEK7DQID60kwpfiyWrFIDER",
} as const;

/**
 * Master switch for the Drills Library checkout. Keep false while the
 * library is being built — the subscribe button shows "Coming soon" and
 * the checkout API refuses to create Stripe sessions.
 */
export const DRILLS_LIBRARY_CHECKOUT_OPEN = false;
