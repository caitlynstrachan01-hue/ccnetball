"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  MousePointer2,
  Pencil,
  RectangleHorizontal,
  RectangleVertical,
  Save,
  Trash2,
  Undo2,
  X,
} from "lucide-react";

// ---- Types ----------------------------------------------------------------

type Position = "GS" | "GA" | "WA" | "C" | "WD" | "GD" | "GK";
type Palette = "green" | "red" | "purple" | "orange";
type TokenLabel = "A" | "D" | "T" | Position;
type ArrowVariant = "lead" | "pass";

type TokenItem = {
  id: string;
  kind: "token";
  label: TokenLabel;
  palette: Palette;
  x: number;
  y: number;
};

type ArrowItem = {
  id: string;
  kind: "arrow";
  variant: ArrowVariant;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type PenItem = {
  id: string;
  kind: "pen";
  points: Array<{ x: number; y: number }>;
};

type Item = TokenItem | ArrowItem | PenItem;

type Mode =
  | { kind: "select" }
  | { kind: "place"; label: TokenLabel; palette: Palette }
  | { kind: "arrow"; variant: ArrowVariant }
  | { kind: "pen" };

type Drill = {
  id: string;
  name: string;
  items: Item[];
  savedAt: string;
};

type Folder = {
  id: string;
  name: string;
  drills: Drill[];
};

// ---- Constants ------------------------------------------------------------

const POSITIONS: Position[] = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];
const PALETTES: Palette[] = ["green", "red", "purple", "orange"];
const PALETTE_FILL: Record<Palette, string> = {
  green: "#16A34A",
  red: "#DC2626",
  purple: "#7E22CE",
  orange: "#EA580C",
};
const PALETTE_LABEL: Record<Palette, string> = {
  green: "Green",
  red: "Red",
  purple: "Purple",
  orange: "Orange",
};
const ARROW_COLOR = "#2563EB";
const PEN_COLOR = "#111111";

type Orientation = "landscape" | "portrait";

const STORAGE_KEY = "cc-court-planner-v1";
const ORIENTATION_KEY = "cc-court-planner-orientation";
const MAX_FOLDERS = 5;
const MAX_DRILLS_PER_FOLDER = 30;
const MAX_NAME_LEN = 60;
const HISTORY_LIMIT = 50;

const VB_W = 1000;
const VB_H = 500;
const GOAL_RADIUS = 161; // 4.9m scaled to viewBox

// ---- Helpers --------------------------------------------------------------

function genId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function clampName(input: string): string {
  return input.trim().slice(0, MAX_NAME_LEN);
}

function isTokenLabel(v: unknown): v is TokenLabel {
  return (
    v === "A" ||
    v === "D" ||
    v === "T" ||
    (typeof v === "string" && (POSITIONS as readonly string[]).includes(v))
  );
}

function isPalette(v: unknown): v is Palette {
  return (
    typeof v === "string" && (PALETTES as readonly string[]).includes(v)
  );
}

