"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  LayoutGrid,
  Users,
  Clock,
  ClipboardList,
  Check,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { POSITIONS, type Position } from "@/lib/trial-fees";
import { buildGames, type Game, type SlotVal, type BuildResult } from "@/lib/trial-games";
import {
  playerLabel,
  buildPlayerLabels,
  type DisplayMode,
} from "@/lib/trial-display";
import {
  downloadCSV,
  printHTML,
  selectionSheetsHTML,
  SHEET_BODY_CSS,
  type SheetMeta,
} from "@/lib/trial-export";

/* ----------------------------- types ----------------------------- */
export type RunData = {
  trial: { id: string; name: string; club: string; display_mode: DisplayMode; status: string };
  divisions: { id: string; name: string; draft_team_count: number }[];
  sessions: {
    id: string;
    age_group_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    venue: string;
  }[];
  participants: {
    id: string;
    age_group_id: string;
    player_number: number | null;
    first_name: string;
    last_name: string;
    position_1: string | null;
    position_2: string | null;
    status: string;
    manual_entry: boolean;
    draft_team: number | null;
    draft_bucket: "shooters" | "midcourt" | "defenders" | null;
    purged: boolean;
  }[];
  attendance: { session_id: string; participant_id: string; present: boolean }[];
  games: {
    session_id: string;
    num_games: number;
    allow_shared: boolean;
    result: BuildResult;
  }[];
};

type Participant = RunData["participants"][number];
const BUCKETS = [
  ["shooters", "Shooters"],
  ["midcourt", "Midcourt"],
  ["defenders", "Defenders"],
] as const;

/** Common netball bib / sash colours offered for Team A and Team B. */
const BIB_COLOURS = [
  "White",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Pink",
  "Purple",
  "Black",
  "Maroon",
  "Sky Blue",
  "Navy",
] as const;

