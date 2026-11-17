"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parts } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const ON = "#ff7a3d";
const OFF = "rgba(242,226,214,0.62)";

function Blueprint({ active }: { active: number }) {
  const c = (i: number) => (i === active ? ON : OFF);
  const f = (i: number) => (i === active ? "rgba(255,122,61,0.12)" : "rgba(20,16,18,0.6)");
  const t = { transition: "stroke .3s, fill .3s" };
  return (
    <svg viewBox="0 0 800 680" className="h-auto w-full" role="img" aria-label={`Top-down blueprint of a soccer robot, ${parts[active].name} highlighted`}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(100 20)">
        <path d="M150 470 V154 Q150 130 174 130 H426 Q450 130 450 154 V470 Q450 494 426 494 H174 Q150 494 150 470 Z" stroke={c(0)} strokeWidth="2" fill={f(0)} style={t} />
        <rect x="114" y="200" width="30" height="104" rx="6" stroke={c(1)} strokeWidth="2" fill={f(1)} style={t} />
        <rect x="456" y="200" width="30" height="104" rx="6" stroke={c(1)} strokeWidth="2" fill={f(1)} style={t} />
        <path d="M120 214H138M120 228H138M120 242H138M120 256H138M120 270H138M120 284H138M462 214H480M462 228H480M462 242H480M462 256H480M462 270H480M462 284H480" stroke={c(1)} strokeWidth="1" opacity=".6" style={t} />
        <circle cx="300" cy="452" r="18" stroke={c(1)} strokeWidth="2" fill={f(1)} style={t} />
        <rect x="210" y="92" width="180" height="30" rx="4" stroke={c(2)} strokeWidth="2" fill={f(2)} style={t} />
        <path d="M250 122V150M350 122V150M240 150H260M340 150H360M300 92V70" stroke={c(2)} strokeWidth="2" style={t} />
        <rect x="205" y="318" width="190" height="78" rx="6" stroke={c(3)} strokeWidth="2" fill={f(3)} style={t} />
        <path d="M235 340V374M265 340V374M295 340V374M325 340V374M355 340V374M395 350H405V364H395" stroke={c(3)} strokeWidth="1.5" style={t} />
        <rect x="225" y="186" width="150" height="96" rx="4" stroke={c(4)} strokeWidth="2" fill={f(4)} style={t} />
        <rect x="270" y="210" width="60" height="48" stroke={c(4)} strokeWidth="1.5" style={t} />
        <path d="M270 218H258M270 230H258M270 242H258M270 250H258M330 218H342M330 230H342M330 242H342M330 250H342" stroke={c(4)} strokeWidth="1.5" style={t} />
        <circle cx="410" cy="440" r="8" stroke={c(4)} strokeWidth="1.5" style={t} />
        <path d="M410 432V410" stroke={c(4)} strokeWidth="1.5" style={t} />
        <path d="M150 40V60M450 40V60M150 50H450M150 50l10-5M150 50l10 5M450 50l-10-5M450 50l-10 5" stroke="rgba(242,226,214,0.35)" strokeWidth="1" />
        <path d="M540 130H560M540 494H560M550 130V494M550 130l-5 10M550 130l5 10M550 494l-5-10M550 494l5-10" stroke="rgba(242,226,214,0.35)" strokeWidth="1" />
      </g>
      <g style={{ fontFamily: "var(--font-display)" }} fontSize="14" fill="#cfc2b8">
        <text x="400" y="60" textAnchor="middle">W [MAX WIDTH] mm</text>
        <text x="690" y="330" transform="rotate(90 690 330)" textAnchor="middle">L [MAX LENGTH] mm</text>
      </g>
    </svg>
  );
}

export default function BuildSpec() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setActive(Math.min(parts.length - 1, Math.floor(self.progress * parts.length))),
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  const p = parts[active];

  return (
    <section id="spec" className="blueprint-grid relative scroll-mt-20 border-y border-line">
      <div ref={trackRef} className="lg:h-[420vh]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-24 md:px-14 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-[440px_minmax(0,1fr)] lg:items-center lg:py-0">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-3 text-[15px] font-medium text-muted"><span className="tabular-nums text-orange">02</span><span aria-hidden className="h-px w-8 bg-line-2" />Build spec</p>
              <h2 className="text-[clamp(40px,5.2vw,76px)] font-semibold leading-[0.98] tracking-[-0.04em]">Know the<br />limits.</h2>
              <p className="text-lg text-soft">Every bot is inspected before its first match. Scroll — or pick a part — to see the rule.</p>
            </div>
            <div role="tablist" aria-label="Robot parts" className="flex flex-col overflow-hidden rounded-[14px] border border-[rgba(255,214,190,0.16)] bg-[#0c0a0b]/90">
              {parts.map((pt, i) => (
                <button
                  key={pt.name}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={`grid min-h-12 grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-b border-l-2 border-b-[rgba(255,214,190,0.08)] px-4 text-left text-base font-semibold transition last:border-b-0 ${i === active ? "border-l-orange bg-orange/10" : "border-l-transparent hover:bg-white/5"}`}
                >
                  <span className={`text-[13px] font-medium tabular-nums ${i === active ? "text-orange" : "text-dim"}`}>0{i + 1}</span>
                  <span>{pt.name}</span>
                  <span className="text-[13px] text-muted">{pt.spec}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Blueprint active={active} />
            <div className="absolute bottom-0 right-0 w-full max-w-[380px] overflow-hidden rounded-[14px] border border-[rgba(255,214,190,0.2)] bg-[#0c0a0b]/95 text-[13px] max-lg:relative max-lg:mt-4">
              <div className="flex flex-col gap-1.5 border-b border-[rgba(255,214,190,0.14)] p-4" aria-live="polite">
                <span className="font-medium tabular-nums text-muted">Selected · {active + 1} of {parts.length}</span>
                <span className="text-2xl font-semibold tracking-[-0.02em] text-orange">{p.name}</span>
                <span className="text-sm text-ink">{p.rule}</span>
              </div>
              <div className="grid grid-cols-2 text-muted">
                <span className="border-r border-[rgba(255,214,190,0.14)] px-4 py-2.5">Drawing BF27-SB-05</span>
                <span className="px-4 py-2.5">Scale 1:4 · sheet 1 of 1</span>
              </div>
            </div>
            <div aria-hidden className="absolute left-0 top-0 hidden h-1 w-full bg-[rgba(255,214,190,0.1)] lg:block">
              <div className="h-1 bg-orange transition-all duration-300" style={{ width: `${((active + 1) / parts.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
