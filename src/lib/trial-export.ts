/**
 * Trial App — CSV export + printable selection sheets (client-only).
 *
 * The three sheet styles replicate CC Netball's own templates exactly:
 *   1. Landscape, 2 games per page. Positions run across as columns; Team A then
 *      Team B as rows, with Team B's columns reversed (GK→GS) so opponents align.
 *   2. Portrait, 1 game per page. Team A and Team B side by side; positions as
 *      rows (GS→GK); a "Shooting stats:" prompt in the GS and GA cells.
 *   3. Landscape, 1 game per page. Per-position rows with stat columns
 *      (Shooting · Contact · Obstruction · Negative/Error · Positive/Turnover ·
 *      Intercept · Other Comments); Team A over Team B.
 *
 * Players show by number or initial+surname; a "*" marks an out-of-position
 * placement. Stat cells are left blank for selectors to complete by hand.
 */

import { POSITIONS, type Position } from "./trial-fees";
import type { Game, SlotVal } from "./trial-games";

/* ------------------------------- CSV ------------------------------- */
export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------ styles ----------------------------- */
/** Shared by the print document and the in-app preview, so what you review is
 * exactly what prints. */
export const SHEET_BODY_CSS = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1b2330; margin: 0; }
  .pg { page-break-after: always; }
  .pg:last-child { page-break-after: auto; }

  .hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .hdr .fields div { font-size: 13px; margin-bottom: 5px; }
  .hdr .fields b { font-weight: 700; }
  .blank { display: inline-block; min-width: 110px; border-bottom: 1px solid #1b2330; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; white-space: nowrap; }
  .brand .cc { color: #e23b7a; }
  .gametag { font-size: 14px; font-weight: 800; margin: 10px 0 5px; }

  /* Sheet 1 — positions run ACROSS as column headers, teams run as rows.
     Each game is a block: a header row (GS GA WA · C · WD GD GK) with TEAM A's
     write row beneath it, then the mirrored header (GK GD WD · C · WA GA GS)
     with TEAM B's write row beneath. Two games stack down a landscape page.
     The centre column is set off with heavier borders (attack / centre /
     defence thirds). Player label sits at the top of a tall white write cell. */
  .t1 { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 5mm; }
  .t1 col.lblcol { width: 62px; }
  .t1 th, .t1 td { border: 1px solid #27324a; }
  .t1 .corner { border: 0; background: #fff; }
  .t1 .ph { background: #eef1f6; text-align: center; font-weight: 700; font-size: 12px; padding: 4px 2px; letter-spacing: .5px; }
  .t1 .teamlbl { background: #eef1f6; text-align: center; font-weight: 800; font-size: 12px; letter-spacing: 1px; }
  .t1 .cell { height: 28mm; vertical-align: top; text-align: center; padding: 4px; font-size: 14px; }
  .t1 .cell b { font-size: 15px; }
  .t1 .mid { border-left: 2px solid #27324a; border-right: 2px solid #27324a; }

  /* Sheet 2 — two teams side by side, positions as rows */
  .t2wrap { display: flex; gap: 16px; }
  .t2wrap > div { flex: 1; min-width: 0; }
  .t2 { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .t2 th, .t2 td { border: 1px solid #27324a; }
  .t2 .teamhdr { background: #eef1f6; text-align: center; font-weight: 700; font-size: 13px; padding: 6px; letter-spacing: 1px; }
  .t2 .poslbl { width: 28px; text-align: center; font-weight: 700; font-size: 12px; background: #eef1f6; }
  .t2 .cell { height: 84px; vertical-align: top; padding: 5px 7px; font-size: 13px; text-align: left; position: relative; }
  .t2 .cell .num { font-size: 14px; }
  .t2 .cell b { font-size: 14px; }
  /* Shooting-stats prompt tucked into the bottom-left of the GS / GA cell. */
  .t2 .prompt { position: absolute; left: 7px; bottom: 5px; font-style: italic; font-size: 10px; color: #555; text-align: left; }

  /* Sheet 3 — stat grid, positions as rows, stats as columns */
  .t3 { width: 100%; border-collapse: collapse; margin-bottom: 14px; table-layout: fixed; }
  .t3 th, .t3 td { border: 1px solid #27324a; font-size: 11px; }
  .t3 thead th { background: #eef1f6; font-weight: 700; text-align: center; padding: 4px 2px; line-height: 1.15; }
  .t3 .teamlbl { width: 26px; writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; font-weight: 700; letter-spacing: 1px; }
  .t3 .poscol { width: 54px; text-align: center; font-weight: 700; background: #eef1f6; padding: 3px; }
  .t3 .poscol small { display: block; font-weight: 400; font-size: 11px; margin-top: 2px; }
  .t3 .stat { height: 36px; }
  .t3 .wide { width: 26%; }
`;

function printCSS(landscape: boolean) {
  return `
    @page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: ${landscape ? "8mm" : "12mm"}; }
    ${SHEET_BODY_CSS}
  `;
}

/* ------------------------------ print ------------------------------ */
export function printHTML(title: string, bodyHTML: string, landscape = false) {
  // Print via a hidden iframe — no pop-up window, so nothing to be blocked.
  const full = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${printCSS(landscape)}</style></head><body>${bodyHTML}</body></html>`;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  iframe.srcdoc = full;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* ignore */
    }
    setTimeout(() => iframe.remove(), 60000);
  };
  document.body.appendChild(iframe);
}

/* --------------------------- sheet building --------------------------- */
/** labelOf(id, pos) returns the player's label; callers append "*" for an
 * out-of-position placement so the sheet flags it. */
type LabelOf = (id: string, pos: Position) => string;

function cellContent(val: SlotVal, labelOf: LabelOf, pos: Position): string {
  if (val == null) return "";
  if (typeof val === "object")
    return `<b>${labelOf(val.share[0], pos)}</b> <span style="font-size:10px">½</span> &nbsp; <b>${labelOf(val.share[1], pos)}</b> <span style="font-size:10px">½</span>`;
  return `<b>${labelOf(val, pos)}</b>`;
}

export type SheetMeta = {
  trialName: string;
  club: string;
  divisionName: string;
  sessionDate: string;
  sessionNo: number;
  sessionTotal: number;
  /** Team names to print, e.g. "Team White" / "Team Blue" (from bib colours).
   * Default to "Team A" / "Team B" when no colours were chosen. */
  teamA: string;
  teamB: string;
};

function headerHTML(m: SheetMeta): string {
  return `<div class="hdr">
    <div class="fields">
      <div><b>Age group:</b> ${m.divisionName} &nbsp;&nbsp;&nbsp;&nbsp; <b>Date:</b> ${m.sessionDate || '<span class="blank"></span>'}</div>
      <div><b>Selectors:</b> <span class="blank"></span> &nbsp;&nbsp;&nbsp;&nbsp; <b>Time:</b> <span class="blank"></span></div>
    </div>
    <div class="brand"><span class="cc">CC</span>Netball</div>
  </div>`;
}

const REV = [...POSITIONS].reverse(); // GK GD WD C WA GA GS

/* ---- Sheet 1: positions ACROSS, teams as rows -------------------------------
 * Team A's positions read GS→GK; Team B's read the opponents (GK→GS) so the two
 * teams mirror each other across the court. Each game is one block; two blocks
 * stack down a landscape page. */
function t1Game(
  title: string,
  g: Game | null,
  labelOf: LabelOf,
  teams: { A: string; B: string },
): string {
  const posHdr = (order: readonly Position[]) =>
    `<tr><td class="corner"></td>` +
    order.map((p) => `<th class="ph${p === "C" ? " mid" : ""}">${p}</th>`).join("") +
    `</tr>`;
  const teamRow = (label: string, team: "A" | "B", order: readonly Position[]) =>
    `<tr><th class="teamlbl">${label.toUpperCase()}</th>` +
    order
      .map(
        (p) =>
          `<td class="cell${p === "C" ? " mid" : ""}">${g ? cellContent(g[team][p], labelOf, p) : ""}</td>`,
      )
      .join("") +
    `</tr>`;
  const cols = `<col class="lblcol">${POSITIONS.map(() => "<col>").join("")}`;
  return `<div class="gametag">${title}</div>
    <table class="t1"><colgroup>${cols}</colgroup>
      ${posHdr(POSITIONS)}
      ${teamRow(teams.A, "A", POSITIONS)}
      ${posHdr(REV)}
      ${teamRow(teams.B, "B", REV)}
    </table>`;
}

/* ---- Sheet 2: two teams side by side, positions as rows ---- */
function t2Team(label: string, team: "A" | "B", g: Game | null, labelOf: LabelOf): string {
  const rows = POSITIONS.map((p) => {
    const num = g ? cellContent(g[team][p], labelOf, p) : "";
    const prompt = p === "GS" || p === "GA" ? `<span class="prompt">Shooting stats:</span>` : "";
    return `<tr><th class="poslbl">${p}</th><td class="cell"><div class="num">${num}</div>${prompt}</td></tr>`;
  }).join("");
  return `<table class="t2"><colgroup><col style="width:30px"><col></colgroup><tr><th class="teamhdr" colspan="2">${label}</th></tr>${rows}</table>`;
}
function t2Game(
  title: string,
  g: Game | null,
  labelOf: LabelOf,
  teams: { A: string; B: string },
): string {
  return `<div class="gametag">${title}</div>
  <div class="t2wrap">
    <div>${t2Team(teams.A.toUpperCase(), "A", g, labelOf)}</div>
    <div>${t2Team(teams.B.toUpperCase(), "B", g, labelOf)}</div>
  </div>`;
}

/* ---- Sheet 3: stat grid, positions as rows, stats as columns ---- */
const T3_STATS = [
  "Shooting",
  "Contact",
  "Obstruction",
  "Negative<br>Error",
  "Positive<br>Turnover",
  "Intercept",
  "Other Comments",
];
function t3Team(label: string, team: "A" | "B", g: Game | null, labelOf: LabelOf): string {
  const headCells = T3_STATS.map(
    (s, i) => `<th${i === T3_STATS.length - 1 ? ' class="wide"' : ""}>${s}</th>`,
  ).join("");
  let rows = `<tr><th class="teamlbl" rowspan="8">${label}</th><th class="poscol"></th>${headCells}</tr>`;
  for (const p of POSITIONS) {
    const who = g ? cellContent(g[team][p], labelOf, p) : "";
    rows += `<tr><td class="poscol">${p}${who ? `<small>${who}</small>` : ""}</td>${T3_STATS.map(() => `<td class="stat"></td>`).join("")}</tr>`;
  }
  return `<table class="t3">${rows}</table>`;
}
function t3Game(
  title: string,
  g: Game | null,
  labelOf: LabelOf,
  teams: { A: string; B: string },
): string {
  return `<div class="gametag">${title}</div>${t3Team(teams.A.toUpperCase(), "A", g, labelOf)}${t3Team(teams.B.toUpperCase(), "B", g, labelOf)}`;
}

export function selectionSheetsHTML(
  template: 1 | 2 | 3,
  meta: SheetMeta,
  games: Game[],
  labelOf: LabelOf,
): { html: string; landscape: boolean } {
  let pages = "";
  const teams = { A: meta.teamA, B: meta.teamB };

  if (template === 1) {
    for (let i = 0; i < games.length; i += 2) {
      const top = t1Game("Game " + (i + 1), games[i], labelOf, teams);
      const bottom = games[i + 1]
        ? t1Game("Game " + (i + 2), games[i + 1], labelOf, teams)
        : t1Game("Game #", null, labelOf, teams);
      pages += `<div class="pg">${headerHTML(meta)}${top}${bottom}</div>`;
    }
    pages += `<div class="pg">${headerHTML(meta)}${t1Game("Game #", null, labelOf, teams)}${t1Game("Game #", null, labelOf, teams)}</div>`;
    return { html: pages, landscape: true };
  }

  if (template === 2) {
    games.forEach((g, i) => {
      pages += `<div class="pg">${headerHTML(meta)}${t2Game("Game " + (i + 1), g, labelOf, teams)}</div>`;
    });
    pages += `<div class="pg">${headerHTML(meta)}${t2Game("Game #", null, labelOf, teams)}</div>`;
    return { html: pages, landscape: false };
  }

  // template 3 — landscape (the stat grid is wide, as in the PDF)
  games.forEach((g, i) => {
    pages += `<div class="pg">${headerHTML(meta)}${t3Game("Game " + (i + 1), g, labelOf, teams)}</div>`;
  });
  pages += `<div class="pg">${headerHTML(meta)}${t3Game("Game #", null, labelOf, teams)}</div>`;
  return { html: pages, landscape: true };
}
