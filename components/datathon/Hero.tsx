"use client";

import { useEffect, useRef, useState } from "react";
import { eventPages } from "@/lib/eventPages";
import EventHero from "@/components/event/EventHero";

/* Datathon hero. Under the title, the online preliminary's public leaderboard sits in a lit lid. It
   fills the rest of the first screen with whole rows and fades out over its last row and a half, so
   the board reads as running on below; teams down there slide up into view when they climb. Every second or so a team submits: a signal runs along its row, its score ticks up and,
   when it beats the team above, the rows slide past each other. Point at a row to pause the board and
   read that team's run (its best score after each submission). Rows move by transform only. */

const page = eventPages.datathon;

type Team = { name: string; s: number; n: number; hist: number[]; hit: number; moved: number; passed: boolean };

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const SEED = [
  { name: "Kernel Panic", s: 0.9381, n: 41 },
  { name: "Overfit Club", s: 0.9374, n: 37 },
  { name: "Bayes Watch", s: 0.9366, n: 52 },
  { name: "Null Hypothesis", s: 0.9351, n: 29 },
  { name: "Gradient Ascent", s: 0.9342, n: 33 },
  { name: "Feature Creep", s: 0.933, n: 24 },
  { name: "Dropout", s: 0.9318, n: 46 },
];

// Each team's best score so far, after each of its last sixteen submissions (never goes down).
function start(): Team[] {
  return SEED.map((t, k) => {
    const r = rand(17 + k * 31);
    const hist: number[] = [];
    let best = 0;
    for (let i = 0; i < 16; i++) {
      const v = t.s - 0.045 * Math.exp(-i / (3 + k * 0.4)) - (r() < 0.5 ? 0.002 * r() : 0);
      best = Math.max(best, Math.min(t.s, v));
      hist.push(best);
    }
    hist[15] = t.s;
    return { ...t, hist, hit: 0, moved: 0, passed: false };
  });
}

const LO = 0.89; // the bottom of every sparkline's scale, so runs compare across rows

