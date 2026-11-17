"use client";

import { pad2 } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { useActiveEvent } from "../heroes/variants/useActiveEvent";
import { PLACES, ROWS } from "./data";

/* P5 — Blocks. The prize pool as a treemap: each contest's tile is as large as its share of the
   money. The lit tile opens its breakdown. */

type R = { x: number; y: number; w: number; h: number };

/** Squarified treemap of values (largest first) in a w×h box. */
function squarify(values: number[], W: number, H: number): R[] {
  const total = values.reduce((a, b) => a + b, 0);
  const scaled = values.map((v) => (v * W * H) / total);
  const out: R[] = [];
  let x = 0, y = 0, w = W, h = H;
  const worst = (row: number[], side: number) => {
    const s = row.reduce((a, b) => a + b, 0);
    return Math.max(...row.map((v) => Math.max((side * side * v) / (s * s), (s * s) / (side * side * v))));
  };
  const lay = (row: number[]) => {
    const s = row.reduce((a, b) => a + b, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      for (const v of row) { out.push({ x, y: cy, w: cw, h: v / cw }); cy += v / cw; }
      x += cw; w -= cw;
    } else {
      const ch = s / w;
      let cx = x;
      for (const v of row) { out.push({ x: cx, y, w: v / ch, h: ch }); cx += v / ch; }
      y += ch; h -= ch;
    }
  };
  let row: number[] = [];
  let i = 0;
  while (i < scaled.length) {
    const side = Math.min(w, h);
    if (!row.length || worst([...row, scaled[i]], side) <= worst(row, side)) { row.push(scaled[i]); i++; }
    else { lay(row); row = []; }
  }
  if (row.length) lay(row);
  return out;
}

// Largest first; the unannounced gaming pool gets a small placeholder tile at the end.
const ORDER = [...ROWS].sort((a, b) => (b.p.total ?? 0) - (a.p.total ?? 0));
const H = 40; // box is 100 × H
const RECTS = squarify(ORDER.map((r) => r.p.total ?? 22), 100, H);

export default function PrizeBlocks() {
  const [active, pick] = useActiveEvent(2800);

  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 md:px-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHead n="03" label="Prize pool" title="Prizes in every contest" sub="Each tile is sized by its prize money. Point at one to see how it splits." />
          <p className="flex flex-col items-start gap-1 lg:items-end">
            <span className="text-[clamp(72px,8vw,128px)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums">550K+</span>
            <span className="text-[15px] text-muted">BDT across the fest</span>
          </p>
        </div>

        <div className="relative aspect-[100/40] w-full">
          {ORDER.map((r, k) => {
            const b = RECTS[k];
            const on = active === r.i;
            const big = b.w * b.h > 520;
            const tiny = b.h < 9 || b.w < 9;
            return (
              <div
                key={r.e.slug}
                data-reveal
                className="absolute p-[3px]"
                style={{ left: `${b.x}%`, top: `${(b.y / H) * 100}%`, width: `${b.w}%`, height: `${(b.h / H) * 100}%` }}
                onPointerEnter={() => pick(r.i)}
                onPointerLeave={() => pick(-1)}
              >
                <div className={`flex h-full overflow-hidden transition-colors duration-300 ${tiny ? "flex-col justify-between p-3" : "flex-col justify-between p-4 md:p-5"} ${r.p.total ? (on ? "bg-[#1a120c] outline outline-1 outline-orange" : "bg-[#0e1017] outline outline-1 outline-line") : `border border-dashed ${on ? "border-orange" : "border-line-2"}`}`}>
                  <div className="flex flex-col">
                    <span className={`text-[12px] tabular-nums transition-colors ${on ? "text-orange" : "text-dim"}`}>{pad2(r.i + 1)} · {r.e.kind}</span>
                    <span className={`font-semibold leading-tight ${big ? "text-[clamp(18px,2vw,28px)]" : tiny ? "text-[13px]" : "text-[15px]"}`}>{r.e.name}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`font-semibold leading-none tracking-[-0.03em] tabular-nums transition-colors ${on ? "text-orange" : "text-ink"} ${big ? "text-[clamp(36px,5vw,76px)]" : tiny ? "text-[18px]" : "text-[clamp(22px,2.4vw,34px)]"}`}>{r.p.total ? `${r.p.total}K+` : "TBA"}</span>
                    {big && r.p.top && (
                      <span className={`text-[13px] tabular-nums text-muted transition-opacity ${on ? "opacity-100" : "opacity-0"}`}>
                        {PLACES.map((pl, j) => `${pl} ${r.p.top![j]}K`).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
