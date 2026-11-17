"use client";

import { useRef, useState } from "react";
import { pad2 } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { ROWS } from "./data";

/* P3 — Podium. A clean slider of contest cards. Each card stands its three prizes on a small
   podium, sized by the money. Drag, swipe or use the arrows. */

const MAX = 40; // the biggest single prize (IUPC champion), for podium heights

export default function PrizePodium() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; left: number } | null>(null);

  const step = (dir: number) => {
    const t = trackRef.current;
    if (!t) return;
    const card = t.querySelector("li") as HTMLElement | null;
    t.scrollBy({ left: dir * ((card?.offsetWidth ?? 340) + 16), behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHead n="03" label="Prize pool" title="550K+ BDT, eight podiums" sub="Every contest pays its top three. IUPC, the Hackathon and the Datathon go further down the table." />
          <div className="flex items-center gap-4">
            <span className="text-[15px] tabular-nums text-muted">{pad2(index + 1)} / 08</span>
            <button type="button" aria-label="Previous" onClick={() => step(-1)} className="grid h-12 w-12 place-items-center border border-line-2 text-lg transition hover:border-orange hover:text-orange">←</button>
            <button type="button" aria-label="Next" onClick={() => step(1)} className="grid h-12 w-12 place-items-center border border-line-2 text-lg transition hover:border-orange hover:text-orange">→</button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={(e) => {
          const t = e.currentTarget;
          const card = t.querySelector("li") as HTMLElement | null;
          const w = (card?.offsetWidth ?? 340) + 16;
          setIndex(Math.min(7, Math.round(t.scrollLeft / w)));
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
          e.currentTarget.style.scrollSnapType = "none";
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={(e) => {
          drag.current = null;
          e.currentTarget.style.scrollSnapType = "";
        }}
        onPointerLeave={(e) => {
          drag.current = null;
          e.currentTarget.style.scrollSnapType = "";
        }}
        className="mt-14 cursor-grab snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max gap-4 px-6 md:px-[max(56px,calc((100vw_-_1440px)/2_+_56px))]">
          {ROWS.map(({ i, e, p }) => (
            <li key={e.slug} className="flex h-[440px] w-[min(340px,78vw)] shrink-0 snap-start flex-col justify-between border border-line bg-[#0b0d13] p-6 transition-colors hover:border-line-2">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] tabular-nums text-dim">{pad2(i + 1)} · {e.kind}</span>
                <span className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{e.name}</span>
              </div>
              {/* Podium: 2nd · 1st · 3rd */}
              <div className="grid grid-cols-3 items-end gap-2">
                {[1, 0, 2].map((k) => {
                  const v = p.top?.[k];
                  const h = v ? 40 + (v / MAX) * 150 : [120, 160, 90][k === 0 ? 1 : k === 1 ? 0 : 2];
                  return (
                    <div key={k} className="flex flex-col items-center gap-2">
                      <span className="text-[17px] font-semibold tabular-nums">{v ? `${v}K` : "—"}</span>
                      <span
                        className={`grid w-full place-items-start p-2 text-[13px] font-semibold ${v ? (k === 0 ? "bg-orange text-[#120802]" : "bg-[#1d2130] text-soft") : "border border-dashed border-line-2 text-dim"}`}
                        style={{ height: h }}
                      >
                        {k + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-4 text-[14px]">
                <span className="text-muted">{p.extra ? "+ more awards" : p.top ? "Top three" : "To be announced"}</span>
                <span className="text-lg font-semibold tabular-nums">{p.total ? `${p.total}K+ BDT` : "TBA"}</span>
              </div>
            </li>
          ))}
          <li aria-hidden className="w-px shrink-0" />
        </ul>
      </div>
    </section>
  );
}
