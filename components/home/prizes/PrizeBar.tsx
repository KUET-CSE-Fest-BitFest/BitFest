"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pad2 } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { useActiveEvent } from "../heroes/variants/useActiveEvent";
import { PLACES, ROWS } from "./data";

gsap.registerPlugin(ScrollTrigger);

/* P2 — One bar. The whole 550K+ as a single bar, split by each contest's share. The bar builds
   itself from the left on arrival; the lit share is described in large type underneath. */

export default function PrizeBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const [active, pick] = useActiveEvent(3000);
  const row = ROWS[active];

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(bar.children, {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: bar, start: "top 80%", once: true },
      });
    }, bar);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 md:px-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHead n="03" label="Prize pool" title="Prizes in every contest" sub="Every contest has champion and runner-up prizes. Point at a share to see how it splits." />
          <p className="flex flex-col items-start gap-1 lg:items-end">
            <span className="text-[clamp(72px,8vw,128px)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums">550K+</span>
            <span className="text-[15px] text-muted">BDT across the fest</span>
          </p>
        </div>

        <div>
          <div ref={barRef} className="flex h-[clamp(56px,7vw,96px)] gap-[3px]">
            {ROWS.map(({ i, e, p }) => {
              const on = active === i;
              return (
                <button
                  key={e.slug}
                  type="button"
                  aria-label={`${e.name}: ${p.total ? `${p.total}K+ BDT` : "prizes to be announced"}`}
                  onPointerEnter={() => pick(i)}
                  onPointerLeave={() => pick(-1)}
                  onFocus={() => pick(i)}
                  onBlur={() => pick(-1)}
                  className={`relative h-full transition-colors duration-300 ${p.total ? (on ? "bg-orange" : i % 2 ? "bg-[#1b1f2a]" : "bg-[#222735]") : on ? "border border-dashed border-orange" : "border border-dashed border-line-2"}`}
                  style={{ flexGrow: p.total ?? 22, flexBasis: 0 }}
                >
                  <span className={`absolute bottom-2 left-2 text-[12px] font-medium tabular-nums transition-colors ${on ? (p.total ? "text-[#120802]" : "text-orange") : "text-dim"}`}>{pad2(i + 1)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[12px] tabular-nums text-dim">
            <span>0</span>
            <span>550K+ BDT</span>
          </div>
        </div>

        <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end" aria-live="polite">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] tabular-nums text-orange">{pad2(active + 1)} · {row.e.kind}</span>
            <span className="text-[clamp(32px,3.6vw,52px)] font-semibold leading-tight tracking-[-0.03em]">{row.e.name}</span>
          </div>
          <span className="text-[clamp(48px,5.4vw,84px)] font-semibold leading-none tracking-[-0.04em] tabular-nums">{row.p.total ? `${row.p.total}K+` : "TBA"}</span>
          <dl className="grid grid-cols-3 gap-4 md:justify-self-end">
            {PLACES.map((pl, k) => (
              <div key={pl} className="flex flex-col gap-1">
                <dt className="text-[13px] text-dim">{pl}</dt>
                <dd className="text-xl font-semibold tabular-nums">{row.p.top ? `${row.p.top[k]}K` : "—"}</dd>
              </div>
            ))}
            <p className="col-span-3 text-[13px] text-muted">{row.p.extra ? `Also: ${row.p.extra}` : row.p.top ? " " : "Gaming Contest prizes are still to be announced."}</p>
          </dl>
        </div>
      </div>
    </section>
  );
}
