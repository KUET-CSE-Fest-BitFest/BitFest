"use client";

import { useCallback, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions, useCanvasLoop } from "./shared";

/* A — Circuit board. The copy block is the main chip; the eight events are chips wired to it.
   Signals run out along the traces, the pointer is a probe, hovering a chip lights its route. */

type Pt = { x: number; y: number };
type Route = { pts: Pt[]; cum: number[]; len: number };
type Box = { x: number; y: number; w: number; h: number };

const route = (pts: Pt[]): Route => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, cum, len: cum[cum.length - 1] };
};
const at = (r: Route, s: number): Pt => {
  s = Math.max(0, Math.min(r.len, s));
  let i = 1;
  while (i < r.cum.length - 1 && r.cum[i] < s) i++;
  const a = r.pts[i - 1], b = r.pts[i];
  const seg = r.cum[i] - r.cum[i - 1] || 1;
  const k = (s - r.cum[i - 1]) / seg;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};
const distTo = (r: Route, p: Pt) => {
  let d = Infinity;
  for (let i = 1; i < r.pts.length; i++) {
    const a = r.pts[i - 1], b = r.pts[i];
    const vx = b.x - a.x, vy = b.y - a.y;
    const l2 = vx * vx + vy * vy || 1;
    const k = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
    d = Math.min(d, Math.hypot(p.x - (a.x + vx * k), p.y - (a.y + vy * k)));
  }
  return d;
};
const strokeRoute = (ctx: CanvasRenderingContext2D, r: Route) => {
  ctx.beginPath();
  ctx.moveTo(r.pts[0].x, r.pts[0].y);
  for (let i = 1; i < r.pts.length; i++) ctx.lineTo(r.pts[i].x, r.pts[i].y);
  ctx.stroke();
};
// Small seeded random so the decoration stays put between reloads.
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const ORANGE = "255,122,61";

