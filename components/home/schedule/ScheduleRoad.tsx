"use client";

import { eventHref, isExternal, pad2, schedule } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { useActiveEvent } from "../heroes/variants/useActiveEvent";
import { KIND_LABEL, detail, events, range } from "./data";

/* T2 — Your contest. Pick a contest and its own road appears as a few big steps:
   registration, online round, final and where it happens. The section sits on a dark lid-like panel
   with a soft warm light coming in from its bottom-left corner (static gradient; it only breathes). */

export default function ScheduleRoad() {
  const [active, pick] = useActiveEvent(3200);
  const e = events[active];
  const steps = schedule[e.slug] ?? [];

  return (
    <section id="schedule" className="relative scroll-mt-20 px-3 py-14 md:px-4 md:py-20">
      <div className="lidx relative mx-auto max-w-[1408px] rounded-[24px] md:rounded-[32px]">
        <span className="lx lx-corner lx-bl lx-warm lx-breathe road-light" />
        <span className="lx lx-rim" />
      <div className="relative z-[4] grid gap-14 px-5 py-14 md:px-10 md:py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead n="02" label="Key dates" title="Your road to the finals" sub="Every contest keeps its own dates. Pick yours." />
          <ul className="flex flex-col">
            {events.map((ev, i) => {
              const on = active === i;
              const final = (schedule[ev.slug] ?? []).find((m) => m.kind === "final");
              return (
                <li key={ev.slug}>
                  <button
                    type="button"
                    onPointerEnter={() => pick(i)}
                    onPointerLeave={() => pick(-1)}
                    onFocus={() => pick(i)}
                    onBlur={() => pick(-1)}
                    onClick={() => pick(i)}
                    className="group flex w-full items-baseline justify-between gap-4 border-b border-line py-3 text-left"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className={`text-[13px] tabular-nums transition-colors ${on ? "text-orange" : "text-dim"}`}>{pad2(i + 1)}</span>
                      <span className={`text-[17px] font-semibold transition-colors ${on ? "text-ink" : "text-muted group-hover:text-soft"}`}>{ev.name}</span>
                    </span>
                    <span className={`text-[14px] tabular-nums transition-colors ${on ? "text-orange" : "text-dim"}`}>{final ? range(final) : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div key={e.slug} className="flex flex-col gap-10 self-center" aria-live="polite">
          <div className="road-in flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-orange">{pad2(active + 1)} · {e.kind}</span>
              <span className="text-[clamp(34px,4.4vw,64px)] font-semibold leading-none tracking-[-0.04em]">{e.name}</span>
            </div>
            <a href={eventHref(e)} {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})} className="text-[15px] font-semibold underline decoration-line-2 decoration-2 underline-offset-[7px] transition hover:decoration-orange">
              Open contest {isExternal(e) ? "↗" : "→"}
            </a>
          </div>
          <ol className="relative flex flex-col">
            <span aria-hidden className="absolute bottom-6 left-[7px] top-6 w-px bg-line-2" />
            {steps.map((m, k) => {
              const final = m.kind === "final";
              return (
                <li key={k} className="road-in relative grid grid-cols-[32px_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 py-5 sm:grid-cols-[32px_minmax(0,200px)_minmax(0,1fr)] lg:grid-cols-[32px_minmax(0,230px)_minmax(0,1fr)]" style={{ animationDelay: `${80 + k * 90}ms` }}>
                  <span className={`relative z-10 mt-2 h-[15px] w-[15px] rounded-full border-2 ${final ? "border-orange bg-orange" : "border-line-2 bg-bg"}`} />
                  <span className={`text-[clamp(22px,2vw,30px)] font-semibold leading-none tracking-[-0.03em] tabular-nums ${final ? "text-orange" : ""}`}>{range(m)}</span>
                  <span className="col-start-2 flex flex-col gap-1 sm:col-start-auto">
                    <span className={`text-[13px] font-medium ${final ? "text-orange" : "text-dim"}`}>{KIND_LABEL[m.kind]}</span>
                    {detail(m) && <span className="text-[17px] text-soft">{detail(m)}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="road-in border-t border-line pt-5 text-[15px] text-muted" style={{ animationDelay: "380ms" }}>
            Prize pool <span className="font-semibold text-ink">{e.pool === "TBA" ? "to be announced" : `${e.pool} BDT`}</span> · Venue <span className="font-semibold text-ink">{e.venue}</span>
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
