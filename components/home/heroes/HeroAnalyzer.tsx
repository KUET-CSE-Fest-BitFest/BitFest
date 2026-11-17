"use client";

import { useCallback, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions, useCanvasLoop } from "./shared";
import { INK, ORANGE } from "./pcb";

/* A4 — Logic analyzer. Eight channels, one per event. Each trace is the event's name sent as
   real serial (UART) bits. Hover a channel to trigger it: it freezes and the bytes are decoded. */

const BW = 6; // px per bit
const IDLE = 9; // idle bits between repeats
// Start bit 0, eight data bits LSB first, stop bit 1 — then idle high.
const encode = (text: string) => {
  const bits: number[] = [];
  const chars: { at: number; ch: string }[] = [];
  for (const ch of text) {
    chars.push({ at: bits.length, ch });
    const c = ch.charCodeAt(0);
    bits.push(0);
    for (let b = 0; b < 8; b++) bits.push((c >> b) & 1);
    bits.push(1);
  }
  for (let i = 0; i < IDLE; i++) bits.push(1);
  return { bits, chars };
};
const STREAMS = events.map((e) => encode(e.short));

export default function HeroAnalyzer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [rows, setRows] = useState<{ top: number; h: number }[]>([]);
  const st = useRef({
    L: 168,
    ruler: 26,
    rowH: 0,
    off: events.map((_, i) => i * 37),
    active: 0,
    hover: -1,
    lastSwitch: 0,
    ptr: null as null | { x: number; y: number },
    font: "sans-serif",
  });

  const onResize = useCallback((w: number, h: number) => {
    const s = st.current;
    s.font = getComputedStyle(canvasRef.current!).fontFamily;
    s.L = w < 560 ? 120 : 168;
    s.rowH = (h - s.ruler) / 8;
    setRows(events.map((_, i) => ({ top: s.ruler + i * s.rowH, h: s.rowH })));
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    const s = st.current;
    const { L, ruler, rowH } = s;
    if (!rowH) return;
    if (!s.lastSwitch) s.lastSwitch = t;
    if (s.hover < 0 && t - s.lastSwitch > 2.6) {
      s.active = (s.active + 1) % 8;
      s.lastSwitch = t;
      setActive(s.active);
    }
    const act = s.hover >= 0 ? s.hover : s.active;

    // Ruler.
    ctx.font = `500 11px ${s.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.strokeStyle = `rgba(${INK},0.12)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ruler - 0.5);
    ctx.lineTo(w, ruler - 0.5);
    ctx.stroke();
    for (let x = L, n = 0; x < w; x += BW * 5, n++) {
      const major = n % 10 === 0;
      ctx.strokeStyle = `rgba(${INK},${major ? 0.3 : 0.12})`;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, ruler - (major ? 10 : 5));
      ctx.lineTo(x + 0.5, ruler);
      ctx.stroke();
      if (major) {
        ctx.fillStyle = `rgba(${INK},0.4)`;
        ctx.fillText(`${n * 5} bit`, x + 4, 9);
      }
    }

    // Channels.
    for (let i = 0; i < 8; i++) {
      const top = ruler + i * rowH;
      const on = i === act;
      const freeze = on && s.hover === i;
      if (!freeze) s.off[i] += dt * 46;
      const { bits, chars } = STREAMS[i];
      const total = bits.length * BW;
      const off = s.off[i] % total;

      if (on) {
        ctx.fillStyle = `rgba(${ORANGE},0.05)`;
        ctx.fillRect(0, top, w, rowH);
      }
      ctx.strokeStyle = `rgba(${INK},0.07)`;
      ctx.beginPath();
      ctx.moveTo(0, top + rowH - 0.5);
      ctx.lineTo(w, top + rowH - 0.5);
      ctx.stroke();

      const hi = top + rowH * (on ? 0.5 : 0.36), lo = top + rowH * 0.78;
      ctx.lineWidth = on ? 2 : 1.25;
      ctx.strokeStyle = on ? `rgba(${ORANGE},1)` : `rgba(${INK},0.38)`;
      ctx.beginPath();
      const first = Math.floor(off / BW);
      let x = L - (off - first * BW);
      let prev = -1;
      ctx.moveTo(L, bits[first % bits.length] ? hi : lo);
      for (let n = first; x < w; n++, x += BW) {
        const b = bits[n % bits.length];
        const y = b ? hi : lo;
        const xs = Math.max(L, x);
        if (prev !== -1 && prev !== b) ctx.lineTo(xs, prev ? hi : lo);
        ctx.lineTo(xs, y);
        ctx.lineTo(Math.min(w, x + BW), y);
        prev = b;
      }
      ctx.stroke();

      // Decoded bytes over the triggered channel.
      if (on) {
        ctx.font = `600 12px ${s.font}`;
        ctx.textAlign = "center";
        const bh = Math.min(18, rowH * 0.3), by = top + rowH * 0.1;
        for (let rep = -1; rep < Math.ceil((w - L) / total) + 1; rep++) {
          for (const c of chars) {
            const x0 = L + rep * total + c.at * BW - off;
            const x1 = x0 + 10 * BW;
            if (x1 < L || x0 > w) continue;
            ctx.strokeStyle = `rgba(${ORANGE},0.6)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(Math.max(L, x0 + 2), by);
            ctx.lineTo(Math.max(L, x0 + 2), by + bh);
            ctx.moveTo(x1 - 2, by);
            ctx.lineTo(x1 - 2, by + bh);
            ctx.moveTo(Math.max(L, x0 + 2), by + bh / 2);
            ctx.lineTo(x1 - 2, by + bh / 2);
            ctx.stroke();
            const mx = (x0 + x1) / 2;
            if (mx > L + 6) {
              const label = c.ch === " " ? "␠" : c.ch;
              ctx.fillStyle = "#0b0d15";
              ctx.fillRect(mx - 9, by + 1, 18, bh - 2);
              ctx.fillStyle = `rgba(${ORANGE},1)`;
              ctx.fillText(label, mx, by + bh / 2 + 0.5);
            }
          }
        }
        ctx.textAlign = "left";
      }
    }

    // Cursor.
    const p = s.ptr;
    if (p && p.x > L) {
      ctx.strokeStyle = `rgba(${ORANGE},0.55)`;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x + 0.5, ruler);
      ctx.lineTo(p.x + 0.5, h);
      ctx.stroke();
      ctx.setLineDash([]);
      const n = Math.round((p.x - L) / BW);
      const label = `${n} bit`;
      ctx.font = `600 11px ${s.font}`;
      const tw = ctx.measureText(label).width + 12;
      ctx.fillStyle = `rgba(${ORANGE},1)`;
      ctx.fillRect(p.x - tw / 2, 2, tw, 18);
      ctx.fillStyle = "#120802";
      ctx.textAlign = "center";
      ctx.fillText(label, p.x, 11.5);
      ctx.textAlign = "left";
    }
  }, []);

  useCanvasLoop(canvasRef, frame, onResize);

  const trigger = (i: number) => {
    const s = st.current;
    s.hover = i;
    if (i >= 0) {
      s.active = i;
      setActive(i);
    }
    s.lastSwitch = performance.now() / 1000;
    setFrozen(i >= 0);
  };

  const ev = events[active];

  return (
    <section aria-label="BitFest 2027" className="relative flex min-h-[100svh] items-center overflow-hidden lg:h-[100svh] lg:min-h-[680px]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 pb-12 pt-28 md:px-14 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-0">
        <div className="flex flex-col gap-7">
          <p className="text-[15px] font-medium text-soft">{fest.kicker}</p>
          <h1 className="text-[clamp(64px,min(8vw,15vh),128px)] font-semibold leading-[0.9] tracking-[-0.045em]">
            BitFest<br /><span className="text-orange">2027</span>
          </h1>
          <p className="max-w-[460px] text-lg leading-relaxed text-soft">{fest.blurb}</p>
          <FestFacts />
          <HeroActions />
        </div>

        <div className="flex h-[min(74vh,600px)] min-h-[440px] flex-col border border-line-2 bg-panel/70">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 text-[13px]">
            <span className="font-semibold text-soft">Capture · 8 channels</span>
            <span className="flex items-center gap-2 text-muted">
              <span className={`h-2 w-2 rounded-full ${frozen ? "bg-orange" : "animate-live bg-cyan"}`} />
              {frozen ? `Triggered on ${ev.name}` : "Running · hover a channel to trigger"}
            </span>
          </div>

          <div
            ref={bodyRef}
            className="relative flex-1"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const s = st.current;
              const p = { x: e.clientX - r.left, y: e.clientY - r.top };
              s.ptr = p;
              const row = Math.floor((p.y - s.ruler) / s.rowH);
              const want = p.y > s.ruler && row >= 0 && row < 8 ? row : -1;
              if (want !== s.hover) trigger(want);
            }}
            onPointerLeave={() => {
              st.current.ptr = null;
              trigger(-1);
            }}
            onClick={() => {
              const h = st.current.hover;
              if (h >= 0) window.location.href = events[h].href;
            }}
          >
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full cursor-crosshair" />
            <ul>
              {rows.map((r, i) => {
                const e = events[i];
                const on = active === i;
                return (
                  <li key={e.slug} className="absolute left-0 flex items-center border-r border-line pl-4" style={{ top: r.top, height: r.h, width: st.current.L }}>
                    <a href={e.href} onFocus={() => trigger(i)} onBlur={() => trigger(-1)} className="flex flex-col leading-tight">
                      <span className={`text-[11px] tabular-nums ${on ? "text-orange" : "text-dim"}`}>Ch {pad2(i + 1)}</span>
                      <span className={`text-[14px] font-semibold ${on ? "text-ink" : "text-muted"}`}>{e.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="border-t border-line px-4 py-3 text-[14px] text-soft" aria-live="polite">
            <span className="text-dim">Decoded </span>
            <span className="font-semibold text-orange">“{ev.short}”</span>
            <span className="text-muted"> · {ev.kind} · {ev.day} · {ev.venue} · {ev.pool === "TBA" ? "Prizes TBA" : `${ev.pool} BDT`}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
