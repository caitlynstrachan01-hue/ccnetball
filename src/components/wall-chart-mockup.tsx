"use client";

import { useState } from "react";

type FrameColor = "white" | "black" | "oak";

const FRAMES: Record<
  FrameColor,
  { label: string; background: string; swatch: string }
> = {
  white: {
    label: "White",
    background:
      "linear-gradient(135deg, #fafafa 0%, #ececec 50%, #f6f3ee 100%)",
    swatch: "#f3f1ec",
  },
  black: {
    label: "Black",
    background:
      "linear-gradient(135deg, #2a2a2a 0%, #0f0f0f 50%, #1c1c1c 100%)",
    swatch: "#171717",
  },
  oak: {
    label: "Oak",
    background:
      "linear-gradient(135deg, #d4a877 0%, #8b6239 50%, #b78a5b 100%)",
    swatch: "#a37b4c",
  },
};

const FRAME_ORDER: FrameColor[] = ["white", "black", "oak"];

export function WallChartMockup({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [frame, setFrame] = useState<FrameColor>("white");
  const style = FRAMES[frame];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[460px]">
        <div
          className="relative rounded-sm p-5"
          style={{
            background: style.background,
            boxShadow:
              "0 30px 60px rgba(26,31,54,0.22), 0 12px 24px rgba(26,31,54,0.12), inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Matting */}
          <div
            className="bg-white p-6"
            style={{
              boxShadow: "inset 0 0 14px rgba(0,0,0,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="block h-auto w-full" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Frame preview
        </span>
        {FRAME_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFrame(c)}
            aria-pressed={frame === c}
            aria-label={`Preview ${FRAMES[c].label} frame`}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              frame === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 bg-card text-foreground hover:border-primary/40"
            }`}
          >
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-full border border-black/10"
              style={{ background: FRAMES[c].swatch }}
            />
            {FRAMES[c].label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] italic text-muted-foreground">
        Frame not included — the preview above shows how it looks in
        different frame colours.
      </p>
    </div>
  );
}

export function isWallChartProduct(slug: string): boolean {
  return /-wall-chart$/.test(slug);
}
