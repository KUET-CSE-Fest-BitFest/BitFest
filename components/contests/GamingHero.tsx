"use client";

import { useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick, seeded } from "@/components/event/useLiveTick";
import { eventPages } from "@/lib/eventPages";

/* Gaming hero: the Valorant knockout bracket under the title, two-sided and drawn as traces like
   the landing chip's: quarter-finals on the outside, semi-finals inside them, the final in the
   middle. Matches finish one after another: the winner's score lands, its trace lights and the team
   moves on. When a champion is crowned the final lights up and the bracket holds, then a new one
   starts. Phones show the semi-finals and the final. */

const page = eventPages.gaming;
const TEAMS = ["Red Shift", "Null Sector", "Night Owls", "Ember", "Static", "Paper Tigers", "Lag Spike", "Clutch Club"];
// Match slots: 0–3 quarter-finals, 4–5 semi-finals, 6 the final. Each feeds the next round.
const FEEDS: Record<number, [number, number]> = { 4: [0, 1], 5: [2, 3], 6: [4, 5] };
const ROUND = ["Quarter-final", "Quarter-final", "Quarter-final", "Quarter-final", "Semi-final", "Semi-final", "Final"];

type Result = { win: 0 | 1; score: [number, number] };
type State = { order: number[]; results: (Result | null)[]; live: number; run: number };

function fresh(run: number): State {
  const r = seeded(97 + run * 31);
  // A seeded Fisher–Yates shuffle, so the server and the browser draw the same first bracket.
  const order = [...TEAMS.keys()];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  // The quarter-finals are already played when a bracket appears, so every screen (phones show
  // only the semis and the final) opens on a live match between named teams.
  const results: (Result | null)[] = Array(7).fill(null);
  for (let m = 0; m < 4; m++) {
    const win = (r() < 0.5 ? 0 : 1) as 0 | 1, lose = 3 + Math.floor(r() * 9);
    results[m] = { win, score: win === 0 ? [13, lose] : [lose, 13] };
  }
  return { order, results, live: 4, run };
}

function teamsOf(s: State, m: number): [number | null, number | null] {
  if (m < 4) return [s.order[m * 2], s.order[m * 2 + 1]];
  return FEEDS[m].map((f) => {
    const res = s.results[f];
    if (!res) return null;
    const [a, b] = teamsOf(s, f);
    return res.win === 0 ? a : b;
  }) as [number | null, number | null];
}

function Match({ s, m }: { s: State; m: number }) {
  const [a, b] = teamsOf(s, m);
  const res = s.results[m];
  const live = s.live === m;
  return (
    <div data-live={live} data-done={!!res} className="gm-match relative w-full rounded-[10px] bg-[#0b0809]">
      {[a, b].map((t, k) => {
        const won = res && res.win === k;
        return (
          <div key={k} className={`flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] md:text-[14px] ${k ? "border-t border-[rgba(255,214,190,0.07)]" : ""}`}>
            <span className={`truncate ${t === null ? "text-[#f2e6dc]/30" : won ? "font-semibold text-[#fbf1e9]" : res ? "text-[#f2e6dc]/40" : "text-[#f2e6dc]/80"}`}>{t === null ? "To be decided" : TEAMS[t]}</span>
            <span className={`shrink-0 tabular-nums ${won ? "text-orange" : "text-[#f2e6dc]/40"}`}>{res ? res.score[k] : live ? "–" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Traces between rounds: `count` matches (1 or 2) feed one; `flip` draws the right-hand side. */
function Joins({ lit, count, flip = false, className = "" }: { lit: boolean[]; count: 1 | 2; flip?: boolean; className?: string }) {
  return (
    <svg aria-hidden className={`h-full w-full ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none">
      {lit.map((on, k) => {
        const y = count === 2 ? (k ? 75 : 25) : 50;
        const d = flip ? `M100 ${y} H50 V50 H0` : `M0 ${y} H50 V50 H100`;
        return <path key={k} d={d} fill="none" stroke={on ? "#ff7a3d" : "rgba(255,214,190,0.16)"} strokeWidth={on ? 1.6 : 1} vectorEffect="non-scaling-stroke" style={{ transition: "stroke 0.4s ease" }} />;
      })}
    </svg>
  );
}

function Bracket() {
  const [s, setS] = useState<State>(() => fresh(0));
  const hold = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  useLiveTick(1900, () => {
    setS((cur) => {
      if (cur.live >= 7) {
        // Champion crowned: hold for two beats, then a new bracket.
        if (++hold.current < 2) return cur;
        hold.current = 0;
        return fresh(cur.run + 1);
      }
      const win = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
      const lose = 3 + Math.floor(Math.random() * 9);
      const results = cur.results.slice();
      results[cur.live] = { win, score: win === 0 ? [13, lose] : [lose, 13] };
      return { ...cur, results, live: cur.live + 1 };
    });
  }, ref);

  const final = s.results[6];
  const champ = final ? teamsOf(s, 6)[final.win] : null;
  const done = (m: number) => !!s.results[m];
  // Two-sided: quarter-finals on the outside, semi-finals inside them, the final in the middle.
  return (
    <HeroPanel
      title="Valorant"
      meta="Knockout bracket"
      label="The Valorant knockout bracket, with matches finishing one after another until a champion is crowned."
      right={champ !== null ? <><span className="hidden sm:inline">Champion</span><span key={s.run} className="road-in font-semibold text-orange">{TEAMS[champ]}</span></> : <><LiveDot /><span>{ROUND[s.live]}</span></>}
    >
      <div ref={ref} className="grid h-[150px] grid-cols-[minmax(0,1fr)_14px_minmax(0,1.1fr)_14px_minmax(0,1fr)] px-3 py-4 sm:h-[168px] md:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1.1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)] md:px-6">
        <div className="hidden flex-col justify-around md:flex">{[0, 1].map((m) => <Match key={m} s={s} m={m} />)}</div>
        <Joins lit={[done(0), done(1)]} count={2} className="hidden md:block" />
        <div className="flex flex-col justify-around"><Match s={s} m={4} /></div>
        <Joins lit={[done(4)]} count={1} />
        <div className="flex flex-col justify-around"><div data-on={champ !== null} className="gm-final rounded-[10px]"><Match s={s} m={6} /></div></div>
        <Joins lit={[done(5)]} count={1} flip />
        <div className="flex flex-col justify-around"><Match s={s} m={5} /></div>
        <Joins lit={[done(2), done(3)]} count={2} flip className="hidden md:block" />
        <div className="hidden flex-col justify-around md:flex">{[2, 3].map((m) => <Match key={m} s={s} m={m} />)}</div>
      </div>
    </HeroPanel>
  );
}

export default function GamingHero() {
  return <EventHero slug="gaming" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Bracket />} />;
}
