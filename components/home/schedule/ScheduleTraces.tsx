"use client";

import { useRef } from "react";
import { eventHref, events, fest, isExternal, pad2, prizes, schedule } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { useActiveEvent } from "../heroes/variants/useActiveEvent";
import WarmLight from "../heroes/rebrand/WarmLight";
import { KIND_LABEL, dayLabel, detail, range } from "./data";

const REG = (schedule[events[0].slug] ?? []).find((m) => m.kind === "window");

/* S-A — All roads to the finals. Each contest is a trace on the board, running left to right from
   30 November; its registration window, online round and shortlist sit on it as pads at their
   dates. Every trace bends into one lit chip on the right: the finals on campus. The contest in
   focus lights its trace, a signal runs along it into the chip, and the chip's light swings toward
   that pin. */

const FINAL_DAY = 60; // 29 Jan: where traces reach the chip
const X_END = 80; // % of the field where the dated part ends and traces bend into the chip
const N = events.length;
const ROW = 58;
const H = ROW * N;
const CHIP_H = 440;
const CHIP_TOP = (H - CHIP_H) / 2;
const xOf = (d: number) => (Math.min(d, FINAL_DAY) / FINAL_DAY) * X_END;
const rowY = (i: number) => ROW / 2 + ROW * i;
const pinY = (i: number) => CHIP_TOP + CHIP_H * (0.14 + (0.72 * i) / (N - 1));
const TICKS = [0, 16, 32, 43, 53, FINAL_DAY]; // 30 Nov, 16 Dec, 1 Jan, 12 Jan, 22 Jan, 29 Jan

