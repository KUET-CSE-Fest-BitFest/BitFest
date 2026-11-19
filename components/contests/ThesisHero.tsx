"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick, seeded } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* 3 Minute Thesis hero: one slide and the clock under the title. A pair presents; the ring runs
   down three minutes (shown six times faster than real time); at zero the next pair's slide comes
   up. Research titles are samples. */

const page = eventPages["3mt"];
const TALKS = [
  "Reading arsenic risk from a phone photo of a tube well",
  "Bangla speech recognition that runs on a budget phone",
  "Predicting river-bank erosion a season early",
  "Second-life batteries for solar in coastal schools",
  "Spotting jute disease from drone images",
];
const FULL = 180;
const R = 46, C = 2 * Math.PI * R;

function Figure({ k }: { k: number }) {
  const r = seeded(11 + k * 5);
  const bars = Array.from({ length: 6 }, (_, i) => 0.3 + 0.7 * Math.min(1, r() * 0.6 + i * 0.09));
  return (
    <div aria-hidden className="flex h-16 items-end gap-1.5">
      {bars.map((h, i) => (
        <span key={i} className="w-3 rounded-t-[3px]" style={{ height: `${h * 100}%`, background: i === bars.length - 1 ? "linear-gradient(180deg,#ffc49e,#ff7a3d)" : "rgba(242,230,220,0.22)" }} />
      ))}
    </div>
  );
}

function Talk() {
  const [left, setLeft] = useState(161);
  const [k, setK] = useState(6);
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef({ left: 161, k: 6 });
  useLiveTick(1000, () => {
    const s = t.current;
    if (s.left <= 0) { s.k = (s.k + 1) % 30; s.left = FULL; setK(s.k); }
    else s.left = Math.max(0, s.left - 6);
    setLeft(s.left);
  }, ref);
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <HeroPanel
      title="Presentations"
      meta="One slide each"
      label="A 3 Minute Thesis presentation: a single research slide and a three-minute countdown ring."
      right={<><LiveDot /><span className="tabular-nums">Pair {String(k + 1).padStart(2, "0")} of 30</span></>}
    >
      <div ref={ref} className="grid items-center gap-5 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:px-6 md:py-6">
        <div key={k} className="road-in relative flex aspect-[16/9] max-h-[220px] flex-col justify-between overflow-hidden rounded-[12px] bg-[#0b0809] p-4 shadow-[inset_0_0_0_1px_rgba(255,214,190,0.14)] md:p-5">
          <span className="text-[12px] font-medium text-[#f2e6dc]/50">Slide 1 of 1</span>
          <span className="max-w-[440px] text-[clamp(17px,2vw,24px)] font-semibold leading-[1.15] tracking-[-0.02em] text-[#fbf1e9]">{TALKS[k % TALKS.length]}</span>
          <Figure k={k} />
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:gap-2">
          <div className="relative h-[112px] w-[112px] md:h-[132px] md:w-[132px]">
            <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
              <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(255,214,190,0.1)" strokeWidth="5" />
              <circle cx="56" cy="56" r={R} fill="none" stroke="url(#tm-ring)" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / FULL)} style={{ transition: left === FULL ? "none" : "stroke-dashoffset 1s linear" }} />
              <defs>
                <linearGradient id="tm-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffc49e" /><stop offset="55%" stopColor="#ff7a3d" /><stop offset="100%" stopColor="#a33a14" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#fbf1e9] md:text-[32px]">{mm}</span>
          </div>
          <span className="text-[13px] text-[#f2e6dc]/55">{left === 0 ? "Time" : "of 3:00"}</span>
        </div>
      </div>
    </HeroPanel>
  );
}

export default function ThesisHero() {
  return <EventHero slug="3mt" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Talk />} />;
}
