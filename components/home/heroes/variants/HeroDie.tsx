"use client";

import { eventHref, events, isExternal, pad2 } from "@/lib/fest";
import { rng } from "../pcb";
import { HeroCopy } from "./Copy";
import { useActiveEvent } from "./useActiveEvent";

/* V1 — Die. The lid is off: the silicon itself, drawn in fine detail, with each contest as an
   annotated block, the way a chip launch shows its die. No glow; the light is the material. */

type Kind = "cores" | "logic" | "sram" | "stripes";
const BLOCKS: { x: number; y: number; w: number; h: number; kind: Kind }[] = [
  { x: 48, y: 48, w: 250, h: 156, kind: "cores" },
  { x: 310, y: 48, w: 242, h: 156, kind: "logic" },
  { x: 48, y: 216, w: 150, h: 128, kind: "sram" },
  { x: 210, y: 216, w: 180, h: 128, kind: "stripes" },
  { x: 402, y: 216, w: 150, h: 128, kind: "cores" },
  { x: 48, y: 356, w: 190, h: 196, kind: "logic" },
  { x: 250, y: 356, w: 160, h: 196, kind: "sram" },
  { x: 422, y: 356, w: 130, h: 196, kind: "stripes" },
];
const TONES = ["#15161b", "#17181d", "#131419", "#18191f"];

// Standard-cell logic: many small rects, fixed by a seed so server and browser agree.
function logicRects(b: { x: number; y: number; w: number; h: number }, seed: number) {
  const r = rng(seed);
  const out: { x: number; y: number; w: number; h: number; f: string }[] = [];
  for (let row = b.y + 10; row < b.y + b.h - 8; row += 9) {
    let x = b.x + 8;
    while (x < b.x + b.w - 10) {
      const w = 3 + Math.floor(r() * 18);
      if (x + w > b.x + b.w - 8) break;
      if (r() > 0.18) out.push({ x, y: row, w, h: 6, f: r() > 0.7 ? "#2d2f36" : r() > 0.4 ? "#24262c" : "#1f2026" });
      x += w + 1 + Math.floor(r() * 3);
    }
  }
  return out;
}
const LOGIC = BLOCKS.map((b, i) => (b.kind === "logic" ? logicRects(b, 11 + i * 7) : []));
const CORE_LOGIC = BLOCKS.map((b, i) =>
  b.kind === "cores"
    ? [0, 1, 2, 3].flatMap((k) => {
        const cw = (b.w - 30) / 2, ch = (b.h - 30) / 2;
        const sub = { x: b.x + 10 + (k % 2) * (cw + 10), y: b.y + 10 + Math.floor(k / 2) * (ch + 10), w: cw, h: ch };
        return logicRects({ x: sub.x + sub.w * 0.45, y: sub.y, w: sub.w * 0.55, h: sub.h }, 40 + i * 13 + k);
      })
    : [],
);

function Block({ i, on }: { i: number; on: boolean }) {
  const b = BLOCKS[i];
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={TONES[i % 4]} stroke={on ? "#ff7a3d" : "#2a2c33"} strokeWidth={on ? 1.6 : 1} style={{ transition: "stroke .4s" }} />
      {b.kind === "sram" && <rect x={b.x + 8} y={b.y + 20} width={b.w - 16} height={b.h - 28} fill="url(#die-sram)" />}
      {b.kind === "stripes" && <rect x={b.x + 8} y={b.y + 20} width={b.w - 16} height={b.h - 28} fill="url(#die-stripes)" />}
      {b.kind === "logic" && LOGIC[i].map((r, k) => <rect key={k} x={r.x} y={r.y + 10} width={r.w} height={r.h} fill={r.f} />)}
      {b.kind === "cores" && (
        <>
          {[0, 1, 2, 3].map((k) => {
            const cw = (b.w - 30) / 2, ch = (b.h - 30) / 2;
            const x = b.x + 10 + (k % 2) * (cw + 10), y = b.y + 10 + Math.floor(k / 2) * (ch + 10);
            return (
              <g key={k}>
                <rect x={x} y={y + 8} width={cw} height={ch - 4} fill="#111216" stroke="#24262c" strokeWidth={0.8} />
                <rect x={x + 4} y={y + 12} width={cw * 0.4} height={ch - 12} fill="url(#die-sram)" />
              </g>
            );
          })}
          {CORE_LOGIC[i].map((r, k) => <rect key={k} x={r.x} y={r.y + 10} width={r.w} height={r.h - 1} fill={r.f} />)}
        </>
      )}
      {on && <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#ff7a3d" opacity={0.07} />}
      <text x={b.x + 8} y={b.y + 14} fontSize="11" fontWeight="600" fill={on ? "#ff7a3d" : "#8b90a3"} style={{ fontFeatureSettings: '"tnum"' }}>
        {pad2(i + 1)}
      </text>
    </g>
  );
}

