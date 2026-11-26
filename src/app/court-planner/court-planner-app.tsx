"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FolderOpen,
  MousePointer2,
  Pencil,
  RectangleHorizontal,
  RectangleVertical,
  Redo2,
  Save,
  Spline,
  Trash2,
  Undo2,
  X,
} from "lucide-react";

// ---- Types ----------------------------------------------------------------

type Position = "GS" | "GA" | "WA" | "C" | "WD" | "GD" | "GK";
type Palette = "green" | "red" | "purple" | "orange";
type TokenLabel = "A" | "D" | "T" | Position;
type MarkerKind = "cone" | "ball" | "cross";
type LineShape = "straight" | "curved";
type Orientation = "landscape" | "portrait";

type Point = { x: number; y: number };

type TokenItem = {
  id: string;
  kind: "token";
  label: TokenLabel;
  palette: Palette;
  x: number;
  y: number;
};

type LineItem = {
  id: string;
  kind: "line";
  shape: LineShape;
  arrow: boolean;
  dotted: boolean;
  color: string;
  thickness: number;
  points: Point[];
};

type PenItem = {
  id: string;
  kind: "pen";
  color: string;
  thickness: number;
  points: Point[];
};

type MarkerItem = {
  id: string;
  kind: "marker";
  marker: MarkerKind;
  x: number;
  y: number;
};

type Item = TokenItem | LineItem | PenItem | MarkerItem;

type Mode =
  | { kind: "select" }
  | { kind: "place"; label: TokenLabel; palette: Palette }
  | { kind: "place-marker"; marker: MarkerKind }
  | { kind: "line" }
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

type DragState = {
  startPointer: Point;
  snapshot: Item;
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

const COURT_BG = "#FFFFFF";
const COURT_LINE = "#334155";
const SELECT_HIGHLIGHT = "#E91E63";

const INK_COLORS = [
  { key: "black", value: "#111111", name: "Black" },
  { key: "blue", value: "#2563EB", name: "Blue" },
  { key: "red", value: "#DC2626", name: "Red" },
  { key: "green", value: "#16A34A", name: "Green" },
  { key: "yellow", value: "#CA8A04", name: "Yellow" },
] as const;
const INK_COLOR_VALUES: Set<string> = new Set(INK_COLORS.map((c) => c.value));

const THICKNESSES = [
  { key: "thin", value: 3, name: "Thin" },
  { key: "medium", value: 5, name: "Medium" },
  { key: "thick", value: 9, name: "Thick" },
] as const;
const THICKNESS_VALUES: Set<number> = new Set(THICKNESSES.map((t) => t.value));

const STORAGE_KEY = "cc-court-planner-v1";
const ORIENTATION_KEY = "cc-court-planner-orientation";
const MAX_FOLDERS = 5;
const MAX_DRILLS_PER_FOLDER = 30;
const MAX_NAME_LEN = 60;

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
  return typeof v === "string" && (PALETTES as readonly string[]).includes(v);
}

function pointsValid(raw: unknown): Point[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Point[] = [];
  for (const p of raw) {
    if (
      p &&
      typeof p === "object" &&
      typeof (p as Point).x === "number" &&
      typeof (p as Point).y === "number"
    ) {
      out.push({ x: (p as Point).x, y: (p as Point).y });
    }
  }
  return out;
}

function clampColor(value: unknown): string {
  if (typeof value === "string" && INK_COLOR_VALUES.has(value)) return value;
  return INK_COLORS[0].value;
}

function clampThickness(value: unknown): number {
  if (typeof value === "number" && THICKNESS_VALUES.has(value)) return value;
  return THICKNESSES[1].value;
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
        } else if (it.kind === "line" && typeof it.id === "string") {
          const pts = pointsValid(it.points);
          if (!pts || pts.length < 2) continue;
          items.push({
            id: it.id,
            kind: "line",
            shape: it.shape === "curved" ? "curved" : "straight",
            arrow: it.arrow !== false,
            dotted: it.dotted === true,
            color: clampColor(it.color),
            thickness: clampThickness(it.thickness),
            points: pts,
          });
        } else if (it.kind === "pen" && typeof it.id === "string") {
          const pts = pointsValid(it.points);
          if (!pts || pts.length < 2) continue;
          items.push({
            id: it.id,
            kind: "pen",
            color: clampColor(it.color),
            thickness: clampThickness(it.thickness),
            points: pts,
          });
        } else if (
          it.kind === "marker" &&
          typeof it.id === "string" &&
          (it.marker === "cone" ||
            it.marker === "ball" ||
            it.marker === "cross") &&
          typeof it.x === "number" &&
          typeof it.y === "number"
        ) {
          items.push({
            id: it.id,
            kind: "marker",
            marker: it.marker,
            x: it.x,
            y: it.y,
          });
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
): Point {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const t = pt.matrixTransform(ctm.inverse());
  if (orientation === "portrait") {
    return { x: t.y, y: VB_H - t.x };
  }
  return { x: t.x, y: t.y };
}

function smoothedPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2)
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mid = {
      x: (points[i].x + points[i + 1].x) / 2,
      y: (points[i].y + points[i + 1].y) / 2,
    };
    d += ` Q ${points[i].x} ${points[i].y} ${mid.x} ${mid.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function translateItem(item: Item, dx: number, dy: number): Item {
  if (item.kind === "token" || item.kind === "marker")
    return { ...item, x: item.x + dx, y: item.y + dy };
  return {
    ...item,
    points: item.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
  };
}

// ---- Component ------------------------------------------------------------

export function CourtPlannerApp() {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "select" });
  const [history, setHistory] = useState<Item[][]>([]);
  const [redoStack, setRedoStack] = useState<Item[][]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [lineDraft, setLineDraft] = useState<LineItem | null>(null);
  const [penDraft, setPenDraft] = useState<PenItem | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  // Ink / line options (shared across both drawing tools)
  const [inkColor, setInkColor] = useState<string>(INK_COLORS[0].value);
  const [inkThickness, setInkThickness] = useState<number>(
    THICKNESSES[1].value,
  );
  const [lineShape, setLineShape] = useState<LineShape>("straight");
  const [lineArrow, setLineArrow] = useState<boolean>(true);
  const [lineDotted, setLineDotted] = useState<boolean>(false);

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
    setHistory((h) => [...h, snapshot]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setRedoStack((r) => [...r, items]);
      setItems(prev);
      setSelectedId(null);
      return h.slice(0, -1);
    });
  }, [items]);

  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setHistory((h) => [...h, items]);
      setItems(next);
      setSelectedId(null);
      return r.slice(0, -1);
    });
  }, [items]);

  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    if (!window.confirm("Clear everything on the court?")) return;
    pushHistory(items);
    setItems([]);
    setSelectedId(null);
  }, [items, pushHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory(items);
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, items, pushHistory]);

  // Delete / Backspace while an item is selected (and no input focused)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (!selectedId) return;
      e.preventDefault();
      handleDeleteSelected();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, handleDeleteSelected]);

  // ---- Pointer -------------------------------------------------------------
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
      const itemEl = target.closest("[data-item-id]");
      const itemId = itemEl?.getAttribute("data-item-id") ?? null;

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

      if (mode.kind === "place-marker") {
        pushHistory(items);
        const marker: MarkerItem = {
          id: genId(),
          kind: "marker",
          marker: mode.marker,
          x,
          y,
        };
        setItems((prev) => [...prev, marker]);
        setMode({ kind: "select" });
        return;
      }

      if (mode.kind === "line") {
        svgRef.current.setPointerCapture(e.pointerId);
        setLineDraft({
          id: genId(),
          kind: "line",
          shape: lineShape,
          arrow: lineArrow,
          dotted: lineDotted,
          color: inkColor,
          thickness: inkThickness,
          points: [{ x, y }],
        });
        return;
      }

      if (mode.kind === "pen") {
        svgRef.current.setPointerCapture(e.pointerId);
        setPenDraft({
          id: genId(),
          kind: "pen",
          color: inkColor,
          thickness: inkThickness,
          points: [{ x, y }],
        });
        return;
      }

      // select mode — start dragging the tapped item, or clear selection
      if (itemId) {
        const item = items.find((i) => i.id === itemId);
        if (item) {
          svgRef.current.setPointerCapture(e.pointerId);
          pushHistory(items);
          setSelectedId(itemId);
          setDrag({ startPointer: { x, y }, snapshot: item });
          return;
        }
      }
      setSelectedId(null);
    },
    [
      mode,
      items,
      pushHistory,
      orientation,
      inkColor,
      inkThickness,
      lineShape,
      lineArrow,
      lineDotted,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      if (!drag && !lineDraft && !penDraft) return;
      const { x, y } = clientToSvg(
        svgRef.current,
        e.clientX,
        e.clientY,
        orientation,
      );
      if (drag) {
        const dx = x - drag.startPointer.x;
        const dy = y - drag.startPointer.y;
        const updated = translateItem(drag.snapshot, dx, dy);
        setItems((prev) =>
          prev.map((it) => (it.id === drag.snapshot.id ? updated : it)),
        );
      } else if (lineDraft) {
        setLineDraft({ ...lineDraft, points: [...lineDraft.points, { x, y }] });
      } else if (penDraft) {
        setPenDraft({ ...penDraft, points: [...penDraft.points, { x, y }] });
      }
    },
    [drag, lineDraft, penDraft, orientation],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (svgRef.current?.hasPointerCapture(e.pointerId)) {
        svgRef.current.releasePointerCapture(e.pointerId);
      }
      if (lineDraft) {
        const pts = lineDraft.points;
        const first = pts[0];
        const last = pts[pts.length - 1];
        const dx = last.x - first.x;
        const dy = last.y - first.y;
        if (Math.hypot(dx, dy) > 10) {
          const trimmed =
            lineDraft.shape === "straight" ? [first, last] : pts;
          pushHistory(items);
          setItems((prev) => [...prev, { ...lineDraft, points: trimmed }]);
        }
        setLineDraft(null);
      }
      if (penDraft) {
        if (penDraft.points.length >= 2) {
          pushHistory(items);
          setItems((prev) => [...prev, penDraft]);
        }
        setPenDraft(null);
      }
      setDrag(null);
    },
    [lineDraft, penDraft, items, pushHistory],
  );

  // ---- Folder ops ---------------------------------------------------------
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
      setSelectedId(null);
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

  // ---- Export PNG ----------------------------------------------------------
  const handleExport = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const bbox = svgEl.viewBox.baseVal;
    const vw = bbox.width;
    const vh = bbox.height;

    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(vw));
    clone.setAttribute("height", String(vh));
    const xml = new XMLSerializer().serializeToString(clone);
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 3;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(svgUrl);
        return;
      }
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(svgUrl);
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const stamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);
        const link = document.createElement("a");
        link.download = `cc-court-drill-${stamp}.png`;
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      window.alert("Couldn't export this drill — try again.");
    };
    img.src = svgUrl;
  }, []);

  // ---- UI helpers ----------------------------------------------------------
  const modeLabel = useMemo(() => {
    if (mode.kind === "place")
      return `Tap the court to place ${mode.label}`;
    if (mode.kind === "place-marker") {
      const name =
        mode.marker === "cone"
          ? "a cone"
          : mode.marker === "ball"
            ? "the ball"
            : "a cross";
      return `Tap the court to place ${name}`;
    }
    if (mode.kind === "line")
      return `Press and drag to draw a ${lineShape} line${lineArrow ? " with arrow" : ""}${lineDotted ? ", dotted" : ""}`;
    if (mode.kind === "pen") return "Press and drag to draw freely";
    if (selectedId) return "Drag the selected item to move it, or tap Delete";
    return "Tap a player or line to move it, or pick a tool";
  }, [mode, lineShape, lineArrow, lineDotted, selectedId]);

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

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

  const markerActive = (marker: MarkerKind) =>
    mode.kind === "place-marker" && mode.marker === marker;

  const toggleMarker = (marker: MarkerKind) =>
    setMode((m) =>
      m.kind === "place-marker" && m.marker === marker
        ? { kind: "select" }
        : { kind: "place-marker", marker },
    );

  // Toolbar layout — side (vertical) when court is up/down, bottom
  // (vertical scroll, condensed) when court is sideways.
  const toolbarOnSide = orientation === "portrait";

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#0F1012] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to shop
        </Link>
        <h1 className="font-display text-sm font-bold tracking-wide sm:text-base">
          Netball Court - Drawing
        </h1>
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:inline">
          Beta
        </span>
      </header>

      <div className="border-b border-white/10 bg-white/5 px-4 py-1 text-center text-[11px] font-medium text-white/70">
        {modeLabel}
      </div>

      <div
        className={`flex min-h-0 flex-1 overflow-hidden ${
          toolbarOnSide ? "flex-row" : "flex-col-reverse"
        }`}
      >
        <aside
          className={`flex shrink-0 overflow-y-auto border-white/10 bg-black/40 p-1.5 ${
            toolbarOnSide
              ? "h-full w-[150px] border-r"
              : "max-h-[32dvh] border-t"
          }`}
        >
          <div
            className={`w-full [&>*]:mb-1.5 [&>*]:break-inside-avoid ${
              toolbarOnSide
                ? "flex flex-col"
                : "mx-auto max-w-[560px] columns-3 gap-x-3"
            }`}
          >
            <div
              className={`flex flex-col gap-1 ${
                toolbarOnSide
                  ? "sticky top-0 z-10 -mx-1.5 -mt-1.5 border-b border-white/10 bg-[#0F1012]/95 px-1.5 pb-2 pt-1.5 backdrop-blur-sm"
                  : ""
              }`}
            >
              <div className="grid grid-cols-2 gap-1">
                <ToolButton
                  label="Undo"
                  icon={<Undo2 className="size-3" />}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  compact
                />
                <ToolButton
                  label="Redo"
                  icon={<Redo2 className="size-3" />}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  compact
                />
              </div>
              <ToolButton
                label="Delete selected"
                icon={<X className="size-3" />}
                onClick={handleDeleteSelected}
                disabled={!selectedId}
                compact
              />
            </div>

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

            <ToolbarGroup label="Team A" dot={PALETTE_FILL.purple}>
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

            <ToolbarGroup label="Team B" dot={PALETTE_FILL.orange}>
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

            <ToolbarGroup label="Markers">
              <MarkerButton
                marker="cone"
                active={markerActive("cone")}
                onClick={() => toggleMarker("cone")}
              />
              <MarkerButton
                marker="ball"
                active={markerActive("ball")}
                onClick={() => toggleMarker("ball")}
              />
              <MarkerButton
                marker="cross"
                active={markerActive("cross")}
                onClick={() => toggleMarker("cross")}
              />
            </ToolbarGroup>

            <div>
              <SectionLabel>Court</SectionLabel>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <ToolButton
                  label="Side"
                  icon={<RectangleHorizontal className="size-3" />}
                  active={orientation === "landscape"}
                  onClick={() => setOrientation("landscape")}
                />
                <ToolButton
                  label="Up/down"
                  icon={<RectangleVertical className="size-3" />}
                  active={orientation === "portrait"}
                  onClick={() => setOrientation("portrait")}
                />
              </div>
            </div>

            <div>
              <SectionLabel>Drawing</SectionLabel>
              <div className="mt-1 grid grid-cols-3 gap-1">
                <ToolButton
                  label="Move"
                  icon={<MousePointer2 className="size-3" />}
                  active={mode.kind === "select"}
                  onClick={() => setMode({ kind: "select" })}
                  compact
                />
                <ToolButton
                  label="Pen"
                  icon={<Pencil className="size-3" />}
                  active={mode.kind === "pen"}
                  onClick={() =>
                    setMode((m) =>
                      m.kind === "pen" ? { kind: "select" } : { kind: "pen" },
                    )
                  }
                  compact
                />
                <ToolButton
                  label="Line"
                  icon={<Spline className="size-3" />}
                  active={mode.kind === "line"}
                  onClick={() =>
                    setMode((m) =>
                      m.kind === "line" ? { kind: "select" } : { kind: "line" },
                    )
                  }
                  compact
                />
              </div>
            </div>

            {mode.kind === "line" && (
              <div className="flex flex-col gap-1.5 rounded-md border border-white/10 bg-white/[0.03] p-2">
                <SegmentedToggle
                  label="Shape"
                  options={[
                    { value: "straight", label: "Straight" },
                    { value: "curved", label: "Curved" },
                  ]}
                  value={lineShape}
                  onChange={(v) => setLineShape(v as LineShape)}
                />
                <SegmentedToggle
                  label="End"
                  options={[
                    { value: "yes", label: "Arrow" },
                    { value: "no", label: "No arrow" },
                  ]}
                  value={lineArrow ? "yes" : "no"}
                  onChange={(v) => setLineArrow(v === "yes")}
                />
                <SegmentedToggle
                  label="Style"
                  options={[
                    { value: "solid", label: "Solid" },
                    { value: "dotted", label: "Dotted" },
                  ]}
                  value={lineDotted ? "dotted" : "solid"}
                  onChange={(v) => setLineDotted(v === "dotted")}
                />
              </div>
            )}

            {(mode.kind === "pen" || mode.kind === "line") && (
              <div className="flex flex-col gap-1.5 rounded-md border border-white/10 bg-white/[0.03] p-2">
                <div className="flex flex-col gap-1">
                  <SectionLabel compact>Thickness</SectionLabel>
                  <div className="grid grid-cols-3 gap-1">
                    {THICKNESSES.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setInkThickness(t.value)}
                        aria-pressed={inkThickness === t.value}
                        className={`flex h-7 items-center justify-center rounded border transition ${
                          inkThickness === t.value
                            ? "border-white bg-white/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="block w-5 rounded-full bg-white"
                          style={{ height: Math.max(2, t.value - 1) }}
                        />
                        <span className="sr-only">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <SectionLabel compact>Colour</SectionLabel>
                  <div className="grid grid-cols-5 gap-1">
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setInkColor(c.value)}
                        aria-label={c.name}
                        aria-pressed={inkColor === c.value}
                        className={`relative flex aspect-square items-center justify-center rounded-full border-2 transition ${
                          inkColor === c.value
                            ? "border-white"
                            : "border-white/10 hover:border-white/40"
                        }`}
                        style={{ background: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-2">
              <ToolButton
                label="Save"
                icon={<Save className="size-3" />}
                onClick={() => setSaveOpen(true)}
                tone="primary"
                disabled={items.length === 0}
                compact
              />
              <div className="grid grid-cols-2 gap-1">
                <ToolButton
                  label="Open"
                  icon={<FolderOpen className="size-3" />}
                  onClick={() => setLoadOpen(true)}
                  compact
                />
                <ToolButton
                  label="Export"
                  icon={<Download className="size-3" />}
                  onClick={handleExport}
                  disabled={items.length === 0}
                  compact
                />
              </div>
              <ToolButton
                label="Clear all"
                icon={<Trash2 className="size-3" />}
                onClick={handleClearAll}
                tone="danger"
                disabled={items.length === 0}
                compact
              />
            </div>
          </div>
        </aside>

        <main className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-3">
          <svg
            ref={svgRef}
            viewBox={
              orientation === "portrait"
                ? `0 0 ${VB_H} ${VB_W}`
                : `0 0 ${VB_W} ${VB_H}`
            }
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            className="block max-h-full max-w-full touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              cursor:
                mode.kind === "place" ||
                mode.kind === "line" ||
                mode.kind === "pen"
                  ? "crosshair"
                  : "default",
            }}
          >
            <defs>
              {INK_COLORS.map((c) => (
                <marker
                  key={`ah-${c.key}`}
                  id={`arrowhead-${c.key}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={c.value} />
                </marker>
              ))}
            </defs>

            <g
              transform={
                orientation === "portrait"
                  ? `translate(${VB_H}, 0) rotate(90)`
                  : undefined
              }
            >
              <rect x={0} y={0} width={VB_W} height={VB_H} fill={COURT_BG} />
              <line
                x1={VB_W / 3}
                y1={0}
                x2={VB_W / 3}
                y2={VB_H}
                stroke={COURT_LINE}
                strokeWidth={3}
              />
              <line
                x1={(2 * VB_W) / 3}
                y1={0}
                x2={(2 * VB_W) / 3}
                y2={VB_H}
                stroke={COURT_LINE}
                strokeWidth={3}
              />
              <rect
                x={0}
                y={0}
                width={VB_W}
                height={VB_H}
                fill="none"
                stroke={COURT_LINE}
                strokeWidth={4}
              />
              <circle
                cx={VB_W / 2}
                cy={VB_H / 2}
                r={18}
                fill="none"
                stroke={COURT_LINE}
                strokeWidth={3}
              />
              <path
                d={`M 0 ${VB_H / 2 - GOAL_RADIUS} A ${GOAL_RADIUS} ${GOAL_RADIUS} 0 0 1 0 ${VB_H / 2 + GOAL_RADIUS}`}
                fill="none"
                stroke={COURT_LINE}
                strokeWidth={3}
              />
              <path
                d={`M ${VB_W} ${VB_H / 2 - GOAL_RADIUS} A ${GOAL_RADIUS} ${GOAL_RADIUS} 0 0 0 ${VB_W} ${VB_H / 2 + GOAL_RADIUS}`}
                fill="none"
                stroke={COURT_LINE}
                strokeWidth={3}
              />
              <circle cx={0} cy={VB_H / 2} r={7} fill={COURT_LINE} />
              <circle cx={VB_W} cy={VB_H / 2} r={7} fill={COURT_LINE} />

              {items
                .filter((it): it is PenItem => it.kind === "pen")
                .map((p) => (
                  <PenRender
                    key={p.id}
                    item={p}
                    selected={selectedId === p.id}
                  />
                ))}
              {penDraft && (
                <polyline
                  points={penDraft.points
                    .map((pt) => `${pt.x},${pt.y}`)
                    .join(" ")}
                  fill="none"
                  stroke={penDraft.color}
                  strokeWidth={penDraft.thickness}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.9}
                />
              )}

              {items
                .filter((it): it is LineItem => it.kind === "line")
                .map((l) => (
                  <LineRender
                    key={l.id}
                    item={l}
                    selected={selectedId === l.id}
                  />
                ))}
              {lineDraft && <LineRender item={lineDraft} preview />}

              {items
                .filter((it): it is MarkerItem => it.kind === "marker")
                .map((m) => (
                  <MarkerRender
                    key={m.id}
                    item={m}
                    orientation={orientation}
                    selected={selectedId === m.id}
                  />
                ))}

              {items
                .filter((it): it is TokenItem => it.kind === "token")
                .map((t) => (
                  <g key={t.id} data-item-id={t.id}>
                    {selectedId === t.id && (
                      <circle
                        cx={t.x}
                        cy={t.y}
                        r={34}
                        fill="none"
                        stroke={SELECT_HIGHLIGHT}
                        strokeWidth={3}
                        strokeDasharray="4 3"
                      />
                    )}
                    <circle
                      cx={t.x}
                      cy={t.y}
                      r={28}
                      fill={PALETTE_FILL[t.palette]}
                      stroke={COURT_LINE}
                      strokeWidth={2.5}
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

// ---- Renderers for lines / pens -----------------------------------------

function LineRender({
  item,
  selected,
  preview,
}: {
  item: LineItem;
  selected?: boolean;
  preview?: boolean;
}) {
  const first = item.points[0];
  const last = item.points[item.points.length - 1];
  const dasharray = item.dotted
    ? `${item.thickness * 2},${item.thickness * 2}`
    : undefined;
  const markerKey =
    INK_COLORS.find((c) => c.value === item.color)?.key ?? "black";
  const markerEnd = item.arrow ? `url(#arrowhead-${markerKey})` : undefined;
  const straight = item.shape === "straight" || item.points.length < 3;
  const pathD = straight
    ? `M ${first.x} ${first.y} L ${last.x} ${last.y}`
    : smoothedPath(item.points);
  const hitWidth = Math.max(20, item.thickness * 4);

  return (
    <g data-item-id={preview ? undefined : item.id}>
      {selected && (
        <path
          d={pathD}
          fill="none"
          stroke={SELECT_HIGHLIGHT}
          strokeWidth={item.thickness + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.35}
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={item.color}
        strokeWidth={item.thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dasharray}
        markerEnd={markerEnd}
        opacity={preview ? 0.7 : 1}
      />
      {!preview && (
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={hitWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="stroke"
        />
      )}
    </g>
  );
}

function MarkerRender({
  item,
  orientation,
  selected,
}: {
  item: MarkerItem;
  orientation: Orientation;
  selected?: boolean;
}) {
  const { x, y, marker } = item;
  // Counter-rotate markers with a visual "up" so they still read correctly
  // when the whole court is rendered rotated 90° CW for portrait mode.
  const needsCounterRotate = orientation === "portrait" && marker === "cone";
  const transform = needsCounterRotate ? `rotate(-90 ${x} ${y})` : undefined;

  return (
    <g data-item-id={item.id} transform={transform}>
      {selected && (
        <circle
          cx={x}
          cy={y}
          r={22}
          fill="none"
          stroke={SELECT_HIGHLIGHT}
          strokeWidth={3}
          strokeDasharray="4 3"
        />
      )}
      {marker === "cone" && (
        <polygon
          points={`${x},${y - 16} ${x - 12},${y + 10} ${x + 12},${y + 10}`}
          fill="#F97316"
          stroke="#334155"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {marker === "ball" && (
        <>
          <circle cx={x} cy={y} r={10} fill="#111111" />
          <circle cx={x - 3} cy={y - 3} r={2.5} fill="#ffffff" opacity={0.7} />
        </>
      )}
      {marker === "cross" && (
        <>
          <line
            x1={x - 12}
            y1={y - 12}
            x2={x + 12}
            y2={y + 12}
            stroke="#111111"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={x - 12}
            y1={y + 12}
            x2={x + 12}
            y2={y - 12}
            stroke="#111111"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </>
      )}
      {/* Transparent hit area so taps land reliably */}
      <circle cx={x} cy={y} r={18} fill="transparent" pointerEvents="all" />
    </g>
  );
}

function PenRender({
  item,
  selected,
}: {
  item: PenItem;
  selected?: boolean;
}) {
  const pts = item.points.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const hitWidth = Math.max(20, item.thickness * 4);
  return (
    <g data-item-id={item.id}>
      {selected && (
        <polyline
          points={pts}
          fill="none"
          stroke={SELECT_HIGHLIGHT}
          strokeWidth={item.thickness + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.35}
        />
      )}
      <polyline
        points={pts}
        fill="none"
        stroke={item.color}
        strokeWidth={item.thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="transparent"
        strokeWidth={hitWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="stroke"
      />
    </g>
  );
}

// ---- Toolbar bits --------------------------------------------------------

function SectionLabel({
  children,
  compact,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <p
      className={`font-bold uppercase tracking-[0.16em] text-white/50 ${
        compact ? "text-[9px]" : "text-[10px]"
      }`}
    >
      {children}
    </p>
  );
}

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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {dot && (
          <span
            className="size-2 rounded-full"
            style={{ background: dot }}
            aria-hidden
          />
        )}
        <SectionLabel>{label}</SectionLabel>
      </div>
      <div className="flex flex-wrap gap-1">{children}</div>
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
      className={`flex size-7 shrink-0 items-center justify-center rounded text-[9px] font-bold transition ${
        active
          ? "ring-2 ring-white"
          : "border border-white/10 hover:border-white/40"
      }`}
      style={{ background: PALETTE_FILL[palette], color: "white" }}
    >
      {label}
    </button>
  );
}

function MarkerButton({
  marker,
  active,
  onClick,
}: {
  marker: MarkerKind;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={marker}
      className={`flex size-7 shrink-0 items-center justify-center rounded bg-white/5 transition ${
        active
          ? "ring-2 ring-white"
          : "border border-white/10 hover:border-white/40"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        {marker === "cone" && (
          <polygon
            points="12,4 4,20 20,20"
            fill="#F97316"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}
        {marker === "ball" && (
          <circle cx={12} cy={12} r={6} fill="#FFFFFF" />
        )}
        {marker === "cross" && (
          <g stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round">
            <line x1={5} y1={5} x2={19} y2={19} />
            <line x1={5} y1={19} x2={19} y2={5} />
          </g>
        )}
      </svg>
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
  compact,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: "primary" | "danger";
  compact?: boolean;
}) {
  const sizing = compact ? "px-1.5 py-1 text-[10px] gap-1" : "px-2 py-1 text-[10px] gap-1";
  const base = `inline-flex w-full items-center justify-center rounded border font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${sizing}`;
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
      <span className="truncate">{label}</span>
    </button>
  );
}

function SegmentedToggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <SectionLabel compact>{label}</SectionLabel>
      <div className="grid grid-cols-2 gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`rounded border px-1.5 py-1 text-[10px] font-semibold transition ${
              value === o.value
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/5 text-white hover:border-white/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
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
