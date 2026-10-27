/**
 * Trial App — de-identified game builder (ported from the CC Netball prototype).
 *
 * Places every present attendee into trial games so that, as far as the court
 * slots allow, each player gets a turn in BOTH of their preferred positions
 * across the trial. When whole slots run out it can SHARE a slot (two players
 * split the court time, ½ each). Line-ups reference players by id only — the UI
 * renders them as a number or initial+surname per the trial's display mode.
 *
 * Pure, client-safe logic (no DB, no React). The result is stored as JSON so
 * sheets re-print and a late arrival can be folded in "from round N" without
 * disturbing earlier rounds.
 */

import { POSITIONS, POSITION_ELIGIBLE, type Position } from "./trial-fees";

/** May this player be placed at `pos`? Only their own nominated positions and the
 * sanctioned out-of-position cover for `pos` qualify. This is a hard rule: a player
 * who isn't eligible is never placed there (the slot is left empty instead). */
function eligibleAt(p: PlayerLite, pos: Position): boolean {
  const ok = POSITION_ELIGIBLE[pos];
  return p.positions.some((q) => ok.includes(q));
}

export type PlayerLite = { id: string; positions: Position[] };

/** A filled slot: a single player id, a shared pair, or empty. */
export type SlotVal = string | { share: [string, string] } | null;
export type Game = { A: Record<Position, SlotVal>; B: Record<Position, SlotVal> };

export type BuildResult = {
  games: Game[];
  playCount: Record<string, number>;
  playedPref: Record<string, boolean>;
  sharedCount: number;
  attendeeIds: string[];
  /** Bib/sash colour chosen for each team (set in the UI, e.g. the night before).
   * When present, teams show as "Team White" / "Team Blue" on cards and sheets
   * instead of "Team A" / "Team B". */
  teamColours?: { A: string; B: string };
};

function emptyTeam(): Record<Position, SlotVal> {
  const t = {} as Record<Position, SlotVal>;
  for (const p of POSITIONS) t[p] = null;
  return t;
}

function idsInGame(g: Game): string[] {
  const s: string[] = [];
  for (const t of ["A", "B"] as const)
    for (const p of POSITIONS) {
      const v = g[t][p];
      if (v == null) continue;
      if (typeof v === "object") s.push(...v.share);
      else s.push(v);
    }
  return s;
}

/** Court-time and positions-played, recomputed straight from the games (the
 * single source of truth), so improvement passes can't drift out of sync. */
function recomputeState(games: Game[], pMap: Record<string, PlayerLite>) {
  const playCount: Record<string, number> = {};
  const played: Record<string, Set<Position>> = {};
  for (const id in pMap) {
    playCount[id] = 0;
    played[id] = new Set();
  }
  for (const g of games)
    for (const t of ["A", "B"] as const)
      for (const pos of POSITIONS) {
        const v = g[t][pos];
        const ids = v == null ? [] : typeof v === "object" ? v.share : [v];
        for (const id of ids) {
          if (!(id in playCount)) continue;
          playCount[id]++;
          if (pMap[id].positions.includes(pos)) played[id].add(pos);
        }
      }
  return { playCount, played };
}

/**
 * Build `numGames` games from `attendees`. If `keep` is given (earlier rounds
 * that must not change), those games are preserved and only the rounds after
 * them are generated — used when a late player is folded in from a round.
 */