function validateFolders(raw: unknown): Folder[] {
  if (!Array.isArray(raw)) return [];
  const folders: Folder[] = [];
  for (const f of raw) {
    if (
      !f ||
      typeof f !== "object" ||
      typeof (f as Folder).id !== "string" ||
      typeof (f as Folder).name !== "string" ||
      !Array.isArray((f as Folder).drills)
    ) {
      continue;
    }
    const drills: Drill[] = [];
    for (const d of (f as Folder).drills) {
      if (
        !d ||
        typeof d !== "object" ||
        typeof d.id !== "string" ||
        typeof d.name !== "string" ||
        typeof d.savedAt !== "string" ||
        !Array.isArray(d.items)
      ) {
        continue;
      }
      const items: Item[] = [];
      for (const it of d.items) {
        if (!it || typeof it !== "object") continue;
        if (
          it.kind === "token" &&
          typeof it.id === "string" &&
          isTokenLabel(it.label) &&
          isPalette(it.palette) &&
          typeof it.x === "number" &&
          typeof it.y === "number"
        ) {
          items.push({
            id: it.id,
            kind: "token",
            label: it.label,
            palette: it.palette,
            x: it.x,
            y: it.y,
          });
        } else if (
          it.kind === "arrow" &&
          typeof it.id === "string" &&
          (it.variant === "lead" || it.variant === "pass") &&
          typeof it.x1 === "number" &&
          typeof it.y1 === "number" &&
          typeof it.x2 === "number" &&
          typeof it.y2 === "number"
        ) {
          items.push({
            id: it.id,
            kind: "arrow",
            variant: it.variant,
            x1: it.x1,
            y1: it.y1,
            x2: it.x2,
            y2: it.y2,
          });
        } else if (
          it.kind === "pen" &&
          typeof it.id === "string" &&
          Array.isArray(it.points)
        ) {
          const points: Array<{ x: number; y: number }> = [];
          for (const p of it.points) {
            if (
              p &&
              typeof p === "object" &&
              typeof p.x === "number" &&
              typeof p.y === "number"
            ) {
              points.push({ x: p.x, y: p.y });
            }
          }
          if (points.length >= 2) {
            items.push({ id: it.id, kind: "pen", points });
          }
        }
      }
      drills.push({
        id: d.id,
        name: clampName(d.name) || "Untitled",
        items,
        savedAt: d.savedAt,
      });
    }
    folders.push({
      id: (f as Folder).id,
      name: clampName((f as Folder).name) || "Untitled",
      drills: drills.slice(0, MAX_DRILLS_PER_FOLDER),
    });
    if (folders.length >= MAX_FOLDERS) break;
  }
  return folders;
}

function loadFolders(): Folder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return validateFolders(JSON.parse(raw));
  } catch {
    return [];
  }
}

function saveFolders(folders: Folder[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch {
    // quota / private mode — swallow silently
  }
}

function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  orientation: Orientation,
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const t = pt.matrixTransform(ctm.inverse());
  // Items are always stored in canonical landscape coordinates (0..VB_W ×
  // 0..VB_H). In portrait mode the drawn content is rotated 90° CW via
  // `translate(VB_H, 0) rotate(90)`, so invert that here.
  if (orientation === "portrait") {
    return { x: t.y, y: VB_H - t.x };
  }
  return { x: t.x, y: t.y };
}

// ---- Main component ------------------------------------------------------

