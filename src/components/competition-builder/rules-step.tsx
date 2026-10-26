"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookText,
  Lightbulb,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  RULE_TYPE_LABELS,
  type CompetitionCourt,
  type CompetitionDivision,
  type CompetitionTeam,
  type CompetitionTimeslot,
  type Rule,
  type RuleType,
} from "@/lib/competition-builder";

type Props = {
  competitionId: string;
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  divisions: CompetitionDivision[];
  teams: CompetitionTeam[];
  rules: Rule[];
};

export function RulesStep({
  competitionId,
  courts,
  timeslots,
  divisions,
  teams,
  rules,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function deleteRule(ruleId: string) {
    if (!window.confirm("Remove this rule?")) return;
    const res = await fetch(
      `/api/competition-builder/${competitionId}/rules?ruleId=${encodeURIComponent(ruleId)}`,
      { method: "DELETE" },
    );
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Rules</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Any constraint you can describe becomes part of how the draw is
            built — not patched afterwards. Add as many as you need.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01]"
        >
          <Plus className="size-4" /> Add rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background p-10 text-center">
          <BookText className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-bold">
            No rules yet.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hit <strong>Add rule</strong> to describe a constraint.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
            >
              <span className="flex min-w-0 items-start gap-2">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm">{rule.plainEnglish}</span>
              </span>
              <button
                type="button"
                onClick={() => deleteRule(rule.id)}
                aria-label="Remove rule"
                className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <AddRuleModal
          competitionId={competitionId}
          courts={courts}
          timeslots={timeslots}
          divisions={divisions}
          teams={teams}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AddRuleModal({
  competitionId,
  courts,
  timeslots,
  divisions,
  teams,
  onClose,
  onSaved,
}: {
  competitionId: string;
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  divisions: CompetitionDivision[];
  teams: CompetitionTeam[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ruleType, setRuleType] = useState<RuleType>("team_timeslot_required");
  const [teamId, setTeamId] = useState<string>("");
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [timeslotIds, setTimeslotIds] = useState<string[]>([]);
  const [courtId, setCourtId] = useState<string>("");
  const [divisionId, setDivisionId] = useState<string>("");
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const params = buildParams();
    if (!params) {
      setError("Please fill in all the required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/competition-builder/${competitionId}/rules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ruleType, params }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save rule.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function buildParams(): Record<string, unknown> | null {
    switch (ruleType) {
      case "team_timeslot_required":
      case "team_timeslot_forbidden":
        if (!teamId || timeslotIds.length === 0) return null;
        return { teamId, timeslotIds };
      case "teams_different_times":
        if (teamIds.length < 2) return null;
        return { teamIds };
      case "court_closed_round":
        if (!courtId || !roundNumber) return null;
        return { courtId, roundNumber };
      case "division_timeslots":
        if (!divisionId || timeslotIds.length === 0) return null;
        return { divisionId, timeslotIds };
      case "team_bye_round":
        if (!teamId || !roundNumber) return null;
        return { teamId, roundNumber };
    }
  }

  function toggleArrayValue(
    current: string[],
    value: string,
    setter: (v: string[]) => void,
  ) {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <form
        onSubmit={save}
        className="relative w-full max-w-2xl rounded-3xl bg-background p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-lg font-bold">Add a rule</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Rule type
          </span>
          <select
            value={ruleType}
            onChange={(e) => {
              setRuleType(e.target.value as RuleType);
              setTeamId("");
              setTeamIds([]);
              setTimeslotIds([]);
              setCourtId("");
              setDivisionId("");
              setRoundNumber(1);
            }}
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {(Object.keys(RULE_TYPE_LABELS) as RuleType[]).map((t) => (
              <option key={t} value={t}>
                {RULE_TYPE_LABELS[t].label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {RULE_TYPE_LABELS[ruleType].help}
          </p>
        </label>

        {(ruleType === "team_timeslot_required" ||
          ruleType === "team_timeslot_forbidden" ||
          ruleType === "team_bye_round") && (
          <SingleSelect
            label="Team"
            value={teamId}
            onChange={setTeamId}
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
            emptyHint="Add teams in Step 2 first."
          />
        )}

        {ruleType === "teams_different_times" && (
          <MultiSelect
            label="Teams"
            help="Pick two or more teams that can never share a timeslot."
            selected={teamIds}
            onToggle={(id) => toggleArrayValue(teamIds, id, setTeamIds)}
            options={teams.map((t) => ({ value: t.id, label: t.name }))}
            emptyHint="Add teams in Step 2 first."
          />
        )}

        {ruleType === "court_closed_round" && (
          <SingleSelect
            label="Court"
            value={courtId}
            onChange={setCourtId}
            options={courts.map((c) => ({ value: c.id, label: c.name }))}
            emptyHint="Add courts in Step 1 first."
          />
        )}

        {ruleType === "division_timeslots" && (
          <SingleSelect
            label="Division"
            value={divisionId}
            onChange={setDivisionId}
            options={divisions.map((d) => ({ value: d.id, label: d.name }))}
            emptyHint="Add divisions in Step 2 first."
          />
        )}

        {(ruleType === "team_timeslot_required" ||
          ruleType === "team_timeslot_forbidden" ||
          ruleType === "division_timeslots") && (
          <MultiSelect
            label="Timeslot(s)"
            selected={timeslotIds}
            onToggle={(id) =>
              toggleArrayValue(timeslotIds, id, setTimeslotIds)
            }
            options={timeslots.map((t) => ({ value: t.id, label: t.label }))}
            emptyHint="Add timeslots in Step 1 first."
          />
        )}

        {(ruleType === "court_closed_round" ||
          ruleType === "team_bye_round") && (
          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Round number
            </span>
            <input
              type="number"
              min={1}
              value={roundNumber}
              onChange={(e) =>
                setRoundNumber(Math.max(1, Number(e.target.value)))
              }
              className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 bg-background px-5 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save rule"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SingleSelect({
  label,
  value,
  onChange,
  options,
  emptyHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  emptyHint: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {options.length === 0 ? (
        <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {emptyHint}
        </p>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">— pick one —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}

function MultiSelect({
  label,
  help,
  selected,
  onToggle,
  options,
  emptyHint,
}: {
  label: string;
  help?: string;
  selected: string[];
  onToggle: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  emptyHint: string;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {help && <p className="mt-1 text-[11px] text-muted-foreground">{help}</p>}
      {options.length === 0 ? (
        <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {emptyHint}
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.map((o) => {
            const picked = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggle(o.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  picked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/70 bg-background text-foreground/70 hover:border-primary/40"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
