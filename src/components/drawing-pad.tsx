"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Eraser, Undo2, X } from "lucide-react";

type Court = "half" | "full" | "blank";

type Point = { x: number; y: number };
type Stroke = { color: string; width: number; points: Point[] };

// Portrait courts — easier to draw on a phone. Netball court is 15.25m wide
// × 30.5m long; "half" shows the centre third + goal third, goal at the bottom.
const COURTS: { id: Court; label: string; width: number; height: number }[] = [
  { id: "half", label: "Half court", width: 750, height: 1000 },
  { id: "full", label: "Full court", width: 500, height: 1000 },
  { id: "blank", label: "Blank", width: 750, height: 1000 },
];

const PENS = [
  { color: "#E63B7A", label: "Attack" },
  { color: "#1A1F36", label: "Defence" },
  { color: "#2563EB", label: "Ball" },
];

const COURT_GREEN = "#EEF6F0";
const LINE = "#8FA3B8";

/** Draw court markings scaled to the canvas (length runs top to bottom). */
function drawCourt(
  ctx: CanvasRenderingContext2D,
  court: Court,
  w: number,
  h: number,
) {
  ctx.fillStyle = court === "blank" ? "#FFFFFF" : COURT_GREEN;
  ctx.fillRect(0, 0, w, h);
  if (court === "blank") return;

  const lengthM = court === "full" ? 30.5 : 20.33;
  const pad = 24;
  const sx = (w - pad * 2) / 15.25;
  const sy = (h - pad * 2) / lengthM;
  const X = (m: number) => pad + m * sx;
  const Y = (m: number) => pad + m * sy;
  const mid = 7.625;

  ctx.strokeStyle = LINE;
  ctx.lineWidth = 5;
  ctx.strokeRect(X(0), Y(0), 15.25 * sx, lengthM * sy);

  // Transverse lines between the thirds.
  for (const m of court === "full" ? [10.17, 20.33] : [lengthM - 10.17]) {
    ctx.beginPath();
    ctx.moveTo(X(0), Y(m));
    ctx.lineTo(X(15.25), Y(m));
    ctx.stroke();
  }

  // Goal circles — 4.9m radius semicircles on the goal lines.
  const goalCircle = (atM: number, opensDown: boolean) => {
    ctx.beginPath();
    ctx.ellipse(
      X(mid),
      Y(atM),
      4.9 * sx,
      4.9 * sy,
      0,
      opensDown ? 0 : Math.PI,
      opensDown ? Math.PI : Math.PI * 2,
    );
    ctx.stroke();
  };
  goalCircle(lengthM, false);
  if (court === "full") goalCircle(0, true);

  // Centre circle (0.9m), 15.25m from each goal line.
  ctx.beginPath();
  ctx.ellipse(
    X(mid),
    Y(lengthM - 15.25),
    0.45 * sx,
    0.45 * sy,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Goal posts.
  ctx.fillStyle = "#94A3B8";
  for (const m of court === "full" ? [0, lengthM] : [lengthM]) {
    ctx.beginPath();
    ctx.arc(X(mid), Y(m), 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  if (s.points.length === 0) return;
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (s.points.length === 1) {
    ctx.beginPath();
    ctx.arc(s.points[0].x, s.points[0].y, s.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(s.points[0].x, s.points[0].y);
  for (const p of s.points.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

/**
 * Full-screen court drawing pad. Works with a finger, stylus or mouse.
 * Returns a PNG of the court plus the coach's drawing.
 */
export function DrawingPad({
  onSave,
  onCancel,
}: {
  onSave: (png: Blob) => void | Promise<void>;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<{ w: number; h: number } | null>(null);
  const [court, setCourt] = useState<Court>("half");
  const [pen, setPen] = useState(PENS[0].color);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const [saving, setSaving] = useState(false);

  const size = COURTS.find((c) => c.id === court)!;

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawCourt(ctx, court, size.width, size.height);
    for (const s of strokes) drawStroke(ctx, s);
    if (drawing.current) drawStroke(ctx, drawing.current);
  }, [court, size.width, size.height, strokes]);

  useEffect(redraw, [redraw]);

  // Fit the whole court on screen without stretching it.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => {
      const scale = Math.min(
        box.clientWidth / size.width,
        box.clientHeight / size.height,
      );
      setDisplay({ w: size.width * scale, h: size.height * scale });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [size.width, size.height]);

  // Stop the page scrolling behind the pad.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function toCanvas(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * size.width,
      y: ((e.clientY - rect.top) / rect.height) * size.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = { color: pen, width: 7, points: [toCanvas(e)] };
    redraw();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current.points.push(toCanvas(e));
    redraw();
  }

  function end() {
    if (!drawing.current) return;
    const done = drawing.current;
    drawing.current = null;
    setStrokes((prev) => [...prev, done]);
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (blob) await onSave(blob);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background p-3 md:p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {COURTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (
                  strokes.length &&
                  !window.confirm("Change court? Your drawing will be cleared.")
                )
                  return;
                setStrokes([]);
                setCourt(c.id);
              }}
              className={
                court === c.id
                  ? "rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                  : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80"
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close drawing"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background"
        >
          <X className="size-4" />
        </button>
      </div>

      <div
        ref={boxRef}
        className="relative mx-auto mt-3 min-h-0 w-full min-w-0 max-w-4xl flex-1"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            style={{
              width: display?.w ?? 0,
              height: display?.h ?? 0,
              touchAction: "none",
            }}
            className="rounded-2xl border border-border shadow-sm"
          />
        </div>
      </div>

      <div className="mx-auto mt-3 flex w-full max-w-4xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {PENS.map((p) => (
            <button
              key={p.color}
              type="button"
              onClick={() => setPen(p.color)}
              className={
                pen === p.color
                  ? "inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-3 py-1.5 text-xs font-semibold"
                  : "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80"
              }
            >
              <span
                className="size-3.5 rounded-full"
                style={{ background: p.color }}
              />
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStrokes((prev) => prev.slice(0, -1))}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          >
            <Undo2 className="size-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={() => setStrokes([])}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          >
            <Eraser className="size-3.5" /> Clear
          </button>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
        >
          <Check className="size-4" /> {saving ? "Saving…" : "Save drawing"}
        </button>
      </div>
    </div>
  );
}
