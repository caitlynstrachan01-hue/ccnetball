import {
  AGE_GROUPS,
  type AgeGroupId,
  type DrillCategory,
} from "@/lib/drills-library-content";

/** The Centre Pass categories — sold as their own membership. */
export const CENTRE_PASS_CATEGORIES = [
  "attack-centre-pass",
  "defence-centre-pass",
];

export const ALL_AGE_GROUPS: AgeGroupId[] = AGE_GROUPS.map((a) => a.id);

/**
 * What a membership opens: drills ticked for one of `ageGroups`, in either
 * the main library ("main", everything except Centre Pass), the Centre Pass
 * categories, or every category.
 */
export type Grant = {
  ageGroups: AgeGroupId[];
  categories: "main" | "centre-pass" | "all";
};

/**
 * Drills Library memberships. A drill ticked for several age groups shows in
 * every membership that covers one of them. Stored in entitlements.tier.
 * Prices are AUD per year.
 */
export const MEMBERSHIPS = [
  {
    id: "netsetgo",
    name: "NetSetGo",
    short: "Drills for our youngest players (U6–U10).",
    priceAud: 199,
    grant: { ageGroups: ["netsetgo"], categories: "main" },
  },
  {
    id: "junior-senior",
    name: "Junior & Senior",
    short: "Drills for Junior (U11–U13) and Senior (U14–Open) players.",
    priceAud: 199,
    grant: { ageGroups: ["junior", "senior"], categories: "main" },
  },
  {
    id: "centre-pass",
    name: "Centre Pass",
    short: "Centre Pass - Attack and Centre Pass - Defence structures.",
    priceAud: 79,
    grant: { ageGroups: ALL_AGE_GROUPS, categories: "centre-pass" },
  },
  {
    id: "all-access",
    name: "All access",
    short:
      "Everything — NetSetGo, Junior & Senior and both Centre Pass categories.",
    priceAud: 329,
    grant: { ageGroups: ALL_AGE_GROUPS, categories: "all" },
  },
] as const satisfies readonly {
  id: string;
  name: string;
  short: string;
  priceAud: number;
  grant: Grant;
}[];

export type MembershipId = (typeof MEMBERSHIPS)[number]["id"];

export function getMembership(id: string | null | undefined) {
  return MEMBERSHIPS.find((m) => m.id === id);
}

/** Everything a membership opens (admins and full access). */
export const FULL_ACCESS: Grant[] = [
  { ageGroups: ALL_AGE_GROUPS, categories: "all" },
];

/**
 * What an entitlement opens. Subscriptions from before memberships were
 * split (no tier) keep full access.
 */
export function membershipGrant(tier: string | null | undefined): Grant {
  const grant = getMembership(tier)?.grant ?? FULL_ACCESS[0];
  return { ageGroups: [...grant.ageGroups], categories: grant.categories };
}

function grantCovers(grant: Grant, categorySlug: string) {
  const centrePass = CENTRE_PASS_CATEGORIES.includes(categorySlug);
  if (grant.categories === "all") return true;
  return grant.categories === "centre-pass" ? centrePass : !centrePass;
}

/**
 * Only the drills a viewer's memberships open; empty categories drop out.
 * Drills with no age ticked stay admin-only.
 */
export function filterCategoriesForAccess(
  categories: DrillCategory[],
  grants: Grant[],
): DrillCategory[] {
  return categories
    .map((cat) => {
      const ages = new Set(
        grants
          .filter((g) => grantCovers(g, cat.slug))
          .flatMap((g) => g.ageGroups),
      );
      return {
        ...cat,
        drills: cat.drills.filter((d) =>
          (d.ageGroups ?? []).some((a) => ages.has(a)),
        ),
      };
    })
    .filter((cat) => cat.drills.length > 0);
}

/** Age groups a coach can plan sessions for. */
export function grantAgeGroups(grants: Grant[]): AgeGroupId[] {
  const ages = new Set(grants.flatMap((g) => g.ageGroups));
  return ALL_AGE_GROUPS.filter((a) => ages.has(a));
}
