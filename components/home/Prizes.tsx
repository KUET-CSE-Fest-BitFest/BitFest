"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { events, prizes } from "@/lib/fest";
import SectionHead from "./SectionHead";

gsap.registerPlugin(ScrollTrigger);

/* 03 · Prize pool — one LED bar meter per contest, 5K BDT a segment.
   On arrival the meters charge segment by segment while the total counts up. */

const UNIT = 5;
const SEGS = 28;

export default function Prizes() {
  const rootRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = [...root.querySelectorAll<HTMLElement>("[data-meter]")];
    const ctx = gsap.context(() => {
      rows.forEach((r) => gsap.set(r.querySelectorAll("[data-lit]"), { opacity: 0.12 }));
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } });
      rows.forEach((r, i) => {
        tl.to(r.querySelectorAll("[data-lit]"), { opacity: 1, duration: 0.05, stagger: 0.035, ease: "none" }, i * 0.12);
      });
      const n = { v: 0 };
      tl.to(n, {
        v: 550,
        duration: tl.duration(),
        ease: "power1.out",
        onUpdate: () => {
          if (totalRef.current) totalRef.current.textContent = `${Math.round(n.v)}K+`;
        },
      }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="prizes" aria-labelledby="prizes-h" className="relative scroll-mt-20 py-28 md:py-36">
      <div ref={rootRef} className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <div id="prizes-h">
            <SectionHead
              n="03"
              label="Prize pool"
              title="Prizes in every contest"
              sub="Champion and runner-up prizes in all eight, with extra awards in IUPC, the Hackathon and the Datathon."
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[clamp(84px,11vw,168px)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums">
              <span ref={totalRef}>550K+</span>
            </span>
            <span className="text-lg text-soft">BDT across the fest. Gaming Contest prizes are still to be announced.</span>
          </div>
        </div>

        <ul className="flex flex-col self-end">
          {events.map((e) => {
            const p = prizes[e.slug];
            const lit = p.total ? Math.round(p.total / UNIT) : 0;
            return (
              <li key={e.slug} data-meter className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-3 border-b border-line py-5 md:grid-cols-[200px_minmax(0,1fr)_72px] md:items-center">
                <span className="flex flex-col">
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-[13px] text-dim">
                    {p.top ? `${p.top[0]}K · ${p.top[1]}K · ${p.top[2]}K${p.extra ? " + more" : ""}` : "To be announced"}
                  </span>
                </span>
                <span aria-hidden className="col-span-2 flex h-4 gap-[3px] md:col-span-1">
                  {Array.from({ length: SEGS }, (_, k) =>
                    k < lit ? (
                      <span key={k} data-lit className="flex-1 bg-orange shadow-[0_0_8px_rgba(255,122,61,0.45)]" />
                    ) : (
                      <span key={k} className={`flex-1 ${p.total ? "bg-line" : "border border-dashed border-line-2"}`} />
                    ),
                  )}
                </span>
                <span className="col-start-2 row-start-1 text-right text-lg font-semibold tabular-nums md:col-start-auto md:row-start-auto">
                  {p.total ? `${p.total}K+` : <span className="text-[15px] font-medium text-muted">TBA</span>}
                </span>
              </li>
            );
          })}
          <li className="pt-4 text-[13px] text-dim">One segment is 5K BDT. Champion · 1st · 2nd runner-up shown under each contest.</li>
        </ul>
      </div>
    </section>
  );
}
