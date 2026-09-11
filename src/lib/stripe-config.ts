/**
 * Stripe price IDs for CC Netball subscription products.
 * These are safe to expose — they're identifiers, not credentials.
 */
export const STRIPE_PRICE_IDS = {
  /** Netball Drills Library — $49 AUD / month recurring subscription. */
  drillsLibrary: "price_1UEK7DQID60kwpfiyWrFIDER",
} as const;
