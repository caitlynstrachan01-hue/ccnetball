"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type {
  CompetitionCourt,
  CompetitionDivision,
  CompetitionTeam,
} from "@/lib/competition-builder";

type Props = {
  competitionId: string;
  courts: CompetitionCourt[];
  divisions: CompetitionDivision[];
  teams: CompetitionTeam[];
  matchCellsPerRound: number;
};

const UNASSIGNED = "__unassigned__";

export function TeamsStep({
  competitionId,
  courts,
  divisions,
  teams,
  matchCellsPerRound,
}: Props) {
  const router = useRouter();
  const [bulkInput, setBulkInput] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [draggingTeamId, setDraggingTeamId] = useState<string | null>(null);
  const [overTarget, setOverTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byDivision = new Map<string | null, CompetitionTeam[]>();
    byDivision.set(null, []);
    for (const d of divisions) byDivision.set(d.id, []);
    for (const t of teams) {
      const key = t.divisionId ?? null;
      if (!byDivision.has(key)) byDivision.set(key, []);
      byDivision.get(key)!.push(t);
    }
    return byDivision;
  }, [divisions, teams]);

  async function addBulkTeams(e: React.FormEvent) {
    e.preventDefault();
    const names = bulkInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/competition-builder/${competitionId}/teams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names, divisionId: null }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add teams.");
      setBulkInput("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function addDivision(e: React.FormEvent) {
    e.preventDefault();
    const name = newDivisionName.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/competition-builder/${competitionId}/divisions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add division.");
      setNewDivisionName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function moveTeam(teamId: string, targetDivisionId: string | null) {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    if ((team.divisionId ?? null) === targetDivisionId) return;
    try {
      const res = await fetch(
        `/api/competition-builder/${competitionId}/teams`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, divisionId: targetDivisionId }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not move team.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function renameTeam(teamId: string, currentName: string) {
    const next = window.prompt("Rename team", currentName)?.trim();
    if (!next || next === currentName) return;
    const res = await fetch(
      `/api/competition-builder/${competitionId}/teams`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, name: next }),
      },
    );
    if (res.ok) router.refresh();
  }

  async function deleteTeam(teamId: string, teamName: string) {
    if (!window.confirm(`Remove team "${teamName}"?`)) return;
    const res = await fetch(
      `/api/competition-builder/${competitionId}/teams?teamId=${encodeURIComponent(teamId)}`,
      { method: "DELETE" },
    );
    if (res.ok) router.refresh();
  }

  async function renameDivision(divisionId: string, currentName: string) {
    const next = window.prompt("Rename division", currentName)?.trim();
    if (!next || next === currentName) return;
    const res = await fetch(
      `/api/competition-builder/${competitionId}/divisions`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divisionId, name: next }),
      },
    );
    if (res.ok) router.refresh();
  }

  async function deleteDivision(divisionId: string, name: string) {
    if (
      !window.confirm(
        `Remove the "${name}" division? Its teams will go back to Unassigned.`,
      )
    )
      return;
    const res = await fetch(
      `/api/competition-builder/${competitionId}/divisions?divisionId=${encodeURIComponent(divisionId)}`,
      { method: "DELETE" },
    );
    if (res.ok) router.refresh();
  }

  async function setDivisionCourt(
    divisionId: string,
    courtId: string | null,
  ) {
    const res = await fetch(
      `/api/competition-builder/${competitionId}/divisions`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divisionId, lockedCourtId: courtId }),
      },
    );
    if (res.ok) router.refresh();
  }

  const unassigned = grouped.get(null) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold">Teams &amp; divisions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add every team playing, then drag each one into a division. Division
          counts and bye warnings update live.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={addBulkTeams}
        className="rounded-2xl border border-border/70 bg-background p-4"
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Add teams
          </span>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="One team per line, or comma-separated — e.g.
