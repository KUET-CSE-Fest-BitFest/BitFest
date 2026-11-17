"use client";

import { useEffect, useRef, useState } from "react";
import { Arena3D, CAMS } from "@/lib/game/arena3d";
import { fitCanvas, useInView, useReducedMotion } from "@/lib/hooks";
import SectionHead from "@/components/ui/SectionHead";

const SPECS = [
  { k: "Arena", v: "[W] × [L] cm" },
  { k: "Surface", v: "[MATERIAL]" },
  { k: "Goal width", v: "[X] cm" },
  { k: "Ball", v: "[TYPE / SIZE]" },
];

export default function Arena() {
  const [wrapRef, inView] = useInView<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arenaRef = useRef<Arena3D | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [preset, setPreset] = useState(0);
  const [score, setScore] = useState({ orange: 0, cyan: 0 });
  const [dragging, setDragging] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const c = canvasRef.current!;
    const a = (arenaRef.current ??= new Arena3D());
    a.onGoal = setScore;
    let w = 0, h = 0;
    const resize = () => { const r = c.getBoundingClientRect(); w = r.width; h = r.height; fitCanvas(c, w, h); a.draw(c.getContext("2d")!, w, h); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    if (!inView) return () => ro.disconnect();
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); if (!reduce) a.step(); a.draw(ctx, w, h); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [inView, reduce]);

  const pick = (i: number) => { arenaRef.current?.setPreset(i); setPreset(i); };

  return (
    <section aria-labelledby="arena-h" className="mx-auto max-w-[1440px] px-6 py-28 md:px-14 lg:py-40">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div id="arena-h"><SectionHead n="06" eyebrow="The arena" title="Walk the pitch." sub="Drag to orbit, switch cameras, zoom in. Same field, same goals your bot will face." /></div>
        <dl data-reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line">
          {SPECS.map((s) => (
            <div key={s.k} className="flex flex-col gap-1 bg-bg px-5 py-4">
              <dt className="text-[13px] font-medium text-dim">{s.k}</dt>
              <dd className="text-lg font-semibold">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div ref={wrapRef} data-reveal className="lidx relative mt-12 rounded-[16px]">
        <span className="lx lx-rim" />
        <canvas
          ref={canvasRef}
          className={`relative z-[4] block aspect-[16/9] w-full touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          role="img"
          aria-label="3D view of the arena with a 2 versus 2 AI match. Drag to orbit."
          onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (!drag.current) return; arenaRef.current?.orbit(e.clientX - drag.current.x, e.clientY - drag.current.y); drag.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={() => { drag.current = null; setDragging(false); }}
        />
        <div className="pointer-events-none absolute left-1/2 top-4 z-[5] flex -translate-x-1/2 items-center gap-3 rounded-full border border-[rgba(255,214,190,0.22)] bg-[#0c0a0b]/85 px-4 py-1.5 text-[13px] font-medium">
          <span className="flex items-center gap-2 text-[#ff8a6a]"><span className="h-2 w-2 animate-live rounded-full bg-[#ff6a5a]" />Live</span>
          <span className="text-orange">Orange</span>
          <span className="text-2xl font-semibold tabular-nums">{score.orange}–{score.cyan}</span>
          <span className="text-plum">Plum</span>
        </div>
        <div className="absolute bottom-4 right-4 z-[5] flex gap-2">
          {[["Zoom in", "+", -160], ["Zoom out", "−", 160]].map(([l, t, d]) => (
            <button key={l as string} type="button" aria-label={l as string} onClick={() => arenaRef.current?.zoom(d as number)} className="grid h-11 w-11 place-items-center rounded-[10px] border border-[rgba(255,214,190,0.2)] bg-[#0c0a0b]/85 text-xl transition-colors hover:border-orange">{t}</button>
          ))}
        </div>
        <div role="group" aria-label="Camera" className="absolute bottom-4 left-4 z-[5] flex flex-wrap gap-2">
          {CAMS.map((c, i) => (
            <button key={c.label} type="button" aria-pressed={preset === i} onClick={() => pick(i)}
              className={`min-h-11 rounded-[10px] border px-4 text-[13px] font-medium transition-colors ${preset === i ? "border-orange bg-[#2a150c]/90 text-ink" : "border-[rgba(255,214,190,0.2)] bg-[#0c0a0b]/85 text-muted hover:text-ink"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
