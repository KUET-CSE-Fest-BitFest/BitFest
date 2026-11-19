"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHead from "@/components/ui/SectionHead";
import { useCountUp, useInView } from "@/lib/hooks";
import type { EventPage } from "@/lib/eventPages";
import { PRIZES_ANNOUNCED } from "@/lib/fest";

gsap.registerPlugin(ScrollTrigger);

/* 02 · Prize money. Once the rulebook gives the split, a podium of three lids: 1st runner-up, the
   champion (tallest, lit from its top-right corner) and 2nd runner-up. Until then, one wide lit lid
   with the contest's total. On arrival the lids rise in, the amounts count up and the light swells. */

const PLACES = ["Champion", "1st runner-up", "2nd runner-up"];

function Total({ total, active }: { total: number; active: boolean }) {
  // "??" until prizes are announced (the count-up shows text as it is).
  const v = useCountUp(PRIZES_ANNOUNCED ? `${total}K` : "??", active, 1400);
  return (
    <li data-lid className="lidx relative flex min-h-[300px] flex-col justify-between gap-12 rounded-[18px] p-7 md:col-span-3 md:min-h-[360px] md:p-10">
      <span className="podium-light lx lx-corner lx-tr lx-warm" style={{ width: "58%" }} />
      <span className="lx lx-rim" />
      <span className="relative z-[4] text-[13px] font-medium text-[#f2e6dc]/80">Total prize money</span>
      <div className="relative z-[4] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <span className="lx-ink-warm font-semibold leading-none tracking-[-0.05em] tabular-nums text-[clamp(72px,11vw,168px)]">
          {v}
          <span className="ml-3 text-xl font-medium tracking-normal text-muted">BDT</span>
        </span>
        <span className="max-w-[300px] text-[15px] leading-relaxed text-[#f2e6dc]/70 md:text-right">{PRIZES_ANNOUNCED ? "In cash. How it splits between the places comes with the rulebook." : "In cash. The amount is announced with the rulebook."}</span>
      </div>
    </li>
  );
}

function Lid({ i, amount, active }: { i: number; amount: number; active: boolean }) {
  const v = useCountUp(PRIZES_ANNOUNCED ? `${amount}K` : "??", active, 1200);
  const champ = i === 0;
  return (
    <li
      data-lid
      className={`lidx relative flex flex-col justify-between gap-12 rounded-[18px] p-7 ${champ ? "min-h-[260px] md:order-2 md:h-[440px]" : i === 1 ? "min-h-[200px] md:order-1 md:h-[360px]" : "min-h-[200px] md:order-3 md:h-[320px]"}`}
    >
      {champ && <span className="podium-light lx lx-corner lx-tr lx-warm" style={{ width: "110%" }} />}
      <span className="lx lx-rim" />
      <div className="relative z-[4] flex items-center justify-between">
        <span className={`text-[13px] font-medium tabular-nums ${champ ? "text-[#f2e6dc]/80" : "text-dim"}`}>0{i + 1}</span>
        {champ && <span className="text-[13px] font-medium text-[#fbf1e9]">Top prize</span>}
      </div>
      <div className="relative z-[4] flex flex-col gap-2">
        <span className={`text-[18px] font-semibold ${champ ? "text-[#fbf1e9]" : "text-soft"}`}>{PLACES[i]}</span>
        <span className={`font-semibold leading-none tracking-[-0.05em] tabular-nums ${champ ? "lx-ink-warm text-[clamp(64px,7vw,104px)]" : "text-[clamp(44px,4.4vw,64px)]"}`}>
          {v}
          <span className="ml-2 text-lg font-medium tracking-normal text-muted">BDT</span>
        </span>
      </div>
    </li>
  );
}

export default function EventPrizes({ page }: { page: EventPage }) {
  const [ref, inView] = useInView<HTMLOListElement>("-120px");
  const listRef = useRef<HTMLOListElement | null>(null);
  // Latched: once the podium has arrived it stays arrived. Following inView both ways made the light
  // shrink and swell again whenever the list sat near the edge of the screen, which read as flicker.
  const [arrived, setArrived] = useState(false);
  useEffect(() => { if (inView) setArrived(true); }, [inView]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(list.querySelectorAll("[data-lid]"), {
        y: 90, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.14,
        scrollTrigger: { trigger: list, start: "top 82%", once: true },
      });
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <section id="prizes" className="relative scroll-mt-20 overflow-hidden py-20 md:py-36">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-16 px-6 md:px-14">
        <SectionHead n="02" eyebrow="Prize money" title={page.prizes.places && PRIZES_ANNOUNCED ? `BDT ${page.prizes.total},000 in prizes` : "Cash prizes for the best teams"} sub={page.prizes.note} />
        <ol
          ref={(el) => { ref.current = el; listRef.current = el; }}
          data-in={arrived}
          className="podium grid gap-4 md:grid-cols-3 md:items-end"
        >
          {page.prizes.places
            ? page.prizes.places.map((amount, i) => <Lid key={i} i={i} amount={amount} active={arrived} />)
            : <Total total={page.prizes.total} active={arrived} />}
        </ol>
      </div>
    </section>
  );
}
