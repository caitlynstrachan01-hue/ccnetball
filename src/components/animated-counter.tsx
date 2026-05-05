"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedCounter({
  to,
  duration = 1.6,
}: {
  to: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const value = useMotionValue(0);
  const rounded = useTransform(value, (latest) =>
    Math.round(latest).toLocaleString("en-AU"),
  );

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, to, duration, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
    </span>
  );
}
