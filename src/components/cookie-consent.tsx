"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { getConsent, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!getConsent()) setVisible(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  function choose(value: "all" | "essential") {
    setConsent(value);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-[55] mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card/95 p-5 shadow-2xl backdrop-blur md:p-6"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cookie className="size-6" />
            </div>
            <div className="flex-1">
              <p className="font-display text-base font-bold">
                We use cookies to make this site better.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Essential cookies keep the site working. Analytics cookies
                help us see what content lands. Read our{" "}
                <Link href="/privacy" className="font-semibold text-primary hover:underline">
                  privacy policy
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => choose("essential")}
                className="rounded-full border border-foreground/15 bg-background px-5 py-2.5 text-sm font-semibold transition hover:border-primary/40 hover:bg-muted"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => choose("all")}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
              >
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
