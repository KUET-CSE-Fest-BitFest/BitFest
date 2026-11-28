"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick, seeded } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* IT Business Case hero: the jury's scorecard under the title. A finalist team defends its case
   while the Q&A clock runs; the four criteria the jury scores fill in one after another and the
   total lands. Then the next team steps up. The case shown is a sample, labelled as one. */

const page = eventPages["it-case"];
const CRITERIA = ["Analysis", "Feasibility", "Financial reasoning", "Final defence"];
const TEAMS = ["Quorum", "Margin Call", "Blue Ocean", "Unit Economics", "Pivot Table", "Due Diligence"];
const SAMPLE = "A courier company weighs building its own delivery app against partnering with one.";

const scoresFor = (k: number) => {
  const r = seeded(13 + k * 7);
  return CRITERIA.map(() => Math.round((6 + r() * 3.6) * 10) / 10);
};

function Scorecard() {
  const [k, setK] = useState(0);
  const [qa, setQa] = useState(272);
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef({ k: 0, qa: 272, ticks: 0 });
  // Each team gets seven beats on screen; the Q&A clock counts down meanwhile.
  useLiveTick(1000, () => {
    const s = t.current;
    if (++s.ticks >= 7) {
      s.ticks = 0;
      s.k += 1;
      s.qa = 300 - ((s.k * 23) % 50);
      setK(s.k);
    } else s.qa -= 1;
    setQa(s.qa);
  }, ref);

  const scores = scoresFor(k);
  const total = scores.reduce((a, b) => a + b, 0);
  const team = TEAMS[k % TEAMS.length];
  const mm = `${Math.floor(qa / 60)}:${String(qa % 60).padStart(2, "0")}`;
  return (
    <HeroPanel
      title="Jury scorecard"
      meta="Sample case"
      label="A jury scorecard for the Tech Business Case final: a team defends its case while four criteria are scored and totalled."
      right={<><LiveDot /><span>Q&amp;A</span><span className="tabular-nums text-cream-hi">{mm}</span></>}
    >
      <div ref={ref} key={k} className="grid gap-6 px-4 py-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10 md:px-6 md:py-6">
        <div className="road-in flex flex-col gap-3">
          <span className="text-[13px] font-medium text-cream/55">Presenting · team {String((k % 20) + 1).padStart(2, "0")} of 20</span>
          <span className="lx-ink-warm text-[clamp(30px,3.4vw,44px)] font-semibold leading-[1] tracking-[-0.035em]">{team}</span>
          <p className="max-w-[360px] text-[14px] leading-relaxed text-cream/65">{SAMPLE}</p>
        </div>
        <div className="flex flex-col gap-3.5">
          {CRITERIA.map((c, i) => (
            <div key={c} className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-x-4 gap-y-1.5">
              <span className="text-[14px] text-cream/80">{c}</span>
              <span className="case-num text-right text-[14px] font-semibold tabular-nums text-cream-hi" style={{ animationDelay: `${0.35 + i * 0.3}s` }}>{scores[i].toFixed(1)}</span>
              <span className="col-span-2 h-[3px] overflow-hidden rounded-full bg-[rgba(219,231,238,0.09)]">
                <span className="case-bar block h-full origin-left rounded-full" style={{ ["--s" as string]: scores[i] / 10, animationDelay: `${i * 0.3}s` }} />
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-baseline justify-between border-t border-[rgba(219,231,238,0.1)] pt-3">
            <span className="text-[14px] font-medium text-cream/70">Total</span>
            <span className="case-num text-[26px] font-semibold tabular-nums text-orange" style={{ animationDelay: "1.6s" }}>
              {total.toFixed(1)}<span className="text-[15px] font-medium text-cream/45"> / 40</span>
            </span>
          </div>
        </div>
      </div>
    </HeroPanel>
  );
}

export default function CaseHero() {
  return <EventHero slug="it-case" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Scorecard />} />;
}
