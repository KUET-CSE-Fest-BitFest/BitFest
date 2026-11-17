"use client";

import { useEffect, useRef } from "react";
import EventHero from "@/components/event/EventHero";
import { LiveDot } from "@/components/event/HeroPanel";
import { copyRects } from "@/lib/copyRects";
import { fitCanvas } from "@/lib/hooks";
import { eventPages } from "@/lib/eventPages";

/* Line Following Robot hero: a white line on the dark mat, laid around the title rather than under
   it: along the bottom, up both sides and back beneath the buttons, with a junction spur, a gap in
   the line and a start bar. A small robot follows it, slowing into the curves, its sensor bar
   reading the line and a warm trail behind it. The badge times each lap. */

const page = eventPages.lfr;
type Pt = { x: number; y: number };

/** A closed polygon with rounded corners, sampled every `step` px. */
function roundedLoop(c: Pt[], radius: number, step = 3): Pt[] {
  const out: Pt[] = [];
  const n = c.length;
  const ends = c.map((p, i) => {
    const a = c[(i - 1 + n) % n], b = c[(i + 1) % n];
    const la = Math.hypot(a.x - p.x, a.y - p.y), lb = Math.hypot(b.x - p.x, b.y - p.y);
    const r = Math.min(radius, la / 2, lb / 2);
    return { p0: { x: p.x + ((a.x - p.x) / la) * r, y: p.y + ((a.y - p.y) / la) * r }, p1: { x: p.x + ((b.x - p.x) / lb) * r, y: p.y + ((b.y - p.y) / lb) * r }, p };
  });
  ends.forEach(({ p0, p1, p }, i) => {
    const k = Math.max(6, Math.ceil(Math.hypot(p1.x - p0.x, p1.y - p0.y) / step));
    for (let j = 0; j <= k; j++) {
      const t = j / k, u = 1 - t;
      out.push({ x: u * u * p0.x + 2 * u * t * p.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * p.y + t * t * p1.y });
    }
    const q = ends[(i + 1) % n].p0;
    const m = Math.ceil(Math.hypot(q.x - p1.x, q.y - p1.y) / step);
    for (let j = 1; j < m; j++) out.push({ x: p1.x + ((q.x - p1.x) * j) / m, y: p1.y + ((q.y - p1.y) * j) / m });
  });
  return out;
}

const fmt = (ms: number) => {
  const s = ms / 1000;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
};

