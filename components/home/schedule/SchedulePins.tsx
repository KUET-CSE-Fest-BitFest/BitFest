"use client";

import { useRef } from "react";
import { eventHref, events, isExternal, pad2, schedule } from "@/lib/fest";
import { TextLink } from "@/components/ui/Button";
import SectionHead from "../SectionHead";
import { useActiveEvent } from "../heroes/variants/useActiveEvent";
import WarmLight from "../heroes/rebrand/WarmLight";
import { KIND_LABEL, detail, range } from "./data";

/* S-B — Pins and lid. The hero's chip again, opened to one contest: the eight contests are pins with
   leaders running into a large lit lid, and the lid shows the chosen contest's road, date by date.
   Choosing a pin swings the lid's light toward it and sends a signal down its leader. */

const LID_H = 480;
const pinY = (i: number) => LID_H * (0.1 + (0.8 * i) / 7);

export default function SchedulePins() {
  const sec = useRef<HTMLElement>(null);
  const [active, pick] = useActiveEvent(3000);
  const e = events[active];
  const steps = schedule[e.slug] ?? [];

  const Lid = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`lidx relative rounded-[14px] ${className}`} style={style}>
      <span className="lx lx-corner lx-bl lx-warm" />
      <WarmLight track={sec} rest={[0, 1]} radius={0.9} lean={0.3} box={[-0.4, 0.62, 1.2, 1.3]} focus={[-0.35, pinY(active) / LID_H]} />
      <span className="lx lx-rim" />
      <div key={e.slug} className="relative z-[4] flex h-full flex-col gap-8 p-6 md:p-9">
        <div className="road-in flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium tabular-nums text-[#f2e6dc]/75">Pin {pad2(active + 1)} · {e.kind}</span>
            <span className="lx-ink-warm text-[clamp(34px,3.6vw,54px)] font-semibold leading-[0.95] tracking-[-0.045em]">{e.name}</span>
          </div>
          <TextLink href={eventHref(e)} external={isExternal(e)} className="hidden shrink-0 text-[15px] sm:inline-flex">Open contest</TextLink>
        </div>
        <ol className="flex flex-1 flex-col justify-center gap-5">
          {steps.map((m, k) => {
            const fin = m.kind === "final";
            return (
              <li key={k} className="road-in grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] items-baseline gap-5 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)] md:grid-cols-[minmax(0,190px)_minmax(0,1fr)]" style={{ animationDelay: `${90 + k * 80}ms` }}>
                <span className={`text-[clamp(22px,2.2vw,32px)] font-semibold leading-none tracking-[-0.03em] tabular-nums ${fin ? "text-[#ffd9b8]" : "text-[#fbf1e9]"}`}>{range(m)}</span>
                <span className="flex flex-col gap-0.5">
                  <span className={`text-[13px] font-medium ${fin ? "text-[#ffb27a]" : "text-[#f2e6dc]/70"}`}>{KIND_LABEL[m.kind]}</span>
                  {detail(m) && <span className="text-[16px] text-[#fbf1e9]/90">{detail(m)}</span>}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="road-in text-[14px] text-[#f2e6dc]/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]" style={{ animationDelay: "320ms" }}>
          Prize pool <span className="font-semibold text-[#fbf1e9]">{e.pool === "TBA" ? "to be announced" : `${e.pool} BDT`}</span> · {e.venue}
        </p>
      </div>
    </div>
  );

  return (
    <section ref={sec} id="schedule" className="relative scroll-mt-20 overflow-hidden py-28 md:py-36">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-14 px-6 md:px-14">
        <SectionHead n="02" label="Key dates" title="Your road to the finals" sub="Every contest keeps its own dates. Pick a pin." />

        {/* Desktop: pins, leaders, lid. */}
        <div className="hidden lg:grid lg:grid-cols-[230px_minmax(60px,1fr)_minmax(0,660px)]">
          <ul className="relative" style={{ height: LID_H }}>
            {events.map((ev, i) => {
              const on = i === active;
              return (
                <li key={ev.slug} className="absolute right-5 -translate-y-1/2 text-right" style={{ top: pinY(i) }}>
                  <button
                    type="button"
                    onPointerEnter={() => pick(i)}
                    onPointerLeave={() => pick(-1)}
                    onFocus={() => pick(i)}
                    onBlur={() => pick(-1)}
                    onClick={() => pick(i)}
                    className="flex flex-col items-end"
                  >
                    <span className={`text-[12px] tabular-nums ${on ? "text-orange" : "text-dim"}`}>Pin {pad2(i + 1)} · {ev.kind}</span>
                    <span className={`text-[17px] font-semibold transition-colors duration-300 ${on ? "text-ink" : "text-muted hover:text-soft"}`}>{ev.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div aria-hidden className="relative" style={{ height: LID_H }}>
            {events.map((ev, i) => {
              const on = i === active;
              return (
                <span key={ev.slug} className={`absolute inset-x-0 h-px -translate-y-1/2 transition-colors duration-300 ${on ? "bg-orange" : "bg-white/15"}`} style={{ top: pinY(i) }}>
                  <span className={`absolute -left-[2px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full ${on ? "bg-orange shadow-[0_0_10px_rgba(255,122,61,0.8)]" : "bg-white/30"}`} />
                  {on && <span key={`s${active}`} className="absolute inset-x-0 -inset-y-[1px] overflow-hidden"><span className="pin-sig" /></span>}
                </span>
              );
            })}
          </div>
          <Lid style={{ height: LID_H }} />
        </div>

        {/* Phones and tablets: pick from a row of pins, the lid below. */}
        <div className="flex flex-col gap-5 lg:hidden">
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:-mx-14 md:px-14">
            {events.map((ev, i) => (
              <button
                key={ev.slug}
                type="button"
                onClick={() => pick(i)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${i === active ? "border-orange text-ink" : "border-line-2 text-muted"}`}
              >
                {ev.name}
              </button>
            ))}
          </div>
          <Lid className="min-h-[420px]" />
        </div>
      </div>
    </section>
  );
}
