"use client";

import { useCallback, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions, ease, useCanvasLoop } from "./shared";

/* C — Radar. A scope rises from the floor of the hero. Rings are the days, sectors are the fields.
   The arm sweeps on its own and pings each event; point inside the scope to steer it and lock on. */

const ORANGE = "255,122,61";
const INK = "236,238,245";
const RING: Record<string, number> = { "3 Jan": 0.42, "3–4 Jan": 0.66, "4 Jan": 0.9 };
const SECTORS = [
  { label: "Code", from: 180, to: 135 },
  { label: "Data and business", from: 135, to: 90 },
  { label: "Robotics", from: 90, to: 45 },
  { label: "Show and play", from: 45, to: 0 },
];
// Angle (deg) per event, inside its sector.
const ANGLE: Record<string, number> = {
  iupc: 165, hackathon: 148, datathon: 122, "it-case": 102,
  lfr: 77, "soccer-bot": 57, "project-showcase": 33, gaming: 14,
};
const DEG = Math.PI / 180;

type Blip = { x: number; y: number; th: number; i: number };

export default function HeroRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focus, setFocus] = useState<{ i: number; x: number; y: number; locked: boolean; left: boolean } | null>(null);
  const st = useRef({
    C: { x: 0, y: 0 },
    R: 0,
    blips: [] as Blip[],
    phi: 150 * DEG,
    prevPhi: 150 * DEG,
    ping: events.map(() => -9),
    ptr: null as null | { x: number; y: number },
    lock: -1,
    focusI: -1,
    focusLocked: false,
  });

  const onResize = useCallback((w: number, h: number) => {
    const s = st.current;
    s.C = { x: w / 2, y: h - 1 };
    s.R = Math.max(120, Math.min(w < 1024 ? w / 2 - 70 : w * 0.34, h - 50));
    s.blips = events.map((e, i) => {
      const th = ANGLE[e.slug] * DEG;
      const r = RING[e.day] * s.R;
      return { x: s.C.x + Math.cos(th) * r, y: s.C.y - Math.sin(th) * r, th, i };
    });
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    const s = st.current;
    const { C, R } = s;
    if (!R) return;

    // Arm: steered by the pointer inside the scope, otherwise sweeping.
    let lock = -1;
    const p = s.ptr;
    const inside = p && Math.hypot(p.x - C.x, p.y - C.y) <= R + 10 && p.y <= C.y;
    s.prevPhi = s.phi;
    if (inside && p) {
      const want = Math.atan2(C.y - p.y, p.x - C.x);
      s.phi += (want - s.phi) * ease(10, dt);
      let best = 72;
      s.blips.forEach((b) => {
        const d = Math.hypot(b.x - p.x, b.y - p.y);
        if (d < best) { best = d; lock = b.i; }
      });
    } else {
      s.phi = (90 + 88 * Math.sin(t * 0.42)) * DEG;
    }
    s.lock = lock;
    const dir = Math.sign(s.phi - s.prevPhi) || 1;

    // Pings as the arm crosses a blip.
    s.blips.forEach((b) => {
      const lo = Math.min(s.prevPhi, s.phi), hi = Math.max(s.prevPhi, s.phi);
      if (b.th >= lo && b.th <= hi && t - s.ping[b.i] > 0.8) s.ping[b.i] = t;
    });

    // What the readout shows: the lock, else the newest ping.
    let fi = lock, locked = lock >= 0;
    if (fi < 0) {
      let newest = -9;
      s.ping.forEach((pt, i) => { if (pt > newest) { newest = pt; fi = i; } });
    }
    if (fi >= 0 && (fi !== s.focusI || locked !== s.focusLocked)) {
      s.focusI = fi;
      s.focusLocked = locked;
      const b = s.blips[fi];
      setFocus({ i: fi, x: b.x, y: b.y, locked, left: b.x > w * 0.6 });
    }
    if (canvasRef.current) canvasRef.current.style.cursor = lock >= 0 ? "pointer" : "crosshair";

    // Floor line.
    ctx.strokeStyle = `rgba(${INK},0.12)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, C.y - 0.5);
    ctx.lineTo(w, C.y - 0.5);
    ctx.stroke();

    // Sweep trail.
    const trail = 34 * DEG, slices = 26;
    for (let i = 0; i < slices; i++) {
      const a0 = s.phi - dir * (i / slices) * trail;
      const a1 = s.phi - dir * ((i + 1) / slices) * trail;
      ctx.fillStyle = `rgba(${ORANGE},${0.16 * (1 - i / slices) ** 1.6})`;
      ctx.beginPath();
      ctx.moveTo(C.x, C.y);
      ctx.arc(C.x, C.y, R, -Math.max(a0, a1), -Math.min(a0, a1));
      ctx.closePath();
      ctx.fill();
    }

    // Rings and spokes.
    ctx.lineWidth = 1;
    for (const k of [0.42, 0.66, 0.9, 1]) {
      ctx.strokeStyle = k === 1 ? `rgba(${INK},0.22)` : `rgba(${INK},0.1)`;
      if (k !== 1) ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.arc(C.x, C.y, R * k, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    for (let d = 0; d <= 180; d += 15) {
      const a = d * DEG;
      const major = d % 45 === 0;
      ctx.strokeStyle = `rgba(${INK},${major ? 0.12 : 0.05})`;
      ctx.beginPath();
      ctx.moveTo(C.x + Math.cos(a) * 16, C.y - Math.sin(a) * 16);
      ctx.lineTo(C.x + Math.cos(a) * R, C.y - Math.sin(a) * R);
      ctx.stroke();
    }
    for (let d = 0; d <= 180; d += 3) {
      const a = d * DEG;
      const l = d % 15 === 0 ? 10 : 5;
      ctx.strokeStyle = `rgba(${INK},${d % 15 === 0 ? 0.3 : 0.14})`;
      ctx.beginPath();
      ctx.moveTo(C.x + Math.cos(a) * R, C.y - Math.sin(a) * R);
      ctx.lineTo(C.x + Math.cos(a) * (R + l), C.y - Math.sin(a) * (R + l));
      ctx.stroke();
    }

    // Labels: sectors outside the rim, days on the floor.
    ctx.textBaseline = "middle";
    ctx.font = `600 13px "Chakra Petch", sans-serif`;
    for (const sc of w < 640 ? [] : SECTORS) {
      const a = ((sc.from + sc.to) / 2) * DEG;
      const x = C.x + Math.cos(a) * (R + 26), y = C.y - Math.sin(a) * (R + 26);
      ctx.textAlign = Math.abs(Math.cos(a)) < 0.2 ? "center" : Math.cos(a) > 0 ? "left" : "right";
      ctx.fillStyle = `rgba(${INK},0.5)`;
      ctx.fillText(sc.label, x, y);
    }
    ctx.font = `500 12px "Chakra Petch", sans-serif`;
    ctx.textAlign = "center";
    for (const [day, k] of Object.entries(RING)) {
      ctx.fillStyle = `rgba(${INK},0.4)`;
      ctx.fillText(day, C.x - R * k, C.y - 12);
    }

    // Arm.
    const ax = C.x + Math.cos(s.phi) * R, ay = C.y - Math.sin(s.phi) * R;
    ctx.save();
    ctx.strokeStyle = `rgba(${ORANGE},0.95)`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `rgba(${ORANGE},0.9)`;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(C.x, C.y);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    ctx.restore();

    // Hub.
    ctx.fillStyle = `rgba(${ORANGE},0.9)`;
    ctx.beginPath();
    ctx.arc(C.x, C.y, 9, Math.PI, Math.PI * 2);
    ctx.fill();

    // Blips.
    for (const b of s.blips) {
      const age = t - s.ping[b.i];
      const on = b.i === lock;
      const glow = on ? 1 : Math.max(0, 1 - age / 2.4);
      if (age < 1.1) {
        ctx.strokeStyle = `rgba(${ORANGE},${0.7 * (1 - age / 1.1)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5 + age * 26, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.save();
      ctx.fillStyle = glow > 0.05 ? `rgba(${ORANGE},${0.45 + 0.55 * glow})` : `rgba(${ORANGE},0.4)`;
      ctx.shadowColor = `rgba(${ORANGE},1)`;
      ctx.shadowBlur = 14 * glow;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (on) {
        ctx.strokeStyle = `rgba(${ORANGE},1)`;
        ctx.lineWidth = 1.5;
        const g = 13, l = 6;
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          ctx.beginPath();
          ctx.moveTo(b.x + sx * g, b.y + sy * (g - l));
          ctx.lineTo(b.x + sx * g, b.y + sy * g);
          ctx.lineTo(b.x + sx * (g - l), b.y + sy * g);
          ctx.stroke();
        }
      }
      // Short label: number always, name while lit.
      const left = b.th < 25 * DEG;
      ctx.textAlign = left ? "right" : "left";
      const lx = b.x + (left ? -16 : 16);
      ctx.font = `600 12px "Chakra Petch", sans-serif`;
      ctx.fillStyle = `rgba(${INK},${0.35 + 0.4 * glow})`;
      ctx.fillText(pad2(b.i + 1), lx, b.y - 1);
      if (glow > 0.02) {
        ctx.font = `700 15px "Chakra Petch", sans-serif`;
        ctx.fillStyle = `rgba(${INK},${glow})`;
        ctx.fillText(events[b.i].name, lx + (left ? -24 : 24), b.y - 1);
      }
    }
  }, []);

  useCanvasLoop(canvasRef, frame, onResize);

  const ev = focus ? events[focus.i] : null;

  return (
    <section aria-label="BitFest 2027" className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden pt-[96px]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:items-end md:gap-12 md:px-14">
        <div className="flex flex-col gap-4">
          <p className="text-[15px] font-medium text-soft">KUET CSE · National inter-university fest</p>
          <h1 className="text-[clamp(56px,min(8.6vw,14vh),150px)] font-bold leading-[0.86] tracking-[-0.025em]">
            BitFest <span className="text-orange">2027</span>
          </h1>
        </div>
        <div className="flex flex-col gap-6 pb-2">
          <p className="text-[17px] leading-relaxed text-soft">
            Eight events over two days on the KUET campus. The scope below is the whole fest: rings are the days, sectors are the fields.
          </p>
          <HeroActions />
        </div>
      </div>

      <div className="relative mt-6 flex-1">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            st.current.ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
          }}
          onPointerLeave={() => (st.current.ptr = null)}
          onClick={() => {
            const l = st.current.lock;
            if (l >= 0) window.location.href = events[l].href;
          }}
        />

        {/* Readout pinned beside the focused contact. */}
        {focus && ev && (
          <div
            className="pointer-events-none absolute z-10 hidden w-[250px] border-l-2 border-orange bg-bg/85 py-2 pl-4 pr-3 backdrop-blur md:block"
            style={{ left: focus.x + (focus.left ? -290 : 40), top: Math.max(0, focus.y - 110) }}
          >
            <p className="text-[13px] font-medium tabular-nums text-dim">{pad2(focus.i + 1)} / 08 · {ev.kind}</p>
            <p className="text-xl font-bold">{ev.name}</p>
            <p className="text-[14px] text-muted">{ev.line}</p>
            <p className="mt-1 text-[14px] text-soft tabular-nums">{ev.day} · {ev.pool === "TBA" ? "Prizes TBA" : `${ev.pool} BDT`}</p>
            <p className="mt-1 text-[13px] font-semibold text-orange">{focus.locked ? "Click to open" : "Point at the scope to steer"}</p>
          </div>
        )}

        <FestFacts className="absolute bottom-5 right-6 hidden md:right-14 lg:flex" />
        <p className="absolute bottom-5 left-6 hidden max-w-[220px] text-[13px] leading-snug text-dim md:left-14 lg:block">
          {fest.dates}<br />{fest.venue}
        </p>

        <ul className="sr-only">
          {events.map((e) => (
            <li key={e.slug}><a href={e.href}>{e.name}, {e.kind}, {e.day}</a></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
