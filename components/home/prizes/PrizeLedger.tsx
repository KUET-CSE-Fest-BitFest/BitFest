"use client";

import { useEffect, useRef, useState } from "react";
import { pad2 } from "@/lib/fest";
import SectionHead from "../SectionHead";
import { ROWS } from "./data";

/* P1 — Ledger. The prize money as one clean table. The total counts up when the section arrives;
   hovering a row opens its extra awards. */

function useCountUp(to: number, ms = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let t0 = -1;
      const step = (t: number) => {
        if (t0 < 0) t0 = t;
        const k = Math.min(1, (t - t0) / ms);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, ms]);
  return [ref, v] as const;
}

export default function PrizeLedger() {
  const [open, setOpen] = useState(-1);
  const [ref, total] = useCountUp(550);
  const cols = "grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.6fr))_minmax(0,0.7fr)]";

  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead n="03" label="Prize pool" title="Prizes in every contest" sub="Champion and runner-up prizes in all eight, with extra awards in IUPC, the Hackathon and the Datathon." />
          <p className="flex flex-col gap-2">
            <span ref={ref} className="text-[clamp(84px,10vw,156px)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums">{total}K+</span>
            <span className="text-lg text-soft">BDT across the fest</span>
          </p>
        </div>

        <div className="self-end">
          <div className={`grid ${cols} gap-4 border-b border-line-2 pb-3 text-[13px] font-medium text-dim`}>
            <span>Contest</span>
            <span className="text-right">Champion</span>
            <span className="text-right">1st runner-up</span>
            <span className="text-right">2nd runner-up</span>
            <span className="text-right">Pool</span>
          </div>
          <ul>
            {ROWS.map(({ i, e, p }) => {
              const on = open === i;
              return (
                <li key={e.slug} data-reveal onPointerEnter={() => setOpen(i)} onPointerLeave={() => setOpen(-1)} className="border-b border-line">
                  <div className={`grid ${cols} items-baseline gap-4 py-4 transition-colors ${on ? "text-ink" : "text-soft"}`}>
                    <span className="flex items-baseline gap-3">
                      <span className={`text-[13px] tabular-nums ${on ? "text-orange" : "text-dim"}`}>{pad2(i + 1)}</span>
                      <span className="text-[17px] font-semibold text-ink">{e.name}</span>
                    </span>
                    {p.top ? p.top.map((v, k) => <span key={k} className="text-right text-[17px] tabular-nums">{v}K</span>) : <span className="col-span-3 text-right text-[15px] text-muted">To be announced</span>}
                    <span className={`text-right text-[19px] font-semibold tabular-nums ${on ? "text-orange" : "text-ink"}`}>{p.total ? `${p.total}K+` : "TBA"}</span>
                  </div>
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${on && p.extra ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden pl-9 text-[14px] text-muted"><span className="block pb-4">Also: {p.extra}</span></p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[13px] text-dim">All amounts in BDT. Hover a contest to see its extra awards.</p>
        </div>
      </div>
    </section>
  );
}
