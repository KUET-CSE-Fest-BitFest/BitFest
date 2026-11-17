"use client";

import { useState } from "react";
import { SCHEDULE_START } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { ITEMS, KIND_LABEL, dayLabel, events, range } from "./data";

/* T3 — Two halves. December happens online (registrations, deadlines, online rounds, by date);
   January happens on campus (each finals day and what's in it). Pointing at a contest anywhere
   lights its rows in both halves. */

const ONLINE = ITEMS.filter((m) => m.kind !== "final");
const FINALS = ITEMS.filter((m) => m.kind === "final");
const FINAL_DAYS = [...new Set(FINALS.flatMap((m) => (m.to !== undefined ? [m.from, m.to] : [m.from])))].sort((a, b) => a - b);
const weekday = (d: number) => {
  const t = new Date(SCHEDULE_START.getFullYear(), SCHEDULE_START.getMonth(), SCHEDULE_START.getDate() + d);
  return t.toLocaleDateString("en-GB", { weekday: "long" });
};

export default function ScheduleHalves() {
  const [hot, setHot] = useState<number | null>(null);
  const props = (ev: number) => ({
    onPointerEnter: () => setHot(ev),
    onPointerLeave: () => setHot(null),
    onFocus: () => setHot(ev),
    onBlur: () => setHot(null),
    tabIndex: 0,
    "data-dim": hot !== null && hot !== ev,
    "data-hot": hot === ev,
  });

  return (
    <section id="schedule" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 md:px-14">
        <SectionHead n="02" label="Key dates" title="December online, January on campus" sub="Registrations and online rounds run through December. Every final is on the KUET campus." />

        <div className="grid border-y border-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* December */}
          <div className="flex flex-col gap-6 py-8 lg:border-r lg:border-line lg:py-10 lg:pr-12">
            <p className="flex items-baseline justify-between">
              <span className="text-[22px] font-semibold tracking-[-0.02em]">December</span>
              <span className="text-[15px] text-muted">Online</span>
            </p>
            <ul className="flex flex-col">
              {ONLINE.map((m, k) => (
                <li key={k} {...props(m.ev)} className="halves-row grid grid-cols-[120px_minmax(0,1fr)] items-baseline gap-4 border-t border-line py-3.5 outline-none first:border-t-0">
                  <span className="text-[15px] font-medium tabular-nums text-soft">{range(m)}</span>
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-[16px] font-semibold">{events[m.ev].name}</span>
                    <span className={`text-[14px] ${m.kind === "deadline" ? "text-orange" : "text-muted"}`}>{KIND_LABEL[m.kind]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* January */}
          <div className="flex flex-col gap-6 border-t border-line py-8 lg:border-t-0 lg:py-10 lg:pl-12">
            <p className="flex items-baseline justify-between">
              <span className="text-[22px] font-semibold tracking-[-0.02em]">January</span>
              <span className="text-[15px] text-orange">On campus, KUET</span>
            </p>
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {FINAL_DAYS.map((d) => {
                const list = FINALS.filter((m) => d >= m.from && d <= (m.to ?? m.from));
                return (
                  <div key={d} className="flex flex-col gap-4">
                    <p className="flex flex-col gap-0.5 border-b border-line-2 pb-4">
                      <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{dayLabel(d).split(" ")[0]}</span>
                      <span className="text-[14px] text-muted">{weekday(d)}</span>
                    </p>
                    <ul className="flex flex-col gap-3.5">
                      {list.map((m) => (
                        <li key={m.ev} {...props(m.ev)} className="halves-row flex flex-col gap-0.5 outline-none">
                          <span className="text-[16px] font-semibold">{events[m.ev].name}</span>
                          <span className="text-[14px] leading-snug text-muted">{m.to !== undefined && m.to !== m.from ? (d === m.from ? "Starts · " : "Ends · ") : ""}{m.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
