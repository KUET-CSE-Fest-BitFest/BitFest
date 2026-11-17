"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import { useLiveTick } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* Line Following Robot hero · Pinout. The robot is drawn like the home page's chip: a lit lid
   seen from above, wheels at its sides and an eight-eye sensor bar at its nose. The eyes light where
   the line runs under them (the reading drifts as it steers, all eight at a junction, none in a gap),
   and the lid shows that reading. Leaders run out to the three things the event tests, with signals
   on them like the home chip's. */

const page = eventPages.lfr;
const PINS = [
  { t: "Sensor calibration", d: "Eight eyes that read the line", side: "l" },
  { t: "Control", d: "Steering through curves and junctions", side: "l" },
  { t: "Build quality", d: "Chassis, wheels and power", side: "r" },
  { t: "Fastest clean run", d: "The time that wins", side: "r" },
] as const;

function reading(t: number) {
  // Where the line sits under the bar (0–7), with a junction every so often and a gap now and then.
  const k = t % 40;
  if (k === 13) return Array(8).fill(true);
  if (k === 27 || k === 28) return Array(8).fill(false);
  const c = 3.5 + 2.2 * Math.sin(t / 3.1) + 0.8 * Math.sin(t / 1.3);
  return Array.from({ length: 8 }, (_, i) => Math.abs(i - c) < 1.1);
}

function Robot() {
  const [t, setT] = useState(4);
  const ref = useRef<HTMLDivElement>(null);
  useLiveTick(140, () => setT((x) => x + 1), ref);
  const eyes = reading(t);
  const bits = eyes.map((e) => (e ? "1" : "0")).join("");
  const state = eyes.every(Boolean) ? "Junction" : eyes.some(Boolean) ? "On the line" : "Gap: holding course";
  const active = Math.floor(t / 18) % PINS.length;
  return (
    <div ref={ref} role="img" aria-label="A line-following robot seen from above, its eight sensors reading the line, with leaders to sensor calibration, control, build quality and the fastest clean run." className="pointer-events-none relative mx-auto mb-6 mt-[clamp(28px,5vh,56px)] flex h-[200px] w-[min(1100px,calc(100%-24px))] items-center justify-center md:h-[220px]">
      {/* Leaders and their signals, from behind the robot out to the labels. */}
      {PINS.map((p, i) => {
        const left = p.side === "l";
        const y = i % 2 ? "64%" : "36%";
        return (
          <div key={p.t} aria-hidden className={`absolute top-0 hidden h-full lg:block ${left ? "right-1/2" : "left-1/2"}`} style={{ width: "min(26vw, 330px)" }}>
            <span className="absolute h-px w-full bg-white/15" style={{ top: y }} />
            <span className={`absolute h-[5px] w-[5px] -translate-y-1/2 rounded-full ${active === i ? "bg-orange shadow-[0_0_10px_rgba(255,122,61,0.8)]" : "bg-white/30"} ${left ? "left-0" : "right-0"}`} style={{ top: y }} />
            <span className={`sig ${left ? "sig-l" : "sig-r"}`} data-on={active === i} style={{ top: y, width: "calc(100% - 140px)", ...(left ? { left: 0 } : { right: 0 }) }}>
              <i style={{ animationDelay: `${-(i * 1.3) % 6.5}s` }} />
            </span>
          </div>
        );
      })}
      {PINS.map((p, i) => {
        const left = p.side === "l";
        return (
          <div key={p.t} className={`absolute hidden w-max -translate-y-1/2 flex-col lg:flex ${left ? "items-end text-right" : "items-start"}`} style={{ top: i % 2 ? "64%" : "36%", ...(left ? { right: "calc(50% + min(26vw, 330px) + 14px)" } : { left: "calc(50% + min(26vw, 330px) + 14px)" }) }}>
            <span className={`text-[12px] tabular-nums ${active === i ? "text-orange" : "text-dim"}`}>Pin {String(i + 1).padStart(2, "0")} · {p.d}</span>
            <span className={`text-[17px] font-semibold ${active === i ? "text-ink" : "text-muted"}`}>{p.t}</span>
          </div>
        );
      })}

      {/* The robot, from above: nose (sensor bar) to the right. */}
      <div className="relative z-[3] h-[150px] w-[260px] md:h-[164px] md:w-[300px]">
        {[["left-[18%] -top-[14px]"], ["left-[18%] -bottom-[14px]"]].map(([pos], k) => (
          <span key={k} aria-hidden className={`lfr-wheel absolute h-[22px] w-[74px] rounded-[7px] ${pos}`} />
        ))}
        <div className="lidx absolute inset-0 flex flex-col justify-between rounded-[22px] p-4 pr-12">
          <span className="lx lx-corner lx-bl lx-warm" style={{ width: "140%" }} />
          <span className="lx lx-rim" />
          <span className="relative z-[4] text-[12px] font-medium text-[#f2e6dc]/70">{state}</span>
          <span className="relative z-[4] flex flex-col gap-1">
            <span className="lx-ink-warm text-[30px] font-semibold leading-none tracking-[0.06em] tabular-nums md:text-[34px]">{bits}</span>
            <span className="text-[12px] text-[#f2e6dc]/60">Sensor reading</span>
          </span>
        </div>
        {/* Sensor bar at the nose: eight eyes, lit where they see the line. */}
        <div className="absolute -right-[10px] top-1/2 z-[4] flex h-[132px] w-[22px] -translate-y-1/2 flex-col items-center justify-between rounded-[8px] bg-[#0f0c0e] py-2 shadow-[inset_0_0_0_1px_rgba(255,214,190,0.18)] md:h-[146px]">
          {eyes.map((on, i) => <span key={i} data-on={on} className="lfr-eye h-[9px] w-[9px] rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

export default function LfrPinoutHero() {
  return <EventHero slug="lfr" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Robot />} />;
}
