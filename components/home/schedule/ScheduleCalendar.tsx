"use client";

import { useEffect, useRef, useState } from "react";
import { SCHEDULE_DAYS, SCHEDULE_START } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { ITEMS, KEY_DAYS, KIND_LABEL, dayLabel, events, onDay } from "./data";

/* T1 — Calendar. Five weeks from the Monday before registrations open, through the finals. Finals are filled orange, deadlines carry
   a ring, online rounds an underline. Point at a day (or watch it step through) to see what happens. */

const OFFSET = (SCHEDULE_START.getDay() + 6) % 7; // days from that Monday to the first schedule day
const START = new Date(SCHEDULE_START.getFullYear(), SCHEDULE_START.getMonth(), SCHEDULE_START.getDate() - OFFSET);
const DAYS = Math.ceil((SCHEDULE_DAYS + OFFSET) / 7) * 7;
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function useStepper(list: number[], ms = 2400) {
  const [i, setI] = useState(0);
  const hold = useRef(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!hold.current) setI((v) => (v + 1) % list.length); }, ms);
    return () => window.clearInterval(id);
  }, [list.length, ms]);
  return [list[i], (d: number | null) => {
    hold.current = d !== null;
    if (d !== null) { const k = list.indexOf(d); setI(k >= 0 ? k : i); }
  }] as const;
}

export default function ScheduleCalendar() {
  const [auto, setHold] = useStepper(KEY_DAYS);
  const [hover, setHover] = useState<number | null>(null);
  const day = hover ?? auto;
  const items = onDay(day);
  const date = new Date(START);
  date.setDate(date.getDate() + day + OFFSET);

  const pick = (d: number | null) => { setHover(d); setHold(d); };

  return (
    <section id="schedule" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead n="02" label="Key dates" title="Five weeks to the finals" sub="Registrations and online rounds run through December. Every final is on campus on 3 and 4 January." />
          <div className="flex min-h-[220px] flex-col gap-4 border-t border-line pt-6" aria-live="polite">
            <p className="flex items-baseline gap-3">
              <span className="text-[56px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{dayLabel(day)}</span>
              <span className="text-lg text-muted">{date.toLocaleDateString("en-GB", { weekday: "long" })}</span>
            </p>
            <ul className="flex flex-col gap-2.5">
              {items.length ? items.map((m, k) => (
                <li key={k} className="flex items-baseline gap-3 text-[16px]">
                  <span className={`h-2 w-2 shrink-0 translate-y-[-1px] rounded-full ${m.kind === "final" ? "bg-orange" : m.kind === "deadline" ? "border border-orange" : m.kind === "round" ? "bg-orange/60" : "bg-white/30"}`} />
                  <span><span className="font-semibold">{events[m.ev].name}</span> <span className="text-muted">· {m.label}</span></span>
                </li>
              )) : <li className="text-muted">Nothing scheduled on this day.</li>}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-px text-[13px] font-medium text-dim">
            {WEEK.map((w) => <span key={w} className="px-2 pb-2">{w}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-px border border-line bg-line">
            {Array.from({ length: DAYS }, (_, k) => {
              const d = k - OFFSET;
              const dt = new Date(START);
              dt.setDate(dt.getDate() + k);
              const on = onDay(d);
              const final = on.some((m) => m.kind === "final");
              const deadline = on.some((m) => m.kind === "deadline" && m.from === d);
              const round = on.some((m) => m.kind === "round");
              const windowed = on.some((m) => m.kind === "window");
              const active = d === day;
              const first = dt.getDate() === 1 || k === 0;
              return (
                <button
                  key={k}
                  type="button"
                  onPointerEnter={() => pick(on.length ? d : null)}
                  onPointerLeave={() => pick(null)}
                  onFocus={() => pick(d)}
                  onBlur={() => pick(null)}
                  aria-label={`${dt.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}: ${on.length ? on.map((m) => `${events[m.ev].name}, ${m.label}`).join("; ") : "nothing scheduled"}`}
                  className={`relative flex aspect-[1/0.82] flex-col justify-between p-2.5 text-left transition-colors duration-300 md:p-3 ${final ? "bg-[#2a170d]" : "bg-bg"} ${active ? "outline outline-1 -outline-offset-1 outline-orange" : ""} ${on.length ? "cursor-pointer hover:bg-[#12151c]" : "cursor-default"}`}
                >
                  <span className="flex items-baseline justify-between">
                    <span className={`text-[clamp(15px,1.4vw,20px)] font-semibold tabular-nums ${final ? "text-orange" : on.length ? "text-ink" : "text-dim"}`}>{dt.getDate()}</span>
                    {first && <span className="text-[11px] text-muted">{dt.toLocaleDateString("en-GB", { month: "short" })}</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {deadline && <span className="h-2 w-2 rounded-full border border-orange" />}
                    {final && <span className="text-[11px] font-medium text-orange">Finals</span>}
                    {!final && on.length > 0 && <span className="text-[11px] tabular-nums text-dim">{on.length}</span>}
                  </span>
                  {(round || windowed) && <span className={`absolute inset-x-0 bottom-0 h-[3px] ${round ? "bg-orange/70" : "bg-white/15"}`} />}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-dim">
            <span className="flex items-center gap-2"><span className="h-3 w-4 bg-[#2a170d] outline outline-1 outline-orange/40" />Final on campus</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full border border-orange" />Registration closes</span>
            <span className="flex items-center gap-2"><span className="h-[3px] w-4 bg-orange/70" />Online round</span>
            <span className="flex items-center gap-2"><span className="h-[3px] w-4 bg-white/15" />Registration open</span>
          </div>
          <p className="sr-only">{ITEMS.length} milestones in all.</p>
        </div>
      </div>
    </section>
  );
}
