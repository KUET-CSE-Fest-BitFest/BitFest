"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* ICT Olympiad hero: the question paper under the title. A question comes up, an answer is picked,
   it is marked, the score moves on, and the two-hour clock runs (faster than real time). Plain DOM
   and one timer. The questions are samples. */

const page = eventPages["ict-olympiad"];
const QS = [
  { q: "What is 1011 in binary, written in decimal?", opts: ["9", "11", "13", "10"], a: 1 },
  { q: "Which device sends data between different networks?", opts: ["Switch", "Hub", "Router", "Repeater"], a: 2 },
  { q: "If every cat is an animal and Tom is a cat, then Tom is…", opts: ["a dog", "an animal", "not sure", "a plant"], a: 1 },
  { q: "Which of these is an input device?", opts: ["Monitor", "Printer", "Speaker", "Scanner"], a: 3 },
  { q: "What comes next: 2, 4, 8, 16, …", opts: ["24", "30", "32", "18"], a: 2 },
];
const LETTERS = ["A", "B", "C", "D"];

function Paper() {
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0); // 0 read, 1 picked, 2 marked
  const [score, setScore] = useState(37);
  const [left, setLeft] = useState(7200 - 1460);
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef({ i: 0, step: 0, score: 37, left: 7200 - 1460 });
  useLiveTick(1100, () => {
    const s = t.current;
    s.left = s.left <= 60 ? 7200 : s.left - 37;
    if (s.step === 2) { s.step = 0; s.i = (s.i + 1) % QS.length; setI(s.i); }
    else { s.step += 1; if (s.step === 2) s.score = s.score >= 98 ? 37 : s.score + 1; }
    setStep(s.step); setScore(s.score); setLeft(s.left);
  }, ref);
  const q = QS[i];
  const hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60), ss = left % 60;
  return (
    <HeroPanel
      title="Question paper"
      meta="Two hours"
      label="A sample ICT Olympiad question with four options, an answer being marked, the score and the clock."
      right={<><LiveDot /><span className="tabular-nums">{`${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`} left</span></>}
    >
      <div ref={ref} className="grid gap-5 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:px-6 md:py-6">
        <div key={i} className="road-in flex flex-col gap-4">
          <p className="text-[clamp(16px,1.7vw,21px)] font-semibold leading-[1.25] tracking-[-0.01em] text-cream-hi">
            <span className="mr-2 text-orange tabular-nums">Q{String(score + 1).padStart(2, "0")}</span>{q.q}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {q.opts.map((o, k) => {
              const picked = step >= 1 && k === q.a;
              const marked = step === 2 && k === q.a;
              return (
                <li key={o} className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-[background-color,box-shadow,color] duration-300 ${marked ? "bg-orange/15 text-cream-hi shadow-[inset_0_0_0_1px_rgba(34,197,94,0.6)]" : picked ? "bg-[rgba(219,231,238,0.06)] text-cream-hi shadow-[inset_0_0_0_1px_rgba(219,231,238,0.3)]" : "text-soft shadow-[inset_0_0_0_1px_rgba(219,231,238,0.1)]"}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${marked ? "bg-orange text-on-accent" : "bg-[rgba(219,231,238,0.08)] text-cream/70"}`}>{marked ? "✓" : LETTERS[k]}</span>
                  {o}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:justify-center sm:gap-1">
          <span className="text-[44px] font-semibold leading-none tabular-nums tracking-[-0.04em] text-cream-hi md:text-[56px]">{score}</span>
          <span className="text-[13px] text-cream/55">correct so far</span>
        </div>
      </div>
    </HeroPanel>
  );
}

export default function IctOlympiadHero() {
  return <EventHero slug="ict-olympiad" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Paper />} />;
}