export default function HeroCircuit() {
  const secRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chips, setChips] = useState<Box[]>([]);
  const [hover, setHover] = useState(-1);
  const hoverRef = useRef(-1);
  const st = useRef({
    routes: [] as Route[],
    deco: [] as Route[],
    vias: [] as Pt[],
    pads: [] as { p: Pt; on: boolean }[],
    copy: null as Box | null,
    chips: [] as Box[],
    pulses: events.map(() => [] as { s: number; v: number }[]),
    next: events.map(() => 0),
    arrived: events.map(() => -9),
    pointer: null as Pt | null,
  });

  const onResize = useCallback((w: number, h: number) => {
    const s = st.current;
    const sec = secRef.current?.getBoundingClientRect();
    const cr = copyRef.current?.getBoundingClientRect();
    if (!sec || !cr) return;
    const copy = { x: cr.left - sec.left, y: cr.top - sec.top, w: cr.width, h: cr.height };
    s.copy = copy;
    if (w < 1024) {
      s.routes = []; s.deco = []; s.vias = []; s.pads = []; s.chips = [];
      setChips([]);
      return;
    }
    const G = 56, cw = 204, ch = 64, gapX = 44;
    const right = (w + Math.min(w, 1440)) / 2 - G; // same right edge as the nav
    const colX2 = right - cw, colX1 = colX2 - gapX - cw;
    const top = 112, bottom = h - 56;
    const step = (bottom - top - ch) / 7;
    const boxes = events.map((_, i) => ({ x: i % 2 ? colX2 : colX1, y: top + i * step, w: cw, h: ch }));
    const pinX = copy.x + copy.w + 36;
    const mid = (top + bottom) / 2;
    const pinGap = 18;
    const xEnd = colX1 - 30;
    const fan = xEnd - (pinX + 28);
    const dys = boxes.map((b, i) => b.y + b.h / 2 - (mid + (i - 3.5) * pinGap));
    const k = Math.max(1, Math.max(...dys.map(Math.abs)) / Math.max(40, fan));
    s.routes = boxes.map((b, i) => {
      const yp = mid + (i - 3.5) * pinGap, yt = b.y + b.h / 2;
      const xs = xEnd - Math.abs(yt - yp) / k;
      return route([{ x: pinX, y: yp }, { x: xs, y: yp }, { x: xEnd, y: yt }, { x: b.x, y: yt }]);
    });

    // Pads down the main chip's edge; the eight in use are lit.
    s.pads = [];
    const used = new Set(events.map((_, i) => Math.round(mid + (i - 3.5) * pinGap)));
    for (let y = mid - 3.5 * pinGap - 6 * pinGap; y <= mid + 3.5 * pinGap + 6 * pinGap + 0.5; y += pinGap) {
      if (y < copy.y - 10 || y > copy.y + copy.h + 10) continue;
      s.pads.push({ p: { x: pinX, y }, on: used.has(Math.round(y)) });
    }

    // Decoration: stubs off the chips, a few traces dropping off the board, scattered vias.
    const deco: Route[] = [];
    boxes.forEach((b, i) => {
      const y = b.y + b.h / 2;
      deco.push(route([{ x: b.x + b.w, y }, { x: i % 2 ? w + 4 : b.x + b.w + 18, y }]));
    });
    const r = rng(7);
    for (let i = 0; i < 6; i++) {
      const x0 = copy.x + 40 + i * 64 + r() * 20;
      const y0 = copy.y + copy.h + 34;
      if (y0 > h - 30) break;
      const j = 22 + r() * 30;
      deco.push(route([{ x: x0, y: y0 }, { x: x0, y: y0 + 14 }, { x: x0 + j, y: y0 + 14 + j }, { x: x0 + j, y: h + 4 }]));
    }
    s.deco = deco;
    const vias: Pt[] = [];
    const rv = rng(19);
    const inBox = (p: Pt, b: Box, m: number) => p.x > b.x - m && p.x < b.x + b.w + m && p.y > b.y - m && p.y < b.y + b.h + m;
    for (let n = 0; n < 400 && vias.length < 34; n++) {
      const p = { x: 24 + rv() * (w - 48), y: 96 + rv() * (h - 120) };
      if (inBox(p, copy, 44) || boxes.some((b) => inBox(p, b, 26))) continue;
      if (s.routes.some((rt) => distTo(rt, p) < 16) || deco.some((rt) => distTo(rt, p) < 12)) continue;
      vias.push(p);
    }
    s.vias = vias;
    s.chips = boxes;
    setChips(boxes);
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    const s = st.current;
    if (!s.copy || !s.routes.length) return;
    const hov = hoverRef.current;
    const p = s.pointer;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Main-chip outline: corner marks round the copy, pin-1 dot.
    const c = s.copy, m = 26, L = 22;
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1.5;
    const corners: [number, number, number, number][] = [
      [c.x - m, c.y - m, 1, 1], [c.x + c.w + m, c.y - m, -1, 1],
      [c.x - m, c.y + c.h + m, 1, -1], [c.x + c.w + m, c.y + c.h + m, -1, -1],
    ];
    for (const [x, y, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(x + dx * L, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * L);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${ORANGE},0.9)`;
    ctx.beginPath();
    ctx.arc(c.x - m + 12, c.y - m + 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // Decoration + vias.
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    s.deco.forEach((r) => strokeRoute(ctx, r));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    for (const v of s.vias) {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 3.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pads.
    for (const pad of s.pads) {
      ctx.fillStyle = pad.on ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.08)";
      ctx.fillRect(pad.p.x - 10, pad.p.y - 3, 14, 6);
    }

    // Routes: base copper, pointer proximity, hovered route.
    s.routes.forEach((r, i) => {
      const near = p ? Math.max(0, 1 - distTo(r, p) / 90) : 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(255,255,255,${0.1 + near * 0.12})`;
      strokeRoute(ctx, r);
      const lit = i === hov ? 1 : near * near * 0.7;
      if (lit > 0.01) {
        ctx.save();
        ctx.strokeStyle = `rgba(${ORANGE},${0.25 + lit * 0.65})`;
        ctx.shadowColor = `rgba(${ORANGE},0.8)`;
        ctx.shadowBlur = 12 * lit;
        strokeRoute(ctx, r);
        ctx.restore();
      }
    });

    // Signals.
    s.routes.forEach((r, i) => {
      const hot = i === hov;
      if (t > s.next[i]) {
        s.pulses[i].push({ s: 0, v: 150 + Math.random() * 90 });
        s.next[i] = t + (hot ? 0.22 : 0.9 + Math.random() * 2.2);
      }
      const near = p ? Math.max(0, 1 - distTo(r, p) / 90) : 0;
      const speed = hot ? 2.4 : 1 + near * 1.2;
      const list = s.pulses[i];
      for (let j = list.length - 1; j >= 0; j--) {
        const pu = list[j];
        pu.s += pu.v * speed * dt;
        if (pu.s >= r.len) {
          s.arrived[i] = t;
          list.splice(j, 1);
          continue;
        }
        const head = at(r, pu.s), tail = at(r, pu.s - 26);
        const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        g.addColorStop(0, `rgba(${ORANGE},0)`);
        g.addColorStop(1, `rgba(${ORANGE},1)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        const mid = at(r, pu.s - 13);
        ctx.lineTo(mid.x, mid.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.save();
        ctx.fillStyle = "#ffd2bd";
        ctx.shadowColor = `rgba(${ORANGE},1)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Chip flash when a signal lands.
    s.chips.forEach((b, i) => {
      const a = 1 - (t - s.arrived[i]) / 0.6;
      if (a <= 0) return;
      const g = 2 + (1 - a) * 8;
      ctx.strokeStyle = `rgba(${ORANGE},${a * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x - g, b.y - g, b.w + g * 2, b.h + g * 2);
    });

    // Probe.
    if (p) {
      ctx.strokeStyle = `rgba(${ORANGE},0.75)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        ctx.moveTo(p.x + dx * 17, p.y + dy * 17);
        ctx.lineTo(p.x + dx * 25, p.y + dy * 25);
      }
      ctx.stroke();
    }
  }, []);

  useCanvasLoop(canvasRef, frame, onResize);

  const setHov = (i: number) => {
    hoverRef.current = i;
    setHover(i);
  };

  return (
    <section
      ref={secRef}
      aria-label="BitFest 2027"
      className="dot-grid relative flex min-h-[100svh] items-center overflow-hidden lg:h-[100svh] lg:min-h-[640px]"
      onPointerMove={(e) => {
        const r = secRef.current!.getBoundingClientRect();
        st.current.pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
      onPointerLeave={() => (st.current.pointer = null)}
    >
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 pb-12 pt-28 md:px-14 lg:py-0">
        <div ref={copyRef} className="flex max-w-[540px] flex-col gap-7">
          <p className="text-[15px] font-medium text-soft">KUET CSE · National inter-university fest</p>
          <h1 className="text-[clamp(64px,min(8.4vw,15vh),132px)] font-semibold leading-[0.9] tracking-[-0.045em]">
            BitFest<br />
            <span className="text-orange">2027</span>
          </h1>
          <p className="max-w-[460px] text-lg leading-relaxed text-soft">{fest.blurb}</p>
          <FestFacts />
          <HeroActions />
        </div>

        {/* Phones and tablets: the chips sit in a grid under the copy. */}
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 lg:hidden">
          {events.map((e, i) => (
            <li key={e.slug}>
              <a href={e.href} className="ic-legs relative flex h-[60px] flex-col justify-center border border-line-2 bg-panel px-3">
                <span className="text-[12px] text-dim tabular-nums">{pad2(i + 1)} · {e.kind}</span>
                <span className="truncate text-[15px] font-bold">{e.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop: chips placed where the traces land. */}
      <ul className="absolute inset-0 z-10 hidden lg:block" style={{ pointerEvents: "none" }}>
        {chips.map((b, i) => {
          const e = events[i];
          const on = hover === i;
          return (
            <li key={e.slug} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, pointerEvents: "auto" }}>
              <a
                href={e.href}
                data-on={on}
                onPointerEnter={() => setHov(i)}
                onPointerLeave={() => setHov(-1)}
                onFocus={() => setHov(i)}
                onBlur={() => setHov(-1)}
                className={`ic-legs relative flex h-full flex-col justify-center gap-0.5 border bg-panel/95 px-4 transition-colors duration-200 ${on ? "border-orange" : "border-line-2"}`}
              >
                <span className="flex justify-between text-[12px] font-medium tabular-nums">
                  <span className={on ? "text-orange" : "text-dim"}>{pad2(i + 1)}</span>
                  <span className="text-muted">{on ? `${e.day} · ${e.pool === "TBA" ? "Prizes TBA" : `${e.pool} BDT`}` : e.kind}</span>
                </span>
                <span className={`truncate text-[17px] font-bold transition-colors ${on ? "text-orange" : "text-ink"}`}>{e.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
