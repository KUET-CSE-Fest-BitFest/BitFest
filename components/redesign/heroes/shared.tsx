"use client";

import { useEffect, useRef } from "react";
import { fest, SHOW_PRIZES, events } from "@/lib/fest";
import { Button, TextLink } from "@/components/redesign/ui/Button";
import { fitCanvas } from "@/lib/hooks";

export function HeroActions({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 ${className}`} style={style}>
      <Button href="#schedule">Explore the events</Button>
      <TextLink href={fest.facebook} external>Follow on Facebook</TextLink>
    </div>
  );
}

export function FestFacts({ className = "" }: { className?: string }) {
  const items = [
    ...(SHOW_PRIZES ? [["Prize pool", `${fest.prizePool} BDT`]] : []),
    ["Competitions", String(events.length)],
    ["Dates", fest.dates.replace("February", "Feb")],
  ];
  return (
    <dl className={`flex gap-8 ${className}`}>
      {items.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1">
          <dt className="text-[13px] font-medium text-dim">{k}</dt>
          <dd className="text-xl font-bold tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

type Frame = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void;

/**
 * Sizes the canvas to its box (≤2× DPR) and calls `frame` every animation frame while it is on screen.
 * With reduced motion it draws a single still frame per resize.
 */
export function useCanvasLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  frame: Frame,
  onResize?: (w: number, h: number) => void,
) {
  const frameRef = useRef(frame);
  const resizeRef = useRef(onResize);
  frameRef.current = frame;
  resizeRef.current = onResize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = performance.now(), running = false;

    const draw = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      ctx.clearRect(0, 0, w, h);
      frameRef.current(ctx, w, h, now / 1000, dt);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      draw(now);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const resize = () => {
      // Layout size, not the projected box, so canvases inside 3D transforms size correctly.
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      fitCanvas(canvas, w, h);
      resizeRef.current?.(w, h);
      draw(performance.now());
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    document.fonts?.ready.then(resize);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [canvasRef]);
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const ease = (k: number, dt: number) => 1 - Math.exp(-k * dt);
