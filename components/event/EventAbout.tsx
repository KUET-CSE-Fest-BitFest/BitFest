"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import SectionHead from "@/components/ui/SectionHead";
import { hasRulebook, type EventPage } from "@/lib/eventPages";
import RegisterButton from "./RegisterButton";

gsap.registerPlugin(ScrollTrigger);

/* 01 · About the contest, with its timeline. The description stays put on the left while the
   timeline on the right draws itself as you scroll, in the hero's signal language: a lit trace grows
   down the track (plum behind, orange at the head) carrying a comet-like signal; each stage's pad
   ignites as the signal reaches it (an ember core, a ring that pulses out once, a short leader to its
   text), and stages ahead stay dim until reached. Everything moves by transform and opacity. */

const PAD = 13; // a stage's pad centre, from the top of the stage

export default function EventAbout({ page }: { page: EventPage }) {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current, fill = fillRef.current, head = headRef.current, track = trackRef.current;
    if (!list || !fill || !head || !track) return;
    const items = [...list.querySelectorAll<HTMLLIElement>(":scope > li")];
    // Pad centres, measured on resize only (never read while scrolling).
    let tops: number[] = [], end = 0;
    const measure = () => {
      tops = items.map((li) => li.offsetTop + PAD);
      end = tops[tops.length - 1];
      const len = `${Math.max(0, end - PAD)}px`;
      track.style.height = len;
      fill.style.height = len;
    };
    let lastP = 0;
    const light = (p: number) => {
      lastP = p;
      const y = PAD + p * (end - PAD);
      let cur = -1;
      items.forEach((li, i) => {
        const on = y >= tops[i] - 1;
        if (on) cur = i;
        if (li.dataset.on !== String(on)) li.dataset.on = String(on);
      });
      items.forEach((li, i) => {
        const c = String(i === cur && p > 0.001 && p < 0.999);
        if (li.dataset.current !== c) li.dataset.current = c;
      });
      head.style.transform = `translateY(${y}px)`;
      head.style.opacity = p > 0.003 && p < 0.997 ? "1" : "0";
    };
    measure();
    const ro = new ResizeObserver(() => { measure(); light(lastP); });
    ro.observe(list);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.transform = "scaleY(1)";
      light(1);
      return () => ro.disconnect();
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 62%", scrub: 0.6, onUpdate: (st) => light(st.progress) },
      });
      items.forEach((li) => {
        gsap.from(li.querySelector("[data-body]"), {
          opacity: 0, x: 32, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: li, start: "top 88%", once: true },
        });
      });
    }, list);
    return () => { ctx.revert(); ro.disconnect(); };
  }, []);

  return (
    <section id="about" className="relative scroll-mt-20 overflow-x-clip py-20 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-20 px-6 md:px-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24">
        <div className="flex flex-col gap-10 lg:sticky lg:top-28 lg:self-start">
          <SectionHead n="01" eyebrow="About the contest" title={page.points.map((p) => p.t).join(". ") + "."} />
          <p data-reveal className="max-w-[560px] text-xl leading-relaxed text-soft">{page.about}</p>
          <ol className="flex flex-col">
            {page.points.map((p, i) => (
              <li key={p.t} data-reveal className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-t border-line py-5 last:border-b">
                <span className="text-[13px] font-medium tabular-nums text-orange">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-xl font-semibold tracking-[-0.02em]">{p.t}</span>
                  <span className="text-soft">{p.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <dl data-reveal className="lidx relative grid grid-cols-2 rounded-[16px]">
            <span className="lx lx-corner lx-tr lx-warm" style={{ width: "120%", opacity: 0.55 }} />
            <span className="lx lx-rim" />
            {page.facts.map((f, i) => (
              <div key={f.k} className={`relative z-[4] flex flex-col gap-1 p-5 ${i % 2 ? "border-l border-[rgba(255,214,190,0.1)]" : ""} ${i > 1 ? "border-t border-[rgba(255,214,190,0.1)]" : ""}`}>
                <dt className="text-[13px] font-medium text-[#f2e6dc]/65">{f.k}</dt>
                <dd className="text-[18px] font-semibold tracking-[-0.01em] text-[#fbf1e9]">{f.v}</dd>
              </div>
            ))}
          </dl>
          <div data-reveal className="flex flex-wrap gap-3">
            <RegisterButton href={page.registerHref} />
            {hasRulebook(page.rulebookHref) && <Button href={page.rulebookHref} variant="ghost">Read the rulebook</Button>}
          </div>
        </div>

        <div id="timeline" className="scroll-mt-28">
          <p data-reveal className="text-[15px] font-medium text-muted">Timeline</p>
          <h3 data-reveal className="mt-3 text-[clamp(32px,3.4vw,48px)] font-semibold leading-[1] tracking-[-0.035em]">Road to the final</h3>
          <ol ref={listRef} className="event-timeline relative mt-12">
            {/* The track runs from the first pad to the last; the lit part warms from plum to orange at the head. */}
            <span ref={trackRef} aria-hidden className="absolute left-[8px] w-[2px] rounded-full bg-[rgba(255,214,190,0.09)]" style={{ top: PAD }} />
            <span ref={fillRef} aria-hidden className="tl-fill absolute left-[8px] w-[2px] origin-top rounded-full" style={{ top: PAD, transform: "scaleY(0)" }} />
            <span ref={headRef} aria-hidden className="tl-head absolute left-[9px] top-0 opacity-0"><i className="tl-tail" /><b className="tl-core" /></span>
            {page.timeline.map((t, i) => (
              <li key={t.t} data-on="false" data-current="false" className="relative pb-14 pl-14 last:pb-0">
                <span aria-hidden className="tl-pad absolute left-0 top-[4px] grid h-[18px] w-[18px] place-items-center rounded-full">
                  <span className="tl-ring" />
                  <span className="tl-dot" />
                </span>
                <span aria-hidden className="tl-lead absolute left-[24px] top-[13px] h-px w-[18px]" />
                <div data-body>
                  <div className="tl-text flex flex-col gap-2">
                    <span className="tl-when text-[13px] font-medium tabular-nums">Stage {String(i + 1).padStart(2, "0")} · {t.when}</span>
                    <span className="text-[26px] font-semibold leading-tight tracking-[-0.025em]">{t.t}</span>
                    <span className="max-w-[460px] text-[16px] leading-relaxed text-soft">{t.d}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