function Track({ lapRef, timeRef, bestRef }: { lapRef: React.RefObject<HTMLSpanElement | null>; timeRef: React.RefObject<HTMLSpanElement | null>; bestRef: React.RefObject<HTMLSpanElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, pts: Pt[] = [], acc: number[] = [], total = 1, gap: [number, number] = [0, 0], start = 0, spur: [Pt, Pt] | null = null, lw = 9;
    const bot = { s: 0, lap: 1, t0: performance.now(), best: 0, trail: [] as Pt[] };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      fitCanvas(canvas, W, H);
      const sec = canvas.closest("section") as HTMLElement | null;
      const boxes = sec ? copyRects(sec, 30) : [];
      const cx0 = Math.min(W, ...boxes.map((b) => b.x0)), cx1 = Math.max(0, ...boxes.map((b) => b.x1));
      const cb = Math.max(0, ...boxes.map((b) => b.y1));
      const L = Math.max(36, W * 0.045), R = W - L;
      // The bottom lane runs above the lap badge when there is room, else beneath it.
      let bandTop = cb + 34;
      let bandBot = H - 108;
      if (bandBot - bandTop < 80) bandBot = H - 28;
      if (bandBot - bandTop < 80) bandTop = bandBot - 80;
      const yT = H * 0.36;
      const sxL = cx0 - 34, sxR = cx1 + 34;
      const sides = W >= 900 && sxL - L >= 90 && R - sxR >= 90 && bandTop - yT > 80;
      lw = W < 768 ? 7 : 9;
      let corners: Pt[];
      if (sides) {
        corners = [
          { x: L, y: bandBot }, { x: L, y: yT }, { x: sxL, y: yT }, { x: sxL, y: bandTop }, { x: sxR, y: bandTop },
          { x: sxR, y: yT }, { x: R, y: yT }, { x: R, y: bandBot }, { x: W * 0.68, y: bandBot }, { x: W * 0.5, y: bandBot - 30 }, { x: W * 0.32, y: bandBot },
        ];
      } else {
        // A dip in the top lane (an S-bend each way) when the band is deep enough.
        const dip = Math.min(46, (bandBot - bandTop) * 0.3);
        corners = W >= 768 && dip > 24
          ? [{ x: L, y: bandBot }, { x: L, y: bandTop }, { x: W * 0.3, y: bandTop }, { x: W * 0.4, y: bandTop + dip }, { x: W * 0.6, y: bandTop + dip }, { x: W * 0.7, y: bandTop }, { x: R, y: bandTop }, { x: R, y: bandBot }, { x: W * 0.62, y: bandBot }, { x: W * 0.5, y: bandBot - 24 }, { x: W * 0.38, y: bandBot }]
          : [{ x: L, y: bandBot }, { x: L, y: bandTop }, { x: R, y: bandTop }, { x: R, y: bandBot }, { x: W * 0.62, y: bandBot }, { x: W * 0.5, y: bandBot - 24 }, { x: W * 0.38, y: bandBot }];
      }
      pts = roundedLoop(corners, sides ? 64 : Math.min(56, (bandBot - bandTop) / 2.2));
      acc = [0];
      for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      total = acc[acc.length - 1] + Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
      const near = (q: Pt) => pts.reduce((bi, p, i) => (Math.hypot(p.x - q.x, p.y - q.y) < Math.hypot(pts[bi].x - q.x, pts[bi].y - q.y) ? i : bi), 0);
      // The gap: a short break in the line on the lane under the buttons (or the top lane on phones).
      const g = acc[near(sides ? { x: (sxL + sxR) / 2 + (sxR - sxL) * 0.22, y: bandTop } : { x: W * 0.5, y: bandTop + 40 })];
      gap = [g - 18, g + 18];
      start = acc[near({ x: W * 0.2, y: bandBot })];
      // A junction: a short spur off the bump in the bottom straight.
      const j = pts[near({ x: W * 0.5, y: bandBot - (sides ? 30 : 24) })];
      spur = [j, { x: j.x, y: j.y + 26 }];
      bot.s = start;
      bot.trail = [];
    };

    const at = (s: number) => {
      s = ((s % total) + total) % total;
      let lo = 0, hi = acc.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (acc[m] <= s) lo = m; else hi = m - 1; }
      const a = pts[lo], b = pts[(lo + 1) % pts.length];
      const seg = Math.hypot(b.x - a.x, b.y - a.y) || 1, t = (s - acc[lo]) / seg;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, a: Math.atan2(b.y - a.y, b.x - a.x) };
    };

    let shown = 0;
    const step = (dt: number, now: number) => {
      const p = at(bot.s), q = at(bot.s + 34);
      let d = q.a - p.a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      const base = W < 768 ? 120 : 200;
      const before = (((bot.s - start) % total) + total) % total;
      bot.s += base * (1 - Math.min(0.6, Math.abs(d) * 1.1)) * dt;
      const after = (((bot.s - start) % total) + total) % total;
      if (after < before) {
        const lapMs = now - bot.t0;
        bot.best = bot.best ? Math.min(bot.best, lapMs) : lapMs;
        bot.lap++;
        bot.t0 = now;
        if (bestRef.current) bestRef.current.textContent = `best ${fmt(bot.best)}`;
        if (lapRef.current) lapRef.current.textContent = `Lap ${bot.lap}`;
      }
      bot.trail.push({ x: p.x, y: p.y });
      if (bot.trail.length > 70) bot.trail.shift();
      if (now - shown > 60 && timeRef.current) { shown = now; timeRef.current.textContent = fmt(now - bot.t0); }
    };

    const line = (from: number, to: number) => {
      ctx.beginPath();
      const s0 = at(from);
      ctx.moveTo(s0.x, s0.y);
      for (let s = from + 3; s < to; s += 3) { const p = at(s); ctx.lineTo(p.x, p.y); }
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = "round"; ctx.lineCap = "butt";
      ctx.strokeStyle = "rgba(255,214,190,0.04)"; ctx.lineWidth = 26;
      line(0, total);
      ctx.strokeStyle = "rgba(242,236,230,0.8)"; ctx.lineWidth = lw;
      line(gap[1], gap[0] + total);
      if (spur) {
        ctx.beginPath(); ctx.moveTo(spur[0].x, spur[0].y); ctx.lineTo(spur[1].x, spur[1].y); ctx.stroke();
      }
      // Start bar.
      const st = at(start);
      ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.a + Math.PI / 2);
      ctx.fillStyle = "#ff7a3d"; ctx.shadowColor = "#ff7a3d"; ctx.shadowBlur = 12;
      ctx.fillRect(-16, -2, 32, 4);
      ctx.restore();
      // Trail.
      for (let i = 1; i < bot.trail.length; i++) {
        const a = bot.trail[i - 1], b = bot.trail[i];
        ctx.strokeStyle = `rgba(255,122,61,${(i / bot.trail.length) * 0.5})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // The robot: chassis, wheels, and a sensor bar whose middle eye sits on the line.
      const p = at(bot.s);
      const inGap = (() => { const s = ((bot.s % total) + total) % total; return s > gap[0] && s < gap[1]; })();
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      const k = W < 768 ? 0.8 : 1;
      ctx.scale(k, k);
      ctx.fillStyle = "#0b0809";
      ctx.fillRect(-14, -15, 9, 5); ctx.fillRect(-14, 10, 9, 5);
      ctx.shadowColor = "#ff7a3d"; ctx.shadowBlur = 16;
      ctx.fillStyle = "#151214"; ctx.strokeStyle = "#ff7a3d"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-16, -11, 30, 22, 5); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      for (let i = -2; i <= 2; i++) {
        const lit = i === 0 && !inGap;
        ctx.fillStyle = lit ? "#ffd27a" : inGap && i === 0 ? "#c2458a" : "rgba(242,230,220,0.3)";
        ctx.beginPath(); ctx.arc(17, i * 4.5, lit ? 2.2 : 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    let raf = 0, visible = true, last = performance.now();
    const loop = (now: number) => {
      step(Math.min(0.05, (now - last) / 1000), now);
      last = now;
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    build();
    draw();
    const ro = new ResizeObserver(() => { build(); if (reduce || !raf) draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    kick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [lapRef, timeRef, bestRef]);

  return (
    <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_18%,rgba(0,0,0,0.35)_30%,rgba(0,0,0,0.85)_42%,#000_52%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_18%,rgba(0,0,0,0.35)_30%,rgba(0,0,0,0.85)_42%,#000_52%)]">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" role="img" aria-label="A line-following robot running laps of a track with curves, a junction and a gap in the line." />
    </div>
  );
}

export default function LfrHero() {
  const lapRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const bestRef = useRef<HTMLSpanElement>(null);
  return (
    <EventHero
      slug="lfr"
      lead={page.lead}
      registerHref={page.registerHref}
      rulebookHref={page.rulebookHref}
      scene={<Track lapRef={lapRef} timeRef={timeRef} bestRef={bestRef} />}
      badge={
        <>
          <span className="relative z-[4] flex items-center gap-2 text-[#ff8a6a]"><LiveDot /><span ref={lapRef}>Lap 1</span></span>
          <span ref={timeRef} className="relative z-[4] text-[24px] font-semibold leading-none tabular-nums text-ink">00:00.00</span>
          <span ref={bestRef} className="relative z-[4] hidden tabular-nums text-soft sm:inline">best –</span>
        </>
      }
    />
  );
}
