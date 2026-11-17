"use client";

import { eventHref, events, fest, isExternal, pad2 } from "@/lib/fest";
import { HeroActions } from "../shared";
import { useActiveEvent } from "./useActiveEvent";

/* V2 — Drawing. The hero is an engineering drawing sheet for the BF-27 package: hairline top and
   side views, numbered balloons on the eight contest pins, a parts list and a title block with the
   fest's real details. The lines draw themselves in once; no glow anywhere. */

const PKG = { x: 230, y: 78, w: 260, h: 250 };
const SIDE_PINS = 12;
const EV_PIN = [2, 5, 8, 11].map((i) => i); // pins carrying events, per side
const pinY = (i: number) => PKG.y + 18 + ((PKG.h - 36) * i) / (SIDE_PINS - 1);

const LINE = "rgba(201,205,216,0.55)";
const FAINT = "rgba(201,205,216,0.22)";

function Arrow({ x, y, dir }: { x: number; y: number; dir: "l" | "r" | "u" | "d" }) {
  const p = { l: `${x},${y} ${x + 7},${y - 3} ${x + 7},${y + 3}`, r: `${x},${y} ${x - 7},${y - 3} ${x - 7},${y + 3}`, u: `${x},${y} ${x - 3},${y + 7} ${x + 3},${y + 7}`, d: `${x},${y} ${x - 3},${y - 7} ${x + 3},${y - 7}` }[dir];
  return <polygon points={p} fill={LINE} className="draw-fade" />;
}

