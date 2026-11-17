"use client";

import { useEffect, useRef, useState } from "react";
import { SCHEDULE_DAYS, SCHEDULE_START } from "@/lib/fest";
import SectionHead from "../SectionHead";
import WarmLight from "../heroes/rebrand/WarmLight";
import { KEY_DAYS, KIND_LABEL, dayLabel, detail, events, onDay } from "./data";

/* S-C — The die. Five weeks laid out like the cells of a chip's die, on the same lit lid as the hero.
   The light rests on the finals days; pointing at a day leans it there and the readout beside the
   lid says what happens. When nobody points, it steps through the key dates on its own. */

// Weeks start on Sunday, which keeps the finals (3–5 Jan) together on the last row, bottom left.
const OFFSET = SCHEDULE_START.getDay();
const START = new Date(SCHEDULE_START.getFullYear(), SCHEDULE_START.getMonth(), SCHEDULE_START.getDate() - OFFSET);
const WEEKS = Math.ceil((SCHEDULE_DAYS + OFFSET) / 7);
const DAYS = WEEKS * 7;
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FINALS = 26;
// Where a day's cell sits in the lid, in 0–1 (a header row of weekday names sits above the weeks).
const cellUV = (d: number): [number, number] => {
  const k = d + OFFSET;
  return [((k % 7) + 0.5) / 7, (Math.floor(k / 7) + 1.1) / (WEEKS + 0.6)];
};

export default function ScheduleDie() {
  const sec = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const hold = useRef(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!hold.current) setStep((s) => (s + 1) % KEY_DAYS.length); }, 2600);
    return () => window.clearInterval(id);
  }, []);
  const day = hover ?? KEY_DAYS[step];
  const items = onDay(day);
  const date = new Date(START);
  date.setDate(date.getDate() + day + OFFSET);
  const point = (d: number | null) => { hold.current = d !== null; setHover(d); };

  return (
    <section ref={sec} id="schedule" className="relative scroll-mt-20 overflow-hidden py-28 md:py-36">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid max-w-[1440px] gap-14 px-6 md:px-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHead n="02" label="Key dates" title="Five weeks to the finals" sub="Every registration, deadline and online round, on one die. The light sits on the finals, bottom left." />
          <div className="flex min-h-[200px] flex-col gap-4 border-t border-line pt-6" aria-live="polite">
            <p key={day} className="road-in flex items-baseline gap-3">
              <span className={`text-[56px] font-semibold leading-none tracking-[-0.045em] tabular-nums ${day >= FINALS ? "text-orange" : ""}`}>{dayLabel(day)}</span>
              <span className="text-lg text-muted">{date.toLocaleDateString("en-GB", { weekday: "long" })}</span>
            </p>
            <ul className="flex flex-col gap-2.5">
              {items.length ? items.map((m, k) => (
                <li key={k} className="flex items-baseline gap-3 text-[16px]">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${m.kind === "final" ? "bg-orange" : m.kind === "deadline" ? "border border-orange" : m.kind === "round" ? "bg-orange/60" : "bg-white/30"}`} />
                  <span><span className="font-semibold">{events[m.ev].name}</span> <span className="text-muted">· {detail(m) || KIND_LABEL[m.kind]}</span></span>
                </li>
              )) : <li className="text-muted">Nothing scheduled on this day.</li>}
            </ul>
          </div>
        </div>

        <div className="lidx relative rounded-[16px]">
          <span className="lx lx-corner lx-bl lx-warm" style={{ width: "100%" }} />
          <WarmLight track={sec} rest={[0, 1]} radius={0.5} lean={0.3} focus={hover !== null ? cellUV(hover) : null} />
          <span className="lx lx-rim" />
          <div className="relative z-[4] flex flex-col gap-2 p-3 md:p-5">
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {WEEK.map((w) => <span key={w} className="px-1 pb-1 text-[11px] font-medium text-[#f2e6dc]/60 md:text-[13px]">{w}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {Array.from({ length: DAYS }, (_, k) => {
                const d = k - OFFSET;
                const dt = new Date(START);
                dt.setDate(dt.getDate() + k);
                const on = d >= 0 && d < SCHEDULE_DAYS ? onDay(d) : [];
                const fin = on.some((m) => m.kind === "final");
                const deadline = on.some((m) => m.kind === "deadline" && m.from === d);
                const round = on.some((m) => m.kind === "round");
                const windowed = on.some((m) => m.kind === "window");
                const sel = d === day;
                return (
                  <button
                    key={k}
                    type="button"
                    onPointerEnter={() => point(on.length ? d : null)}
                    onPointerLeave={() => point(null)}
                    onFocus={() => point(d)}
                    onBlur={() => point(null)}
                    aria-label={`${dt.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}: ${on.length ? on.map((m) => `${events[m.ev].name}, ${m.label}`).join("; ") : "nothing scheduled"}`}
                    className={`relative flex aspect-[1/0.78] flex-col justify-between rounded-[8px] p-1.5 text-left transition-[background-color,box-shadow] duration-300 md:p-2.5 ${on.length ? "cursor-pointer bg-white/[0.035] hover:bg-white/[0.07]" : "cursor-default bg-white/[0.012]"} ${sel ? "shadow-[inset_0_0_0_1px_rgba(255,214,190,0.6)]" : fin ? "shadow-[inset_0_0_0_1px_rgba(255,214,190,0.28)]" : "shadow-[inset_0_0_0_1px_rgba(255,214,190,0.06)]"}`}
                  >
                    <span className="flex items-baseline justify-between">
                      <span className={`text-[13px] font-semibold tabular-nums [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] md:text-[17px] ${on.length ? "text-[#fbf1e9]" : "text-[#f2e6dc]/35"}`}>{dt.getDate()}</span>
                      {dt.getDate() === 1 && <span className="hidden text-[10px] text-[#f2e6dc]/60 md:inline">Jan</span>}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {deadline && <span className="h-2 w-2 rounded-full border border-orange" />}
                      {round && <span className="h-1.5 w-1.5 rounded-full bg-orange" />}
                      {fin && <span className="hidden text-[11px] font-semibold text-[#fff1e2] [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] md:inline">Finals</span>}
                    </span>
                    {windowed && <span className="absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-[#f2e6dc]/25" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