export default function HeroDie() {
  const [active, pick] = useActiveEvent();

  return (
    <section aria-label="BitFest 2027" className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#060709] lg:h-[100svh] lg:min-h-[680px]">
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-14 px-6 pb-12 pt-28 md:px-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10 lg:py-0">
        <HeroCopy />

        <figure className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_200px]">
          <svg viewBox="0 0 600 600" className="h-auto w-full max-w-[min(560px,66vh)] justify-self-center" role="img" aria-label="The BitFest die: eight contest blocks on one piece of silicon">
            <defs>
              <pattern id="die-sram" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="4.2" height="4.2" fill="#23252b" />
              </pattern>
              <pattern id="die-stripes" width="5" height="5" patternUnits="userSpaceOnUse">
                <rect width="5" height="1.6" fill="#23252b" />
              </pattern>
            </defs>
            {/* Silicon, seal ring, pad ring. */}
            <rect x="0" y="0" width="600" height="600" fill="#101115" />
            <rect x="8" y="8" width="584" height="584" fill="none" stroke="#2e3037" strokeWidth="1" />
            <rect x="12" y="12" width="576" height="576" fill="none" stroke="#24262c" strokeWidth="1" />
            {Array.from({ length: 28 }, (_, k) => {
              const p = 30 + k * 19.6;
              return (
                <g key={k} fill="#4a4237">
                  <rect x={p} y={20} width="11" height="16" />
                  <rect x={p} y={564} width="11" height="16" />
                  <rect x={20} y={p} width="16" height="11" />
                  <rect x={564} y={p} width="16" height="11" />
                </g>
              );
            })}
            {/* Buses between blocks. */}
            <g stroke="#3a342c" strokeWidth="1">
              <path d="M304 40 V560 M44 210 H556 M44 350 H556 M244 350 V560 M416 350 V560 M204 210 V350 M396 210 V350" />
            </g>
            {BLOCKS.map((_, i) => (
              <g key={i} onPointerEnter={() => pick(i)} onPointerLeave={() => pick(-1)} style={{ cursor: "default" }}>
                <Block i={i} on={active === i} />
              </g>
            ))}
          </svg>

          <ol className="flex flex-col">
            {events.map((e, i) => {
              const on = active === i;
              return (
                <li key={e.slug} className="border-b border-line first:border-t">
                  <a
                    href={eventHref(e)}
                    {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                    onPointerEnter={() => pick(i)}
                    onPointerLeave={() => pick(-1)}
                    onFocus={() => pick(i)}
                    onBlur={() => pick(-1)}
                    className="grid grid-cols-[28px_minmax(0,1fr)] items-baseline gap-2 py-2.5"
                  >
                    <span className={`text-[12px] tabular-nums transition-colors ${on ? "text-orange" : "text-dim"}`}>{pad2(i + 1)}</span>
                    <span className="flex flex-col">
                      <span className={`text-[15px] font-semibold transition-colors ${on ? "text-ink" : "text-muted"}`}>{e.name}</span>
                      <span className={`text-[12px] text-dim transition-opacity ${on ? "opacity-100" : "opacity-0"}`}>{e.day} · {e.pool === "TBA" ? "Prizes TBA" : `${e.pool} BDT`}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
          <figcaption className="text-[13px] text-dim md:col-span-2">BF-27 die · eight contest blocks on one piece of silicon · KUET, Khulna</figcaption>
        </figure>
      </div>
    </section>
  );
}
