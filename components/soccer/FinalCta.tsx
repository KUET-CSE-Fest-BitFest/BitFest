"use client";

import { useEffect, useRef, useState } from "react";
import { Shootout, SW, SH, type ShotResult } from "@/lib/game/shootout";
import { fitCanvas, useInView } from "@/lib/hooks";
import { event } from "@/lib/content";
import { Button } from "@/components/ui/Button";

export default function FinalCta() {
  const [wrapRef, inView] = useInView<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Shootout | null>(null);
  const [res, setRes] = useState<{ r: ShotResult; id: number } | null>(null);
  const [stats, setStats] = useState({ streak: 0, best: 0 });
  const [aiming, setAiming] = useState(false);

  useEffect(() => {
    const c = canvasRef.current!;
    const g = (gameRef.current ??= new Shootout());
    g.onResult = (r, streak, best) => {
      setStats({ streak, best });
      const id = Date.now();
      setRes({ r, id });
      window.setTimeout(() => setRes((x) => (x?.id === id ? null : x)), 1100);
    };
    let w = 0;
    const resize = () => { const r = c.getBoundingClientRect(); w = r.width; fitCanvas(c, r.width, r.height); g.draw(c.getContext("2d")!, w); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    if (!inView) return () => ro.disconnect();
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); g.step(); g.draw(ctx, w); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [inView]);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), s = SW / r.width;
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  };

  const col = res?.r === "GOAL" ? "#ff7a3d" : res?.r === "SAVED" ? "#c2458a" : "#8b90a3";

  return (
    <section id="register" className="relative scroll-mt-20 overflow-hidden border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 py-28 md:px-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:py-40">
        <div className="flex flex-col gap-7">
          <p data-reveal className="flex items-center gap-3 text-[15px] font-medium text-muted"><span className="tabular-nums text-orange">09</span><span aria-hidden className="h-px w-8 bg-line-2" />Registration open</p>
          <h2 data-reveal className="text-[clamp(48px,6.4vw,96px)] font-semibold leading-[0.92] tracking-[-0.045em]">Think you<br />can score?</h2>
          <p data-reveal className="max-w-[460px] text-lg text-soft">Warm up against our keeper — then bring the real bot to KUET. It gets harder every two goals.</p>
          <div data-reveal className="flex flex-wrap gap-3">
            <Button href={event.registrationUrl}>Register your team</Button>
            <Button href={event.rulebookHref} variant="ghost">Rulebook (PDF)</Button>
          </div>
          <p data-reveal className="text-[14px] text-dim">Registration closes 26 Dec · [fee] per team</p>
        </div>

        <div ref={wrapRef} data-reveal className="lidx relative rounded-[16px] p-2">
          <span className="lx lx-rim" />
          <div className="relative z-[4] flex items-center justify-between px-3 py-2.5 text-[13px] font-medium text-muted">
            <span>Drag the ball back, then release</span>
            <span className="tabular-nums">Streak <span className="text-orange">{String(stats.streak).padStart(2, "0")}</span> · Best <span className="text-ink">{String(stats.best).padStart(2, "0")}</span></span>
          </div>
          <div className="relative z-[4] overflow-hidden rounded-[10px]">
            <canvas
              ref={canvasRef}
              className={`block w-full touch-none ${aiming ? "cursor-grabbing" : "cursor-grab"}`}
              style={{ aspectRatio: `${SW} / ${SH}` }}
              role="img"
              aria-label="Penalty mini game. Drag the ball back and release to shoot past the keeper."
              onPointerDown={(e) => { if (gameRef.current?.down(pt(e))) { setAiming(true); e.currentTarget.setPointerCapture(e.pointerId); } }}
              onPointerMove={(e) => gameRef.current?.move(pt(e))}
              onPointerUp={() => { gameRef.current?.up(); setAiming(false); }}
              onPointerCancel={() => { gameRef.current?.up(); setAiming(false); }}
            />
            {res && (
              <span key={res.id} aria-live="polite" className="animate-pop pointer-events-none absolute left-1/2 top-1/2 text-[clamp(48px,8vw,110px)] font-semibold tracking-[-0.04em]" style={{ color: col, textShadow: `0 0 50px ${col}` }}>
                {res.r === "GOAL" ? "GOAL!" : res.r}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
