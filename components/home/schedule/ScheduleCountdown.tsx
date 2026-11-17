"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "../SectionHead";
import { ITEMS, KEY_DAYS, KIND_LABEL, dayLabel, detail, events, range } from "./data";

/* T4 — Countdown. The page scrolls normally; a large date stays beside the list and turns over
   as each date reaches the middle of the screen, with the days left to the finals under it. */

const FINALS_DAY = Math.min(...ITEMS.filter((m) => m.kind === "final").map((m) => m.from));
const LAST = KEY_DAYS[KEY_DAYS.length - 1];
const GROUPS = KEY_DAYS.map((d) => ({ d, items: ITEMS.filter((m) => m.from === d) }));

function note(d: number) {
  if (d < FINALS_DAY) {
    const n = FINALS_DAY - d;
    return `${n} ${n === 1 ? "day" : "days"} to the finals`;
  }
  if (d === FINALS_DAY) return "Finals, day one";
  if (d === FINALS_DAY + 1) return "Finals, day two";
  return "Results";
}

export default function ScheduleCountdown() {
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCur(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const g = GROUPS[cur];
  const final = g.d >= FINALS_DAY;
  const [day, month] = dayLabel(g.d).split(" ");

  return (
    <section id="schedule" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 md:px-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
          <SectionHead n="02" label="Key dates" title="The run-up to the finals" />
          <div className="mt-12 hidden flex-col gap-4 lg:flex" aria-live="polite">
            <p key={g.d} className="road-in flex items-baseline gap-4">
              <span className={`text-[clamp(120px,13vw,200px)] font-semibold leading-[0.8] tracking-[-0.06em] tabular-nums ${final ? "text-orange" : ""}`}>{day}</span>
              <span className="text-[clamp(28px,2.6vw,40px)] font-semibold tracking-[-0.03em] text-muted">{month}</span>
            </p>
            <p className="text-lg text-soft">{note(g.d)}</p>
            <div className="mt-4 h-[3px] w-full max-w-[420px] bg-line-2">
              <div className="h-full origin-left bg-orange transition-transform duration-500 ease-out" style={{ transform: `scaleX(${(g.d + 1) / (LAST + 1)})` }} />
            </div>
            <p className="flex max-w-[420px] justify-between text-[13px] tabular-nums text-dim">
              <span>{dayLabel(0)}</span>
              <span>{dayLabel(LAST)}</span>
            </p>
          </div>
        </div>

        <ol className="flex flex-col lg:py-[30svh]">
          {GROUPS.map((grp, i) => {
            const on = i === cur;
            const isFinal = grp.d >= FINALS_DAY;
            return (
              <li
                key={grp.d}
                ref={(el) => { refs.current[i] = el; }}
                data-i={i}
                className={`grid grid-cols-[92px_minmax(0,1fr)] gap-5 border-t border-line py-7 transition-opacity duration-500 lg:opacity-[var(--o)]`}
                style={{ ["--o" as string]: on ? 1 : 0.38 }}
              >
                <span className={`text-[22px] font-semibold tracking-[-0.02em] tabular-nums ${isFinal ? "text-orange" : ""}`}>{dayLabel(grp.d)}</span>
                <ul className="flex flex-col gap-3">
                  {grp.items.map((m, k) => (
                    <li key={k} className="flex flex-col gap-0.5">
                      <span className="text-[18px] font-semibold">{events[m.ev].name}</span>
                      <span className="text-[15px] text-muted">
                        <span className={m.kind === "deadline" || m.kind === "final" ? "text-orange" : ""}>{KIND_LABEL[m.kind]}</span>
                        {[m.to !== undefined && m.to !== m.from ? range(m) : "", detail(m)].filter(Boolean).map((x) => ` · ${x}`).join("")}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