export default function HeroDrawing() {
  const [active, pick] = useActiveEvent();

  return (
    <section aria-label="BitFest 2027" className="relative min-h-[100svh] overflow-hidden bg-[#08090b] px-4 pb-4 pt-[80px] md:px-8 lg:h-[100svh] lg:min-h-[700px]">
      {/* The sheet: double border, zone marks. */}
      <div className="relative flex h-full flex-col border border-white/[0.14] p-2">
        <div className="pointer-events-none absolute inset-2 border border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-2 top-0 hidden -translate-y-full justify-around text-[10px] text-dim md:flex">
          {[1, 2, 3, 4, 5, 6].map((n) => <span key={n}>{n}</span>)}
        </div>

        <div className="relative grid flex-1 gap-10 p-6 md:p-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8">
          {/* Copy */}
          <div className="flex flex-col justify-center gap-7">
            <p className="text-[15px] font-medium text-soft">{fest.kicker}</p>
            <h1 className="text-[clamp(60px,min(7.2vw,13vh),118px)] font-semibold leading-[0.9] tracking-[-0.045em]">
              BitFest<br /><span className="text-orange">2027</span>
            </h1>
            <p className="max-w-[420px] text-[17px] leading-relaxed text-soft">{fest.blurb}</p>
            <HeroActions />
          </div>

          {/* Drawing + parts list + title block */}
          <div className="flex min-h-0 flex-col justify-between gap-6">
            <svg viewBox="-60 0 840 470" className="h-auto max-h-[44vh] w-full" role="img" aria-label="Drawing of the BF-27 package with its eight contest pins numbered">
              {/* Centre lines (chain). */}
              <g stroke={FAINT} strokeWidth="1" strokeDasharray="14 4 2 4" className="draw-fade">
                <path pathLength={1} d={`M${PKG.x - 40} ${PKG.y + PKG.h / 2} H${PKG.x + PKG.w + 40}`} />
                <path pathLength={1} d={`M${PKG.x + PKG.w / 2} ${PKG.y - 40} V${PKG.y + PKG.h + 30}`} />
              </g>
              {/* Package, lid, pin 1. */}
              <g fill="none" stroke={LINE} strokeWidth="1.2" className="draw">
                <rect pathLength={1} x={PKG.x} y={PKG.y} width={PKG.w} height={PKG.h} rx="6" />
                <rect pathLength={1} x={PKG.x + 26} y={PKG.y + 26} width={PKG.w - 52} height={PKG.h - 52} rx="3" />
                <circle pathLength={1} cx={PKG.x + 40} cy={PKG.y + 40} r="5" />
              </g>
              <text x={PKG.x + PKG.w / 2} y={PKG.y + PKG.h / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill="#d7dae2" className="draw-fade">BF-27</text>
              {/* Pins on four sides; event pins carry balloons. */}
              <g stroke={LINE} strokeWidth="1.2" className="draw">
                {Array.from({ length: SIDE_PINS }, (_, i) => (
                  <g key={i}>
                    <path pathLength={1} d={`M${PKG.x} ${pinY(i)} h-14`} />
                    <path pathLength={1} d={`M${PKG.x + PKG.w} ${pinY(i)} h14`} />
                  </g>
                ))}
                {Array.from({ length: 11 }, (_, i) => {
                  const x = PKG.x + 22 + ((PKG.w - 44) * i) / 10;
                  return (
                    <g key={i}>
                      <path pathLength={1} d={`M${x} ${PKG.y} v-14`} />
                      <path pathLength={1} d={`M${x} ${PKG.y + PKG.h} v14`} />
                    </g>
                  );
                })}
              </g>
              {events.map((e, ev) => {
                const left = ev < 4;
                const y = pinY(EV_PIN[ev % 4]);
                const px = left ? PKG.x - 14 : PKG.x + PKG.w + 14;
                const bx = left ? 120 : 600;
                const on = active === ev;
                return (
                  <g key={e.slug} onPointerEnter={() => pick(ev)} onPointerLeave={() => pick(-1)}>
                    <path pathLength={1} d={`M${px} ${y} H${left ? bx + 13 : bx - 13}`} stroke={on ? "#ff7a3d" : LINE} strokeWidth="1" className="draw" style={{ transition: "stroke .3s" }} />
                    <circle cx={bx} cy={y} r="13" fill="#08090b" stroke={on ? "#ff7a3d" : LINE} strokeWidth="1.2" className="draw-fade" style={{ transition: "stroke .3s" }} />
                    <text x={bx} y={y + 4.5} textAnchor="middle" fontSize="12" fontWeight="600" fill={on ? "#ff7a3d" : "#c9cdd8"} className="draw-fade">{ev + 1}</text>
                    <text x={left ? bx - 22 : bx + 22} y={y + 4.5} textAnchor={left ? "end" : "start"} fontSize="13" fill={on ? "#eceef5" : "#8b90a3"} className="draw-fade" style={{ transition: "fill .3s" }}>{e.name}</text>
                  </g>
                );
              })}
              {/* Dimensions. */}
              <g stroke={FAINT} strokeWidth="1" className="draw">
                <path pathLength={1} d={`M${PKG.x} ${PKG.y - 20} V${PKG.y - 50} M${PKG.x + PKG.w} ${PKG.y - 20} V${PKG.y - 50}`} />
                <path pathLength={1} d={`M${PKG.x + 8} ${PKG.y - 42} H${PKG.x + PKG.w - 8}`} />
              </g>
              <Arrow x={PKG.x + 1} y={PKG.y - 42} dir="l" />
              <Arrow x={PKG.x + PKG.w - 1} y={PKG.y - 42} dir="r" />
              <text x={PKG.x + PKG.w / 2} y={PKG.y - 50} textAnchor="middle" fontSize="13" fill="#c9cdd8" className="draw-fade">8 contests</text>
              {/* Side view. */}
              <g fill="none" stroke={LINE} strokeWidth="1.2" className="draw">
                <rect pathLength={1} x={PKG.x} y={398} width={PKG.w} height={20} rx="3" />
                <path pathLength={1} d={`M${PKG.x} 412 h-8 v14 h-10 M${PKG.x + PKG.w} 412 h8 v14 h10`} />
              </g>
              <g stroke={FAINT} strokeWidth="1" className="draw">
                <path pathLength={1} d={`M${PKG.x + PKG.w + 30} 398 h30 M${PKG.x + PKG.w + 30} 426 h30 M${PKG.x + PKG.w + 52} 404 v16`} />
              </g>
              <Arrow x={PKG.x + PKG.w + 52} y={399} dir="u" />
              <Arrow x={PKG.x + PKG.w + 52} y={425} dir="d" />
              <text x={PKG.x + PKG.w + 66} y={416} fontSize="13" fill="#c9cdd8" className="draw-fade">2 days</text>
              <text x={PKG.x} y={452} fontSize="12" fill="#6d7286" className="draw-fade">Side view A–A</text>
              <text x={PKG.x - 40} y={PKG.y + PKG.h + 30} fontSize="12" fill="#6d7286" className="draw-fade">Top view</text>
            </svg>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
              {/* Parts list */}
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="text-dim">
                    <th className="border border-white/[0.12] px-2.5 py-1 font-medium">No.</th>
                    <th className="border border-white/[0.12] px-2.5 py-1 font-medium">Contest</th>
                    <th className="border border-white/[0.12] px-2.5 py-1 font-medium">Final</th>
                    <th className="border border-white/[0.12] px-2.5 py-1.5 text-right font-medium">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e, i) => {
                    const on = active === i;
                    return (
                      <tr key={e.slug} onPointerEnter={() => pick(i)} onPointerLeave={() => pick(-1)} className={on ? "text-ink" : "text-muted"}>
                        <td className={`border border-white/[0.12] px-2.5 py-[3px] tabular-nums ${on ? "text-orange" : ""}`}>{i + 1}</td>
                        <td className="border border-white/[0.12] px-2.5 py-[3px]">
                          <a href={eventHref(e)} {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})} onFocus={() => pick(i)} onBlur={() => pick(-1)} className="transition-colors hover:text-ink">{e.name}</a>
                        </td>
                        <td className="border border-white/[0.12] px-2.5 py-[3px] tabular-nums">{e.day}</td>
                        <td className="border border-white/[0.12] px-2.5 py-[3px] text-right tabular-nums">{e.pool === "TBA" ? "TBA" : e.pool}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Title block */}
              <dl className="grid grid-cols-2 self-end text-[12px]">
                <div className="col-span-2 border border-white/[0.12] px-3 py-2">
                  <dt className="text-dim">Title</dt>
                  <dd className="text-[15px] font-semibold text-ink">BitFest 2027 <span className="font-medium text-soft" style={{ fontFamily: "var(--f-bangla), sans-serif" }}>· বিটফেস্ট ২০২৭</span></dd>
                </div>
                <div className="border border-white/[0.12] px-3 py-2"><dt className="text-dim">Drawn by</dt><dd className="text-soft">Dept. of CSE, KUET</dd></div>
                <div className="border border-white/[0.12] px-3 py-2"><dt className="text-dim">Date</dt><dd className="tabular-nums text-soft">3–4 Jan 2027</dd></div>
                <div className="border border-white/[0.12] px-3 py-2"><dt className="text-dim">Site</dt><dd className="tabular-nums text-soft">22.90° N, 89.50° E</dd></div>
                <div className="grid grid-cols-2">
                  <div className="border border-white/[0.12] px-3 py-2"><dt className="text-dim">Rev</dt><dd className="text-orange">3</dd></div>
                  <div className="border border-white/[0.12] px-3 py-2"><dt className="text-dim">Sheet</dt><dd className="text-soft">1 / 1</dd></div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
