"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* AI-Driven Solutions for Bangladesh's Needs hero: one poster on the board under the title (problem,
   AI approach, impact) and the judges' four criteria filling beside it; every few seconds the next
   sample poster comes up. Plain DOM and one timer, so it costs almost nothing to load. The posters
   are samples. */

const page = eventPages["ai-solutions"];
const POSTERS = [
  { problem: "Arsenic in rural tube wells goes untested", ai: "A phone photo of a colour test strip, read by a small vision model", impact: "Village-level testing without a lab" },
  { problem: "Flood warnings reach char villages too late", ai: "River-level forecasts from satellite and gauge data", impact: "Hours more to move people and cattle" },
  { problem: "Farmers misread crop disease until it spreads", ai: "Leaf photos classified offline on a budget phone", impact: "Treatment advice in Bangla, in the field" },
  { problem: "Dhaka buses bunch up while stops wait", ai: "Arrival prediction from crowd-shared GPS", impact: "Shorter waits on the busiest routes" },
];
const CRITERIA = ["Relevance to Bangladesh", "Feasibility of the AI", "Expected impact", "Poster clarity"];
const SCORES = [[9, 7, 8, 8], [8, 8, 9, 7], [9, 8, 7, 9], [7, 9, 8, 8]];

function Board() {
  const [k, setK] = useState(0);
  const [fill, setFill] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef({ k: 0, fill: 0 });
  useLiveTick(700, () => {
    const s = t.current;
    if (s.fill >= 6) { s.k = (s.k + 1) % POSTERS.length; s.fill = 0; setK(s.k); }
    else s.fill += 1;
    setFill(s.fill);
  }, ref);
  const p = POSTERS[k];
  return (
    <HeroPanel
      title="Poster board"
      meta="Individual entries"
      label="A sample AI-Driven Solutions poster: a problem in Bangladesh, the AI approach and its impact, with the four judging criteria."
      right={<><LiveDot /><span className="tabular-nums">Poster {String(k + 1).padStart(2, "0")}</span></>}
    >
      <div ref={ref} className="grid items-stretch gap-5 px-4 py-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8 md:px-6 md:py-6">
        <div key={k} className="road-in flex flex-col gap-3 rounded-[12px] bg-[var(--rd-lid)] p-4 shadow-[inset_0_0_0_1px_rgba(219,231,238,0.14)] md:p-5">
          {[["Problem", p.problem], ["AI approach", p.ai], ["Impact", p.impact]].map(([k2, v], i) => (
            <div key={k2} className="flex flex-col gap-1">
              <span className={`text-[12px] font-medium ${i === 1 ? "text-orange" : "text-cream/55"}`}>{k2}</span>
              <span className={`leading-[1.25] tracking-[-0.01em] ${i === 0 ? "text-[clamp(16px,1.7vw,20px)] font-semibold text-cream-hi" : "text-[14px] text-soft"}`}>{v}</span>
            </div>
          ))}
        </div>
        <ul className="flex flex-col justify-center gap-3">
          {CRITERIA.map((c, i) => {
            const on = fill > i;
            const v = SCORES[k][i];
            return (
              <li key={c} className="flex flex-col gap-1.5">
                <span className="flex justify-between text-[13px]">
                  <span className="text-cream/70">{c}</span>
                  <span className={`tabular-nums transition-colors ${on ? "text-cream-hi" : "text-dim"}`}>{on ? `${v}/10` : "–"}</span>
                </span>
                <span className="relative h-[4px] overflow-hidden rounded-full bg-[rgba(219,231,238,0.08)]">
                  <span className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-[#15925a] to-[#86efac] transition-transform duration-700 ease-out" style={{ transform: `scaleX(${on ? v / 10 : 0})` }} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </HeroPanel>
  );
}

export default function AiSolutionsHero() {
  return <EventHero slug="ai-solutions" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Board />} />;
}
