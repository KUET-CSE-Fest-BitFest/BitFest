"use client";

import { useRef } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import ContestLink from "@/components/redesign/ui/ContestLink";
import PoolOdometer from "./PoolOdometer";
import BottomLight from "./BottomLight";
import { HeroActions, useCanvasLoop } from "./shared";
import { ORANGE, INK, readCanvasTheme } from "./pcb";

/** Background: a fine dot grid where slow rings of green light rise from the bottom centre. A still
    grid with reduced motion. */
function DotWave() {
  const ref = useRef<HTMLCanvasElement>(null);
  useCanvasLoop(
    ref,
    (ctx, w, h, t) => {
      const gap = 22, ox = w / 2, oy = h + 60, max = Math.hypot(w / 2, h + 60) + 200;
      const rings = [(t * 170) % max, (t * 170 + max / 2) % max];
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const d = Math.hypot(x - ox, y - oy);
          let k = 0;
          for (const R of rings) k = Math.max(k, 1 - Math.abs(d - R) / 80);
          k = Math.max(0, k) * (1 - d / max);
          if (k > 0.02) {
            const s = 1.2 + k * 0.8;
            ctx.fillStyle = `rgba(${ORANGE},${0.14 + k * 0.8})`;
            ctx.fillRect(x - s, y - s, s * 2, s * 2);
          } else {
            ctx.fillStyle = `rgba(${INK},0.07)`;
            ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
          }
        }
      }
    },
    () => readCanvasTheme(),
  );
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/** Hero option "Centre stage": one wide lit panel under the nav with everything centred (edition,
    title, motto, the rolling prize pool, actions) and the ten contests running along its foot as a
    moving strip. */
export default function HeroCentre() {
  // Four copies: the strip slides by half its length, and each half must outrun the widest screens.
  const row = [...events, ...events, ...events, ...events];
  return (
    <section id="hero" aria-label={`${fest.name} ${fest.year}`} className="relative flex min-h-[100svh] flex-col px-5 pb-5 pt-[80px] lg:h-[100svh]">
      <style>{`@keyframes hc-strip { to { transform: translateX(-50%); } } @media (prefers-reduced-motion: reduce) { .hc-strip { animation: none !important; } }`}</style>
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-50" />
      <div className="lidx relative flex w-full flex-1 flex-col overflow-hidden rounded-[28px]">
        <DotWave />
        <BottomLight contained />
        <span aria-hidden className="lx lx-rim" />
        <div className="relative z-[4] flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pt-8 text-center lg:gap-7">
            <p className="text-[13px] font-medium text-cream/70 lg:text-[14px]">{fest.name} {fest.year} · ten national contests</p>
            {/* The full name in capitals on two lines; the motto sits right under it as the subtitle. */}
            <div className="flex flex-col items-center gap-4 lg:gap-5">
              <h1 className="whitespace-nowrap text-[clamp(30px,9.4vw,40px)] md:text-[clamp(40px,5.6vw,96px)] font-semibold uppercase leading-[0.95] tracking-[-0.035em]">
                <span className="lx-ink-warm">KUET CSE</span><br /><span className="lx-ink-warm">Innovation Fest</span>
              </h1>
              <p className="rd-motto text-balance text-[clamp(16px,1.5vw,22px)] font-semibold tracking-[-0.015em]">{fest.motto}</p>
            </div>
            <p className="text-[clamp(20px,2.1vw,32px)] font-medium tracking-[-0.01em] text-cream/85 [filter:drop-shadow(0_2px_6px_rgba(3,10,20,0.9))]">
              <PoolOdometer value={`${fest.prizePool} BDT`} className="text-[1.3em] font-semibold tracking-[-0.025em]" /> prize pool
            </p>
            <HeroActions className="mt-2 justify-center" />
          </div>
          <div className="relative mt-8 overflow-hidden border-t border-rim/12 py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <ul className="hc-strip flex w-max gap-10" style={{ animation: "hc-strip 80s linear infinite" }}>
              {row.map((e, i) => (
                <li key={i} aria-hidden={i >= events.length || undefined}>
                  <ContestLink e={e} tabIndex={i >= events.length ? -1 : undefined} className="group flex items-center gap-3 whitespace-nowrap text-[15px] font-medium text-cream/70 transition-colors hover:text-ink">
                    <span className="text-[12px] tabular-nums text-orange">{pad2((i % events.length) + 1)}</span>{e.name}
                  </ContestLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
