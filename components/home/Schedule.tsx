"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type Milestone, SCHEDULE_DAYS, dayLabel, events, schedule } from "@/lib/fest";
import SectionHead from "./SectionHead";

gsap.registerPlugin(ScrollTrigger);

/* 02 · Timing diagram — every event's milestones on one date axis, 8 Dec → 5 Jan.
   On desktop the section pins and scrolling walks a cursor through the days. */

const N = SCHEDULE_DAYS;
const pct = (d: number) => `${(d / N) * 100}%`;
type Item = Milestone & { ev: number };
const ITEMS: Item[] = events.flatMap((e, i) => (schedule[e.slug] ?? []).map((m) => ({ ...m, ev: i })));
const AXIS = [0, 7, 14, 21, 26, 28];
const range = (m: Milestone) => (m.to !== undefined && m.to !== m.from ? `${dayLabel(m.from)} – ${m.open ? "…" : dayLabel(m.to)}` : dayLabel(m.from));

function onDay(day: number) {
  const now = ITEMS.filter((m) => day >= m.from && day <= (m.to ?? m.from));
  if (now.length) return { now, next: [] as Item[] };
  const later = ITEMS.filter((m) => m.from > day).sort((a, b) => a.from - b.from);
  return { now: [] as Item[], next: later.filter((m) => m.from === later[0]?.from) };
}

