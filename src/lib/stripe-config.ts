/**
 * Stripe price IDs for CC Netball subscription products.
 * These are safe to expose — they're identifiers, not credentials.
 */
export const STRIPE_PRICE_IDS = {
  /** Netball Drills Library — $49 AUD / month recurring subscription (sandbox). */
  drillsLibrary: "price_1UEK7DQID60kwpfiyWrFIDER",
} as const;

/**
 * Stripe price for each Drills Library membership. Fill these in once the
 * prices are created in Stripe — a membership with no price can't be bought.
 */
export const MEMBERSHIP_PRICE_IDS: Record<
  "netsetgo" | "junior-senior" | "all-access",
  string | null
> = {
  netsetgo: null,
  "junior-senior": null,
  "all-access": null,
};

/**
 * Master switch for the Drills Library checkout. Keep false while the
 * library is being built — the subscribe button shows "Coming soon" and
 * the checkout API refuses to create Stripe sessions.
 */
export const DRILLS_LIBRARY_CHECKOUT_OPEN = false;
