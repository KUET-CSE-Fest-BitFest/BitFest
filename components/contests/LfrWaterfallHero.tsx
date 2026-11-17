"use client";

import { useEffect, useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import HeroPanel, { LiveDot } from "@/components/event/HeroPanel";
import { fitCanvas } from "@/lib/hooks";
import { EMBER } from "@/components/home/heroes/rebrand/WarmLight";
import { eventPages } from "@/lib/eventPages";

/* Line Following Robot hero · Sensor waterfall. What the robot sees, as it sees it: eight rows, one
   per IR sensor, scrolling left through time and coloured on the site's warm ramp by how strongly
   each sensor reads the line. The line is the warm ribbon wandering between rows; a junction lights a
   whole column, a gap leaves one dark. Beside it, the steering error the controller works against. */

const page = eventPages.lfr;
const ROWS = 8;

function ramp() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 1;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 128, 0);
  EMBER.forEach(([s, col]) => grad.addColorStop(s, col));
  g.fillStyle = grad; g.fillRect(0, 0, 128, 1);
  const d = g.getImageData(0, 0, 128, 1).data;
  return (v: number) => { const i = Math.max(0, Math.min(127, Math.round(v * 127))) * 4; return `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`; };
}

function Waterfall() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [read, setRead] = useState({ err: -0.12, state: "On the line", speed: 1.6 });
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = ramp();
    let W = 0, H = 0, cols = 0, tick = 0;
    let hist: number[][] = [];
    const sample = (t: number) => {
      const k = t % 64;
      if (k === 20 || k === 21) return { v: Array(ROWS).fill(0.95), c: 3.5, state: "Junction" };
      if (k >= 44 && k <= 46) return { v: Array(ROWS).fill(0.04), c: 3.5, state: "Gap: holding course" };
      const c = 3.5 + 2.4 * Math.sin(t / 9) + 0.9 * Math.sin(t / 3.7);
      return { v: Array.from({ length: ROWS }, (_, i) => 0.05 + 0.9 * Math.exp(-((i - c) ** 2) / 1.1)), c, state: "On the line" };
    };
    const build = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      fitCanvas(canvas, W, H);
      cols = Math.floor(W / 11);
      hist = Array.from({ length: cols }, (_, i) => sample(tick - cols + i).v);
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cw = W / cols, rh = H / ROWS;
      hist.forEach((col, x) => {
        const fade = 0.35 + 0.65 * (x / cols);
        col.forEach((v, y) => {
          ctx.globalAlpha = fade;
          ctx.fillStyle = color(v * 0.92);
          ctx.beginPath(); ctx.roundRect(x * cw + 1, y * rh + 1, cw - 2, rh - 2, 2); ctx.fill();
        });
      });
      ctx.globalAlpha = 1;
    };
    let id = 0, visible = true;
    const step = () => {
      if (!visible) return;
      tick++;
      const s = sample(tick);
      hist.push(s.v); if (hist.length > cols) hist.shift();
      draw();
      if (tick % 3 === 0) setRead({ err: s.state === "On the line" ? (s.c - 3.5) / 3.5 : 0, state: s.state, speed: s.state === "Junction" ? 1.2 : 1.4 + 0.4 * (1 - Math.abs(s.c - 3.5) / 3.5) });
    };
    build(); draw();
    const ro = new ResizeObserver(() => { build(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);
    if (!reduce) id = window.setInterval(step, 90);
    return () => { window.clearInterval(id); ro.disconnect(); io.disconnect(); };
  }, []);

  const pct = Math.round(read.err * 100);
  return (
    <HeroPanel
      title="Sensor view"
      meta="8 IR sensors, live"
      label="What a line-following robot's eight sensors read over time, as a warm ribbon, with the steering error beside it."
      right={<><LiveDot /><span className="tabular-nums">{read.speed.toFixed(1)} m/s</span></>}
    >
      <div className="grid gap-5 px-4 py-4 md:grid-cols-[minmax(0,1fr)_230px] md:gap-7 md:px-6">
        <div className="flex gap-3">
          <div aria-hidden className="flex flex-col justify-between py-0.5 text-[11px] tabular-nums text-[#f2e6dc]/40">
            {Array.from({ length: ROWS }, (_, i) => <span key={i}>S{i + 1}</span>)}
          </div>
          <canvas ref={ref} className="h-[168px] min-w-0 flex-1 md:h-[184px]" />
        </div>
        <div className="flex flex-col justify-center gap-4">
          <span className="text-[13px] font-medium text-[#f2e6dc]/60">{read.state}</span>
          <div className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between">
              <span className="text-[13px] text-[#f2e6dc]/60">Steering error</span>
              <span className="lx-ink-warm text-[30px] font-semibold leading-none tabular-nums">{pct > 0 ? "+" : ""}{pct}%</span>
            </span>
            <span className="relative h-[6px] rounded-full bg-[rgba(255,214,190,0.08)]">
              <span className="absolute left-1/2 top-[-3px] h-[12px] w-px bg-[rgba(255,214,190,0.3)]" />
              <span className="absolute top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_40%,#fff1d6,#ff7a3d_65%)] shadow-[0_0_12px_rgba(255,122,61,0.8)] transition-[left] duration-200" style={{ left: `${50 + read.err * 46}%` }} />
            </span>
            <span className="flex justify-between text-[11px] text-[#f2e6dc]/40"><span>Left</span><span>Right</span></span>
          </div>
        </div>
      </div>
    </HeroPanel>
  );
}

export default function LfrWaterfallHero() {
  return <EventHero slug="lfr" lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} under={<Waterfall />} />;
}