Lions
Eagles, Sharks, Falcons"
            rows={3}
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !bulkInput.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add teams
          </button>
          <span className="text-xs text-muted-foreground">
            New teams land in <strong>Unassigned</strong>. Drag them into a
            division next.
          </span>
        </div>
      </form>

      <form
        onSubmit={addDivision}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/70 bg-background p-4"
      >
        <label className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            New division
          </span>
          <input
            type="text"
            value={newDivisionName}
            onChange={(e) => setNewDivisionName(e.target.value)}
            placeholder="e.g. Division 1"
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !newDivisionName.trim()}
          className="inline-flex items-center gap-2 rounded-full border border-primary bg-background px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-60"
        >
          <Plus className="size-4" />
          Add division
        </button>
      </form>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DivisionColumn
          id={UNASSIGNED}
          title="Unassigned"
          teams={unassigned}
          onDrop={(teamId) => moveTeam(teamId, null)}
          dragOver={overTarget === UNASSIGNED}
          setOverTarget={setOverTarget}
          onDragStart={setDraggingTeamId}
          onDragEnd={() => {
            setDraggingTeamId(null);
            setOverTarget(null);
          }}
          draggingTeamId={draggingTeamId}
          onRenameTeam={renameTeam}
          onDeleteTeam={deleteTeam}
          emptyHint="Add teams above, or drag teams out of a division back here."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {divisions.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">
              No divisions yet — add one above to start sorting teams.
            </p>
          )}
          {divisions.map((division) => {
            const divisionTeams = grouped.get(division.id) ?? [];
            const matches = Math.floor(divisionTeams.length / 2);
            const bye = divisionTeams.length % 2 === 1;
            return (
              <DivisionColumn
                key={division.id}
                id={division.id}
                title={division.name}
                teams={divisionTeams}
                onDrop={(teamId) => moveTeam(teamId, division.id)}
                dragOver={overTarget === division.id}
                setOverTarget={setOverTarget}
                onDragStart={setDraggingTeamId}
                onDragEnd={() => {
                  setDraggingTeamId(null);
                  setOverTarget(null);
                }}
                draggingTeamId={draggingTeamId}
                onRenameTeam={renameTeam}
                onDeleteTeam={deleteTeam}
                onRenameDivision={() =>
                  renameDivision(division.id, division.name)
                }
                onDeleteDivision={() =>
                  deleteDivision(division.id, division.name)
                }
                stats={{
                  teamCount: divisionTeams.length,
                  matchesPerRound: matches,
                  bye,
                }}
                lockedCourtId={division.lockedCourtId}
                courts={courts}
                onLockCourt={(courtId) =>
                  setDivisionCourt(division.id, courtId)
                }
                emptyHint="Drag teams in from Unassigned."
              />
            );
          })}
        </div>
      </div>

      <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Round check
        </p>
        <RoundCheck
          divisions={divisions}
          grouped={grouped}
          matchCellsPerRound={matchCellsPerRound}
        />
      </section>
    </div>
  );
}

function RoundCheck({
  divisions,
  grouped,
  matchCellsPerRound,
}: {
  divisions: CompetitionDivision[];
  grouped: Map<string | null, CompetitionTeam[]>;
  matchCellsPerRound: number;
}) {
  const divisionsNeeded = divisions
    .map((d) => {
      const t = grouped.get(d.id)?.length ?? 0;
      return { name: d.name, teamCount: t, matches: Math.floor(t / 2) };
    })
    .filter((d) => d.teamCount > 0);
  const totalMatches = divisionsNeeded.reduce((s, d) => s + d.matches, 0);
  const fits = totalMatches <= matchCellsPerRound;

  return (
    <div className="mt-2 space-y-2 text-sm">
      <p>
        You need <strong>{totalMatches}</strong> match cells per round across
        all divisions.{" "}
        You have <strong>{matchCellsPerRound}</strong>{" "}
        <span className="text-muted-foreground">
          ({matchCellsPerRound - totalMatches >= 0
            ? `${matchCellsPerRound - totalMatches} spare`
            : `${totalMatches - matchCellsPerRound} short`})
        </span>
        .
      </p>
      {fits ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
          <CheckCircle2 className="size-4" /> Teams fit the cells you set up.
        </p>
      ) : (
        <p className="flex items-center gap-2 text-xs font-semibold text-amber-700">
          <AlertTriangle className="size-4" /> Not enough cells — add courts or
          timeslots, or trim a division.
        </p>
      )}
    </div>
  );
}