const fmtDate = (d: string) => {
  if (!d) return "(date TBC)";
  const dt = new Date(d + "T00:00");
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ============================ component ============================ */
export function RunTrial({ initial }: { initial: RunData }) {
  const supabase = createClient();
  const [data, setData] = useState<RunData>(initial);
  const [tab, setTab] = useState<
    "attendance" | "games" | "teams" | "court" | "schedule"
  >("attendance");
  const [divId, setDivId] = useState(initial.divisions[0]?.id ?? "");

  const divisions = data.divisions;
  const divSessions = useMemo(
    () => data.sessions.filter((s) => s.age_group_id === divId),
    [data.sessions, divId],
  );
  const divPlayers = useMemo(
    () => data.participants.filter((p) => p.age_group_id === divId),
    [data.participants, divId],
  );

  const [sessionId, setSessionId] = useState(divSessions[0]?.id ?? "");
  // keep sessionId valid when switching division
  const activeSession =
    divSessions.find((s) => s.id === sessionId) ?? divSessions[0] ?? null;

  function switchDivision(id: string) {
    setDivId(id);
    const first = data.sessions.find((s) => s.age_group_id === id);
    setSessionId(first?.id ?? "");
  }

  /* ---------- attendance helpers ---------- */
  const attMap = useMemo(() => {
    const m = new Map<string, boolean>();
    data.attendance.forEach((a) => m.set(`${a.session_id}|${a.participant_id}`, a.present));
    return m;
  }, [data.attendance]);
  const isPresent = (sid: string, pid: string) => attMap.get(`${sid}|${pid}`) ?? false;

  async function setPresent(sid: string, pid: string, present: boolean) {
    setData((d) => {
      const rest = d.attendance.filter(
        (a) => !(a.session_id === sid && a.participant_id === pid),
      );
      return { ...d, attendance: [...rest, { session_id: sid, participant_id: pid, present }] };
    });
    await supabase.from("trial_attendance").upsert(
      {
        trial_id: data.trial.id,
        session_id: sid,
        participant_id: pid,
        present,
        checked_in_at: present ? new Date().toISOString() : null,
      },
      { onConflict: "session_id,participant_id" },
    );
  }
  async function setAllPresent(sid: string, present: boolean) {
    const rows = divPlayers.map((p) => ({
      trial_id: data.trial.id,
      session_id: sid,
      participant_id: p.id,
      present,
      checked_in_at: present ? new Date().toISOString() : null,
    }));
    setData((d) => {
      const rest = d.attendance.filter((a) => a.session_id !== sid);
      return {
        ...d,
        attendance: [
          ...rest,
          ...divPlayers.map((p) => ({ session_id: sid, participant_id: p.id, present })),
        ],
      };
    });
    if (rows.length)
      await supabase
        .from("trial_attendance")
        .upsert(rows, { onConflict: "session_id,participant_id" });
  }

  /* ---------- games helpers ---------- */
  const gameRec = (sid: string) => data.games.find((g) => g.session_id === sid) ?? null;

  const pPositions = (p: Participant): Position[] =>
    [p.position_1, p.position_2].filter(Boolean) as Position[];
  const byId = useMemo(() => {
    const m = new Map<string, Participant>();
    data.participants.forEach((p) => m.set(p.id, p));
    return m;
  }, [data.participants]);

  async function saveGames(
    sid: string,
    num_games: number,
    allow_shared: boolean,
    result: BuildResult,
  ) {
    setData((d) => {
      const rest = d.games.filter((g) => g.session_id !== sid);
      return { ...d, games: [...rest, { session_id: sid, num_games, allow_shared, result }] };
    });
    await supabase.from("trial_session_games").upsert(
      {
        session_id: sid,
        trial_id: data.trial.id,
        num_games,
        allow_shared,
        result: result as unknown as object,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );
  }

  /* ---------- draft helpers ---------- */
  async function setDraft(
    pid: string,
    team: number | null,
    bucket: Participant["draft_bucket"],
  ) {
    setData((d) => ({
      ...d,
      participants: d.participants.map((p) =>
        p.id === pid ? { ...p, draft_team: team, draft_bucket: bucket } : p,
      ),
    }));
    await supabase
      .from("trial_participants")
      .update({ draft_team: team, draft_bucket: bucket })
      .eq("id", pid);
  }
  async function setTeamCount(count: number) {
    const n = Math.max(1, Math.min(20, count));
    setData((d) => ({
      ...d,
      divisions: d.divisions.map((g) =>
        g.id === divId ? { ...g, draft_team_count: n } : g,
      ),
      // un-draft anyone above the new team count
      participants: d.participants.map((p) =>
        p.age_group_id === divId && p.draft_team && p.draft_team > n
          ? { ...p, draft_team: null, draft_bucket: null }
          : p,
      ),
    }));
    await supabase.from("trial_age_groups").update({ draft_team_count: n }).eq("id", divId);
    await supabase
      .from("trial_participants")
      .update({ draft_team: null, draft_bucket: null })
      .eq("age_group_id", divId)
      .gt("draft_team", n);
  }

  const mode = data.trial.display_mode;
  // Distinct labels per age group (handles name clashes like Sally.Sm / Sally.Si).
  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    const byDiv = new Map<string, Participant[]>();
    for (const p of data.participants) {
      const arr = byDiv.get(p.age_group_id);
      if (arr) arr.push(p);
      else byDiv.set(p.age_group_id, [p]);
    }
    for (const arr of byDiv.values())
      buildPlayerLabels(arr, mode).forEach((v, k) => map.set(k, v));
    return map;
  }, [data.participants, mode]);
  const nameOf = (p: Participant) => labelById.get(p.id) ?? playerLabel(p, mode);
  const labelOf = (pid: string) => {
    const p = byId.get(pid);
    return p ? labelById.get(pid) ?? playerLabel(p, mode) : `#?`;
  };

  /* ---------- manual add ---------- */
  type ManualForm = {
    first: string;
    last: string;
    dob: string;
    positions: Position[];
  };
  async function manualAdd(form: ManualForm): Promise<number> {
    const res = await fetch("/api/trials/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "manual-add", manual: { age_group_id: divId, ...form } }),
    });
    const d = await res.json();
    if (!res.ok || !d.participant) throw new Error(d.error || "Could not add the player.");
    const p = d.participant;
    setData((x) => ({
      ...x,
      participants: [
        ...x.participants,
        {
          id: p.id,
          age_group_id: p.age_group_id,
          player_number: p.player_number ?? null,
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          position_1: p.position_1 ?? null,
          position_2: p.position_2 ?? null,
          status: p.status ?? "manual",
          manual_entry: true,
          draft_team: null,
          draft_bucket: null,
          purged: false,
        },
      ],
    }));
    return (d.billedToClub as number) ?? 0;
  }

  /* ============================ render ============================ */
  return (
    <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      <Link
        href={`/account/trials/${data.trial.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to setup
      </Link>
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        Run the trial
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {data.trial.name} — {data.trial.club}
      </p>

      {/* Division picker */}
      {divisions.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {divisions.map((g) => (
            <button
              key={g.id}
              onClick={() => switchDivision(g.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                g.id === divId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-border/70">
        <TabBtn active={tab === "attendance"} onClick={() => setTab("attendance")} icon={<CalendarCheck className="size-4" />}>
          Attendance
        </TabBtn>
        <TabBtn active={tab === "games"} onClick={() => setTab("games")} icon={<LayoutGrid className="size-4" />}>
          Build games
        </TabBtn>
        <TabBtn active={tab === "teams"} onClick={() => setTab("teams")} icon={<Users className="size-4" />}>
          Draft teams
        </TabBtn>
        <TabBtn active={tab === "court"} onClick={() => setTab("court")} icon={<Clock className="size-4" />}>
          Court time
        </TabBtn>
        <TabBtn active={tab === "schedule"} onClick={() => setTab("schedule")} icon={<ClipboardList className="size-4" />}>
          Player schedule
        </TabBtn>
      </div>

      {divisions.length === 0 ? (
        <Empty>Add an age group on the setup page first.</Empty>
      ) : (
        <div className="mt-6">
          {tab === "attendance" && (
            <AttendanceTab
              divSessions={divSessions}
              divPlayers={divPlayers}
              sessionId={activeSession?.id ?? ""}
              setSessionId={setSessionId}
              isPresent={isPresent}
              setPresent={setPresent}
              setAllPresent={setAllPresent}
              mode={mode}
              nameOf={nameOf}
              divisionName={divisions.find((d) => d.id === divId)?.name ?? ""}
              trialName={data.trial.name}
              club={data.trial.club}
              manualAdd={manualAdd}
              onBuildGames={() => setTab("games")}
            />
          )}
          {tab === "games" && (
            <GamesTab
              divSessions={divSessions}
              divPlayers={divPlayers}
              sessionId={activeSession?.id ?? ""}
              setSessionId={setSessionId}
              isPresent={isPresent}
              gameRec={gameRec}
              saveGames={saveGames}
              pPositions={pPositions}
              byId={byId}
              mode={mode}
              nameOf={nameOf}
              labelOf={labelOf}
              divisionName={divisions.find((d) => d.id === divId)?.name ?? ""}
              trialName={data.trial.name}
              club={data.trial.club}
            />
          )}
          {tab === "teams" && (
            <TeamsTab
              division={divisions.find((d) => d.id === divId) ?? null}
              divPlayers={divPlayers}
              setDraft={setDraft}
              setTeamCount={setTeamCount}
              mode={mode}
              nameOf={nameOf}
              trialName={data.trial.name}
              club={data.trial.club}
            />
          )}
          {tab === "court" && (
            <CourtTab
              divSessions={divSessions}
              divPlayers={divPlayers}
              gameRec={gameRec}
              pPositions={pPositions}
              mode={mode}
              nameOf={nameOf}
            />
          )}
          {tab === "schedule" && (
            <ScheduleTab
              divSessions={divSessions}
              divPlayers={divPlayers}
              gameRec={gameRec}
              mode={mode}
              nameOf={nameOf}
              trialName={data.trial.name}
              club={data.trial.club}
              divisionName={divisions.find((d) => d.id === divId)?.name ?? ""}
            />
          )}
        </div>
      )}
    </section>
  );
}

/* ============================ Attendance ============================ */
function AttendanceTab(props: {
  divSessions: RunData["sessions"];
  divPlayers: Participant[];
  sessionId: string;
  setSessionId: (id: string) => void;
  isPresent: (sid: string, pid: string) => boolean;
  setPresent: (sid: string, pid: string, present: boolean) => void;
  setAllPresent: (sid: string, present: boolean) => void;
  mode: DisplayMode;
  nameOf: (p: Participant) => string;
  divisionName: string;
  trialName: string;
  club: string;
  manualAdd: (f: { first: string; last: string; dob: string; positions: Position[] }) => Promise<number>;
  onBuildGames: () => void;
}) {
  const {
    divSessions,
    divPlayers,
    sessionId,
    setSessionId,
    isPresent,
    setPresent,
    setAllPresent,
    mode,
    nameOf,
    divisionName,
    trialName,
    club,
    manualAdd,
    onBuildGames,
  } = props;
  if (!divSessions.length) return <Empty>No sessions for this age group yet. Add dates on the setup page.</Empty>;
  const present = divPlayers.filter((p) => isPresent(sessionId, p.id)).length;

  function attendanceRows(): (string | number)[][] {
    const header = [
      "Player #",
      "Name",
      "Positions",
      ...divSessions.map((s, i) => `Session ${i + 1} (${s.session_date || "TBC"})`),
    ];
    const rows: (string | number)[][] = [header];
    divPlayers.forEach((p) =>
      rows.push([
        p.player_number ?? "",
        `${p.first_name} ${p.last_name}`.trim(),
        [p.position_1, p.position_2].filter(Boolean).join("/"),
        ...divSessions.map((s) => (isPresent(s.id, p.id) ? "Present" : "Absent")),
      ]),
    );
    return rows;
  }
  function printAttendance() {
    const cols = divSessions.map((s, i) => `<th>S${i + 1}<br>${s.session_date || "TBC"}</th>`).join("");
    const rows = divPlayers
      .map(
        (p) =>
          `<tr><td>${p.player_number ?? ""}</td><td>${nameOf(p)}</td><td>${[p.position_1, p.position_2].filter(Boolean).join("/")}</td>${divSessions.map((s) => `<td>${isPresent(s.id, p.id) ? "✓" : ""}</td>`).join("")}</tr>`,
      )
      .join("");
    printHTML(
      `Attendance — ${divisionName}`,
      `<h1>${trialName} — Attendance — ${divisionName}</h1><div class="meta">${club}</div>
       <table><thead><tr><th>#</th><th>Player</th><th>Positions</th>${cols}</tr></thead><tbody>${rows}</tbody></table>`,
    );
  }

  return (
    <div>
      <SessionTabs divSessions={divSessions} sessionId={sessionId} setSessionId={setSessionId} />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat value={divPlayers.length} label="Registered" />
        <Stat value={present} label="Checked in" />
        <Stat value={divPlayers.length - present} label="Not yet here" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <GhostBtn onClick={() => setAllPresent(sessionId, true)}>Mark all present</GhostBtn>
        <GhostBtn onClick={() => setAllPresent(sessionId, false)}>Mark all absent</GhostBtn>
        <GhostBtn onClick={() => downloadCSV(`attendance-${divisionName}.csv`, attendanceRows())}>
          Export CSV
        </GhostBtn>
        <GhostBtn onClick={printAttendance}>Print / PDF</GhostBtn>
      </div>

      <ManualAddForm divisionName={divisionName} manualAdd={manualAdd} />

      {divPlayers.length === 0 ? (
        <Empty>No players registered in this age group yet.</Empty>
      ) : (
        <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/70 bg-card">
          {divPlayers.map((p) => {
            const here = isPresent(sessionId, p.id);
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {nameOf(p)}
                    {mode === "number" && (
                      <span className="ml-2 font-normal text-muted-foreground">
                        {p.first_name} {p.last_name}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[p.position_1, p.position_2].filter(Boolean).join(" / ") || "—"}
                    {p.manual_entry && " · manually added"}
                  </p>
                </div>
                <button
                  onClick={() => setPresent(sessionId, p.id, !here)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    here
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {here ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  {here ? "Present" : "Not here"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {divPlayers.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onBuildGames}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01]"
          >
            <LayoutGrid className="size-4" />
            Build games →
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================ Build games ============================ */
function GamesTab(props: {
  divSessions: RunData["sessions"];
  divPlayers: Participant[];
  sessionId: string;
  setSessionId: (id: string) => void;
  isPresent: (sid: string, pid: string) => boolean;
  gameRec: (sid: string) => RunData["games"][number] | null;
  saveGames: (sid: string, n: number, s: boolean, r: BuildResult) => void;
  pPositions: (p: Participant) => Position[];
  byId: Map<string, Participant>;
  mode: DisplayMode;
  nameOf: (p: Participant) => string;
  labelOf: (pid: string) => string;
  divisionName: string;
  trialName: string;
  club: string;
}) {
  const {
    divSessions,
    divPlayers,
    sessionId,
    setSessionId,
    isPresent,
    gameRec,
    saveGames,
    pPositions,
    byId,
    mode,
    nameOf,
    labelOf,
    divisionName,
    trialName,
    club,
  } = props;
  const rec = gameRec(sessionId);
  const [numGames, setNumGames] = useState(rec?.num_games ?? 2);
  // Default OFF: only full games (no shared ½ slots) unless the club opts in.
  const [allowShared, setAllowShared] = useState(rec?.allow_shared ?? false);
  // Bib/sash colours for the two teams (set the night before). Default White/Blue.
  const [teamAColour, setTeamAColour] = useState(rec?.result?.teamColours?.A ?? "White");
  const [teamBColour, setTeamBColour] = useState(rec?.result?.teamColours?.B ?? "Blue");
  const [fromRound, setFromRound] = useState(0); // 0 = regenerate all
  const [template, setTemplate] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ html: string; landscape: boolean } | null>(null);

  if (!divSessions.length) return <Empty>No sessions for this age group yet.</Empty>;

  const attendees = divPlayers.filter((p) => isPresent(sessionId, p.id));
  const slots = numGames * 14;
  const sessionIdx = divSessions.findIndex((s) => s.id === sessionId);
  const activeSession = divSessions[sessionIdx];

  // Both-preferred feasibility: each position has 2 slots per game (Team A + B),
  // so a position can seat (2 × games) players across the session. If more players
  // nominated a position than there are slots for it, not everyone can play it.
  const demand: Record<string, number> = {};
  POSITIONS.forEach((pos) => (demand[pos] = 0));
  attendees.forEach((p) => pPositions(p).forEach((pos) => (demand[pos] += 1)));
  const supplyPerPos = 2 * numGames;
  const tightPositions = POSITIONS.filter((pos) => demand[pos] > supplyPerPos);

  function feasibility() {
    if (attendees.length === 0)
      return <Notice tone="warn">No players checked in for this session. Mark attendance first.</Notice>;
    if (slots < attendees.length)
      return (
        <Notice tone="warn">
          Only {slots} court slots for {attendees.length} players — some won&apos;t get on court at all. Add a game.
        </Notice>
      );
    if (numGames < 2)
      return (
        <Notice tone="warn">
          Set at least <b>2 games</b> so each player can play one game in <b>each</b> of their two
          preferred positions.
        </Notice>
      );
    if (tightPositions.length)
      return (
        <Notice tone="warn">
          Not enough slots for everyone to play <b>both</b> preferred positions —{" "}
          {tightPositions
            .map((pos) => `${pos}: ${demand[pos]} want it vs ${supplyPerPos} slots`)
            .join("; ")}
          . Add more games, or those players will miss one of their preferred positions.
        </Notice>
      );
    return (
      <Notice tone="good">
        ✓ Enough slots for <b>every player to play both</b> their preferred positions. Generate to see
        the line-ups.
      </Notice>
    );
  }

  function generate() {
    setBusy(true);
    const lite = attendees.map((p) => ({ id: p.id, positions: pPositions(p) }));
    const keep =
      fromRound > 0 && rec?.result?.games ? rec.result.games.slice(0, fromRound) : [];
    const result = buildGames(lite, Math.max(1, numGames), allowShared, keep);
    result.teamColours = { A: teamAColour, B: teamBColour };
    saveGames(sessionId, Math.max(1, numGames), allowShared, result);
    setBusy(false);
  }

  // Change bib colours after games exist, without rebuilding the line-ups.
  function saveColours(a: string, b: string) {
    if (!rec?.result?.games?.length) return;
    const result = { ...rec.result, teamColours: { A: a, B: b } };
    saveGames(sessionId, rec.num_games, rec.allow_shared, result);
  }

  function printSheets() {
    if (!rec?.result?.games?.length) return;
    const meta: SheetMeta = {
      trialName,
      club,
      divisionName,
      sessionDate: activeSession?.session_date ?? "",
      sessionNo: sessionIdx + 1,
      sessionTotal: divSessions.length,
      teamA: `Team ${teamAColour}`,
      teamB: `Team ${teamBColour}`,
    };
    // Position-aware labels so the printed sheet flags out-of-position with "*".
    const sheetLabel = (id: string, pos: Position) => {
      const p = byId.get(id);
      if (!p) return "#?";
      const oop = !(p.position_1 === pos || p.position_2 === pos);
      return nameOf(p) + (oop ? "*" : "");
    };
    const { html, landscape } = selectionSheetsHTML(template, meta, rec.result.games, sheetLabel);
    setPreview({ html, landscape }); // show a visible preview first
  }
  function exportGamesCSV() {
    if (!rec?.result?.games?.length) return;
    const rows: (string | number)[][] = [["Game", "Team", "Position", "Player"]];
    const val = (v: SlotVal) =>
      v == null ? "" : typeof v === "object" ? `${labelOf(v.share[0])} & ${labelOf(v.share[1])} (shared)` : labelOf(v);
    const teamLbl = (t: "A" | "B") => {
      const c = rec?.result?.teamColours?.[t];
      return c ? `Team ${c}` : `Team ${t}`;
    };
    rec.result.games.forEach((g, i) =>
      (["A", "B"] as const).forEach((t) =>
        POSITIONS.forEach((pos) => rows.push([`Game ${i + 1}`, teamLbl(t), pos, val(g[t][pos])])),
      ),
    );
    downloadCSV(`games-${divisionName}-${activeSession?.session_date || ""}.csv`, rows);
  }

  return (
    <div>
      <SessionTabs divSessions={divSessions} sessionId={sessionId} setSessionId={setSessionId} />
      <div className="mt-4 rounded-2xl border border-border/70 bg-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Games this session
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={numGames}
              onChange={(e) => setNumGames(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-28 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
            />
          </label>
          {rec?.result?.games && rec.result.games.length > 0 && (
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Keep rounds, rebuild from
              </span>
              <select
                value={fromRound}
                onChange={(e) => setFromRound(Number(e.target.value))}
                className="mt-1 w-44 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              >
                <option value={0}>Rebuild all rounds</option>
                {rec.result.games.map((_, i) => (
                  <option key={i} value={i + 1}>
                    Keep 1–{i + 1}, rebuild rest
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            onClick={generate}
            disabled={busy || attendees.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {rec ? "Re-generate" : "Generate games"}
          </button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowShared}
            onChange={(e) => setAllowShared(e.target.checked)}
          />
          Allow shared court time (two players split a slot, ½ each) when slots run out
        </label>

        <div className="mt-4 border-t border-border/50 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bib / sash colours
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Set these the night before — teams then show as “Team {teamAColour}” and “Team{" "}
            {teamBColour}” on the cards, selection sheets and player schedule.
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Team A bib</span>
              <select
                value={teamAColour}
                onChange={(e) => {
                  setTeamAColour(e.target.value);
                  saveColours(e.target.value, teamBColour);
                }}
                className="mt-1 block w-36 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              >
                {BIB_COLOURS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Team B bib</span>
              <select
                value={teamBColour}
                onChange={(e) => {
                  setTeamBColour(e.target.value);
                  saveColours(teamAColour, e.target.value);
                }}
                className="mt-1 block w-36 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              >
                {BIB_COLOURS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat value={attendees.length} label="Checked in" />
          <Stat value={slots} label="Court slots (14 × games)" />
          <Stat
            value={`${(slots / Math.max(attendees.length, 1)).toFixed(1)}×`}
            label="Avg games / player"
          />
        </div>
        {feasibility()}
      </div>

      {rec?.result?.games && rec.result.games.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border/70 bg-card p-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Selection sheet style
            </span>
            <select
              value={template}
              onChange={(e) => setTemplate(Number(e.target.value) as 1 | 2 | 3)}
              className="mt-1 w-full max-w-sm rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
            >
              <option value={1}>Landscape view (2 games per page)</option>
              <option value={2}>Portrait view (1 game per page)</option>
              <option value={3}>Landscape view (1 game per page, with stat boxes)</option>
            </select>
          </label>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <GhostBtn onClick={printSheets}>Preview &amp; print selection sheets</GhostBtn>
            <GhostBtn onClick={exportGamesCSV}>Export games CSV</GhostBtn>
          </div>
        </div>
      )}

      {rec?.result?.games && (
        <GamesOutput rec={rec} attendees={attendees} byId={byId} mode={mode} nameOf={nameOf} />
      )}

      {preview && (
        <SheetPreview
          preview={preview}
          title={`Selection sheets — ${divisionName}`}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function SheetPreview({
  preview,
  title,
  onClose,
}: {
  preview: { html: string; landscape: boolean };
  title: string;
  onClose: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageW = preview.landscape ? "297mm" : "210mm";
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4 ${preview.landscape ? "landscape" : "portrait"}; margin: ${preview.landscape ? "8mm" : "12mm"}; }
    ${SHEET_BODY_CSS}
    body { background: #e9e9ee; margin: 0; padding: 14px; }
    /* Render each page at its true width so columns never cram; the panel scrolls. */
    .pg { background: #fff; padding: 16px; margin: 0 auto 16px; width: ${pageW}; max-width: none; box-shadow: 0 1px 6px rgba(0,0,0,.2); border-radius: 4px; }
    @media print { body { background: #fff; padding: 0; } .pg { box-shadow: none; margin: 0; padding: 0; width: auto; } }
  </style></head><body>${preview.html}</body></html>`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 p-2 sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-bold text-gray-900">Selection sheet preview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                iframeRef.current?.contentWindow?.focus();
                iframeRef.current?.contentWindow?.print();
              }}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          title={title}
          className="h-full w-full flex-1 border-0 bg-[#e9e9ee]"
        />
      </div>
    </div>
  );
}

function GamesOutput({
  rec,
  attendees,
  byId,
  mode,
  nameOf,
}: {
  rec: RunData["games"][number];
  attendees: Participant[];
  byId: Map<string, Participant>;
  mode: DisplayMode;
  nameOf: (p: Participant) => string;
}) {
  const { games, playedPref, playCount, sharedCount } = rec.result;
  const colours = rec.result.teamColours;
  const teamName = (t: "A" | "B") => (colours ? `Team ${colours[t]}` : `Team ${t}`);
  const unmet = attendees.filter((p) => !playedPref[p.id]);
  const noPlay = attendees.filter((p) => (playCount[p.id] ?? 0) === 0);

  const cell = (pos: Position, val: SlotVal) => {
    const tag = (id: string) => {
      const p = byId.get(id);
      const pref = p && (p.position_1 === pos || p.position_2 === pos);
      const label = p ? nameOf(p) : `#?`;
      if (pref)
        return (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{label}</span>
        );
      // Out of position — flag it clearly for selectors.
      return (
        <span
          className="font-bold text-amber-600 dark:text-amber-400"
          title={`Out of position — prefers ${[p?.position_1, p?.position_2].filter(Boolean).join("/")}`}
        >
          {label}
          <sup className="ml-0.5 text-[9px] font-extrabold">OOP</sup>
        </span>
      );
    };
    if (val == null) return <span className="text-muted-foreground">—</span>;
    if (typeof val === "object")
      return (
        <span className="text-violet-500">
          {tag(val.share[0])} <span className="text-[10px]">½</span> / {tag(val.share[1])}{" "}
          <span className="text-[10px]">½</span>
        </span>
      );
    return tag(val);
  };

  return (
    <div className="mt-5 rounded-2xl border border-border/70 bg-card p-5">
      {unmet.length === 0 ? (
        <Notice tone="good">
          ✓ Everyone plays a preferred position at least once
          {sharedCount ? ` (${sharedCount} slot${sharedCount > 1 ? "s" : ""} shared to fit)` : ""}.
        </Notice>
      ) : (
        <Notice tone="warn">
          {unmet.length} player(s) haven&apos;t reached a preferred position:{" "}
          {unmet.map((p) => nameOf(p)).join(", ")}. Add a game, or check Court time to adjust.
        </Notice>
      )}
      {noPlay.length > 0 && (
        <Notice tone="warn">
          Not enough court time for: {noPlay.map((p) => nameOf(p)).join(", ")}.
        </Notice>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        <span className="font-bold text-emerald-600 dark:text-emerald-400">Green</span> = preferred
        position · <span className="font-bold text-amber-600 dark:text-amber-400">Amber OOP</span> = out
        of position (not one of their two) · <span className="text-violet-500">purple</span> = shared
        slot (½ each)
      </p>
      <div className="mt-4 space-y-4">
        {games.map((g, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-background p-4">
            <h3 className="mb-3 text-sm font-bold">Game {i + 1}</h3>
            <div className="grid grid-cols-2 gap-5">
              {(["A", "B"] as const).map((t) => (
                <div key={t}>
                  <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {teamName(t)}
                  </h4>
                  {POSITIONS.map((pos) => (
                    <div
                      key={pos}
                      className="flex items-center justify-between border-b border-border/40 py-1 text-sm"
                    >
                      <span className="w-9 font-bold text-muted-foreground">{pos}</span>
                      <span className="text-right">{cell(pos, g[t][pos])}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ Draft teams ============================ */
function TeamsTab(props: {
  division: { id: string; name: string; draft_team_count: number } | null;
  divPlayers: Participant[];
  setDraft: (pid: string, team: number | null, bucket: Participant["draft_bucket"]) => void;
  setTeamCount: (n: number) => void;
  mode: DisplayMode;
  nameOf: (p: Participant) => string;
  trialName: string;
  club: string;
}) {
  const { division, divPlayers, setDraft, setTeamCount, mode, nameOf, trialName, club } = props;
  const [dragId, setDragId] = useState<string | null>(null);
  if (!division) return <Empty>Pick an age group.</Empty>;
  const nTeams = division.draft_team_count;
  const pool = divPlayers.filter((p) => !p.draft_team);
  const divName = division.name;

  const onDrop = (team: number | null, bucket: Participant["draft_bucket"]) => {
    if (dragId) setDraft(dragId, team, bucket);
    setDragId(null);
  };

  // Teams export/print show players by number/initial-surname only (no positions).
  function teamsRows(): (string | number)[][] {
    const rows: (string | number)[][] = [["Team", "Group", "Player"]];
    for (let t = 1; t <= nTeams; t++)
      for (const [bk, bl] of BUCKETS)
        divPlayers
          .filter((p) => p.draft_team === t && p.draft_bucket === bk)
          .forEach((p) => rows.push([`Team ${t}`, bl, nameOf(p)]));
    pool.forEach((p) => rows.push(["(pool)", "", nameOf(p)]));
    return rows;
  }
  function printTeams() {
    let body = `<h1>${trialName} — Teams — ${divName}</h1><div class="meta">${club}</div>`;
    for (let t = 1; t <= nTeams; t++) {
      body += `<h2>Team ${t}</h2><table><tbody>`;
      for (const [bk, bl] of BUCKETS) {
        const mem = divPlayers.filter((p) => p.draft_team === t && p.draft_bucket === bk);
        body += `<tr><td style="width:120px"><b>${bl} (${mem.length})</b></td><td>${mem.map((p) => nameOf(p)).join(", &nbsp;") || "—"}</td></tr>`;
      }
      body += `</tbody></table>`;
    }
    if (pool.length)
      body += `<h2>Not yet placed</h2><div class="foot">${pool.map((p) => nameOf(p)).join(", &nbsp;")}</div>`;
    printHTML(`Teams — ${divName}`, body);
  }

  // Team-building view only — show the player's label plus their positions.
  const chipLabel = (p: Participant) => {
    const pos = [p.position_1, p.position_2].filter(Boolean).join("/");
    return pos ? `${nameOf(p)} ${pos}` : nameOf(p);
  };
  const chip = (p: Participant) => (
    <div
      key={p.id}
      draggable
      onDragStart={() => setDragId(p.id)}
      onDragEnd={() => setDragId(null)}
      className="mb-1.5 cursor-grab rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs active:cursor-grabbing"
      title={chipLabel(p)}
    >
      {chipLabel(p)}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Teams to build
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={nTeams}
            onChange={(e) => setTeamCount(Number(e.target.value) || 1)}
            className="mt-1 w-24 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
          />
        </label>
        <p className="max-w-md text-xs text-muted-foreground">
          Drag players into a team under Shooters / Midcourt / Defenders to balance it. Positions show
          here only — not on the printed sheet.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <GhostBtn onClick={() => downloadCSV(`teams-${divName}.csv`, teamsRows())}>Export CSV</GhostBtn>
        <GhostBtn onClick={printTeams}>Print teams / PDF</GhostBtn>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: nTeams }, (_, i) => i + 1).map((t) => (
            <div key={t} className="rounded-2xl border border-border/70 bg-card p-3">
              <h3 className="mb-2 text-sm font-bold">Team {t}</h3>
              {BUCKETS.map(([bk, bl]) => {
                const members = divPlayers.filter(
                  (p) => p.draft_team === t && p.draft_bucket === bk,
                );
                return (
                  <div
                    key={bk}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(t, bk)}
                    className="mb-2 rounded-lg border border-dashed border-border/70 p-2"
                  >
                    <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {bl} ({members.length})
                    </h4>
                    {members.map(chip)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="lg:w-64">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(null, null)}
            className="rounded-2xl border border-border/70 bg-card p-3"
          >
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Available — {division.name} ({pool.length})
            </h4>
            {pool.length ? pool.map(chip) : <p className="text-xs italic text-muted-foreground">All players placed.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Court time ============================ */
function CourtTab(props: {
  divSessions: RunData["sessions"];
  divPlayers: Participant[];
  gameRec: (sid: string) => RunData["games"][number] | null;
  pPositions: (p: Participant) => Position[];
  mode: DisplayMode;
  nameOf: (p: Participant) => string;
}) {
  const { divSessions, divPlayers, gameRec, pPositions, mode, nameOf } = props;

  // positions played per participant across all sessions
  const stats = useMemo(() => {
    const perSession: Record<string, Record<string, number>> = {};
    const positionsPlayed = new Map<string, Set<string>>();
    divPlayers.forEach((p) => positionsPlayed.set(p.id, new Set()));
    divSessions.forEach((s) => {
      const rec = gameRec(s.id);
      perSession[s.id] = {};
      if (!rec?.result?.games) return;
      rec.result.games.forEach((g) => {
        (["A", "B"] as const).forEach((t) => {
          POSITIONS.forEach((pos) => {
            const v = g[t][pos];
            const ids = v == null ? [] : typeof v === "object" ? v.share : [v];
            ids.forEach((id) => {
              perSession[s.id][id] = (perSession[s.id][id] ?? 0) + 1;
              positionsPlayed.get(id)?.add(pos);
            });
          });
        });
      });
    });
    return { perSession, positionsPlayed };
  }, [divSessions, divPlayers, gameRec]);

  if (!divPlayers.length) return <Empty>No players in this age group yet.</Empty>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2">Player</th>
            {divSessions.map((s, i) => (
              <th key={s.id} className="px-3 py-2 text-center">
                Session {i + 1}
              </th>
            ))}
            <th className="px-3 py-2 text-center">Total games</th>
            <th className="px-3 py-2">Both preferred?</th>
          </tr>
        </thead>
        <tbody>
          {divPlayers.map((p) => {
            const played = stats.positionsPlayed.get(p.id) ?? new Set();
            const prefs = pPositions(p);
            const missing = prefs.filter((pos) => !played.has(pos));
            let total = 0;
            return (
              <tr key={p.id} className="border-b border-border/40">
                <td className="px-3 py-2 font-semibold">
                  {nameOf(p)}
                  {mode === "number" && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      {p.first_name} {p.last_name}
                    </span>
                  )}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {prefs.join("/")}
                  </span>
                </td>
                {divSessions.map((s) => {
                  const n = stats.perSession[s.id]?.[p.id] ?? 0;
                  total += n;
                  return (
                    <td key={s.id} className="px-3 py-2 text-center">
                      {n || <span className="text-muted-foreground">—</span>}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center font-bold">{total}</td>
                <td className="px-3 py-2">
                  {prefs.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : missing.length === 0 ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Both ✓
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      Still needs {missing.join(", ")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================ Player schedule ============================ */
function placement(
  g: Game,
  pid: string,
): { pos: Position; shared: boolean; team: "A" | "B" } | null {
  for (const t of ["A", "B"] as const)
    for (const pos of POSITIONS) {
      const v = g[t][pos];
      if (v == null) continue;
      if (typeof v === "object") {
        if (v.share.includes(pid)) return { pos, shared: true, team: t };
      } else if (v === pid) return { pos, shared: false, team: t };
    }
  return null;
}

/** The bib/sash colour name for a team in a session, or "" if none chosen. */
function teamColourOf(
  rec: RunData["games"][number] | null | undefined,
  team: "A" | "B",
): string {
  return rec?.result?.teamColours?.[team] ?? "";
}

function ScheduleTab(props: {
  divSessions: RunData["sessions"];
  divPlayers: Participant[];
  gameRec: (sid: string) => RunData["games"][number] | null;
  mode: DisplayMode;
  nameOf: (p: Participant) => string;
  trialName: string;
  club: string;
  divisionName: string;
}) {
  const { divSessions, divPlayers, gameRec, mode, nameOf, trialName, club, divisionName } = props;
  const sessionsWithGames = divSessions
    .map((s, i) => ({ s, i, rec: gameRec(s.id) }))
    .filter((x) => x.rec?.result?.games?.length);

  const isPref = (p: Participant, pos: Position) =>
    p.position_1 === pos || p.position_2 === pos;

  function printSchedule() {
    let body = `<h1>${trialName} — Player schedule — ${divisionName}</h1><div class="meta">${club} · where each player plays, game by game</div>`;
    sessionsWithGames.forEach(({ s, i, rec }) => {
      const games = rec!.result.games;
      const cols = games.map((_, gi) => `<th>G${gi + 1}</th>`).join("");
      const rows = divPlayers
        .map((p) => {
          const cells = games
            .map((g) => {
              const pl = placement(g, p.id);
              if (!pl) return `<td></td>`;
              const oop = !isPref(p, pl.pos);
              const bib = teamColourOf(rec, pl.team);
              return `<td>${pl.pos}${pl.shared ? " ½" : ""}${oop ? " *" : ""}${bib ? `<br><span style="font-size:10px;color:#555">${bib}</span>` : ""}</td>`;
            })
            .join("");
          return `<tr><td>${nameOf(p)}</td>${cells}</tr>`;
        })
        .join("");
      body += `<h2>Session ${i + 1} — ${s.session_date || "TBC"}</h2>
        <table><thead><tr><th>Player</th>${cols}</tr></thead><tbody>${rows}</tbody></table>`;
    });
    body += `<div class="foot">* = out of position (not one of the player's two preferred). "½" = shared slot.</div>`;
    printHTML(`Player schedule — ${divisionName}`, body);
  }
  function exportCSV() {
    const rows: (string | number)[][] = [];
    sessionsWithGames.forEach(({ s, i, rec }) => {
      const games = rec!.result.games;
      rows.push([`Session ${i + 1} (${s.session_date || "TBC"})`]);
      rows.push(["Player", ...games.map((_, gi) => `G${gi + 1}`)]);
      divPlayers.forEach((p) => {
        rows.push([
          nameOf(p),
          ...games.map((g) => {
            const pl = placement(g, p.id);
            if (!pl) return "";
            const bib = teamColourOf(rec, pl.team);
            return `${pl.pos}${pl.shared ? " (½)" : ""}${!isPref(p, pl.pos) ? " *OOP" : ""}${bib ? ` — ${bib}` : ""}`;
          }),
        ]);
      });
      rows.push([]);
    });
    downloadCSV(`player-schedule-${divisionName}.csv`, rows);
  }

  if (!sessionsWithGames.length)
    return <Empty>Build some games first — then every player&apos;s positions show here, game by game.</Empty>;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Every player, every game, and the position they play.{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Green</span> = preferred ·{" "}
          <span className="font-bold text-amber-600 dark:text-amber-400">amber</span> = out of position.
        </p>
        <div className="flex gap-2">
          <GhostBtn onClick={exportCSV}>Export CSV</GhostBtn>
          <GhostBtn onClick={printSchedule}>Print / PDF</GhostBtn>
        </div>
      </div>

      {sessionsWithGames.map(({ s, i, rec }) => {
        const games = rec!.result.games;
        return (
          <div key={s.id} className="mb-5">
            <h3 className="mb-2 text-sm font-bold">
              Session {i + 1} · {fmtDate(s.session_date)}
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">Player</th>
                    {games.map((_, gi) => (
                      <th key={gi} className="px-3 py-2 text-center">
                        G{gi + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {divPlayers.map((p) => (
                    <tr key={p.id} className="border-b border-border/40">
                      <td className="whitespace-nowrap px-3 py-2 font-semibold">
                        {nameOf(p)}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          {[p.position_1, p.position_2].filter(Boolean).join("/")}
                        </span>
                      </td>
                      {games.map((g, gi) => {
                        const pl = placement(g, p.id);
                        if (!pl)
                          return (
                            <td key={gi} className="px-3 py-2 text-center text-muted-foreground">
                              —
                            </td>
                          );
                        const oop = !isPref(p, pl.pos);
                        const bib = teamColourOf(rec, pl.team);
                        return (
                          <td
                            key={gi}
                            className={`px-3 py-2 text-center font-bold ${
                              oop
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {pl.pos}
                            {pl.shared && <span className="text-[10px]"> ½</span>}
                            {bib && (
                              <span className="block text-[10px] font-normal text-muted-foreground">
                                {bib}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ Manual add ============================ */
function ManualAddForm({
  divisionName,
  manualAdd,
}: {
  divisionName: string;
  manualAdd: (f: { first: string; last: string; dob: string; positions: Position[] }) => Promise<number>;
}) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function togglePos(p: Position) {
    setPositions((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : cur.length < 2 ? [...cur, p] : cur,
    );
  }
  async function submit() {
    setErr(null);
    setMsg(null);
    if (!first.trim() || !last.trim()) return setErr("Please enter a first name and surname.");
    if (positions.length !== 2) return setErr("Please choose two preferred positions.");
    setBusy(true);
    try {
      const billed = await manualAdd({ first: first.trim(), last: last.trim(), dob, positions });
      setMsg(
        `Added. $${(billed / 100).toFixed(2)} will be billed to your club for this player (you collect it from them).`,
      );
      setFirst("");
      setLast("");
      setDob("");
      setPositions([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not add the player.");
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground"
      >
        + Add a player manually
      </button>
    );

  return (
    <div className="mt-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Add a player manually — {divisionName}</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        No card is taken. The $2.20 (plus any division add-ons) is billed to your club — you collect it
        from the player.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="First name"
          className="rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
        />
        <input
          value={last}
          onChange={(e) => setLast(e.target.value)}
          placeholder="Surname"
          className="rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
        />
        <label className="text-xs text-muted-foreground">
          Date of birth (optional)
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Two preferred positions
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {POSITIONS.map((p) => {
          const sel = positions.includes(p);
          const dis = !sel && positions.length >= 2;
          return (
            <button
              key={p}
              onClick={() => togglePos(p)}
              disabled={dis}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                sel
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : dis
                    ? "bg-muted text-muted-foreground/40"
                    : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
      <button
        onClick={submit}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        Add player
      </button>
      {msg && <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">{msg}</p>}
      {err && <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}

/* ============================ small UI bits ============================ */
function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
function SessionTabs({
  divSessions,
  sessionId,
  setSessionId,
}: {
  divSessions: RunData["sessions"];
  sessionId: string;
  setSessionId: (id: string) => void;
}) {
  if (divSessions.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {divSessions.map((s, i) => (
        <button
          key={s.id}
          onClick={() => setSessionId(s.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            s.id === sessionId
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Session {i + 1} · {fmtDate(s.session_date)}
        </button>
      ))}
    </div>
  );
}
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
function GhostBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/40"
    >
      {children}
    </button>
  );
}
function Notice({ tone, children }: { tone: "info" | "warn" | "good"; children: React.ReactNode }) {
  const cls =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
        : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
  return <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card px-4 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}
