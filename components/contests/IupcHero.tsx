"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* IUPC hero: the main contest's problem set under the title. Twelve problems, A to L, each with its
   balloon colour and how many teams have solved it; the contest clock counts down; every second or
   so the judge returns a verdict: an accepted run lights its problem and adds a balloon, a wrong one
   blinks plum. The last verdicts run underneath like the judge's queue. */

const page = eventPages.iupc;
const LETTERS = "ABCDEFGHIJKL".split("");
const BALLOON = ["#ff7a3d", "#ffd27a", "#c2458a", "#ffb27a", "#e8557a", "#9a4fc0", "#ff9a5a", "#f2e6dc", "#d35a86", "#ffc79e", "#b8325a", "#ff6a35"];
// Chance a run on each problem is accepted (A is the giveaway, L the one almost nobody gets).
const EASE = [0.66, 0.5, 0.4, 0.33, 0.27, 0.22, 0.17, 0.13, 0.1, 0.07, 0.05, 0.03];
const START = [121, 98, 74, 57, 43, 31, 22, 14, 9, 5, 2, 0];
const TEAMS = ["Segfault Society", "Off By One", "Big O", "Stack Smashers", "Greedy Choice", "Null Pointer", "Two Pointers", "Binary Lifting", "Lazy Propagation", "Mod Prime"];
const WRONG = ["Wrong answer", "Time limit", "Wrong answer", "Runtime error"];
const LEFT0 = 2 * 3600 + 18 * 60 + 51; // time left when the page opens

type Run = { id: number; team: string; p: number; ok: boolean; verdict: string };
const clock = (s: number) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, "0")).join(":");

function Problems() {
  const [solved, setSolved] = useState(START);
  const [left, setLeft] = useState(LEFT0);
  const [flash, setFlash] = useState<{ p: number; ok: boolean; n: number } | null>(null);
  const [runs, setRuns] = useState<Run[]>([
    { id: 18203, team: "Off By One", p: 3, ok: true, verdict: "Accepted" },
    { id: 18202, team: "Lazy Propagation", p: 7, ok: false, verdict: "Time limit" },
    { id: 18201, team: "Big O", p: 1, ok: true, verdict: "Accepted" },
  ]);
  const ref = useRef<HTMLDivElement>(null);
  const n = useRef(0);

  useLiveTick(1000, () => {
    setLeft((l) => (l <= 1 ? LEFT0 : l - 1));
    if (Math.random() < 0.15) return;
    // Teams try the easier problems more often.
    const w = EASE.map((e) => e + 0.06);
    let x = Math.random() * w.reduce((a, b) => a + b, 0), p = 0;
    while ((x -= w[p]) > 0) p++;
    const ok = Math.random() < EASE[p] * 1.15;
    const id = 18204 + n.current++;
    if (ok) setSolved((s) => s.map((v, i) => (i === p ? Math.min(150, v + 1) : v)));
    setFlash({ p, ok, n: id });
    setRuns((r) => [{ id, team: TEAMS[Math.floor(Math.random() * TEAMS.length)], p, ok, verdict: ok ? "Accepted" : WRONG[id % WRONG.length] }, ...r].slice(0, 3));
  }, ref);

  return (
    <HeroPanel
      title="Main contest"
      meta="150 teams"
      label="The IUPC problem set during the main contest: twelve problems with the number of teams that solved each, a contest clock and the judge's latest verdicts."
      right={<><LiveDot /><span className="tabular-nums">{clock(left)}</span><span className="hidden sm:inline">left</span></>}
    >
      <div ref={ref}>
        <ul className="grid grid-cols-4 gap-px bg-[rgba(255,214,190,0.07)] sm:grid-cols-6">
          {LETTERS.map((l, i) => {
            const hit = flash?.p === i ? flash : null;
            return (
              <li key={l} className="relative flex flex-col gap-2 bg-[#050406] px-4 py-3 md:px-5 md:py-4">
                {hit && <span key={hit.n} aria-hidden className={`iupc-flash ${hit.ok ? "is-ok" : "is-no"}`} />}
                <span className="relative flex items-center justify-between">
                  <span className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-[#fbf1e9] md:text-[26px]">{l}</span>
                  <span aria-hidden className="h-3 w-2.5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ background: BALLOON[i], boxShadow: `0 0 10px ${BALLOON[i]}66` }} />
                </span>
                <span className="relative text-[13px] tabular-nums text-[#f2e6dc]/60">
                  <span className={hit?.ok ? "text-orange" : "text-[#f2e6dc]/85"}>{solved[i]}</span> solved
                </span>
                <span aria-hidden className="relative h-[2px] overflow-hidden rounded-full bg-[rgba(255,214,190,0.08)]">
                  <span className="absolute inset-y-0 left-0 origin-left rounded-full transition-transform duration-500" style={{ width: "100%", transform: `scaleX(${solved[i] / 150})`, background: BALLOON[i], opacity: 0.8 }} />
                </span>
              </li>
            );
          })}
        </ul>
        <ol className="flex flex-col px-4 py-2 md:px-6">
          {runs.map((r, k) => (
            <li key={r.id} className={`flex items-center gap-3 border-b border-[rgba(255,214,190,0.06)] py-2.5 text-[14px] last:border-0 ${k === 0 ? "road-in" : ""}`} style={{ opacity: 1 - k * 0.28 }}>
              <span className="w-14 shrink-0 tabular-nums text-[#f2e6dc]/45">#{r.id}</span>
              <span className="min-w-0 flex-1 truncate text-[#f2e6dc]/85">{r.team}</span>
              <span className="w-6 shrink-0 text-center font-semibold" style={{ color: BALLOON[r.p] }}>{LETTERS[r.p]}</span>
              <span className={`w-28 shrink-0 text-right font-medium ${r.ok ? "text-orange" : "text-[#d35a9a]"}`}>{r.verdict}</span>
            </li>
          ))}
        </ol>
      </div>
    </HeroPanel>
  );
}

export default function IupcHero() {
  return <EventHero slug="iupc" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Problems />} />;
}
