"use client";

import { useEffect, useRef, useState } from "react";
import { PitchSim } from "@/lib/game/pitch";
import { fitCanvas, useInView, useReducedMotion } from "@/lib/hooks";
import { about } from "@/lib/content";
import SectionHead from "@/components/ui/SectionHead";

export default function About() {
  const [wrapRef, inView] = useInView<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<PitchSim | null>(null);
  const [score, setScore] = useState({ orange: 0, cyan: 0 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const c = canvasRef.current!;
    const sim = (simRef.current ??= new PitchSim({ mode: "ai", onGoal: (_, s) => setScore(s) }));
    let w = 0, h = 0;
    const resize = () => { const r = c.getBoundingClientRect(); w = r.width; h = r.height; fitCanvas(c, w, h); sim.draw(c.getContext("2d")!, w, h); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    if (!inView || reduce) return () => ro.disconnect();
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); sim.step(); sim.draw(ctx, w, h); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [inView, reduce]);

  return (
    <section id="about" className="relative mx-auto grid max-w-[1440px] scroll-mt-20 gap-14 px-6 py-28 md:px-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:py-40">
      <div className="flex flex-col gap-12">
        <SectionHead n="01" eyebrow="Overview" title={<>Robot football,<br />built by you.</>} />
        <ol className="flex flex-col">
          {about.map((a) => (
            <li key={a.k} data-reveal className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-t border-line py-6 last:border-b">
              <span className="text-[13px] font-medium tabular-nums text-orange">{a.k}</span>
              <div className="flex flex-col gap-1.5">
                <span className="text-2xl font-semibold tracking-[-0.02em]">{a.t}</span>
                <span className="text-soft">{a.d}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div ref={wrapRef} data-reveal className="lidx relative rounded-[16px] p-2">
        <span className="lx lx-rim" />
        <div className="relative z-[4] flex items-center justify-between px-3 py-2.5 text-[13px] font-medium text-muted">
          <span className="flex items-center gap-2 text-[#ff8a6a]"><span className="h-1.5 w-1.5 animate-live rounded-full bg-[#ff6a5a]" />AI vs AI · live sim</span>
          <span><span className="text-orange">{score.orange}</span> : <span className="text-cyan">{score.cyan}</span></span>
        </div>
        <canvas ref={canvasRef} className="relative z-[4] block aspect-[16/9] w-full rounded-[10px]" role="img" aria-label="Two AI robots playing a match" />
      </div>
    </section>
  );
}
