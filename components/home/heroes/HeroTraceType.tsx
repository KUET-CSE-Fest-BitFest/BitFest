"use client";

import { useCallback, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions, useCanvasLoop } from "./shared";
import { type Pt, type Route, INK, ORANGE, PulseLane, distTo, drawProbe, drawPulse, route } from "./pcb";
import { G, GAP, SPACE, UNITS, WORD } from "./trace-glyphs";

/* A3 — Trace type. The wordmark is routed like copper on a board: hollow traces with a live core.
   Each event chip below is wired into a letter; signals climb in and run the letter's path. */

type Letter = { ch: string; routes: Route[]; accent: boolean; pad?: Pt; padPath?: Pt[] };

export default function HeroTraceType() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chips, setChips] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const [hover, setHover] = useState(-1);
  const st = useRef({
    u: 0,
    letters: [] as Letter[],
    feeds: [] as { r: Route; letter: number }[],
    lanes: events.map(() => new PulseLane()),
    hover: -1,
    ptr: null as Pt | null,
  });

  const onResize = useCallback((w: number, h: number) => {
    const s = st.current;
    const desk = w >= 768;
    const chipH = desk ? Math.round(Math.min(100, Math.max(72, h * 0.15))) : 0;
    const traceMin = desk ? 80 : 0;
    const u = Math.min((w - 8) / (UNITS + 0.8), (h - chipH - traceMin - 24) / 6.9);
    s.u = u;
    const x0 = (w - UNITS * u) / 2;
    // Share the spare height: a little above the word, the rest to the wires.
    const spare = Math.max(0, h - chipH - traceMin - 6 * u - u);
    const y0 = u * 0.5 + spare * 0.38;
    let x = x0;
    const letters: Letter[] = [];
    WORD.forEach((ch, i) => {
      if (ch === " ") {
        x += (SPACE - GAP) * u;
        return;
      }
      const g = G[ch];
      const map = ([a, b]: [number, number]): Pt => ({ x: x + a * u, y: y0 + b * u });
      letters.push({
        ch,
        accent: i >= 8,
        routes: g.paths.map((p) => route(p.map(map))),
        pad: g.pad ? map(g.pad) : undefined,
        padPath: g.pad ? g.paths[0].map(map) : undefined,
      });
      x += (g.w + GAP) * u;
    });
    s.letters = letters;

    if (!desk) {
      s.feeds = [];
      setChips([]);
      return;
    }
    // Chips along the bottom; each feeds one letter pad, left to right.
    const gap = 12, cw = (w - gap * 7) / 8, cy = h - chipH;
    const boxes = events.map((_, i) => ({ x: i * (cw + gap), y: cy, w: cw, h: chipH }));
    const targets = letters.map((l, i) => ({ l, i })).filter((o) => o.l.pad).slice(0, 8);
    const padY = y0 + 6 * u;
    const yA = cy - 16, yB = padY + Math.max(18, u * 0.7);
    const dxs = boxes.map((b, i) => targets[i].l.pad!.x - (b.x + b.w / 2));
    const k = Math.max(1, Math.max(...dxs.map(Math.abs)) / Math.max(30, yA - yB));
    s.feeds = boxes.map((b, i) => {
      const t = targets[i];
      const cx = b.x + b.w / 2, px = t.l.pad!.x;
      const ys = yB + Math.abs(px - cx) / k;
      return { r: route([{ x: cx, y: cy }, { x: cx, y: Math.min(yA, ys) }, { x: cx, y: ys }, { x: px, y: yB }, ...t.l.padPath!]), letter: t.i };
    });
    setChips(boxes);
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    const s = st.current;
    const u = s.u;
    if (!u || !s.letters.length) return;
    const p = s.ptr;
    const hov = s.hover;
    const hotLetter = hov >= 0 && s.feeds[hov] ? s.feeds[hov].letter : -1;

    // Feeds (chip → letter pad), base copper.
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    s.feeds.forEach((f, i) => {
      const near = p ? Math.max(0, 1 - distTo(f.r, p) / 80) : 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = i === hov ? `rgba(${ORANGE},0.9)` : `rgba(${INK},${0.12 + near * 0.15})`;
      ctx.beginPath();
      const pts = f.r.pts;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j <= 4; j++) ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
    });

    // Letters: outlines for all paths first, then hollow fills, then the cores — so joins merge cleanly.
    const body = u * 0.62;
    const glow = s.letters.map((l, i) => {
      const near = p ? Math.max(0, 1 - Math.min(...l.routes.map((r) => distTo(r, p))) / (u * 1.4)) : 0;
      return Math.max(i === hotLetter ? 1 : 0, near * 0.8);
    });
    const each = (fn: (r: Route, l: Letter, i: number) => void) => s.letters.forEach((l, i) => l.routes.forEach((r) => fn(r, l, i)));
    const path = (r: Route) => {
      ctx.beginPath();
      ctx.moveTo(r.pts[0].x, r.pts[0].y);
      for (let j = 1; j < r.pts.length; j++) ctx.lineTo(r.pts[j].x, r.pts[j].y);
    };
    ctx.lineJoin = "miter";
    ctx.lineCap = "round";
    each((r, l, i) => {
      path(r);
      ctx.lineWidth = body + 3;
      const g = glow[i];
      ctx.strokeStyle = g > 0.02 ? `rgba(${ORANGE},${0.35 + 0.6 * g})` : l.accent ? `rgba(${ORANGE},0.55)` : `rgba(${INK},0.32)`;
      ctx.stroke();
    });
    each((r, l, i) => {
      path(r);
      ctx.lineWidth = body;
      ctx.strokeStyle = "#06070b";
      ctx.stroke();
      const g = glow[i];
      if (g > 0.02 || l.accent) {
        ctx.strokeStyle = `rgba(${ORANGE},${l.accent ? 0.07 + 0.1 * g : 0.13 * g})`;
        ctx.stroke();
      }
    });
    each((r, l, i) => {
      path(r);
      ctx.lineWidth = Math.max(1.5, u * 0.07);
      ctx.strokeStyle = glow[i] > 0.02 || l.accent ? `rgba(${ORANGE},${0.45 + 0.5 * glow[i]})` : `rgba(${INK},0.22)`;
      ctx.stroke();
    });
    // Pads where the feeds land.
    for (const l of s.letters) {
      if (!l.pad) continue;
      ctx.fillStyle = "#06070b";
      ctx.strokeStyle = l.accent ? `rgba(${ORANGE},0.7)` : `rgba(${INK},0.45)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(l.pad.x, l.pad.y, body * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = l.accent ? `rgba(${ORANGE},0.8)` : `rgba(${INK},0.5)`;
      ctx.beginPath();
      ctx.arc(l.pad.x, l.pad.y, body * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Signals.
    s.feeds.forEach((f, i) => {
      const lane = s.lanes[i];
      lane.step(t, dt, f.r.len, i === hov ? { gap: [0.2, 0.3], speed: 2.6 } : { gap: [1.4, 4.2], speed: 1.15 });
      for (const pu of lane.list) drawPulse(ctx, f.r, pu.s, 30, 2.5);
    });

    if (p) drawProbe(ctx, p);
  }, []);

  useCanvasLoop(canvasRef, frame, onResize);

  const pick = (i: number) => {
    st.current.hover = i;
    setHover(i);
  };

  return (
    <section aria-label="BitFest 2027" className="dot-grid relative flex h-[100svh] min-h-[680px] flex-col overflow-hidden px-6 pb-8 pt-[88px] md:px-14">
      <div className="mx-auto flex w-full max-w-[1332px] flex-1 flex-col">
        <div className="flex flex-wrap justify-between gap-2 text-[15px] font-medium text-soft">
          <p>{fest.kicker}</p>
          <p className="text-muted">{fest.dates} · {fest.venue}</p>
        </div>
        <h1 className="sr-only">BitFest 2027</h1>

        <div
          ref={stageRef}
          className="relative my-5 min-h-[200px] flex-1"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            st.current.ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
          }}
          onPointerLeave={() => (st.current.ptr = null)}
        >
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
          <ul>
            {chips.map((b, i) => {
              const e = events[i];
              const on = hover === i;
              return (
                <li key={e.slug} className="absolute" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}>
                  <a
                    href={e.href}
                    onPointerEnter={() => pick(i)}
                    onPointerLeave={() => pick(-1)}
                    onFocus={() => pick(i)}
                    onBlur={() => pick(-1)}
                    className={`ic-legs relative flex h-full flex-col justify-center border bg-panel px-3 transition-colors ${on ? "border-orange" : "border-line-2"}`}
                    data-on={on}
                  >
                    <span className="text-[12px] tabular-nums text-dim">
                      <span className={on ? "text-orange" : ""}>{pad2(i + 1)}</span> · {e.kind}
                    </span>
                    <span className={`text-[15px] font-semibold leading-tight ${on ? "text-ink" : "text-soft"}`}>{e.name}</span>
                    <span className={`mt-1 text-[12px] tabular-nums ${on ? "text-orange" : "text-muted"}`}>{e.day} · {e.pool === "TBA" ? "Prizes TBA" : `${e.pool} BDT`}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <ul className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 md:hidden">
          {events.map((e, i) => (
            <li key={e.slug}><a href={e.href} className="text-[15px] font-semibold"><span className="text-dim">{pad2(i + 1)} </span>{e.name}</a></li>
          ))}
        </ul>

        <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-12">
          <p className="max-w-[460px] text-[17px] leading-relaxed text-soft">{fest.blurb}</p>
          <FestFacts className="max-md:hidden" />
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
