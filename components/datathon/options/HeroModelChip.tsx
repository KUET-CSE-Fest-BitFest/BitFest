"use client";

import { useEffect, useState } from "react";
import { eventPages } from "@/lib/eventPages";
import EventHero from "@/components/event/EventHero";

/* Datathon option D · Model chip. The landing hero's chip, put to work: a small lit lid is the
   model. Five features run into it from the left as traces (a flood-risk model for a delta city:
   rainfall, river level, soil moisture, month, area), three predictions run out to the right. Every
   batch, signals run in along the traces, the lid's light swells as they arrive, the epoch and score
   step up and signals run out to the predictions, whose shares shift. Point at a feature to see how
   much of the prediction it carries: its trace lights, the others dim and the lid reads its share. */

const page = eventPages.datathon;
const FEATURES = [
  { name: "Rainfall", short: "Rain", imp: 31 },
  { name: "River level", short: "River", imp: 27 },
  { name: "Soil moisture", short: "Soil", imp: 18 },
  { name: "Month", short: "Month", imp: 14 },
  { name: "Area", short: "Area", imp: 10 },
];
const OUTS = ["High risk", "Medium", "Low"];
const BATCH = 2200;
const START = { epoch: 12, score: 0.861, p: [0.46, 0.33, 0.21] };

export default function HeroModelChip() {
  const [batch, setBatch] = useState(0);
  const [m, setM] = useState(START);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setBatch((b) => b + 1);
      // The prediction updates when the signals reach the lid.
      window.setTimeout(() => {
        setM((x) => {
          if (x.epoch >= 60) return START;
          const hi = Math.min(0.72, x.p[0] + (Math.random() - 0.3) * 0.04);
          const md = Math.max(0.12, (1 - hi) * (0.58 + (Math.random() - 0.5) * 0.08));
          return { epoch: x.epoch + 1, score: x.score + (0.951 - x.score) * 0.06, p: [hi, md, 1 - hi - md] };
        });
      }, 900);
    }, BATCH);
    return () => window.clearInterval(id);
  }, []);

  const f = hover !== null ? FEATURES[hover] : null;

  return (
    <EventHero
      slug="datathon"
      lead={page.lead}
      registerHref={page.registerHref}
      rulebookHref={page.rulebookHref}
      scene={
        <div className="absolute inset-x-0 bottom-[3%] top-[max(61%,556px)] md:bottom-[9%] md:top-[57%]">
          <div className="mc relative mx-auto h-full w-[min(1080px,calc(100%-24px))]" data-hover={hover !== null} onPointerLeave={() => setHover(null)}>
            {/* Inputs: label, then a trace that runs on under the lid. */}
            {FEATURES.map((ft, i) => {
              const on = hover === i;
              return (
                <div key={ft.name} data-on={on} className={`mc-in pointer-events-auto absolute left-0 right-1/2 top-[calc(50%_+_var(--ym)_*_19%)] h-7 -translate-y-1/2 cursor-default md:top-[calc(50%_+_var(--yi)_*_11%)] ${i > 2 ? "hidden md:block" : ""}`} style={{ "--ym": i - 1, "--yi": i - 2 } as React.CSSProperties} onPointerEnter={(e) => e.pointerType !== "touch" && setHover(i)} onClick={() => setHover((h) => (h === i ? null : i))}>
                  <span className="mc-label absolute right-[calc(60%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap text-right text-[13px] font-medium md:right-[calc(70%+14px)] md:text-[15px]">
                    <span className="mc-imp mr-2 hidden tabular-nums md:inline">{ft.imp}%</span>
                    <span className="hidden md:inline">{ft.name}</span>
                    <span className="md:hidden">{ft.short}</span>
                  </span>
                  <span className="mc-trace absolute left-[40%] right-0 top-1/2 h-px md:left-[30%]">
                    <span key={batch} className="mc-run" style={{ animationDelay: `${i * 70}ms` }}><i /></span>
                  </span>
                </div>
              );
            })}
            {/* Outputs. */}
            {OUTS.map((o, j) => {
              const y = `calc(50% + ${(j - 1) * 24}%)`;
              return (
                <div key={o} className="absolute left-1/2 right-0 h-7 -translate-y-1/2" style={{ top: y }}>
                  <span className="mc-trace absolute left-0 right-[24%] top-1/2 h-px md:right-[32%]">
                    <span key={batch} className="mc-run mc-out" style={{ animationDelay: `${900 + j * 80}ms` }}><i /></span>
                  </span>
                  <span className="absolute left-[calc(76%+10px)] top-1/2 flex -translate-y-1/2 flex-col gap-1 md:left-[calc(68%+14px)]">
                    <span className="whitespace-nowrap text-[13px] font-medium text-soft md:text-[15px]">
                      <span className="hidden md:inline">{o} </span>
                      <span className={`tabular-nums ${j === 0 ? "text-orange" : "text-ink"}`}>{Math.round(m.p[j] * 100)}%</span>
                    </span>
                    <span className="hidden h-[3px] w-[96px] overflow-hidden rounded-full bg-[rgba(255,214,190,0.1)] md:block">
                      <span className="block h-full origin-left rounded-full transition-transform duration-700 ease-out" style={{ transform: `scaleX(${m.p[j]})`, background: j === 0 ? "linear-gradient(90deg,#c2335a,#ff7a3d)" : "rgba(255,214,190,0.45)" }} />
                    </span>
                  </span>
                </div>
              );
            })}
            {/* The model: a lit lid over the traces' ends. */}
            <div className="lidx absolute left-1/2 top-1/2 z-[3] flex h-[min(100%,176px)] min-h-[112px] w-[128px] -translate-x-1/2 -translate-y-1/2 flex-col justify-between rounded-[16px] p-3.5 sm:w-[150px] md:w-[280px] md:p-5">
              <span key={batch} className="lx lx-corner lx-bl lx-warm mc-light" />
              <span className="lx lx-rim" />
              <span className="relative z-[4] flex items-center justify-between text-[13px] font-medium text-[#f2e6dc]/65">
                <span>{f ? f.name : "Model"}</span>
                <span className="hidden tabular-nums md:inline">{f ? "importance" : `Epoch ${m.epoch}`}</span>
              </span>
              <span className="relative z-[4]">
                <span className="lx-ink-warm block text-[34px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[48px]">
                  {f ? `${f.imp}%` : m.score.toFixed(3)}
                </span>
                <span className="mt-2 block text-[13px] font-medium text-[#f2e6dc]/65">{f ? "of the prediction" : "Validation score"}</span>
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
}
