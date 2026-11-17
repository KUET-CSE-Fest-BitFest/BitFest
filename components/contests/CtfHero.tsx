"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* Capture The Flag hero: the jeopardy board under the title. Five categories, five values each;
   every second or so a team captures a flag: its cell lights, its solve count goes up, and the first
   capture of a challenge flashes "First blood". The leading team sits in the header; the latest
   capture runs underneath. */

const page = eventPages.ctf;
const CATS = ["Web", "Crypto", "Forensics", "Reversing", "Pwn"];
const SHORT = ["Web", "Crypto", "Forens.", "Rev.", "Pwn"]; // phones
const VALUES = [100, 200, 300, 400, 500];
const TEAMS = ["nullbyte", "rootkit ramen", "segv", "xor shift", "heap of trouble", "bit flip"];
// Solves at the start: easy flags are well taken, hard ones mostly open.
const START = [
  [31, 18, 9, 3, 0],
  [27, 14, 6, 1, 0],
  [29, 16, 7, 2, 0],
  [22, 11, 4, 0, 0],
  [19, 8, 2, 0, 0],
];
const SCORE0 = [2450, 2380, 2210, 1960, 1840, 1720];

type Cap = { team: number; c: number; v: number; first: boolean; n: number };

function Board() {
  const [solves, setSolves] = useState(START);
  const [score, setScore] = useState(SCORE0);
  const [last, setLast] = useState<Cap | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const n = useRef(0);
  const solvesRef = useRef(START);

  useLiveTick(1150, () => {
    // Lower values are captured far more often.
    const w = VALUES.map((_, i) => 1 / Math.pow(i + 1, 1.25));
    let x = Math.random() * w.reduce((a, b) => a + b, 0), v = 0;
    while ((x -= w[v]) > 0) v++;
    const c = Math.floor(Math.random() * CATS.length);
    const team = Math.floor(Math.random() * TEAMS.length);
    const cur = solvesRef.current;
    const next = cur.map((row, i) => (i === c ? row.map((k, j) => (j === v ? k + 1 : k)) : row));
    solvesRef.current = next;
    setSolves(next);
    setLast({ team, c, v, first: cur[c][v] === 0, n: ++n.current });
    setScore((s) => s.map((k, i) => (i === team ? k + VALUES[v] : k)));
  }, ref);

  const lead = score.indexOf(Math.max(...score));
  return (
    <HeroPanel
      title="Live scoreboard"
      meta="Jeopardy board"
      label="A Capture The Flag jeopardy board: five categories of challenges, with captures lighting up as teams solve them."
      right={<><LiveDot /><span className="hidden sm:inline">Leading</span><span className="text-[#fbf1e9]">{TEAMS[lead]}</span><span className="tabular-nums text-orange">{score[lead].toLocaleString()}</span></>}
    >
      <div ref={ref}>
        <div className="grid grid-cols-5 gap-px bg-[rgba(255,214,190,0.07)]">
          {CATS.map((cat, c) => (
            <div key={cat} className="flex flex-col gap-px">
              <span className="truncate bg-[#050406] px-2 py-2.5 text-center text-[12px] font-medium text-[#f2e6dc]/60 sm:text-[13px] md:px-3"><span className="sm:hidden">{SHORT[c]}</span><span className="hidden sm:inline">{cat}</span></span>
              {VALUES.map((val, v) => {
                const k = solves[c][v];
                const hit = last && last.c === c && last.v === v ? last : null;
                return (
                  <span key={val} data-taken={k > 0} className="ctf-cell relative flex h-[52px] flex-col items-center justify-center bg-[#050406] md:h-[56px]">
                    {hit && <span key={hit.n} aria-hidden className={`ctf-flash ${hit.first ? "is-first" : ""}`} />}
                    <span className="relative text-[17px] font-semibold tabular-nums md:text-[19px]">{val}</span>
                    <span className="relative text-[12px] tabular-nums text-[#f2e6dc]/45 md:text-[12px]">{k ? `${k} solve${k > 1 ? "s" : ""}` : "open"}</span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <p key={last?.n ?? 0} className="road-in flex min-h-[48px] items-center gap-2 px-4 py-3 text-[14px] text-[#f2e6dc]/75 md:px-6">
          {last ? (
            <>
              <span className="font-medium text-[#fbf1e9]">{TEAMS[last.team]}</span> captured
              <span className="font-medium text-orange">{CATS[last.c]} {VALUES[last.v]}</span>
              {last.first && <span className="rounded-full bg-[rgba(255,122,61,0.16)] px-2 py-0.5 text-[12px] font-semibold text-orange">First blood</span>}
            </>
          ) : (
            <span>Flags open across five categories.</span>
          )}
        </p>
      </div>
    </HeroPanel>
  );
}

export default function CtfHero() {
  return <EventHero slug="ctf" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Board />} />;
}
