import {
  AGE_GROUPS,
  type AgeGroupId,
  type DrillCategory,
} from "@/lib/drills-library-content";

/**
 * Drills Library memberships. Each one opens the drills ticked for its age
 * groups — a drill ticked for several age groups shows in every membership
 * that covers one of them. Stored in entitlements.tier.
 */
export const MEMBERSHIPS = [
  {
    id: "netsetgo",
    name: "NetSetGo",
    short: "Drills for our youngest players (U6–U10).",
    ageGroups: ["netsetgo"],
  },
  {
    id: "junior-senior",
    name: "Junior & Senior",
    short: "Drills for Junior (U11–U13) and Senior (U14–Open) players.",
    ageGroups: ["junior", "senior"],
  },
  {
    id: "all-access",
    name: "All access",
    short: "Every drill — NetSetGo, Junior and Senior.",
    ageGroups: ["netsetgo", "junior", "senior"],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  short: string;
  ageGroups: readonly AgeGroupId[];
}[];

export type MembershipId = (typeof MEMBERSHIPS)[number]["id"];

export const ALL_AGE_GROUPS: AgeGroupId[] = AGE_GROUPS.map((a) => a.id);

export function getMembership(id: string | null | undefined) {
  return MEMBERSHIPS.find((m) => m.id === id);
}

/**
 * Age groups an entitlement opens. Subscriptions from before memberships
 * were split (no tier) keep full access.
 */
export function membershipAgeGroups(tier: string | null | undefined) {
  return [...(getMembership(tier)?.ageGroups ?? ALL_AGE_GROUPS)];
}

/**
 * Only the drills ticked for one of these age groups; empty categories drop
 * out. Drills with no age ticked stay admin-only.
 */
export function filterCategoriesByAge(
  categories: DrillCategory[],
  ageGroups: AgeGroupId[],
): DrillCategory[] {
  return categories
    .map((cat) => ({
      ...cat,
      drills: cat.drills.filter((d) =>
        (d.ageGroups ?? []).some((a) => ageGroups.includes(a)),
      ),
    }))
    .filter((cat) => cat.drills.length > 0);
}