type DivisionColumnProps = {
  id: string;
  title: string;
  teams: CompetitionTeam[];
  onDrop: (teamId: string) => void;
  dragOver: boolean;
  setOverTarget: (id: string | null) => void;
  onDragStart: (teamId: string) => void;
  onDragEnd: () => void;
  draggingTeamId: string | null;
  onRenameTeam: (teamId: string, currentName: string) => void;
  onDeleteTeam: (teamId: string, name: string) => void;
  onRenameDivision?: () => void;
  onDeleteDivision?: () => void;
  stats?: { teamCount: number; matchesPerRound: number; bye: boolean };
  lockedCourtId?: string | null;
  courts?: CompetitionCourt[];
  onLockCourt?: (courtId: string | null) => void;
  emptyHint: string;
};

function DivisionColumn({
  id,
  title,
  teams,
  onDrop,
  dragOver,
  setOverTarget,
  onDragStart,
  onDragEnd,
  draggingTeamId,
  onRenameTeam,
  onDeleteTeam,
  onRenameDivision,
  onDeleteDivision,
  stats,
  lockedCourtId,
  courts,
  onLockCourt,
  emptyHint,
}: DivisionColumnProps) {
  return (
    <div
      onDragOver={(e) => {
        if (draggingTeamId) {
          e.preventDefault();
          setOverTarget(id);
        }
      }}
      onDragLeave={() => setOverTarget(null)}
      onDrop={(e) => {
        e.preventDefault();
        setOverTarget(null);
        if (draggingTeamId) onDrop(draggingTeamId);
      }}
      className={`rounded-2xl border p-4 transition ${
        dragOver
          ? "border-primary bg-primary/10"
          : "border-border/70 bg-card"
      }`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight">
            {title}
          </p>
          {stats && (
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <Users className="mr-1 inline size-3" />
              {stats.teamCount} teams · {stats.matchesPerRound} matches/round
              {stats.bye && (
                <span className="ml-1 text-amber-700">· bye each round</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRenameDivision && (
            <button
              type="button"
              onClick={onRenameDivision}
              aria-label="Rename division"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          {onDeleteDivision && (
            <button
              type="button"
              onClick={onDeleteDivision}
              aria-label="Remove division"
              className="rounded-full p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      {courts && onLockCourt && (
        <label className="mt-3 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Lock to court (optional)
          </span>
          <select
            value={lockedCourtId ?? ""}
            onChange={(e) => onLockCourt(e.target.value || null)}
            className="mt-1 w-full rounded-lg border border-border/70 bg-background px-2 py-1.5 text-xs"
          >
            <option value="">— no lock</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <ul className="mt-3 min-h-[48px] space-y-1.5">
        {teams.length === 0 && (
          <li className="rounded-lg border border-dashed border-border/70 px-3 py-3 text-center text-xs italic text-muted-foreground">
            {emptyHint}
          </li>
        )}
        {teams.map((team) => (
          <li
            key={team.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", team.id);
              onDragStart(team.id);
            }}
            onDragEnd={onDragEnd}
            className={`group flex cursor-grab items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-2 text-sm transition active:cursor-grabbing ${
              draggingTeamId === team.id ? "opacity-50" : ""
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{team.name}</span>
            </span>
            <span className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onRenameTeam(team.id, team.name)}
                aria-label={`Rename ${team.name}`}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <Pencil className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteTeam(team.id, team.name)}
                aria-label={`Remove ${team.name}`}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
