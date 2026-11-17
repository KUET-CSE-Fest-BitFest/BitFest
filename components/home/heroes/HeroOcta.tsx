"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions, ease, useCanvasLoop } from "./shared";

/* B — Octahedron. Eight faces, eight events. It turns face to face on its own;
   drag to spin it, the face that lands toward you is the event, click the lit face to open it. */

type V3 = [number, number, number];
type Q = [number, number, number, number];

const qMul = (a: Q, b: Q): Q => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qAxis = (ax: V3, ang: number): Q => {
  const l = Math.hypot(...ax) || 1, s = Math.sin(ang / 2);
  return [(ax[0] / l) * s, (ax[1] / l) * s, (ax[2] / l) * s, Math.cos(ang / 2)];
};
const qNorm = (q: Q): Q => {
  const l = Math.hypot(...q) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};
const qRot = (q: Q, v: V3): V3 => {
  const [x, y, z, w] = q;
  const ix = w * v[0] + y * v[2] - z * v[1];
  const iy = w * v[1] + z * v[0] - x * v[2];
  const iz = w * v[2] + x * v[1] - y * v[0];
  const iw = -x * v[0] - y * v[1] - z * v[2];
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
};
const qFromTo = (u: V3, v: V3): Q => {
  const d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  if (d < -0.99999) return qAxis(Math.abs(u[0]) < 0.9 ? [0, -u[2], u[1]] : [-u[1], u[0], 0], Math.PI);
  return qNorm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0], 1 + d]);
};
const qSlerp = (a: Q, b: Q, t: number): Q => {
  let c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (c < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; c = -c; }
  if (c > 0.9995) return qNorm([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]);
  const th = Math.acos(c), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb, a[3] * wa + b[3] * wb];
};
const qAngle = (a: Q, b: Q) => 2 * Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])));

// Faces in Gray-code order, so each step turns to a neighbouring face.
const FACES = Array.from({ length: 8 }, (_, k) => {
  const g = k ^ (k >> 1);
  return [g & 4 ? 1 : -1, g & 2 ? 1 : -1, g & 1 ? 1 : -1] as V3;
});
const faceVerts = (s: V3): V3[] => [[s[0], 0, 0], [0, s[1], 0], [0, 0, s[2]]];
const faceNormal = (s: V3): V3 => [s[0] / Math.sqrt(3), s[1] / Math.sqrt(3), s[2] / Math.sqrt(3)];
const VERTS: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const EDGES: [number, number][] = [];
for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) if (Math.floor(a / 2) !== Math.floor(b / 2)) EDGES.push([a, b]);

/** Orientation that puts face k toward the viewer, standing as an upright triangle. */
const alignFace = (q: Q, k: number): Q => {
  let t = qMul(qFromTo(qRot(q, faceNormal(FACES[k])), [0, 0, 1]), q);
  let best = 0, err = Infinity;
  for (const v of faceVerts(FACES[k])) {
    const p = qRot(t, v);
    let d = Math.PI / 2 - Math.atan2(p[1], p[0]);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) < Math.abs(err)) { err = d; best = d; }
  }
  t = qMul(qAxis([0, 0, 1], best), t);
  return qNorm(t);
};

const ORANGE = "255,122,61";
const INK = "236,238,245";

