"use client";

import { useCallback, useRef } from "react";
import { useCanvasLoop } from "./heroes/shared";
import { type Route, INK, ORANGE, drawPulse, readCanvasTheme, route } from "./heroes/pcb";
import { LOOKS, type LookId, layoutWord } from "./heroes/trace-glyphs";

/* "BITFEST 4.0" routed like copper traces, in one of several lettering styles. The letters are
   drawn once into an offscreen image; each frame only copies it and moves the signals. */

type Letter = { routes: Route[]; accent: boolean };

function paint(letters: Letter[], u: number, w: number, h: number, outline: boolean) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const off = document.createElement("canvas");
  off.width = Math.round(w * dpr);
  off.height = Math.round(h * dpr);
  const ctx = off.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const each = (fn: (r: Route, l: Letter) => void) => letters.forEach((l) => l.routes.forEach((r) => fn(r, l)));
  const path = (r: Route) => {
    ctx.beginPath();
    ctx.moveTo(r.pts[0].x, r.pts[0].y);
    for (let j = 1; j < r.pts.length; j++) ctx.lineTo(r.pts[j].x, r.pts[j].y);
  };
  ctx.lineJoin = outline ? "miter" : "round";
  ctx.lineCap = "round";
  if (outline) {
    const body = u * 0.62;
    each((r, l) => {
      path(r);
      ctx.lineWidth = body + 3;
      ctx.strokeStyle = l.accent ? `rgba(${ORANGE},0.55)` : `rgba(${INK},0.3)`;
      ctx.stroke();
    });
    each((r, l) => {
      path(r);
      ctx.lineWidth = body;
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      if (l.accent) {
        ctx.strokeStyle = `rgba(${ORANGE},0.07)`;
        ctx.stroke();
      }
    });
    each((r, l) => {
      path(r);
      ctx.lineWidth = Math.max(1.5, u * 0.07);
      ctx.strokeStyle = l.accent ? `rgba(${ORANGE},0.45)` : `rgba(${INK},0.2)`;
      ctx.stroke();
    });
  } else {
    // Single line: one copper trace per stroke, with a via at each end.
    each((r, l) => {
      path(r);
      ctx.lineWidth = Math.max(2, u * 0.14);
      ctx.strokeStyle = l.accent ? `rgba(${ORANGE},0.75)` : `rgba(${INK},0.42)`;
      ctx.stroke();
    });
    each((r, l) => {
      for (const p of [r.pts[0], r.pts[r.pts.length - 1]]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(3, u * 0.2), 0, Math.PI * 2);
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = Math.max(1.5, u * 0.07);
        ctx.strokeStyle = l.accent ? `rgba(${ORANGE},0.85)` : `rgba(${INK},0.55)`;
        ctx.stroke();
      }
    });
  }
  return off;
}

export default function TraceWordmark({ look = "chamfer", className = "" }: { look?: LookId; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const st = useRef({ u: 0, w: 0, h: 0, letters: [] as Letter[], art: null as HTMLCanvasElement | null, pulses: [] as { r: Route; s: number; v: number }[], next: 0 });

  const onResize = useCallback((w: number, h: number) => {
    const s = st.current;
    const L = LOOKS[look];
    readCanvasTheme();
    const lay = layoutWord(L, w, h);
    s.u = lay.u;
    s.w = w;
    s.h = h;
    s.letters = lay.letters.map((l) => ({ accent: l.accent, routes: l.strokes.map((pts) => route(pts)) }));
    s.art = paint(s.letters, lay.u, w, h, L.outline);
    s.pulses = [];
  }, [look]);

  const frame = useCallback((ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number, dt: number) => {
    const s = st.current;
    if (!s.art || !s.letters.length) return;
    ctx.drawImage(s.art, 0, 0, s.w, s.h);
    if (t > s.next) {
      const l = s.letters[Math.floor(Math.random() * s.letters.length)];
      const r = l.routes[Math.floor(Math.random() * l.routes.length)];
      s.pulses.push({ r, s: 0, v: 160 + Math.random() * 120 });
      s.next = t + 0.35 + Math.random() * 0.6;
    }
    for (let j = s.pulses.length - 1; j >= 0; j--) {
      const pu = s.pulses[j];
      pu.s += pu.v * dt;
      if (pu.s > pu.r.len + 30) {
        s.pulses.splice(j, 1);
        continue;
      }
      drawPulse(ctx, pu.r, pu.s, 34, Math.max(2, s.u * 0.08));
    }
  }, []);

  useCanvasLoop(canvasRef, frame, onResize);

  return (
    <div className={className}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      <p className="sr-only">BitFest 4.0</p>
    </div>
  );
}
