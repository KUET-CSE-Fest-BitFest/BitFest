"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* Imagine the Future with AI hero: an entry being written under the title. The opening lines of a
   sample essay type themselves out with a blinking caret and a running word count, pause, then the
   next sample begins. Plain text and one timer, so it loads at once. The essays are samples. */

const page = eventPages["imagine-ai"];
const DRAFTS = [
  { title: "The river that answers back", text: "In 2045 the Padma keeps a diary. Every sensor along its banks writes to one patient model that learned to read silt the way grandmothers read clouds, and every village gets the river's mood a week before it changes." },
  { title: "A tutor in every pocket", text: "The child in Kurigram never met her teacher, but the teacher knows her: which fractions she fears, which stories make her stay. It speaks her dialect, it never tires, and on Fridays it tells her to go outside and play." },
  { title: "Hospitals without waiting rooms", text: "By the time Rahim feels the fever, his watch has already told the clinic. A model compared his heartbeat with a million others, booked the nurse and sent the medicine before he even thought to worry." },
];

function Draft() {
  const [d, setD] = useState(0);
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef({ d: 0, n: 0, hold: 0 });
  useLiveTick(55, () => {
    const s = t.current;
    const full = DRAFTS[s.d].text.length;
    if (s.n < full) { s.n = Math.min(full, s.n + 2); setN(s.n); return; }
    if (++s.hold < 55) return;
    s.hold = 0; s.n = 0; s.d = (s.d + 1) % DRAFTS.length;
    setD(s.d); setN(0);
  }, ref);
  const draft = DRAFTS[d];
  const shown = n === 0 && d === 0 ? draft.text.slice(0, 96) : draft.text.slice(0, n);
  const words = shown.trim() ? shown.trim().split(/\s+/).length : 0;
  return (
    <HeroPanel
      title="Draft"
      meta="Individual entry"
      label="A sample Imagine the Future with AI entry being written, with a running word count."
      right={<><LiveDot /><span className="tabular-nums">{words} words</span></>}
    >
      <div ref={ref} className="px-4 py-5 md:px-8 md:py-7">
        <p key={d} className="road-in text-[clamp(20px,2.2vw,28px)] font-semibold leading-[1.15] tracking-[-0.02em] text-cream-hi">{draft.title}</p>
        <p className="mt-3 min-h-[5.4em] max-w-[720px] text-[clamp(15px,1.4vw,18px)] leading-[1.65] text-soft">
          {shown}
          <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-orange" />
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
          {["Originality", "Depth of insight", "Plausibility", "Quality of writing"].map((c) => (
            <span key={c} className="rounded-full px-3 py-1 text-cream/65 shadow-[inset_0_0_0_1px_rgba(219,231,238,0.14)]">{c}</span>
          ))}
        </div>
      </div>
    </HeroPanel>
  );
}

export default function ImagineAiHero() {
  return <EventHero slug="imagine-ai" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Draft />} />;
}