export default function Schedule() {
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [day, setDay] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setLive(true);
      let last = -1;
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=170%",
        pin: true,
        onUpdate: (self) => {
          const d = self.progress * (N - 0.001);
          if (cursorRef.current) cursorRef.current.style.left = pct(d);
          const di = Math.floor(d);
          if (di !== last) {
            last = di;
            setDay(di);
          }
        },
      });
      return () => {
        st.kill();
        setLive(false);
      };
    });
    return () => mm.revert();
  }, []);

  const shownDay = live ? day : N - 1;
  const { now, next } = onDay(day);
  const lit = (m: Milestone) => m.from <= shownDay;

  return (
    <section ref={sectionRef} id="schedule" aria-labelledby="schedule-h" className="relative scroll-mt-0 bg-bg">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-center gap-10 px-6 py-28 md:px-14 lg:h-[100svh] lg:min-h-[680px] lg:gap-[clamp(20px,4vh,44px)] lg:py-0 lg:pt-[84px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
          <div id="schedule-h">
            <SectionHead
              n="02"
              label="Timing diagram"
              title="From registration to the finals"
              sub="Online rounds run through December. Every final is on the KUET campus on 3 and 4 January."
            />
          </div>
          {live && (
            <div className="hidden min-h-[132px] border-l-2 border-orange pl-5 lg:block" aria-live="polite">
              <p className="text-[13px] font-medium text-dim">{now.length ? "On this day" : "Next up"}</p>
              <p className="text-[40px] font-semibold leading-tight tracking-[-0.03em] tabular-nums">{dayLabel(day)}</p>
              <ul className="mt-1 flex flex-col gap-0.5 text-[15px]">
                {(now.length ? now : next).slice(0, 3).map((m, i) => (
                  <li key={i} className="text-soft">
                    <span className="font-semibold text-ink">{events[m.ev].name}</span> · {m.label}
                    {!now.length && <span className="text-dim"> · {dayLabel(m.from)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Desktop diagram */}
        <div className="relative hidden lg:block">
          <div className="grid grid-cols-[210px_minmax(0,1fr)]">
            <span />
            <div className="relative h-9 border-b border-line-2">
              {Array.from({ length: N + 1 }, (_, d) => (
                <span key={d} aria-hidden className="absolute bottom-0 w-px bg-line-2" style={{ left: pct(d), height: AXIS.includes(d) ? 10 : 5 }} />
              ))}
              {AXIS.map((d) => (
                <span key={d} className={`absolute top-0 whitespace-nowrap text-[13px] tabular-nums text-dim ${d === N - 1 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: d === N - 1 ? "100%" : pct(d + 0.5) }}>{dayLabel(d)}</span>
              ))}
            </div>
          </div>

          {events.map((e, i) => (
            <div key={e.slug} className="grid h-[clamp(36px,5.4vh,54px)] grid-cols-[210px_minmax(0,1fr)] items-center border-b border-line">
              <span className={`pr-4 text-[15px] font-semibold transition-colors ${(schedule[e.slug] ?? []).some(lit) ? "text-ink" : "text-muted"}`}>{e.name}</span>
              <div className="relative h-full">
                <span aria-hidden className="absolute inset-x-0 top-[72%] h-px bg-line-2" />
                {(schedule[e.slug] ?? []).map((m, k) => {
                  const on = lit(m);
                  if (m.kind === "deadline") {
                    return (
                      <span key={k} title={`${m.label}, ${dayLabel(m.from)}`} className="absolute top-[22%] h-[50%] w-px transition-colors duration-300" style={{ left: pct(m.from + 1), background: on ? "#ff7a3d" : "#2a2f42" }}>
                        <span className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full border transition-colors duration-300" style={{ borderColor: on ? "#ff7a3d" : "#2a2f42", background: "#06070b" }} />
                      </span>
                    );
                  }
                  const hgt = m.kind === "final" ? "56%" : m.kind === "round" ? "44%" : "34%";
                  const width = pct((m.to ?? m.from) - m.from + 1);
                  return (
                    <span
                      key={k}
                      title={`${m.label}, ${range(m)}`}
                      className="absolute border-x border-t transition-colors duration-300"
                      style={{
                        left: pct(m.from),
                        width,
                        bottom: "28%",
                        height: hgt,
                        borderColor: on ? "#ff7a3d" : "#2a2f42",
                        background: m.kind === "window" ? "transparent" : on ? (m.kind === "final" ? "rgba(255,122,61,0.55)" : "rgba(255,122,61,0.16)") : "rgba(255,255,255,0.02)",
                        maskImage: m.open ? "linear-gradient(90deg,#000 40%,transparent)" : undefined,
                        WebkitMaskImage: m.open ? "linear-gradient(90deg,#000 40%,transparent)" : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Finals band and the cursor sit over the tracks only. */}
          <div aria-hidden className="pointer-events-none absolute bottom-0 left-[210px] right-0 top-0">
            <div className="absolute bottom-0 top-9 bg-orange/[0.05]" style={{ left: pct(26), width: pct(2) }}>
              <span className="absolute right-2 top-1.5 whitespace-nowrap text-[12px] font-medium text-orange">Finals on campus</span>
            </div>
            {live && (
              <div ref={cursorRef} className="absolute bottom-0 top-0 w-px bg-orange shadow-[0_0_14px_rgba(255,122,61,0.9)]" style={{ left: 0 }}>
                <span className="absolute -left-[4px] top-[30px] h-[9px] w-[9px] rotate-45 bg-orange" />
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-6 text-[13px] text-dim">
            <span className="flex items-center gap-2"><span className="h-2.5 w-4 border-x border-t border-orange" />Registration window</span>
            <span className="flex items-center gap-2"><span className="h-3 w-px bg-orange" />Registration closes</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-4 border-x border-t border-orange bg-orange/20" />Online round</span>
            <span className="flex items-center gap-2"><span className="h-3 w-4 bg-orange/60" />Final on campus</span>
          </div>
        </div>

        {/* Phones and tablets: the same milestones as an agenda. */}
        <ol className="flex flex-col lg:hidden">
          {[...ITEMS].sort((a, b) => a.from - b.from || a.ev - b.ev).map((m, i) => (
            <li key={i} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-line py-4">
              <span className={`text-[15px] font-semibold tabular-nums ${m.kind === "final" ? "text-orange" : "text-soft"}`}>{range(m)}</span>
              <span className="flex flex-col">
                <span className="font-semibold">{events[m.ev].name}</span>
                <span className="text-[15px] text-muted">{m.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
