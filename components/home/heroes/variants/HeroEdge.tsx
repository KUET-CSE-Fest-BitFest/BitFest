"use client";

import { eventHref, events, fest, isExternal, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions } from "../shared";
import { useActiveEvent } from "./useActiveEvent";

/* V3 — Edge light. The chip you liked, in matte black on black. Its only light is one thin line
   that travels round the lid's edge; the lit pin steps through the contests. No halo, no texture. */

const SIDE = 20;
const TOP = 18;
const EV_IDX = [2, 7, 12, 17];
const yOf = (i: number) => `${7 + (86 * i) / (SIDE - 1)}%`;
const xOf = (i: number) => `${8 + (84 * i) / (TOP - 1)}%`;

export default function HeroEdge() {
  const [active, pick] = useActiveEvent(2600);

  return (
    <section aria-label="BitFest 2027" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#050507] px-6 pb-8 pt-[88px] md:px-14 lg:h-[100svh] lg:min-h-[680px]">
      <div className="relative mx-auto flex w-full max-w-[1332px] flex-1 flex-col">
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-[15px] font-medium text-soft">
          <p>{fest.kicker}</p>
          <p className="text-muted">{fest.dates} · {fest.venue}</p>
        </div>

        <div className="relative my-6 flex flex-1 items-center justify-center lg:my-4">
          <div className="chip relative">
            {/* Pins: plain metal, the active contest's pin in orange. */}
            {[-1, 1].map((side) =>
              Array.from({ length: SIDE }, (_, i) => {
                const k = EV_IDX.indexOf(i);
                const ev = k < 0 ? -1 : side < 0 ? k : 4 + k;
                return (
                  <span
                    key={`s${side}${i}`}
                    aria-hidden
                    className={`absolute h-[3px] w-[var(--pin)] -translate-y-1/2 transition-colors duration-300 lg:h-[3px] ${side < 0 ? "right-full" : "left-full"} ${ev === active ? "bg-orange" : ev >= 0 ? "bg-[#6b6f7a]" : "bg-[#2c2e34]"}`}
                    style={{ top: yOf(i) }}
                  />
                );
              }),
            )}
            {[-1, 1].map((side) =>
              Array.from({ length: TOP }, (_, i) => (
                <span key={`t${side}${i}`} aria-hidden className={`absolute h-[var(--pin)] w-[3px] -translate-x-1/2 bg-[#2c2e34] ${side < 0 ? "bottom-full" : "top-full"}`} style={{ left: xOf(i) }} />
              )),
            )}

            <div aria-hidden className="absolute inset-0 rounded-[12px] border border-white/[0.06] bg-[#0e0f12]" />
            {events.map((e, ev) => {
              const left = ev < 4;
              const y = yOf(EV_IDX[ev % 4]);
              const on = ev === active;
              return (
                <div key={e.slug} aria-hidden>
                  <span className={`absolute h-px -translate-y-1/2 transition-colors duration-300 ${on ? "bg-orange" : "bg-white/[0.08]"}`} style={{ top: y, width: "var(--inset-x)", ...(left ? { left: 0 } : { right: 0 }) }} />
                  <span className={`absolute h-px -translate-y-1/2 transition-colors duration-300 ${on ? "bg-orange" : "bg-white/[0.12]"}`} style={{ top: y, width: "var(--lead)", ...(left ? { right: "calc(100% + var(--pin))" } : { left: "calc(100% + var(--pin))" }) }} />
                </div>
              );
            })}

            {/* Lid: matte black, one bevel line. */}
            <div className="absolute flex flex-col items-center justify-center rounded-[9px] border border-white/[0.07] bg-[#0a0b0e] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ inset: "10.5% var(--inset-x)" }}>
              <span aria-hidden className="absolute left-[5%] top-[6%] h-2 w-2 rounded-full bg-black shadow-[0_1px_0_rgba(255,255,255,0.06)] lg:h-2.5 lg:w-2.5" />
              <h1 className="text-[clamp(40px,14vw,60px)] font-semibold leading-[0.9] tracking-[-0.045em] text-[#ececef] lg:text-[clamp(56px,min(8.4vw,calc((100svh_-_300px)*0.18)),104px)]">
                BitFest<br /><span className="text-orange">2027</span>
              </h1>
              <p className="mt-4 text-[12px] font-medium text-[#6d7286] md:text-[13px]">BF-27 · KUET CSE · Khulna</p>
              <p className="mt-1 text-[12px] text-[#4f5462] md:text-[13px]" style={{ fontFamily: "var(--f-bangla), sans-serif" }}>বিটফেস্ট ২০২৭</p>
            </div>
            {/* The one light: a short line running round the lid edge. */}
            <svg aria-hidden className="pointer-events-none absolute overflow-visible" style={{ inset: "10.5% var(--inset-x)", width: "calc(100% - 2 * var(--inset-x))", height: "79%" }}>
              <rect x="0" y="0" width="100%" height="100%" rx="9" pathLength={1} fill="none" stroke="#ff7a3d" strokeOpacity="0.22" strokeWidth="6" className="edge-run" />
              <rect x="0" y="0" width="100%" height="100%" rx="9" pathLength={1} fill="none" stroke="#ff9a62" strokeWidth="1.5" className="edge-run" />
            </svg>

            <ul className="hidden lg:block">
              {events.map((e, i) => {
                const left = i < 4;
                const on = active === i;
                return (
                  <li key={e.slug} className="absolute -translate-y-1/2" style={{ top: yOf(EV_IDX[i % 4]), ...(left ? { right: "calc(100% + var(--pin) + var(--lead) + 14px)" } : { left: "calc(100% + var(--pin) + var(--lead) + 14px)" }) }}>
                    <a
                      href={eventHref(e)}
                      {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                      onPointerEnter={() => pick(i)}
                      onPointerLeave={() => pick(-1)}
                      onFocus={() => pick(i)}
                      onBlur={() => pick(-1)}
                      className={`flex w-max flex-col ${left ? "items-end text-right" : "items-start"}`}
                    >
                      <span className="text-[12px] tabular-nums">
                        <span className={on ? "text-orange" : "text-dim"}>Pin {pad2(i + 1)}</span>
                        <span className="text-dim"> · {on ? `${e.day} · ${e.pool === "TBA" ? "Prizes TBA" : `${e.pool} BDT`}` : e.kind}</span>
                      </span>
                      <span className={`text-[17px] font-semibold transition-colors ${on ? "text-ink" : "text-muted"}`}>{e.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="grid gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
          <p className="max-w-[460px] text-[17px] leading-relaxed text-soft">{fest.blurb}</p>
          <FestFacts className="max-xl:hidden" />
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
