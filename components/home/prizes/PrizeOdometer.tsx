"use client";

import { useEffect, useRef, useState } from "react";
import { pad2 } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { PLACES, ROWS } from "./data";

/* P4 — Odometer. One very large number. Pick a contest and its digits roll to that contest's pool;
   left alone it rolls through them, starting from the fest's 550K+. */

const CELLS = [" ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function Digit({ ch }: { ch: string }) {
  const k = Math.max(0, CELLS.indexOf(ch));
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-top" aria-hidden>
      <span className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `translateY(${-k * 10 / 1.1}%)` }}>
        {CELLS.map((c, i) => <span key={i} className="block h-[1em] text-center leading-[1em]">{c}</span>)}
      </span>
    </span>
  );
}

export default function PrizeOdometer() {
  const [sel, setSel] = useState(-1); // -1 = whole fest
  const hold = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!hold.current) setSel((s) => (s >= 7 ? -1 : s + 1));
    }, 2600);
    return () => window.clearInterval(id);
  }, []);
  const pick = (i: number | null) => {
    hold.current = i !== null;
    if (i !== null) setSel(i);
  };

  const row = sel >= 0 ? ROWS[sel] : null;
  const value = row ? row.p.total : 550;
  const digits = value ? String(value).padStart(3, " ") : null;

  const items = [{ i: -1, name: "All contests", total: 550 as number | null }, ...ROWS.map((r) => ({ i: r.i, name: r.e.name, total: r.p.total }))];

  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead n="03" label="Prize pool" title="Prizes in every contest" />
          <ul className="flex flex-col">
            {items.map((it) => {
              const on = sel === it.i;
              return (
                <li key={it.i}>
                  <button
                    type="button"
                    onPointerEnter={() => pick(it.i)}
                    onPointerLeave={() => pick(null)}
                    onFocus={() => pick(it.i)}
                    onBlur={() => pick(null)}
                    onClick={() => pick(it.i)}
                    className="group flex w-full items-baseline justify-between gap-4 border-b border-line py-3 text-left"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className={`h-1.5 w-1.5 shrink-0 self-center transition-colors ${on ? "bg-orange" : "bg-transparent"}`} />
                      <span className={`text-[17px] font-semibold transition-colors ${on ? "text-ink" : "text-muted group-hover:text-soft"}`}>{it.name}</span>
                    </span>
                    <span className={`text-[15px] tabular-nums transition-colors ${on ? "text-orange" : "text-dim"}`}>{it.total ? `${it.total}K+` : "TBA"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-8" aria-live="polite">
          <span className="text-[15px] font-medium tabular-nums text-muted">{row ? `${pad2(row.i + 1)} · ${row.e.name}` : "BitFest 2027, all contests"}</span>
          <p className="relative text-[clamp(120px,17vw,280px)] font-semibold leading-none tracking-[-0.05em] tabular-nums">
            <span className="sr-only">{value ? `${value}K+ BDT` : "To be announced"}</span>
            {digits ? (
              <span aria-hidden className="inline-flex items-start leading-[1em]">
                {digits.split("").map((c, k) => <Digit key={k} ch={c} />)}
                <span className="ml-[0.02em] block h-[1em] leading-[1em]">K</span>
                <span className="block h-[1em] leading-[1em] text-orange">+</span>
              </span>
            ) : (
              <span aria-hidden className="text-muted">TBA</span>
            )}
          </p>
          <div className="grid max-w-[640px] grid-cols-3 gap-6 border-t border-line pt-6">
            {row ? (
              PLACES.map((pl, k) => (
                <div key={pl} className="flex flex-col gap-1">
                  <span className="text-[13px] text-dim">{pl}</span>
                  <span className="text-2xl font-semibold tabular-nums">{row.p.top ? `${row.p.top[k]}K` : "—"}</span>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-lg text-soft">BDT across eight contests. Gaming Contest prizes are still to be announced.</p>
            )}
            {row?.p.extra && <p className="col-span-3 text-[14px] text-muted">Also: {row.p.extra}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
