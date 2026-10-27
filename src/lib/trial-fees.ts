/**
 * Trial App — fee model (shared by the public registration form and the
 * server-side checkout, so both agree on what a participant pays).
 *
 * Base CC Netball fee is $2.20 per participant. A division may add its own
 * pass-through charges (umpires, selector, court hire, other). A card
 * surcharge (1.9% + $0.30) is always passed on, never absorbed. If the
 * association chooses to cover the CC fee for a division, participants aren't
 * charged it (it's invoiced to the club later instead).
 */

export const PLATFORM_FEE_CENTS = 220;
export const SURCHARGE_PCT = 0.019;
export const SURCHARGE_FIXED_CENTS = 30;

export const POSITIONS = ["GS", "GA", "WA", "C", "WD", "GD", "GK"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_NAMES: Record<Position, string> = {
  GS: "Goal Shooter",
  GA: "Goal Attack",
  WA: "Wing Attack",
  C: "Centre",
  WD: "Wing Defence",
  GD: "Goal Defence",
  GK: "Goal Keeper",
};

/**
 * Position eligibility — a HARD RULE for every trial. For each court position,
 * these are the ONLY nominated positions that let a player fill it. The position
 * itself is the preferred fit; any others are sanctioned out-of-position cover
 * (always shown orange). A player who is not eligible for a position is NEVER
 * placed there — the slot is left empty instead.
 *
 *  - Shooting circle (GS / GA): only players who nominated GS or GA. GS and GA
 *    cover each other (orange). No one else is ever played at GS or GA.
 *  - A Goal Attack may also cover Wing Attack (orange).
 *  - Goal circle defence (GD / GK): only players who nominated GD or GK. GD and
 *    GK cover each other (orange). No one else is ever played at GD or GK.
 *  - A Goal Defence may also cover Wing Defence (orange).
 *  - Centre: only players who nominated Centre.
 */
export const POSITION_ELIGIBLE: Record<Position, Position[]> = {
  GS: ["GS", "GA"],
  GA: ["GA", "GS"],
  WA: ["WA", "GA"],
  C: ["C"],
  WD: ["WD", "GD"],
  GD: ["GD", "GK"],
  GK: ["GK", "GD"],
};

export type AdditionalFee = { label: string; amount_cents: number };

export type DivisionFeeConfig = {
  /** CC Netball fee per participant (cents). Usually 220. */
  feeCents: number;
  /** Pass-through add-ons the club chose for this division. */
  additionalFees: AdditionalFee[];
  /** If true, participants are NOT charged the CC fee (club invoiced later). */
  associationPaysFees: boolean;
};

export type FeeBreakdown = {
  /** CC Netball fee charged to the participant (0 if the association covers it). */
  platformToParticipant: number;
  /** Add-ons actually charged (amount > 0). */
  addons: AdditionalFee[];
  addonsTotal: number;
  subtotal: number;
  surcharge: number;
  total: number;
  associationPays: boolean;
};

export function computeFee(config: DivisionFeeConfig): FeeBreakdown {
  const platformToParticipant = config.associationPaysFees
    ? 0
    : Math.max(0, Math.round(config.feeCents || 0));
  const addons = (config.additionalFees || []).filter(
    (a) => a && typeof a.amount_cents === "number" && a.amount_cents > 0,
  );
  const addonsTotal = addons.reduce((sum, a) => sum + Math.round(a.amount_cents), 0);
  const subtotal = platformToParticipant + addonsTotal;
  const surcharge =
    subtotal > 0
      ? Math.round(subtotal * SURCHARGE_PCT + SURCHARGE_FIXED_CENTS)
      : 0;
  return {
    platformToParticipant,
    addons,
    addonsTotal,
    subtotal,
    surcharge,
    total: subtotal + surcharge,
    associationPays: config.associationPaysFees,
  };
}
