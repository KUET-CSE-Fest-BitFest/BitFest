"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { eventHref, events, isExternal, pad2 } from "@/lib/fest";
import SectionHead from "./SectionHead";

gsap.registerPlugin(ScrollTrigger);

/* 01 · Pin descriptions — the eight events as a datasheet table.
   On arrival a scan line runs down the table and each row switches on as it passes. */

const COLS = "lg:grid-cols-[64px_minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,0.7fr)_28px]";

export default function Events() {
  const listRef = useRef<HTMLUListElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current, scan = scanRef.current;
    if (!list || !scan) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = list.querySelectorAll<HTMLElement>("[data-row]");
    const ctx = gsap.context(() => {
      gsap.set(rows, { opacity: 0.08 });
      gsap.set(scan, { top: 0, opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: "top 75%", once: true } });
      tl.to(scan, { opacity: 1, duration: 0.15 })
        .to(scan, { top: "100%", duration: 1.3, ease: "none" }, "<")
        .to(rows, { opacity: 1, duration: 0.35, stagger: 1.3 / rows.length, ease: "power2.out" }, "<0.05")
        .to(scan, { opacity: 0, duration: 0.3 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="events" aria-labelledby="events-h" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <div id="events-h">
          <SectionHead
            n="01"
            label="Pin descriptions"
            title="Eight contests. One campus."
            sub="Programming, robotics, data, games and business. Each contest has its own rules, rounds and prizes; open one to read the rulebook and register."
          />
        </div>

        <div className="relative mt-14">
          <div className={`hidden gap-6 border-b border-line-2 pb-3 text-[13px] font-medium text-dim lg:grid ${COLS}`}>
            <span>Pin</span>
            <span>Contest</span>
            <span>Field</span>
            <span>Final</span>
            <span>Venue</span>
            <span className="text-right">Prize pool</span>
            <span />
          </div>
          <div className="relative">
          <div ref={scanRef} aria-hidden className="pointer-events-none absolute inset-x-0 z-10 h-[2px] bg-orange opacity-0 shadow-[0_0_18px_rgba(255,122,61,0.9)]" />
          <ul ref={listRef}>
            {events.map((e, i) => {
              const ext = isExternal(e);
              return (
                <li key={e.slug} data-row>
                  <a
                    href={eventHref(e)}
                    {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}
                    className={`group relative grid grid-cols-[44px_minmax(0,1fr)_24px] items-baseline gap-x-4 gap-y-1 border-b border-line py-6 transition-colors hover:bg-white/[0.025] lg:items-center lg:gap-6 lg:py-7 ${COLS}`}
                  >
                    <span className="text-[15px] font-medium tabular-nums text-dim transition-colors group-hover:text-orange">{pad2(i + 1)}</span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[clamp(22px,2.2vw,30px)] font-semibold leading-tight tracking-[-0.02em]">{e.name}</span>
                      <span className="text-[15px] text-muted">{e.line}</span>
                    </span>
                    <span className="col-start-2 text-[15px] text-soft lg:col-start-auto">{e.kind}</span>
                    <span className="col-start-2 text-[15px] tabular-nums text-soft lg:col-start-auto">
                      <span className="text-dim lg:hidden">Final </span>{e.day}
                    </span>
                    <span className="col-start-2 text-[15px] text-muted lg:col-start-auto">{e.venue}</span>
                    <span className="col-start-2 text-[15px] font-semibold tabular-nums lg:col-start-auto lg:text-right lg:text-lg">
                      {e.pool === "TBA" ? <span className="text-muted">Prizes TBA</span> : <>{e.pool} <span className="text-[13px] font-medium text-dim">BDT</span></>}
                    </span>
                    <span aria-hidden className="col-start-3 row-start-1 text-right text-lg text-dim transition group-hover:translate-x-0.5 group-hover:text-orange lg:col-start-auto lg:row-start-auto">
                      {ext ? "↗" : "→"}
                    </span>
                    {/* A trace runs along the row on hover. */}
                    <span aria-hidden className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-orange transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  </a>
                </li>
              );
            })}
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