export function CourtPlannerApp() {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "select" });
  const [history, setHistory] = useState<Item[][]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [arrowDraft, setArrowDraft] = useState<ArrowItem | null>(null);
  const [penDraft, setPenDraft] = useState<PenItem | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("landscape");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setFolders(loadFolders());
    try {
      const stored = window.localStorage.getItem(ORIENTATION_KEY);
      if (stored === "landscape" || stored === "portrait") {
        setOrientation(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(ORIENTATION_KEY, orientation);
    } catch {
      // ignore
    }
  }, [orientation]);

  const pushHistory = useCallback((snapshot: Item[]) => {
    setHistory((h) => {
      const next = [...h, snapshot];
      if (next.length > HISTORY_LIMIT) next.shift();
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setItems(prev);
      return h.slice(0, -1);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    if (!window.confirm("Clear everything on the court?")) return;
    pushHistory(items);
    setItems([]);
  }, [items, pushHistory]);

  // Pointer handling --------------------------------------------------------
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const { x, y } = clientToSvg(
        svgRef.current,
        e.clientX,
        e.clientY,
        orientation,
      );
      const target = e.target as Element;
      const tokenEl = target.closest("[data-token-id]");
      const tokenId = tokenEl?.getAttribute("data-token-id") ?? null;

      if (mode.kind === "place") {
        pushHistory(items);
        const token: TokenItem = {
          id: genId(),
          kind: "token",
          label: mode.label,
          palette: mode.palette,
          x,
          y,
        };
        setItems((prev) => [...prev, token]);
        setMode({ kind: "select" });
        return;
      }

      if (mode.kind === "arrow") {
        svgRef.current.setPointerCapture(e.pointerId);
        setArrowDraft({
          id: genId(),
          kind: "arrow",
          variant: mode.variant,
          x1: x,
          y1: y,
          x2: x,
          y2: y,
        });
        return;
      }

      if (mode.kind === "pen") {
        svgRef.current.setPointerCapture(e.pointerId);
        setPenDraft({ id: genId(), kind: "pen", points: [{ x, y }] });
        return;
      }

      if (tokenId) {
        svgRef.current.setPointerCapture(e.pointerId);
        pushHistory(items);
        setDragId(tokenId);
      }
    },
    [mode, items, pushHistory, orientation],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      if (!dragId && !arrowDraft && !penDraft) return;
      const { x, y } = clientToSvg(
        svgRef.current,
        e.clientX,
        e.clientY,
        orientation,
      );
      if (dragId) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === dragId && it.kind === "token" ? { ...it, x, y } : it,
          ),
        );
      } else if (arrowDraft) {
        setArrowDraft({ ...arrowDraft, x2: x, y2: y });
      } else if (penDraft) {
        setPenDraft({ ...penDraft, points: [...penDraft.points, { x, y }] });
      }
    },
    [dragId, arrowDraft, penDraft, orientation],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (svgRef.current?.hasPointerCapture(e.pointerId)) {
        svgRef.current.releasePointerCapture(e.pointerId);
      }
      if (arrowDraft) {
        const dx = arrowDraft.x2 - arrowDraft.x1;
        const dy = arrowDraft.y2 - arrowDraft.y1;
        if (Math.hypot(dx, dy) > 10) {
          pushHistory(items);
          setItems((prev) => [...prev, arrowDraft]);
        }
        setArrowDraft(null);
      }
      if (penDraft) {
        if (penDraft.points.length >= 2) {
          pushHistory(items);
          setItems((prev) => [...prev, penDraft]);
        }
        setPenDraft(null);
      }
      setDragId(null);
    },
    [arrowDraft, penDraft, items, pushHistory],
  );

  // Folder ops --------------------------------------------------------------
  const persistFolders = useCallback((next: Folder[]) => {
    setFolders(next);
    saveFolders(next);
  }, []);

  const createFolder = useCallback(
    (rawName: string) => {
      const name = clampName(rawName);
      if (!name) return null;
      if (folders.length >= MAX_FOLDERS) return null;
      const folder: Folder = { id: genId(), name, drills: [] };
      persistFolders([...folders, folder]);
      return folder;
    },
    [folders, persistFolders],
  );

  const saveToFolder = useCallback(
    (folderId: string, rawDrillName: string) => {
      const name = clampName(rawDrillName) || "Untitled drill";
      const drill: Drill = {
        id: genId(),
        name,
        items,
        savedAt: new Date().toISOString(),
      };
      persistFolders(
        folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                drills: [drill, ...f.drills].slice(0, MAX_DRILLS_PER_FOLDER),
              }
            : f,
        ),
      );
    },
    [items, folders, persistFolders],
  );

  const loadDrill = useCallback(
    (drill: Drill) => {
      pushHistory(items);
      setItems(drill.items);
      setLoadOpen(false);
    },
    [items, pushHistory],
  );

  const deleteDrill = useCallback(
    (folderId: string, drillId: string) => {
      persistFolders(
        folders.map((f) =>
          f.id === folderId
            ? { ...f, drills: f.drills.filter((d) => d.id !== drillId) }
            : f,
        ),
      );
    },
    [folders, persistFolders],
  );

  const deleteFolder = useCallback(
    (folderId: string) => {
      persistFolders(folders.filter((f) => f.id !== folderId));
    },
    [folders, persistFolders],
  );

  // Helpers -----------------------------------------------------------------
  const modeLabel = useMemo(() => {
    if (mode.kind === "place")
      return `Tap the court to place a ${PALETTE_LABEL[mode.palette].toLowerCase()} ${mode.label}`;
    if (mode.kind === "arrow")
      return mode.variant === "lead"
        ? "Press and drag to draw a lead arrow"
        : "Press and drag to draw a pass (dashed)";
    if (mode.kind === "pen") return "Press and drag to draw freely";
    return "Drag players to move them, or pick a tool";
  }, [mode]);

  const canUndo = history.length > 0;

  const placeActive = (label: TokenLabel, palette: Palette) =>
    mode.kind === "place" &&
    mode.label === label &&
    mode.palette === palette;

  const togglePlace = (label: TokenLabel, palette: Palette) =>
    setMode((m) =>
      m.kind === "place" && m.label === label && m.palette === palette
        ? { kind: "select" }
        : { kind: "place", label, palette },
    );

  return (
    <div className="flex h-dvh min-h-dvh w-full flex-col bg-[#0F1012] text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to shop
        </Link>
        <h1 className="font-display text-sm font-bold tracking-wide sm:text-base">
          Netball Court Planner
        </h1>
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:inline">
          Beta
        </span>
      </header>

      {/* Mode hint */}
      <div className="border-b border-white/10 bg-white/5 px-4 py-1.5 text-center text-[11px] font-medium text-white/70 sm:text-xs">
        {modeLabel}
      </div>

      <div className="flex flex-1 flex-col-reverse overflow-hidden md:flex-row">
        {/* Toolbar */}
        <aside className="flex max-h-[45dvh] shrink-0 overflow-y-auto border-t border-white/10 bg-black/40 p-3 md:max-h-none md:w-[240px] md:border-r md:border-t-0">
          <div className="flex w-full flex-col gap-3">
            <ToolbarGroup label="Players">
              <TokenButton
                label="A"
                palette="green"
                active={placeActive("A", "green")}
                onClick={() => togglePlace("A", "green")}
              />
              <TokenButton
                label="D"
                palette="red"
                active={placeActive("D", "red")}
                onClick={() => togglePlace("D", "red")}
              />
              <TokenButton
                label="T"
                palette="green"
                active={placeActive("T", "green")}
                onClick={() => togglePlace("T", "green")}
              />
            </ToolbarGroup>

            <ToolbarGroup label="Positions (purple)" dot={PALETTE_FILL.purple}>
              {POSITIONS.map((pos) => (
                <TokenButton
                  key={`p-${pos}`}
                  label={pos}
                  palette="purple"
                  active={placeActive(pos, "purple")}
                  onClick={() => togglePlace(pos, "purple")}
                />
              ))}
            </ToolbarGroup>

            <ToolbarGroup label="Positions (orange)" dot={PALETTE_FILL.orange}>
              {POSITIONS.map((pos) => (
                <TokenButton
                  key={`o-${pos}`}
                  label={pos}
                  palette="orange"
                  active={placeActive(pos, "orange")}
                  onClick={() => togglePlace(pos, "orange")}
                />
              ))}
            </ToolbarGroup>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Court
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <ToolButton
                  label="Side"
                  icon={<RectangleHorizontal className="size-4" />}
                  active={orientation === "landscape"}
                  onClick={() => setOrientation("landscape")}
                />
                <ToolButton
                  label="Up/down"
                  icon={<RectangleVertical className="size-4" />}
                  active={orientation === "portrait"}
                  onClick={() => setOrientation("portrait")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Drawing
              </p>
              <ToolButton
                label="Move"
                icon={<MousePointer2 className="size-4" />}
                active={mode.kind === "select"}
                onClick={() => setMode({ kind: "select" })}
              />
              <ToolButton
                label="Pen"
                icon={<Pencil className="size-4" />}
                active={mode.kind === "pen"}
                onClick={() =>
                  setMode((m) =>
                    m.kind === "pen" ? { kind: "select" } : { kind: "pen" },
                  )
                }
              />
              <ToolButton
                label="Lead (arrow)"
                icon={
                  <svg
                    viewBox="0 0 24 10"
                    className="h-2.5 w-6"
                    aria-hidden
                  >
                    <line
                      x1={1}
                      y1={5}
                      x2={18}
                      y2={5}
                      stroke={ARROW_COLOR}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <path d="M 17 1 L 23 5 L 17 9" fill={ARROW_COLOR} />
                  </svg>
                }
                active={mode.kind === "arrow" && mode.variant === "lead"}
                onClick={() =>
                  setMode((m) =>
                    m.kind === "arrow" && m.variant === "lead"
                      ? { kind: "select" }
                      : { kind: "arrow", variant: "lead" },
                  )
                }
              />
              <ToolButton
                label="Pass (dashed)"
                icon={
                  <svg viewBox="0 0 24 10" className="h-2.5 w-6" aria-hidden>
                    <line
                      x1={1}
                      y1={5}
                      x2={18}
                      y2={5}
                      stroke={ARROW_COLOR}
                      strokeWidth={2}
                      strokeDasharray="3,2"
                      strokeLinecap="round"
                    />
                    <path d="M 17 1 L 23 5 L 17 9" fill={ARROW_COLOR} />
                  </svg>
                }
                active={mode.kind === "arrow" && mode.variant === "pass"}
                onClick={() =>
                  setMode((m) =>
                    m.kind === "arrow" && m.variant === "pass"
                      ? { kind: "select" }
                      : { kind: "arrow", variant: "pass" },
                  )
                }
              />
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
              <ToolButton
                label="Undo"
                icon={<Undo2 className="size-4" />}
                onClick={handleUndo}
                disabled={!canUndo}
              />
              <ToolButton
                label="Clear all"
                icon={<Trash2 className="size-4" />}
                onClick={handleClearAll}
                tone="danger"
                disabled={items.length === 0}
              />
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
              <ToolButton
                label="Save"
                icon={<Save className="size-4" />}
                onClick={() => setSaveOpen(true)}
                tone="primary"
                disabled={items.length === 0}
              />
              <ToolButton
                label={`Open (${folders.reduce((n, f) => n + f.drills.length, 0)})`}
                icon={<FolderOpen className="size-4" />}
                onClick={() => setLoadOpen(true)}
              />
            </div>
          </div>
        </aside>

        {/* Court */}
        <main className="relative flex flex-1 items-center justify-center overflow-hidden p-3">
          <svg
            ref={svgRef}
            viewBox={
              orientation === "portrait"
                ? `0 0 ${VB_H} ${VB_W}`
                : `0 0 ${VB_W} ${VB_H}`
            }
            preserveAspectRatio="xMidYMid meet"
            className="max-h-full max-w-full touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              cursor:
                mode.kind === "place" ||
                mode.kind === "arrow" ||
                mode.kind === "pen"
                  ? "crosshair"
                  : "default",
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW_COLOR} />
              </marker>
            </defs>

            <g
              transform={
                orientation === "portrait"
                  ? `translate(${VB_H}, 0) rotate(90)`
                  : undefined
              }
            >
            {/* Court background */}
            <rect x={0} y={0} width={VB_W} height={VB_H} fill="#6FA87C" />

            {/* Thirds */}
            <line
              x1={VB_W / 3}
              y1={0}
              x2={VB_W / 3}
              y2={VB_H}
              stroke="white"
              strokeWidth={3}
            />
            <line
              x1={(2 * VB_W) / 3}
              y1={0}
              x2={(2 * VB_W) / 3}
              y2={VB_H}
              stroke="white"
              strokeWidth={3}
            />

            {/* Court border */}
            <rect
              x={0}
              y={0}
              width={VB_W}
              height={VB_H}
              fill="none"
              stroke="white"
              strokeWidth={4}
            />

            {/* Centre circle */}
            <circle
              cx={VB_W / 2}
              cy={VB_H / 2}
              r={18}
              fill="none"
              stroke="white"
              strokeWidth={3}
            />

            {/* Goal semicircles */}
            <path
              d={`M 0 ${VB_H / 2 - GOAL_RADIUS} A ${GOAL_RADIUS} ${GOAL_RADIUS} 0 0 1 0 ${VB_H / 2 + GOAL_RADIUS}`}
              fill="none"
              stroke="white"
              strokeWidth={3}
            />
            <path
              d={`M ${VB_W} ${VB_H / 2 - GOAL_RADIUS} A ${GOAL_RADIUS} ${GOAL_RADIUS} 0 0 0 ${VB_W} ${VB_H / 2 + GOAL_RADIUS}`}
              fill="none"
              stroke="white"
              strokeWidth={3}
            />

            {/* Goal posts */}
            <circle cx={0} cy={VB_H / 2} r={7} fill="white" />
            <circle cx={VB_W} cy={VB_H / 2} r={7} fill="white" />

            {/* Pen strokes */}
            {items
              .filter((it): it is PenItem => it.kind === "pen")
              .map((p) => (
                <polyline
                  key={p.id}
                  points={p.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                  fill="none"
                  stroke={PEN_COLOR}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            {penDraft && (
              <polyline
                points={penDraft.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                fill="none"
                stroke={PEN_COLOR}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
            )}

            {/* Arrows */}
            {items
              .filter((it): it is ArrowItem => it.kind === "arrow")
              .map((a) => (
                <line
                  key={a.id}
                  x1={a.x1}
                  y1={a.y1}
                  x2={a.x2}
                  y2={a.y2}
                  stroke={ARROW_COLOR}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray={a.variant === "pass" ? "12,8" : undefined}
                  markerEnd="url(#arrowhead)"
                />
              ))}
            {arrowDraft && (
              <line
                x1={arrowDraft.x1}
                y1={arrowDraft.y1}
                x2={arrowDraft.x2}
                y2={arrowDraft.y2}
                stroke={ARROW_COLOR}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={
                  arrowDraft.variant === "pass" ? "12,8" : undefined
                }
                markerEnd="url(#arrowhead)"
                opacity={0.7}
              />
            )}

            {/* Tokens */}
            {items
              .filter((it): it is TokenItem => it.kind === "token")
              .map((t) => (
                <g key={t.id} data-token-id={t.id}>
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r={28}
                    fill={PALETTE_FILL[t.palette]}
                    stroke="white"
                    strokeWidth={3}
                  />
                  <text
                    x={t.x}
                    y={t.y + 7}
                    textAnchor="middle"
                    fontSize={20}
                    fontWeight={800}
                    fill="white"
                    style={{ pointerEvents: "none" }}
                    transform={
                      orientation === "portrait"
                        ? `rotate(-90 ${t.x} ${t.y + 7})`
                        : undefined
                    }
                  >
                    {t.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </main>
      </div>

      {saveOpen && (
        <SaveModal
          folders={folders}
          onClose={() => setSaveOpen(false)}
          onCreateFolder={createFolder}
          onSave={(folderId, name) => {
            saveToFolder(folderId, name);
            setSaveOpen(false);
          }}
        />
      )}

      {loadOpen && (
        <LoadModal
          folders={folders}
          onClose={() => setLoadOpen(false)}
          onLoad={loadDrill}
          onDeleteDrill={deleteDrill}
          onDeleteFolder={deleteFolder}
        />
      )}
    </div>
  );
}

// ---- Toolbar bits --------------------------------------------------------

function ToolbarGroup({
  label,
  dot,
  children,
}: {
  label: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {dot && (
          <span
            className="size-2.5 rounded-full"
            style={{ background: dot }}
            aria-hidden
          />
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
          {label}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">{children}</div>
    </div>
  );
}

function TokenButton({
  label,
  palette,
  active,
  onClick,
}: {
  label: TokenLabel;
  palette: Palette;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex aspect-square items-center justify-center rounded-lg border text-[11px] font-bold transition ${
        active ? "ring-2 ring-white" : "border-white/10 hover:border-white/40"
      }`}
      style={{ background: PALETTE_FILL[palette], color: "white" }}
    >
      {label}
    </button>
  );
}

function ToolButton({
  label,
  icon,
  onClick,
  active,
  disabled,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: "primary" | "danger";
}) {
  const base =
    "inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 disabled:pointer-events-none";
  const normal = active
    ? "border-white bg-white text-black"
    : "border-white/15 bg-white/5 text-white hover:border-white/40";
  const primary = "border-transparent bg-[#E91E63] text-white hover:bg-[#D7254B]";
  const danger =
    "border-white/10 bg-white/5 text-white/80 hover:bg-red-500/20 hover:text-red-200";
  const toneCls =
    tone === "primary" ? primary : tone === "danger" ? danger : normal;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`${base} ${toneCls}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ---- Modals --------------------------------------------------------------

function SaveModal({
  folders,
  onClose,
  onCreateFolder,
  onSave,
}: {
  folders: Folder[];
  onClose: () => void;
  onCreateFolder: (name: string) => Folder | null;
  onSave: (folderId: string, name: string) => void;
}) {
  const [folderId, setFolderId] = useState<string>(folders[0]?.id ?? "");
  const [newFolderName, setNewFolderName] = useState("");
  const [drillName, setDrillName] = useState("");
  const atFolderLimit = folders.length >= MAX_FOLDERS;

  function handleCreate() {
    const created = onCreateFolder(newFolderName);
    if (created) {
      setFolderId(created.id);
      setNewFolderName("");
    }
  }

  function handleSave() {
    const id = folderId || folders[0]?.id;
    if (!id) return;
    onSave(id, drillName);
  }

  return (
    <ModalShell title="Save drill" onClose={onClose}>
      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
        Drill name
      </label>
      <input
        value={drillName}
        onChange={(e) => setDrillName(e.target.value.slice(0, MAX_NAME_LEN))}
        placeholder="e.g. Centre pass set-up"
        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-white/50 focus:outline-none"
        autoFocus
      />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
        Folder
      </label>
      {folders.length === 0 ? (
        <p className="mt-1 text-xs text-white/60">
          No folders yet — create one below.
        </p>
      ) : (
        <div className="mt-1 flex flex-col gap-1">
          {folders.map((f) => (
            <label
              key={f.id}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                folderId === f.id
                  ? "border-white bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={folderId === f.id}
                  onChange={() => setFolderId(f.id)}
                  className="accent-[#E91E63]"
                />
                <span className="font-semibold">{f.name}</span>
              </span>
              <span className="text-[11px] text-white/50">
                {f.drills.length} drill{f.drills.length === 1 ? "" : "s"}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-dashed border-white/15 p-3">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
          New folder{" "}
          {atFolderLimit && (
            <span className="text-red-300">(limit of 5 reached)</span>
          )}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            value={newFolderName}
            onChange={(e) =>
              setNewFolderName(e.target.value.slice(0, MAX_NAME_LEN))
            }
            placeholder="e.g. Set plays"
            disabled={atFolderLimit}
            className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-white/50 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={atFolderLimit || !newFolderName.trim()}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={folders.length === 0 || !folderId}
          className="rounded-lg bg-[#E91E63] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#D7254B] disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
}

function LoadModal({
  folders,
  onClose,
  onLoad,
  onDeleteDrill,
  onDeleteFolder,
}: {
  folders: Folder[];
  onClose: () => void;
  onLoad: (drill: Drill) => void;
  onDeleteDrill: (folderId: string, drillId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}) {
  return (
    <ModalShell title="Saved drills" onClose={onClose}>
      {folders.length === 0 ? (
        <p className="text-sm text-white/60">
          You haven&apos;t saved anything yet. Tap <b>Save</b> on the toolbar
          once you&apos;ve got a drill on the court.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {folders.map((f) => (
            <div key={f.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold">{f.name}</h3>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete folder "${f.name}" and its ${f.drills.length} drill${f.drills.length === 1 ? "" : "s"}?`,
                      )
                    ) {
                      onDeleteFolder(f.id);
                    }
                  }}
                  className="text-[11px] text-white/40 hover:text-red-300"
                >
                  Delete folder
                </button>
              </div>
              {f.drills.length === 0 ? (
                <p className="mt-1 text-xs text-white/40">Empty folder.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {f.drills.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => onLoad(d)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-semibold">{d.name}</p>
                        <p className="text-[11px] text-white/40">
                          {new Date(d.savedAt).toLocaleString("en-AU", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          · {d.items.length} items
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${d.name}`}
                        onClick={() => {
                          if (window.confirm(`Delete "${d.name}"?`)) {
                            onDeleteDrill(f.id, d.id);
                          }
                        }}
                        className="rounded-md p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-200"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#17181B] p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
