/**
 * How a player is shown on trial documents, per the club's display-mode choice.
 *  - "number"          → "#2"        (most private, fully de-identified)
 *  - "initial_surname" → "S.Smith"   (first initial + surname)
 *  - "first_initial"   → "Sally.S"   (first name + surname initial)
 *
 * The two name modes can CLASH (e.g. two "Sally.S"). To keep every player
 * distinct on a sheet, use buildPlayerLabels() over the whole group: it grows
 * the abbreviated part one letter at a time until the labels differ
 * ("Sally.Sm" vs "Sally.Si"), and falls back to the player number if two names
 * are genuinely identical. playerLabel() gives the simple, non-disambiguated
 * label for a single player (fine for number mode, or as a fallback).
 *
 * IMPORTANT: positions are a selector's aid on the TEAM-BUILDING screen only.
 * They are never added to printed/shared documents — there, use the labels.
 */

export type DisplayMode = "number" | "initial_surname" | "first_initial";

export type PlayerLike = {
  player_number: number | null;
  first_name: string;
  last_name: string;
  position_1?: string | null;
  position_2?: string | null;
  purged?: boolean;
};

function numberLabel(p: PlayerLike): string {
  return `#${p.player_number ?? "?"}`;
}

function isAnonymous(p: PlayerLike): boolean {
  return Boolean(p.purged) || (!p.first_name && !p.last_name);
}

/** Simple per-player label (no cross-player disambiguation). */
export function playerLabel(p: PlayerLike, mode: DisplayMode): string {
  if (mode === "number" || isAnonymous(p)) return numberLabel(p);
  if (mode === "initial_surname") {
    const initial = p.first_name ? `${p.first_name[0]}.` : "";
    return `${initial}${p.last_name}`.trim() || numberLabel(p);
  }
  // first_initial → "Sally.S"
  const sInitial = p.last_name ? `.${p.last_name[0]}` : "";
  return `${p.first_name}${sInitial}`.trim() || numberLabel(p);
}

/**
 * Build distinct labels for a whole group (e.g. one age group). Returns a map
 * from player id → label, disambiguating name-mode clashes by extending the
 * abbreviated part until unique.
 */
export function buildPlayerLabels<T extends PlayerLike & { id: string }>(
  players: T[],
  mode: DisplayMode,
): Map<string, string> {
  const out = new Map<string, string>();
  if (mode === "number") {
    for (const p of players) out.set(p.id, numberLabel(p));
    return out;
  }

  // Anonymous/purged players always show as a number.
  const named: T[] = [];
  for (const p of players) {
    if (isAnonymous(p)) out.set(p.id, numberLabel(p));
    else named.push(p);
  }

  // The "fixed" part is shown in full; the "variable" part grows on a clash.
  //  initial_surname: fixed = surname, variable = first name (shown as initial).
  //  first_initial  : fixed = first name, variable = surname (shown as initial).
  const fixedOf = (p: T) => (mode === "initial_surname" ? p.last_name : p.first_name) || "";
  const varOf = (p: T) => (mode === "initial_surname" ? p.first_name : p.last_name) || "";
  const render = (p: T, k: number) => {
    const v = varOf(p).slice(0, Math.max(1, k));
    return mode === "initial_surname" ? `${v}.${fixedOf(p)}` : `${fixedOf(p)}.${v}`;
  };

  // Only players sharing the fixed part can ever clash — group by it.
  const groups = new Map<string, T[]>();
  for (const p of named) {
    const key = fixedOf(p).toLowerCase();
    const g = groups.get(key);
    if (g) g.push(p);
    else groups.set(key, [p]);
  }

  for (const group of groups.values()) {
    const letters = new Map<string, number>();
    group.forEach((p) => letters.set(p.id, 1));

    // Grow the variable part of any clashing labels until they separate (or the
    // name runs out of letters).
    for (let iter = 0; iter < 30; iter++) {
      const byLabel = new Map<string, T[]>();
      for (const p of group) {
        const lab = render(p, letters.get(p.id)!);
        const arr = byLabel.get(lab);
        if (arr) arr.push(p);
        else byLabel.set(lab, [p]);
      }
      let changed = false;
      for (const arr of byLabel.values()) {
        if (arr.length < 2) continue;
        for (const p of arr) {
          const cur = letters.get(p.id)!;
          if (cur < varOf(p).length) {
            letters.set(p.id, cur + 1);
            changed = true;
          }
        }
      }
      if (!changed) break;
    }

    // Assign, and if two names are genuinely identical, append the number so
    // the de-identified label is still unique.
    const seen = new Map<string, number>();
    for (const p of group) {
      let lab = render(p, letters.get(p.id)!);
      const n = seen.get(lab) ?? 0;
      seen.set(lab, n + 1);
      if (n > 0) lab = `${lab} ${numberLabel(p)}`;
      out.set(p.id, lab);
    }
  }

  return out;
}

/** Team-building view only: label + the player's two nominated positions. */
export function playerLabelWithPositions(p: PlayerLike, mode: DisplayMode): string {
  const pos = [p.position_1, p.position_2].filter(Boolean).join("/");
  const base = playerLabel(p, mode);
  return pos ? `${base} ${pos}` : base;
}
