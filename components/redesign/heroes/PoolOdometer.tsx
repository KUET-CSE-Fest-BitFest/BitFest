"use client";

import { useEffect, useState } from "react";

/** The prize pool on the chip: on load each digit spins a full turn and stops on its number, one after
    another, like a scoreboard; then the line settles into the usual shimmer. The server and reduced
    motion render the plain shimmer text, so the figure is always there. */
export default function PoolOdometer({ value, className = "" }: { value: string; className?: string }) {
  const [phase, setPhase] = useState<"idle" | "set" | "roll">("idle");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPhase("set");
    const go = window.setTimeout(() => setPhase("roll"), 450);
    const done = window.setTimeout(() => setPhase("idle"), 450 + 1500 + value.length * 130);
    return () => { window.clearTimeout(go); window.clearTimeout(done); };
  }, [value]);

  if (phase === "idle") return <span className={`pool-shimmer tabular-nums ${className}`}>{value}</span>;

  return (
    <span className={`tabular-nums text-cream-hi ${className}`} aria-label={value}>
      {value.split("").map((c, i) => {
        const d = Number(c);
        if (c === " " || Number.isNaN(d)) return <span key={i} aria-hidden className="whitespace-pre">{c}</span>;
        return (
          // A hidden copy of the digit holds the width and the baseline; the column spins over it,
          // clipped by clip-path (overflow would move the baseline and lift the digits off the line).
          <span key={i} aria-hidden className="relative inline-block leading-none [clip-path:inset(0_-0.1em)]">
            <span className="invisible">{c}</span>
            <span
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{
                transform: `translateY(${phase === "roll" ? -(10 + d) : 0}em)`,
                transition: phase === "roll" ? `transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 130}ms` : "none",
              }}
            >
              {Array.from({ length: 20 }, (_, k) => <span key={k} className="h-[1em]">{k % 10}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