export default function ScheduleTraces() {
  const sec = useRef<HTMLElement>(null);
  const [active, pick] = useActiveEvent(2800);
  const e = events[active];
  const steps = schedule[e.slug] ?? [];
  const final = steps.find((m) => m.kind === "final");
  const prize = prizes[e.slug];

  return (
    <section ref={sec} id="schedule" className="relative scroll-mt-20 overflow-hidden py-20 md:py-36">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-16 px-6 md:px-14">
        <SectionHead n="01" label="Key dates" title="Every road ends on campus" sub={`Registration runs from 30 November to 12 January, and online rounds from 13 to 22 January. Every final is on the KUET campus on 29 and 30 January, with ${fest.prizePool} BDT in prizes.`} />

        {/* Desktop: the board. */}
        <div className="hidden lg:grid lg:grid-cols-[210px_minmax(0,1fr)_340px] lg:gap-0">
          {/* Contest labels, one per trace. */}
          <ul className="relative" style={{ height: H }}>
            {events.map((ev, i) => {
              const on = i === active;
              return (
                <li key={ev.slug} className="absolute right-6 -translate-y-1/2 text-right" style={{ top: rowY(i) }}>
                  <a
                    href={eventHref(ev)}
                    {...(isExternal(ev) ? { target: "_blank", rel: "noreferrer" } : {})}
                    onPointerEnter={() => pick(i)}
                    onPointerLeave={() => pick(-1)}
                    onFocus={() => pick(i)}
                    onBlur={() => pick(-1)}
                    className="flex flex-col items-end"
                  >
                    <span className={`text-[12px] tabular-nums ${on ? "text-orange" : "text-dim"}`}>Pin {pad2(i + 1)} · {ev.kind}</span>
                    <span className={`text-[17px] font-semibold transition-colors duration-300 ${on ? "text-ink" : "text-muted"}`}>{ev.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* The traces and their dated pads. */}
          <div className="relative" style={{ height: H }}>
            {/* Date ticks */}
            {TICKS.map((d) => (
              <span key={d} className="absolute -top-9 -translate-x-1/2 text-[13px] tabular-nums text-dim" style={{ left: `${xOf(d)}%` }}>
                {dayLabel(d)}
              </span>
            ))}
            {TICKS.map((d) => (
              <span key={`t${d}`} aria-hidden className="absolute -top-3 bottom-0 w-px bg-white/[0.05]" style={{ left: `${xOf(d)}%` }} />
            ))}
            <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none">
              {events.map((ev, i) => {
                const d = `M0 ${rowY(i)} H${X_END} L${X_END + 13} ${pinY(i)} H100`;
                const on = i === active;
                return (
                  <g key={ev.slug}>
                    <path d={d} fill="none" stroke={on ? "#ff7a3d" : "rgba(255,255,255,0.13)"} strokeWidth={on ? 1.6 : 1} vectorEffect="non-scaling-stroke" style={{ transition: "stroke 0.3s" }} />
                  </g>
                );
              })}
            </svg>
            {/* The signal on the trace in focus: one runner along its dated part, like the hero's. */}
            <span key={`run${active}`} aria-hidden className="trace-run absolute left-0 z-[1] h-[2px] -translate-y-1/2 overflow-hidden" style={{ top: rowY(active), width: `${X_END}%` }}>
              <i />
            </span>
            {/* Pads */}
            {events.map((ev, i) =>
              (schedule[ev.slug] ?? []).filter((m) => m.kind !== "final").map((m, k) => {
                const on = i === active;
                const span = m.to !== undefined && m.to !== m.from;
                const left = xOf(m.from);
                const width = span ? xOf(m.to!) - left : 0;
                return (
                  <div key={`${ev.slug}${k}`} className="absolute" style={{ top: rowY(i), left: `${left}%`, width: span ? `${width}%` : 0 }}>
                    {span ? (
                      <span className={`absolute inset-x-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full transition-colors duration-300 ${on ? "bg-orange" : "bg-white/20"}`} />
                    ) : (
                      <span className={`absolute left-0 top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-bg transition-colors duration-300 ${on ? "border-orange" : "border-white/30"}`} />
                    )}
                    {on && (
                      <span className={`road-in absolute left-0 whitespace-nowrap text-[12px] tabular-nums text-soft ${k % 2 ? "top-3" : "bottom-3"}`}>
                        {range(m)} · {KIND_LABEL[m.kind]}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>

          {/* The chip: the finals. */}
          <div className="relative" style={{ height: H }}>
            <div className="lidx absolute inset-x-0 rounded-[12px]" style={{ top: CHIP_TOP, height: CHIP_H }}>
              <span className="lx lx-corner lx-tr lx-warm" style={{ width: "170%" }} />
              <WarmLight track={sec} rest={[1, 0]} radius={0.85} lean={0.25} box={[0.65, -0.3, 1.3, 0.35]} />
              <span className="lx lx-rim" />
              <div key={e.slug} className="relative z-[4] flex h-full flex-col justify-between p-6">
                <p className="text-[13px] font-medium text-[#f2e6dc]/75">Finals · on campus</p>
                <div className="road-in flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <span className="lx-ink-warm text-[34px] font-semibold leading-[1] tracking-[-0.04em]">{e.name}</span>
                    <span className="text-[14px] text-[#f2e6dc]/75">{final ? detail(final) || KIND_LABEL.final : e.venue}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-[rgba(255,214,190,0.14)] pt-4">
                    <span className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-[#f2e6dc]/65">Final</span>
                      <span className="whitespace-nowrap text-[28px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-[#fbf1e9]">{final ? range(final) : "29–30 Jan"}</span>
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-[#f2e6dc]/65">Prize pool · BDT</span>
                      <span className="text-[30px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-[#ffb27a]">{prize?.total ? `${prize.total}K` : "TBA"}</span>
                    </span>
                  </div>
                  <span className="text-[13px] tabular-nums text-[#f2e6dc]/70">Team {e.team} · {e.fee} · {e.onsite} onsite · {e.club}</span>
                </div>
              </div>
            </div>
            {/* Pins on the chip's edge. */}
            {events.map((ev, i) => (
              <span key={ev.slug} aria-hidden className={`absolute -left-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full transition-colors duration-300 ${i === active ? "bg-orange shadow-[0_0_10px_rgba(255,122,61,0.8)]" : "bg-white/25"}`} style={{ top: pinY(i) }} />
            ))}
          </div>
        </div>

        {/* Phones and tablets: the finals chip, then one row per contest with its dates in order. */}
        <div className="lidx relative rounded-[14px] lg:hidden">
          <span className="lx lx-corner lx-tr lx-warm" style={{ width: "120%" }} />
          <span className="lx lx-rim" />
          <div className="relative z-[4] flex flex-col gap-1 p-5">
            <span className="text-[13px] font-medium text-[#f2e6dc]/75">Finals · on campus</span>
            <span className="lx-ink-warm text-[52px] font-semibold leading-[0.95] tracking-[-0.05em]">29–30 Jan</span>
            {/* Registration is the same window for every contest, so it is said once here, not on each row. */}
            <span className="mt-4 grid grid-cols-2 gap-4 border-t border-[rgba(255,214,190,0.14)] pt-4">
              <span className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[#f2e6dc]/65">Registration</span>
                <span className="text-[15px] font-semibold tabular-nums text-[#fbf1e9]">{REG ? range(REG) : "Opens 30 Nov"}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[#f2e6dc]/65">Prize pool</span>
                <span className="text-[15px] font-semibold tabular-nums text-[#fbf1e9]">{fest.prizePool} BDT</span>
              </span>
            </span>
          </div>
        </div>
        <ol className="-mt-6 flex flex-col lg:hidden">
          {events.map((ev) => (
            <li key={ev.slug} className="border-t border-line">
              {/* Each row opens its contest's page. */}
              <a href={eventHref(ev)} className="sched-row group flex flex-col gap-1.5 py-4">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.01em] transition-colors group-hover:text-orange">
                    {ev.name}
                    <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" className="shrink-0 text-dim transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-orange"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold tabular-nums">{prizes[ev.slug]?.total ? `${prizes[ev.slug]!.total}K` : "TBA"} <span className="text-[12px] font-medium text-dim">BDT</span></span>
                </span>
                {/* One quiet line: the online round when there is one, then the final. */}
                <span className="text-[14px] tabular-nums text-muted">
                  {(schedule[ev.slug] ?? []).filter((m) => m.kind === "round").map((m) => (
                    <span key="round">Online round {range(m)}<span aria-hidden className="mx-2 text-dim">·</span></span>
                  ))}
                  {(schedule[ev.slug] ?? []).filter((m) => m.kind === "final").map((m) => (
                    <span key="final" className="text-orange">Final {range(m)}</span>
                  ))}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