export function buildGames(
  attendees: PlayerLite[],
  numGames: number,
  allowShared: boolean,
  keep: Game[] = [],
): BuildResult {
  const players = attendees.slice();
  const pMap: Record<string, PlayerLite> = {};
  players.forEach((p) => (pMap[p.id] = p));

  const playCount: Record<string, number> = {};
  const playedPref: Record<string, boolean> = {};
  players.forEach((p) => {
    playCount[p.id] = 0;
    playedPref[p.id] = false;
  });

  // Seed counts from the kept (locked) rounds.
  const lockedBefore = Math.min(keep.length, numGames);
  const games: Game[] = [];
  for (let i = 0; i < lockedBefore; i++) {
    const g = keep[i];
    games.push(g);
    for (const t of ["A", "B"] as const)
      for (const pos of POSITIONS) {
        const v = g[t][pos];
        const ids = v == null ? [] : typeof v === "object" ? v.share : [v];
        for (const id of ids) {
          if (!(id in playCount)) continue; // player may no longer be present
          playCount[id]++;
          if (pMap[id]?.positions.includes(pos)) playedPref[id] = true;
        }
      }
  }

  // Greedy fill for the remaining rounds.
  for (let g = lockedBefore; g < numGames; g++) {
    const used = new Set<string>();
    const teams: Game = { A: emptyTeam(), B: emptyTeam() };
    for (const team of ["A", "B"] as const)
      for (const pos of POSITIONS) {
        // Only players eligible for this position may fill it (hard rule).
        const cands = players.filter((p) => !used.has(p.id) && eligibleAt(p, pos));
        if (!cands.length) {
          teams[team][pos] = null; // leave empty rather than play someone ineligible
          continue;
        }
        cands.sort((a, b) => {
          const aZ = playCount[a.id] === 0,
            bZ = playCount[b.id] === 0;
          if (aZ !== bZ) return aZ ? -1 : 1;
          const aP = a.positions.includes(pos),
            bP = b.positions.includes(pos);
          const aN = aP && !playedPref[a.id],
            bN = bP && !playedPref[b.id];
          if (aN !== bN) return aN ? -1 : 1;
          if (playedPref[a.id] !== playedPref[b.id])
            return playedPref[a.id] ? 1 : -1;
          // prefer players who nominated this position over eligible OOP cover
          if (aP !== bP) return aP ? -1 : 1;
          if (playCount[a.id] !== playCount[b.id])
            return playCount[a.id] - playCount[b.id];
          return 0;
        });
        const pk = cands[0];
        teams[team][pos] = pk.id;
        used.add(pk.id);
        playCount[pk.id]++;
        if (pk.positions.includes(pos)) playedPref[pk.id] = true;
      }
    games.push(teams);
  }

  const mutableFrom = lockedBefore; // never rewrite locked rounds

  const occMetElsewhere = (occId: string, skipGame: Game, skipPos: Position) => {
    for (const g of games)
      for (const t of ["A", "B"] as const)
        for (const pos of POSITIONS) {
          if (g === skipGame && pos === skipPos) continue;
          const v = g[t][pos];
          const ids = v == null ? [] : typeof v === "object" ? v.share : [v];
          if (ids.includes(occId) && pMap[occId]?.positions.includes(pos))
            return true;
        }
    return false;
  };
  const findSlot = (g: Game, id: string) => {
    for (const t of ["A", "B"] as const)
      for (const pos of POSITIONS) if (g[t][pos] === id) return { t, pos };
    return null;
  };

  // Pass 1: swap players into a preferred position where safe.
  for (let pass = 0; pass < 6; pass++) {
    let ch = false;
    players.forEach((p) => {
      if (playedPref[p.id]) return;
      for (let gi = mutableFrom; gi < games.length; gi++) {
        const g = games[gi];
        const cur = findSlot(g, p.id);
        if (!cur) continue;
        for (const t of ["A", "B"] as const)
          for (const posY of p.positions) {
            const occId = g[t][posY];
            if (occId == null || typeof occId === "object" || occId === p.id)
              continue;
            const occ = pMap[occId];
            // The occupant gets moved into cur.pos — only allow it if they're
            // eligible there (never relocate someone into an illegal position).
            const occSafe =
              eligibleAt(occ, cur.pos) &&
              (occ.positions.includes(cur.pos) ||
                !occ.positions.includes(posY) ||
                occMetElsewhere(occId, g, posY));
            if (occSafe) {
              g[cur.t][cur.pos] = occId;
              g[t][posY] = p.id;
              playedPref[p.id] = true;
              if (occ.positions.includes(cur.pos)) playedPref[occId] = true;
              ch = true;
              return;
            }
          }
      }
    });
    if (!ch) break;
  }

  // Pass 2: give a still-unmet player a benched preferred slot.
  for (let pass = 0; pass < 4; pass++) {
    let ch = false;
    players.forEach((p) => {
      if (playedPref[p.id]) return;
      for (let gi = mutableFrom; gi < games.length; gi++) {
        const g = games[gi];
        for (const t of ["A", "B"] as const)
          for (const pos of p.positions) {
            const v = g[t][pos];
            if (v == null || typeof v === "object") continue;
            const occ = pMap[v];
            const pIn = idsInGame(g).includes(p.id);
            const safe =
              playCount[occ.id] > 1 &&
              (playedPref[occ.id] || !occ.positions.includes(pos));
            if (safe && !pIn) {
              g[t][pos] = p.id;
              playedPref[p.id] = true;
              playCount[p.id]++;
              playCount[occ.id]--;
              ch = true;
              return;
            }
          }
      }
    });
    if (!ch) break;
  }

  // Pass 2b: chase the SECOND preferred position for every player. Each accepted
  // move places a player into a preferred position they haven't played yet, by
  // benching an occupant who can spare the slot WITHOUT losing one of their own
  // preferred positions. Every move raises total preferred coverage by exactly
  // one, so this always terminates and never makes things worse. This drives the
  // goal: each player plays one game in EACH of their two preferred positions.
  {
    const { playCount: pc, played } = recomputeState(games, pMap);
    const playsPosElsewhere = (
      id: string,
      pos: Position,
      skipGi: number,
      skipT: "A" | "B",
    ) => {
      for (let gi2 = 0; gi2 < games.length; gi2++)
        for (const t2 of ["A", "B"] as const) {
          if (gi2 === skipGi && t2 === skipT) continue;
          const v = games[gi2][t2][pos];
          const ids = v == null ? [] : typeof v === "object" ? v.share : [v];
          if (ids.includes(id)) return true;
        }
      return false;
    };
    let changed = true;
    let guard = 0;
    while (changed && guard++ < 2000) {
      changed = false;
      for (let gi = mutableFrom; gi < games.length && !changed; gi++) {
        const g = games[gi];
        for (const t of ["A", "B"] as const) {
          if (changed) break;
          for (const posX of POSITIONS) {
            const occId = g[t][posX];
            if (typeof occId === "object") continue; // shared slot — leave it
            if (occId != null) {
              if (pc[occId] <= 1) continue; // keep the occupant on court
              const occ = pMap[occId];
              // skip if benching would cost the occupant one of their preferred
              if (occ.positions.includes(posX) && !playsPosElsewhere(occId, posX, gi, t))
                continue;
            }
            // players who still need posX as a preferred and aren't already in this game
            const cands = players.filter(
              (q) =>
                q.id !== occId &&
                q.positions.includes(posX) &&
                !played[q.id].has(posX) &&
                !idsInGame(g).includes(q.id),
            );
            if (!cands.length) continue;
            cands.sort((a, b) => {
              const ca = a.positions.filter((x) => played[a.id].has(x)).length;
              const cb = b.positions.filter((x) => played[b.id].has(x)).length;
              if (ca !== cb) return ca - cb; // fewest preferred covered first
              return pc[a.id] - pc[b.id]; // then fewest games
            });
            const p = cands[0];
            g[t][posX] = p.id;
            pc[p.id] = (pc[p.id] ?? 0) + 1;
            played[p.id].add(posX);
            if (occId != null) {
              pc[occId]--;
              if (!playsPosElsewhere(occId, posX, gi, t)) played[occId].delete(posX);
            }
            changed = true;
          }
          if (changed) break;
        }
      }
    }
    // Sync the running counters with the improved games for the share pass + result.
    for (const id in pc) {
      playCount[id] = pc[id];
      playedPref[id] = pMap[id].positions.some((pos) => played[id].has(pos));
    }
  }

  // Pass 3: share a slot (½ each) so a leftover player still gets on.
  let sharedCount = 0;
  if (allowShared) {
    for (let pass = 0; pass < 5; pass++) {
      let ch = false;
      players.forEach((p) => {
        if (playedPref[p.id]) return;
        for (let gi = mutableFrom; gi < games.length; gi++) {
          const g = games[gi];
          for (const t of ["A", "B"] as const)
            for (const pos of p.positions) {
              const v = g[t][pos];
              if (v == null || typeof v === "object") continue;
              if (idsInGame(g).includes(p.id)) continue;
              g[t][pos] = { share: [v, p.id] };
              playedPref[p.id] = true;
              playCount[p.id]++;
              sharedCount++;
              ch = true;
              return;
            }
        }
      });
      if (!ch) break;
    }
  }

  return { games, playCount, playedPref, sharedCount, attendeeIds: players.map((p) => p.id) };
}
