"use client";

import { useEffect, useState } from "react";

const OPTIONS = [
  ["l0", "Now"],
  ["r1", "Keynote"],
  ["r2", "Pinout, lit"],
  ["r3", "Thermal"],
  ["r4", "Up close"],
] as const;

/** Floating A–D switcher for comparing hero options. Hidden with ?shot for clean screenshots. */
export default function PreviewSwitcher({ current }: { current: string }) {
  const [hide, setHide] = useState(true);
  useEffect(() => setHide(new URLSearchParams(location.search).has("shot")), []);
  if (hide) return null;
  return (
    <nav aria-label="Hero options" className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 border border-line-2 bg-bg/90 p-1 text-sm backdrop-blur">
      {OPTIONS.map(([id, label]) => (
        <a
          key={id}
          href={`/previews/hero/${id}`}
          className={`px-3 py-2 font-semibold transition ${id === current ? "bg-orange text-[#120802]" : "text-muted hover:text-ink"}`}
        >
          {id.toUpperCase()} {label}
        </a>
      ))}
    </nav>
  );
}
