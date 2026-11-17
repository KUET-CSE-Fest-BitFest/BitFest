"use client";

import { useCallback, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { HeroActions, ease, useCanvasLoop } from "./shared";

/* D — LED board. A stadium-style dot-matrix board runs the fest name, then each event.
   The pointer is a spotlight on the dots, dragging draws on the board, the row below picks an event. */

const ITEMS = ["BITFEST 25", ...events.map((e) => e.short)];
const HOLD = 2.6;
const WIPE = 0.55;

export default function HeroBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cur, setCur] = useState(0);
  const [held, setHeld] = useState(false);
  const st = useRef({
    pitch: 9,
    cols: 0,
    rows: 0,
    ox: 0,
    oy: 0,
    masks: [] as Uint8Array[],
    b: new Float32Array(0),
    paint: new Float32Array(0),
    cur: 0,
    prev: 0,
    wipeAt: -9,
    shownAt: 0,
    holdUntil: 0,
    ptr: null as null | { x: number; y: number },
    down: false,
    last: null as null | { x: number; y: number },
    now: 0,
  });

  const show = useCallback((k: number) => {
    const s = st.current;
    if (k === s.cur) return;
    s.prev = s.cur;
    s.cur = k;
    s.wipeAt = s.now;
    s.shownAt = s.now;
    setCur(k);
  }, []);

  const onResize = useCallback((w: number, h: number) => {
    const s = st.current;
    const pitch = Math.max(6, Math.min(10, w / 150));
    s.pitch = pitch;
    s.cols = Math.floor(w / pitch);
    s.rows = Math.floor(h / pitch);
    s.ox = (w - s.cols * pitch) / 2;
    s.oy = (h - s.rows * pitch) / 2;
    const n = s.cols * s.rows;
    s.b = new Float32Array(n);
    s.paint = new Float32Array(n);
    // Unlit dots are a CSS background that lines up with the canvas grid.
    const el = boardRef.current;
    if (el) {
      el.style.backgroundSize = `${pitch}px ${pitch}px`;
      el.style.backgroundPosition = `${s.ox}px ${s.oy}px`;
    }
    const off = document.createElement("canvas");
    off.width = s.cols;
    off.height = s.rows;
    const o = off.getContext("2d", { willReadFrequently: true })!;
    s.masks = ITEMS.map((text) => {
      o.clearRect(0, 0, s.cols, s.rows);
      let fs = s.rows * 0.7;
      o.font = `700 ${fs}px "Chakra Petch", sans-serif`;
      const tw = o.measureText(text).width;
      const max = s.cols * 0.86;
      if (tw > max) fs *= max / tw;
      o.font = `700 ${fs}px "Chakra Petch", sans-serif`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.fillText(text, s.cols / 2, s.rows / 2 + fs * 0.06);
      const d = o.getImageData(0, 0, s.cols, s.rows).data;
      const m = new Uint8Array(n);
      for (let i = 0; i < n; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
      return m;
    });
    const m = s.masks[s.cur];
    for (let i = 0; i < n; i++) s.b[i] = m[i];
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number, dt: number) => {
    const s = st.current;
    s.now = t;
    if (!s.shownAt) s.shownAt = t;
    if (!s.masks.length) return;
    if (t > s.holdUntil && t - s.shownAt > HOLD) show((s.cur + 1) % ITEMS.length);

    const { cols, rows, pitch, ox, oy } = s;
    const from = s.masks[s.prev], to = s.masks[s.cur];
    const wp = (t - s.wipeAt) / WIPE;
    const wipeCol = wp >= 1 ? Infinity : wp * (cols + 10) - 5;
    const k = ease(22, dt || 1);
    const decay = Math.exp(-0.55 * dt);
    const p = s.ptr;
    const pc = p ? (p.x - ox) / pitch - 0.5 : -999;
    const pr = p ? (p.y - oy) / pitch - 0.5 : -999;
    const rad = 9;
    const r0 = pitch * 0.36;

    // Paint along the drag.
    if (s.down && p) {
      const a = s.last ?? p;
      const steps = Math.max(1, Math.ceil(Math.hypot(p.x - a.x, p.y - a.y) / (pitch * 0.5)));
      for (let j = 0; j <= steps; j++) {
        const x = (a.x + ((p.x - a.x) * j) / steps - ox) / pitch - 0.5;
        const y = (a.y + ((p.y - a.y) * j) / steps - oy) / pitch - 0.5;
        for (let yy = Math.floor(y - 2); yy <= Math.ceil(y + 2); yy++)
          for (let xx = Math.floor(x - 2); xx <= Math.ceil(x + 2); xx++) {
            if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
            if (Math.hypot(xx - x, yy - y) <= 1.7) s.paint[yy * cols + xx] = 1;
          }
      }
      s.last = { ...p };
    }

    ctx.fillStyle = "#ff7a3d";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const tgt = x < wipeCol ? to[i] : from[i];
        s.b[i] += (tgt - s.b[i]) * k;
        const lit = s.b[i];
        let spot = 0;
        if (p) {
          const d = Math.hypot(x - pc, y - pr);
          if (d < rad) spot = (1 - d / rad) ** 2;
        }
        const v = Math.max(lit, spot * 0.3);
        if (v > 0.03) {
          ctx.globalAlpha = Math.min(1, v + lit * spot * 0.4);
          ctx.beginPath();
          ctx.arc(ox + (x + 0.5) * pitch, oy + (y + 0.5) * pitch, r0 * (1 + spot * 0.25), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Drawn dots in cyan, fading.
    ctx.fillStyle = "#4cc9ff";
    for (let i = 0; i < s.paint.length; i++) {
      const v = s.paint[i];
      if (v < 0.02) continue;
      s.paint[i] = v * decay;
      const x = i % cols, y = (i / cols) | 0;
      ctx.globalAlpha = v;
      ctx.beginPath();
      ctx.arc(ox + (x + 0.5) * pitch, oy + (y + 0.5) * pitch, r0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Scan bar during a change.
    if (wipeCol !== Infinity) {
      ctx.fillStyle = "#ffe3d6";
      for (let dx = 0; dx < 2; dx++) {
        const x = Math.floor(wipeCol) - dx;
        if (x < 0 || x >= cols) continue;
        ctx.globalAlpha = dx ? 0.25 : 0.6;
        for (let y = 0; y < rows; y++) {
          ctx.beginPath();
          ctx.arc(ox + (x + 0.5) * pitch, oy + (y + 0.5) * pitch, r0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [show]);

  useCanvasLoop(canvasRef, frame, onResize);

  const pick = (i: number) => {
    st.current.holdUntil = Infinity;
    setHeld(true);
    show(i);
  };
  const release = () => {
    st.current.holdUntil = st.current.now + 1.2;
    st.current.shownAt = st.current.now;
    setHeld(false);
  };

  const evIndex = cur - 1;
  const ev = evIndex >= 0 ? events[evIndex] : null;

  return (
    <section aria-label="BitFest 2027" className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden px-6 pb-6 pt-[88px] md:px-14">
      <div className="mx-auto flex w-full max-w-[1332px] flex-1 flex-col gap-5">
        <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-end md:gap-12">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] font-medium text-soft">KUET CSE · National inter-university fest</p>
            <h1 className="text-[clamp(44px,5.4vw,80px)] font-bold leading-[0.9] tracking-[-0.02em]">
              BitFest <span className="text-orange">2027</span>
            </h1>
          </div>
          <p className="max-w-[420px] text-[17px] leading-relaxed text-soft max-md:hidden">
            Eight events over {fest.dates}, all on the KUET campus. Point at the board, or drag across it to draw.
          </p>
          <HeroActions />
        </div>

        <div
          ref={boardRef}
          className="relative min-h-[200px] flex-1 touch-none border border-line bg-[#07080d] [background-image:radial-gradient(circle,rgba(255,255,255,0.075)_32%,transparent_36%)]"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            st.current.ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
          }}
          onPointerLeave={() => {
            st.current.ptr = null;
            st.current.down = false;
            st.current.last = null;
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            st.current.ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
            st.current.down = true;
            st.current.last = null;
          }}
          onPointerUp={() => {
            st.current.down = false;
            st.current.last = null;
          }}
        >
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full [filter:drop-shadow(0_0_5px_rgba(255,122,61,0.55))]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-[#07080d] via-[#07080d]/80 to-transparent px-5 pb-4 pt-10" aria-live="polite">
            {ev ? (
              <p className="text-[15px] text-soft">
                <span className="tabular-nums text-dim">{pad2(evIndex + 1)} / 08 · {ev.kind}</span>
                <span className="mx-2 text-line-2">|</span>
                <span className="font-bold text-ink">{ev.name}</span> · {ev.day} · {ev.venue} · {ev.pool === "TBA" ? "Prizes TBA" : `${ev.pool} BDT`}
              </p>
            ) : (
              <p className="text-[15px] text-soft">
                <span className="font-bold text-ink">{fest.edition}</span> · {fest.dates} · {fest.prizePool} BDT prize pool
              </p>
            )}
          </div>
        </div>

        <ul className="grid grid-cols-4 gap-px bg-line md:grid-cols-8">
          {events.map((e, i) => {
            const on = evIndex === i;
            return (
              <li key={e.slug} className="bg-bg">
                <a
                  href={e.href}
                  onPointerEnter={() => pick(i + 1)}
                  onPointerLeave={release}
                  onFocus={() => pick(i + 1)}
                  onBlur={release}
                  className="group relative flex h-full flex-col gap-0.5 px-3 pb-3 pt-4"
                >
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-line-2">
                    {on && (
                      <span
                        key={`${cur}-${held}`}
                        className="block h-full bg-orange"
                        style={held ? { width: "100%" } : { animation: `boardfill ${HOLD}s linear both` }}
                      />
                    )}
                  </span>
                  <span className={`text-[12px] tabular-nums ${on ? "text-orange" : "text-dim"}`}>{pad2(i + 1)} · {e.day}</span>
                  <span className={`text-[14px] font-bold leading-snug transition-colors ${on ? "text-ink" : "text-muted group-hover:text-ink"}`}>{e.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <style>{`@keyframes boardfill { from { width: 0 } to { width: 100% } }`}</style>
    </section>
  );
}