export default function HeroOcta() {
  const cellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cur, setCur] = useState(0);
  const st = useRef({
    q: alignFace([0, 0, 0, 1], 0),
    target: null as Q | null,
    cur: 0,
    mode: "hold" as "hold" | "drag" | "spin" | "settle",
    settleRate: 3.2,
    holdSince: 0,
    omega: [0, 0, 0] as V3,
    hovering: false,
    tilt: [0, 0] as [number, number],
    ptr: [0, 0] as [number, number],
    down: null as null | { x: number; y: number; t: number; moved: number },
    last: { x: 0, y: 0, t: 0 },
    front: [] as { x: number; y: number }[],
    now: 0,
  });

  const goTo = useCallback((k: number, rate = 3.2) => {
    const s = st.current;
    s.cur = ((k % 8) + 8) % 8;
    s.target = alignFace(s.q, s.cur);
    s.mode = "settle";
    s.settleRate = rate;
    setCur(s.cur);
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    const s = st.current;
    s.now = t;
    if (!s.holdSince) s.holdSince = t;

    // Motion state. While dragging or spinning, the lit face is whichever is most toward you.
    const frontMost = () => {
      let best = 0, bz = -2;
      FACES.forEach((f, i) => { const z = qRot(s.q, faceNormal(f))[2]; if (z > bz) { bz = z; best = i; } });
      return best;
    };
    if (s.mode === "drag" || s.mode === "spin") {
      const b = frontMost();
      if (b !== s.cur) { s.cur = b; setCur(b); }
    }
    if (s.mode === "spin") {
      const sp = Math.hypot(...s.omega);
      if (sp > 0.001) s.q = qNorm(qMul(qAxis(s.omega, sp * dt), s.q));
      const k = Math.exp(-3.2 * dt);
      s.omega = [s.omega[0] * k, s.omega[1] * k, s.omega[2] * k];
      if (sp < 0.9) goTo(frontMost(), 6);
    } else if (s.mode === "settle" && s.target) {
      s.q = qSlerp(s.q, s.target, ease(s.settleRate, dt));
      if (qAngle(s.q, s.target) < 0.003) {
        s.q = s.target;
        s.mode = "hold";
        s.holdSince = t;
      }
    } else if (s.mode === "hold" && !s.hovering && t - s.holdSince > 3.4) {
      goTo(s.cur + 1, 2.6);
    }

    // Pointer tilt (small, on top of the real orientation).
    const want: [number, number] = s.hovering && s.mode !== "drag" ? s.ptr : [Math.sin(t * 0.45) * 0.12, Math.cos(t * 0.33) * 0.08];
    s.tilt[0] += (want[0] - s.tilt[0]) * ease(4, dt);
    s.tilt[1] += (want[1] - s.tilt[1]) * ease(4, dt);
    const qv = qMul(qMul(qAxis([0, 1, 0], s.tilt[0] * 0.32), qAxis([1, 0, 0], -s.tilt[1] * 0.24)), s.q);

    const cx = w / 2, cy = h / 2;
    const S = Math.min(w, h) / 2 / 1.95;
    const D = 6;
    const proj = (v: V3) => {
      const f = D / (D - v[2]);
      return { x: cx + v[0] * S * f, y: cy - v[1] * S * f, z: v[2] };
    };

    // Bezel with eight stations.
    const R = S * 1.62;
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${INK},0.08)`;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = `rgba(${INK},0.07)`;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `600 ${Math.round(Math.max(11, S * 0.07))}px "Chakra Petch", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 4;
      const on = k === s.cur;
      const len = on ? 16 : 7;
      ctx.strokeStyle = on ? `rgba(${ORANGE},1)` : `rgba(${INK},0.28)`;
      ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (R + 4), cy + Math.sin(a) * (R + 4));
      ctx.lineTo(cx + Math.cos(a) * (R + 4 + len), cy + Math.sin(a) * (R + 4 + len));
      ctx.stroke();
      ctx.fillStyle = on ? `rgba(${ORANGE},1)` : `rgba(${INK},0.35)`;
      ctx.fillText(pad2(k + 1), cx + Math.cos(a) * (R + 30), cy + Math.sin(a) * (R + 30));
    }

    // Scan line.
    const sy = cy + Math.sin(t * 0.7) * R * 0.85;
    const half = Math.sqrt(Math.max(0, R * R * 0.81 - (sy - cy) ** 2));
    const sg = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
    sg.addColorStop(0, `rgba(${ORANGE},0)`);
    sg.addColorStop(0.5, `rgba(${ORANGE},0.16)`);
    sg.addColorStop(1, `rgba(${ORANGE},0)`);
    ctx.strokeStyle = sg;
    ctx.beginPath();
    ctx.moveTo(cx - half, sy);
    ctx.lineTo(cx + half, sy);
    ctx.stroke();

    // Orbit ring in the object's equator.
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const p = proj(qRot(qv, [Math.cos(a) * 1.32, 0, Math.sin(a) * 1.32]));
      ctx.fillStyle = `rgba(${INK},${0.06 + 0.22 * ((p.z + 1.32) / 2.64)})`;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }

    // Body.
    const pv = VERTS.map((v) => proj(qRot(qv, v)));
    const vIndex = (v: V3) => VERTS.findIndex((u) => u[0] === v[0] && u[1] === v[1] && u[2] === v[2]);
    const faces = FACES.map((f, i) => {
      const ids = faceVerts(f).map(vIndex);
      const nz = qRot(qv, faceNormal(f))[2];
      return { i, ids, nz, f };
    });
    const visible = (f: V3) => qRot(qv, faceNormal(f))[2] > 0;

    // Hidden edges first, dashed.
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${INK},0.13)`;
    for (const [a, b] of EDGES) {
      const fa = FACES.filter((f) => f[Math.floor(a / 2)] === VERTS[a][Math.floor(a / 2)] && f[Math.floor(b / 2)] === VERTS[b][Math.floor(b / 2)]);
      if (fa.some(visible)) continue;
      ctx.beginPath();
      ctx.moveTo(pv[a].x, pv[a].y);
      ctx.lineTo(pv[b].x, pv[b].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Visible faces.
    for (const f of faces) {
      if (f.nz <= 0) continue;
      const [a, b, c] = f.ids.map((id) => pv[id]);
      const on = f.i === s.cur;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      if (on) {
        const g = ctx.createLinearGradient(cx, cy - S, cx, cy + S);
        g.addColorStop(0, `rgba(${ORANGE},${0.1 + 0.2 * f.nz})`);
        g.addColorStop(1, `rgba(${ORANGE},${0.03 + 0.06 * f.nz})`);
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = `rgba(${INK},${0.015 + 0.05 * f.nz})`;
      }
      ctx.fill();
      if (on) s.front = [a, b, c];
    }

    // Visible edges.
    for (const [a, b] of EDGES) {
      const fa = FACES.filter((f) => f[Math.floor(a / 2)] === VERTS[a][Math.floor(a / 2)] && f[Math.floor(b / 2)] === VERTS[b][Math.floor(b / 2)]);
      if (!fa.some(visible)) continue;
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = `rgba(${INK},0.55)`;
      ctx.beginPath();
      ctx.moveTo(pv[a].x, pv[a].y);
      ctx.lineTo(pv[b].x, pv[b].y);
      ctx.stroke();
    }

    // Lit face outline + its number.
    const fr = faces[s.cur];
    if (fr.nz > 0) {
      const [a, b, c] = fr.ids.map((id) => pv[id]);
      ctx.save();
      ctx.strokeStyle = `rgba(${ORANGE},1)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `rgba(${ORANGE},0.9)`;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Face numbers.
    for (const f of faces) {
      if (f.nz <= 0.05) continue;
      const [a, b, c] = f.ids.map((id) => pv[id]);
      const x = (a.x + b.x + c.x) / 3, y = (a.y + b.y + c.y) / 3;
      const on = f.i === s.cur;
      ctx.font = `700 ${Math.round(on ? S * 0.26 : S * 0.1)}px "Chakra Petch", sans-serif`;
      ctx.fillStyle = on ? `rgba(${ORANGE},${0.4 + 0.6 * f.nz})` : `rgba(${INK},${0.5 * f.nz})`;
      ctx.fillText(pad2(f.i + 1), x, y + (on ? S * 0.03 : 0));
    }

    // Vertex handles.
    for (let i = 0; i < 6; i++) {
      const p = pv[i];
      ctx.fillStyle = p.z > 0 ? `rgba(${INK},0.9)` : `rgba(${INK},0.25)`;
      ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
    }
  }, [goTo]);

  // The canvas is a square as large as its cell allows.
  useEffect(() => {
    const cell = cellRef.current, canvas = canvasRef.current;
    if (!cell || !canvas) return;
    const fit = () => {
      const r = cell.getBoundingClientRect();
      const size = Math.floor(Math.min(r.width, r.height));
      canvas.style.width = canvas.style.height = `${size}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cell);
    return () => ro.disconnect();
  }, []);

  useCanvasLoop(canvasRef, frame);

  const local = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  };
  const inFront = (x: number, y: number) => {
    const f = st.current.front;
    if (f.length !== 3) return false;
    const sign = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
    const p = { x, y };
    const d1 = sign(p, f[0], f[1]), d2 = sign(p, f[1], f[2]), d3 = sign(p, f[2], f[0]);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };

  const ev = events[cur];

  return (
    <section aria-label="BitFest 2027" className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden px-6 pb-8 pt-[88px] md:px-14">
      <div className="mx-auto flex w-full max-w-[1332px] flex-1 flex-col">
        <div className="flex flex-wrap justify-between gap-2 text-[15px] font-medium text-soft">
          <p>KUET CSE · National inter-university fest</p>
          <p className="text-muted">{fest.dates} · {fest.venue}</p>
        </div>

        {/* BIT [object] FEST */}
        <div className="grid flex-1 grid-cols-2 grid-rows-[1fr_auto] items-center gap-y-2 py-4 [grid-template-areas:'o_o''b_f'] md:grid-cols-[auto_minmax(0,1fr)_auto] md:grid-rows-1 md:[grid-template-areas:'b_o_f']">
          <h1 className="contents">
            <span className="justify-self-end text-[clamp(56px,min(13vw,24vh),220px)] font-bold leading-[0.8] tracking-[-0.03em] [grid-area:b] md:justify-self-auto">BIT</span>
            <span className="justify-self-start text-[clamp(56px,min(13vw,24vh),220px)] font-bold leading-[0.8] tracking-[-0.03em] [grid-area:f] md:justify-self-auto md:text-right">
              FEST<span className="sr-only"> 2027</span>
            </span>
          </h1>
          <div ref={cellRef} className="relative h-full min-h-[240px] [grid-area:o]">
            <canvas
              ref={canvasRef}
              aria-hidden
              className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none"
              onPointerEnter={() => (st.current.hovering = true)}
              onPointerLeave={() => {
                st.current.hovering = false;
                st.current.ptr = [0, 0];
              }}
              onPointerDown={(e) => {
                const p = local(e);
                const s = st.current;
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                s.down = { x: p.x, y: p.y, t: performance.now(), moved: 0 };
                s.last = { x: p.x, y: p.y, t: performance.now() };
                s.mode = "drag";
                s.omega = [0, 0, 0];
              }}
              onPointerMove={(e) => {
                const p = local(e);
                const s = st.current;
                s.ptr = [(p.x / p.w) * 2 - 1, (p.y / p.h) * 2 - 1];
                const el = e.currentTarget;
                if (s.down) {
                  const now = performance.now();
                  const dx = p.x - s.last.x, dy = p.y - s.last.y;
                  const ang = Math.hypot(dx, dy) * 0.009;
                  if (ang > 0) {
                    const dq = qAxis([dy, dx, 0], ang);
                    s.q = qNorm(qMul(dq, s.q));
                    const sdt = Math.max(0.016, (now - s.last.t) / 1000);
                    const l = Math.hypot(dx, dy);
                    const sp = Math.min(9, ang / sdt); // cap the flick speed
                    s.omega = [(dy / l) * sp, (dx / l) * sp, 0];
                  }
                  s.down.moved += Math.hypot(dx, dy);
                  s.last = { x: p.x, y: p.y, t: now };
                  el.style.cursor = "grabbing";
                } else {
                  el.style.cursor = inFront(p.x, p.y) ? "pointer" : "grab";
                }
              }}
              onPointerUp={(e) => {
                const p = local(e);
                const s = st.current;
                const d = s.down;
                s.down = null;
                if (d && d.moved < 6) {
                  s.mode = "hold";
                  s.holdSince = s.now;
                  if (inFront(p.x, p.y)) window.location.href = events[s.cur].href;
                  return;
                }
                if (performance.now() - s.last.t > 80) s.omega = [0, 0, 0];
                s.mode = "spin";
              }}
            />
          </div>
        </div>

        {/* Readout for the lit face. */}
        <div className="flex items-center justify-center gap-4 pb-6" aria-live="polite">
          <button type="button" aria-label="Previous event" onClick={() => goTo(cur - 1, 4)} className="grid h-11 w-11 place-items-center border border-line-2 text-lg transition hover:border-orange hover:text-orange">‹</button>
          <div className="flex min-w-[280px] flex-col items-center text-center md:min-w-[380px]">
            <span className="text-[13px] font-medium tabular-nums text-dim">{pad2(cur + 1)} / 08 · {ev.kind}</span>
            <a href={ev.href} className="text-2xl font-bold transition hover:text-orange">{ev.name}</a>
            <span className="text-[14px] text-muted">{ev.day} · {ev.venue} · {ev.pool === "TBA" ? "Prizes TBA" : `${ev.pool} BDT`}</span>
          </div>
          <button type="button" aria-label="Next event" onClick={() => goTo(cur + 1, 4)} className="grid h-11 w-11 place-items-center border border-line-2 text-lg transition hover:border-orange hover:text-orange">›</button>
        </div>

        <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-12">
          <p className="max-w-[440px] text-[17px] leading-relaxed text-soft">
            Eight events in programming, robotics, data, gaming and business. Drag the shape to turn it, or click the lit face to open that event.
          </p>
          <FestFacts className="max-md:hidden" />
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