function Spark({ hist, top, lit }: { hist: number[]; top: number; lit: boolean }) {
  const pts = hist.map((v, i) => `${((i / (hist.length - 1)) * 100).toFixed(1)},${(22 - ((v - LO) / (top - LO)) * 20).toFixed(1)}`).join(" ");
  const last = hist[hist.length - 1];
  return (
    <svg aria-hidden viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full overflow-visible">
      <polyline points={pts} fill="none" stroke={lit ? "#4ade80" : "rgba(219,231,238,0.32)"} strokeWidth={lit ? 1.6 : 1.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" style={{ transition: "stroke 0.3s ease" }} />
      <circle cx={100} cy={22 - ((last - LO) / (top - LO)) * 20} r={lit ? 2.4 : 1.6} fill={lit ? "#effdf4" : "rgba(219,231,238,0.5)"} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Board() {
  const [teams, setTeams] = useState<Team[]>(start);
  const [hover, setHover] = useState<number | null>(null);
  const [day, setDay] = useState(6);
  const [run, setRun] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(5);
  const tick = useRef(0);
  const dayRef = useRef(6);
  const hoverRef = useRef(hover);
  hoverRef.current = hover;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(boardRef.current!);
    const r = rand(Date.now() % 100000);
    const id = window.setInterval(() => {
      if (!visible || hoverRef.current !== null) return;
      tick.current++;
      // The clock: the preliminary runs ten days (13–22 January); a day every eight submissions. After
      // day 10 the round closes and a new run starts.
      if (tick.current % 8 === 0) {
        if (dayRef.current >= 10) {
          dayRef.current = 5;
          setDay(5);
          setTeams(start());
          setRun((x) => x + 1);
          return;
        }
        setDay(++dayRef.current);
      }
      setTeams((prev) => {
        const order = prev.map((_, i) => i).sort((a, b) => prev[b].s - prev[a].s);
        // Teams lower down submit more often (they have more to gain), so climbs happen.
        const pick = order[Math.min(order.length - 1, Math.floor(Math.pow(r(), 0.7) * order.length))];
        const old = prev[pick].s;
        const better = r() < 0.72;
        const s = better ? old + (0.9712 - old) * (0.05 + r() * 0.14) : old;
        return prev.map((t, i) => {
          // Teams the climber passes dim briefly while it slides over them.
          if (i !== pick) return { ...t, moved: 0, passed: t.s > old && t.s <= s };
          const before = order.indexOf(i);
          const after = prev.filter((o, j) => j !== i && o.s > s).length;
          return { ...t, s, n: t.n + 1, hist: [...t.hist.slice(1), s], hit: better ? t.hit + 1 : t.hit, moved: better ? before - after : 0, passed: false };
        });
      });
    }, 1300);
    return () => { window.clearInterval(id); io.disconnect(); };
  }, []);

  // Whole rows only: as many as fit between the header and the bottom of the first screen.
  useEffect(() => {
    const measure = () => {
      const board = boardRef.current, rows = rowsRef.current, sec = board?.closest("section");
      if (!board || !rows || !sec) return;
      const row = parseFloat(getComputedStyle(rows).getPropertyValue("--row")) || 54;
      const vh = Math.max(window.innerHeight, 640);
      const top = rows.getBoundingClientRect().top - sec.getBoundingClientRect().top;
      // Rows run to just above the bottom of the first screen (the last ones fade). Desktop keeps the
      // hero one screen tall (three rows at least); phones scroll anyway, so four at least.
      const least = window.innerWidth < 768 ? 4 : 3;
      setFit(Math.max(least, Math.min(7, Math.floor((vh - top - 12) / row))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(boardRef.current!.closest("section")!);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const order = teams.map((_, i) => i).sort((a, b) => teams[b].s - teams[a].s);
  const rankOf = (i: number) => order.indexOf(i);
  const top = teams[order[0]].s;
  const entries = teams.reduce((a, t) => a + t.n, 0) + 1180;

  return (
    <div
      ref={boardRef}
      role="img"
      aria-label="A live public leaderboard: teams submit, their scores rise and they climb past each other."
      onPointerLeave={() => setHover(null)}
      className="lidx lb-board pointer-events-auto relative mx-auto mb-3 mt-[clamp(24px,4.5vh,48px)] [--row:48px] md:[--row:54px] w-[min(920px,calc(100%-24px))] rounded-[20px]"
    >
      <span className="lx lx-rim" />
      <div className="relative z-[4] flex items-center justify-between gap-4 px-4 pb-3 pt-4 md:px-6 md:pt-5">
        <p className="text-[15px] font-medium text-ink">
          Public leaderboard <span className="hidden text-cream/55 min-[360px]:inline">· Day {day} of 10</span>
        </p>
        <p className="flex items-center gap-2 text-[14px] font-medium text-cream/65">
          <span className="h-2 w-2 animate-live rounded-full bg-orange" />
          <span className="tabular-nums">{entries.toLocaleString()}</span>
          <span className="hidden sm:inline">entries</span>
        </p>
      </div>
      <div className="lb-cols relative z-[4] grid grid-cols-[28px_minmax(0,1fr)_76px] gap-3 border-y border-[rgba(219,231,238,0.08)] px-4 py-2 text-[13px] font-medium text-cream/50 md:grid-cols-[40px_minmax(0,1fr)_72px_120px_84px] md:px-6">
        <span>#</span>
        <span>Team</span>
        <span className="hidden md:block">Entries</span>
        <span className="hidden md:block">Run</span>
        <span className="text-right">Score</span>
      </div>
      <div ref={rowsRef} key={run} className="lb-rows relative z-[4] hero-in overflow-hidden" style={{ height: `calc(var(--row) * ${fit})` }}>
        {teams.map((t, i) => {
          const rank = rankOf(i);
          const lit = hover === i;
          return (
            <div
              key={t.name}
              onPointerEnter={(e) => e.pointerType !== "touch" && setHover(i)}
              onClick={() => setHover((h) => (h === i ? null : i))}
              data-dim={hover !== null && !lit}
              data-lit={lit}
              data-lead={rank === 0}
              data-up={t.moved > 0}
              data-passed={t.passed}
              className="lb-row absolute inset-x-0 top-0 grid h-[var(--row)] cursor-default grid-cols-[28px_minmax(0,1fr)_76px] items-center gap-3 px-4 md:grid-cols-[40px_minmax(0,1fr)_72px_120px_84px] md:px-6"
              style={{ transform: `translateY(calc(var(--row) * ${rank}))` }}
            >
              <span aria-hidden className="lb-lead" />
              <span className={`text-[14px] font-medium tabular-nums ${rank === 0 ? "text-orange" : "text-cream/55"}`}>{String(rank + 1).padStart(2, "0")}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[16px] font-medium text-cream-hi md:text-[17px]">{t.name}</span>
                {t.moved > 0 && (
                  <span key={t.hit} className="lb-moved shrink-0 text-[12px] font-semibold tabular-nums text-orange">▲{t.moved}</span>
                )}
              </span>
              <span className="hidden text-[15px] tabular-nums text-cream/55 md:block">{t.n}</span>
              <span className="hidden md:block"><Spark hist={t.hist} top={top} lit={lit} /></span>
              <span key={`s${t.hit}`} className={`text-right text-[16px] font-semibold tabular-nums md:text-[17px] ${t.hit ? "lb-flash" : ""} text-cream-hi`}>{t.s.toFixed(4)}</span>
              {t.hit > 0 && <span key={`r${t.hit}`} aria-hidden className="lb-run"><i /></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <EventHero
      slug="datathon"
      lead={page.lead}
      registerHref={page.registerHref}
      rulebookHref={page.rulebookHref}
      scene={null}
      under={<Board />}
    />
  );
}
