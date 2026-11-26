"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = { src: string; alt: string; caption?: string };

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 40;

export function ShopPreviewCarousel({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const startX = useRef<number | null>(null);

  const prev = useCallback(
    () => setActive((a) => (a - 1 + total) % total),
    [total],
  );
  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);

  // Autoplay — pauses on hover, focus, or when the tab is hidden.
  useEffect(() => {
    if (paused || total < 2) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, total, next]);

  useEffect(() => {
    function onVisibility() {
      setPaused(document.hidden);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Keyboard nav when the carousel region has focus.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  // Simple pointer swipe.
  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0) prev();
    else next();
  }

  if (total === 0) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-[380px] md:max-w-[440px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Netball Court - Drawing previews"
    >
      {/* Ambient glow behind the phone */}
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-0 top-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/30 via-[var(--brand-coral)]/20 to-[var(--brand-raspberry)]/30 blur-3xl"
      />

      <div
        className="relative aspect-[9/19] overflow-hidden rounded-[2.75rem] border-[6px] border-[#0F1012] bg-[#0F1012] shadow-2xl shadow-primary/25 ring-1 ring-border/60"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div
          className="flex h-full touch-pan-y transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={s.src} className="h-full w-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Live indicator badge (purely decorative — the phone screen itself doesn't have a status bar) */}
      </div>

      {/* Side arrows — hidden on narrow screens where swipe is the primary gesture */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-0 top-1/2 hidden size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-card text-foreground shadow-lg transition hover:scale-105 hover:bg-primary hover:text-primary-foreground md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-0 top-1/2 hidden size-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border/70 bg-card text-foreground shadow-lg transition hover:scale-105 hover:bg-primary hover:text-primary-foreground md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-primary"
                  : "w-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
