"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick, seeded } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* Project Showcase hero: the exhibition floor under the title. Thirty-five stalls in three rows; the
   judges walk them one by one, the stall they are at lights up, and every stall they have scored
   keeps a warm mark. The project at the current stall is named underneath. Visitors keep coming. */

const page = eventPages["project-showcase"];
const N = 35;
const PROJECTS: [string, string][] = [
  ["Soil sensors that text farmers", "Hardware"], ["Rickshaw route planner", "Software"], ["Braille e-reader", "Hardware"],
  ["Flood alert buoy", "Hardware"], ["Campus bus tracker", "Software"], ["Sign-language glove", "Hardware"],
  ["Clinic queue app", "Software"], ["Waste-sorting arm", "Hardware"], ["Mangrove drone survey", "Hardware"],
  ["Tutor matching app", "Software"], ["Smart irrigation valve", "Hardware"], ["Bangla OCR for receipts", "Software"],
];
const r0 = seeded(5);
const SCORE = Array.from({ length: N }, () => 0.45 + r0() * 0.55);

function Floor() {
  const [at, setAt] = useState(16);
  const [visitors, setVisitors] = useState(1204);
  const ref = useRef<HTMLDivElement>(null);
  useLiveTick(1500, () => {
    setAt((a) => (a + 1) % N);
    setVisitors((v) => v + 1 + Math.floor(Math.random() * 4));
  }, ref);
  const [name, kind] = PROJECTS[at % PROJECTS.length];
  return (
    <HeroPanel
      title="Exhibition floor"
      meta="35 stalls"
      label="The Project Showcase floor: thirty-five stalls, with the judges moving from stall to stall and scored stalls marked."
      right={<><LiveDot /><span className="tabular-nums">{visitors.toLocaleString()}</span><span className="hidden sm:inline">visitors</span></>}
    >
      <div ref={ref} className="px-4 py-4 md:px-6">
        <ul className="grid grid-cols-6 gap-1.5 md:grid-cols-12 md:gap-2">
          {Array.from({ length: N }, (_, i) => {
            const state = i === at ? "here" : i < at ? "scored" : "waiting";
            return (
              <li key={i} data-state={state} className="sc-stall relative flex h-[36px] flex-col justify-between rounded-[7px] px-1.5 py-1 md:h-[40px] md:px-2">
                <span className="text-[12px] leading-none tabular-nums md:text-[12px]">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden className="sc-mark h-[3px] rounded-full" style={{ width: `${Math.round(SCORE[i] * 100)}%` }} />
              </li>
            );
          })}
        </ul>
        <p key={at} className="road-in mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[14px]">
          <span className="font-medium text-orange">Judges at stall {String(at + 1).padStart(2, "0")}</span>
          <span className="text-cream-hi">{name}</span>
          <span className="text-cream/50">{kind}</span>
        </p>
      </div>
    </HeroPanel>
  );
}

export default function ShowcaseHero() {
  return <EventHero slug="project-showcase" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Floor />} />;
}
