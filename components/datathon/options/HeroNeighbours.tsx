"use client";

import { useEffect, useRef } from "react";
import { eventPages } from "@/lib/eventPages";
import EventHero from "@/components/event/EventHero";

/* Datathon option B · Nearest neighbours. The landing hero's dot field becomes a dataset: a few
   hundred labelled points in three classes (orange, plum, ash) over a faint map of what a model would
   predict there. A query point (the pointer, or a slow drifting probe when no pointer is near) is
   classified the simplest way a data scientist knows: lines run to its seven nearest points, a circle
   marks the neighbourhood, and the majority colours the probe. The badge reads the vote. One canvas,
   drawn only while on screen. */

const page = eventPages.datathon;
const K = 7;
const CLASSES = [
  { name: "Orange", rgb: [255, 122, 61] },
  { name: "Plum", rgb: [194, 69, 138] },
  { name: "Ash", rgb: [231, 217, 207] },
] as const;
// Blobs in the band's 0–1 space: [x, y, class, spread].
const BLOBS: [number, number, number, number][] = [
  [0.16, 0.5, 0, 0.11], [0.6, 0.3, 0, 0.09], [0.88, 0.72, 0, 0.1],
  [0.36, 0.72, 1, 0.11], [0.74, 0.6, 1, 0.08], [0.06, 0.22, 1, 0.07],
  [0.5, 0.48, 2, 0.09], [0.27, 0.22, 2, 0.08], [0.96, 0.28, 2, 0.07],
];

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}
const rgba = (c: readonly number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function Field({ nameRef, votesRef }: { nameRef: React.RefObject<HTMLSpanElement | null>; votesRef: React.RefObject<HTMLSpanElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, top = 0, bandH = 0;
    let pts: { x: number; y: number; c: number }[] = [];
    const map = document.createElement("canvas");
    // The K nearest points to (x, y), nearest first, kept by insertion (no sorting of every point).
    const bestD = new Float64Array(K), bestI = new Int32Array(K);
    const knn = (x: number, y: number) => {
      bestD.fill(Infinity);
      for (let p = 0; p < pts.length; p++) {
        const d = (pts[p].x - x) ** 2 + (pts[p].y - y) ** 2;
        if (d >= bestD[K - 1]) continue;
        let n = K - 1;
        while (n > 0 && bestD[n - 1] > d) { bestD[n] = bestD[n - 1]; bestI[n] = bestI[n - 1]; n--; }
        bestD[n] = d; bestI[n] = p;
      }
    };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The band starts under the title block (layout values, so the entrance animation doesn't move it).
      const title = canvas.closest("section")?.querySelector("h1")?.parentElement;
      const below = title ? title.offsetTop + title.offsetHeight + (W < 768 ? 16 : 36) : 0;
      top = Math.max(H * 0.5, below); bandH = Math.max(80, H - top - H * 0.03);
      const rr = rand(4242);
      const per = Math.round(28 * Math.min(1, Math.max(0.35, Math.sqrt((W * bandH) / (1440 * 380)))));
      pts = [];
      for (const [bx, by, c, sp] of BLOBS) {
        for (let i = 0; i < per; i++) {
          const x = bx * W + gauss(rr) * sp * bandH * 1.7;
          const y = top + by * bandH + gauss(rr) * sp * bandH;
          if (x > 6 && x < W - 6 && y > top - 10 && y < H - 6) pts.push({ x, y, c });
        }
      }
      // The model's map: what seven neighbours vote at every 12px cell, drawn small and scaled up soft.
      const cell = 12, cols = Math.ceil(W / cell), rows = Math.ceil(bandH / cell);
      map.width = cols; map.height = rows;
      const m = map.getContext("2d")!;
      const img = m.createImageData(cols, rows);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        knn(i * cell + cell / 2, top + j * cell + cell / 2);
        const v = [0, 0, 0];
        for (let n = 0; n < K; n++) v[pts[bestI[n]].c]++;
        const c = v.indexOf(Math.max(...v));
        const o = (j * cols + i) * 4;
        const fade = Math.min(1, (j * cell) / 90);
        img.data.set([...CLASSES[c].rgb, Math.round(255 * (c === 2 ? 0.035 : 0.06) * (v[c] / K) * fade)], o);
      }
      m.putImageData(img, 0, 0);
    };

    const s = { qx: 0, qy: 0, tx: 0, ty: 0, rad: 40, hover: false, init: false, pred: -1, votes: -1 };
    const draw = (t: number, dt: number) => {
      if (!s.hover) {
        s.tx = W * (0.5 + 0.34 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.67 + 1));
        s.ty = top + bandH * (0.5 + 0.32 * Math.sin(t * 0.29 + 0.6));
      }
      if (!s.init) { s.qx = s.tx; s.qy = s.ty; s.init = true; }
      const k = 1 - Math.exp(-dt * (s.hover ? 10 : 3));
      s.qx += (s.tx - s.qx) * k; s.qy += (s.ty - s.qy) * k;

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(map, 0, top, W, bandH);

      // Every point, one path per class.
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        for (const p of pts) if (p.c === c) { ctx.moveTo(p.x + 2.2, p.y); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); }
        ctx.fillStyle = rgba(CLASSES[c].rgb, c === 2 ? 0.42 : 0.55);
        ctx.fill();
      }

      // The seven nearest, and their vote.
      knn(s.qx, s.qy);
      const near = Array.from(bestI);
      const v = [0, 0, 0];
      near.forEach((i) => v[pts[i].c]++);
      const pred = v.indexOf(Math.max(...v));
      const R = Math.sqrt(bestD[K - 1]) + 8;
      s.rad += (R - s.rad) * (1 - Math.exp(-dt * 8));

      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,214,190,0.28)";
      ctx.beginPath(); ctx.arc(s.qx, s.qy, s.rad, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      near.forEach((i, n) => {
        const p = pts[i], col = CLASSES[p.c].rgb;
        ctx.strokeStyle = rgba(col, 0.14); ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(s.qx, s.qy); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.85 - n * 0.06); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(s.qx, s.qy); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = rgba(col, 1);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2); ctx.fill();
      });

      const pc = CLASSES[pred].rgb;
      const g = ctx.createRadialGradient(s.qx, s.qy, 0, s.qx, s.qy, 46);
      g.addColorStop(0, rgba(pc, 0.4)); g.addColorStop(1, rgba(pc, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.qx, s.qy, 46, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0b0809";
      ctx.beginPath(); ctx.arc(s.qx, s.qy, 10, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1.6; ctx.strokeStyle = "#fff2e6";
      ctx.beginPath(); ctx.arc(s.qx, s.qy, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = rgba(pc, 1);
      ctx.beginPath(); ctx.arc(s.qx, s.qy, 5, 0, Math.PI * 2); ctx.fill();

      if (pred !== s.pred || v[pred] !== s.votes) {
        s.pred = pred; s.votes = v[pred];
        if (nameRef.current) { nameRef.current.textContent = CLASSES[pred].name; nameRef.current.style.color = rgba(pc, 1); }
        if (votesRef.current) votesRef.current.textContent = `${v[pred]} of ${K}`;
      }
    };

    let raf = 0, visible = true, last = performance.now();
    const t0 = last;
    const loop = (now: number) => {
      draw((now - t0) / 1000, Math.min(0.05, (now - last) / 1000));
      last = now;
      raf = visible && !reduce ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    const host = canvas.parentElement!;
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const y = e.clientY - r.top;
      if (e.pointerType === "touch" && e.type === "pointermove") return;
      s.hover = true;
      s.tx = Math.min(W - 8, Math.max(8, e.clientX - r.left));
      s.ty = Math.min(H - 8, Math.max(top + 12, y));
      if (reduce) draw(30, 1);
    };
    const leave = () => { s.hover = false; };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerdown", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    build();
    if (reduce) draw(30, 1);
    const ro = new ResizeObserver(() => { build(); s.init = false; if (reduce) draw(30, 1); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    kick();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [nameRef, votesRef]);

  return (
    <div className="absolute inset-0 touch-pan-y [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_44%,rgba(0,0,0,0.6)_56%,#000_66%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_44%,rgba(0,0,0,0.6)_56%,#000_66%)]">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" role="img" aria-label="A dataset of points in three classes. The point under the pointer is classified by its seven nearest neighbours." />
    </div>
  );
}

export default function HeroNeighbours() {
  const nameRef = useRef<HTMLSpanElement>(null);
  const votesRef = useRef<HTMLSpanElement>(null);
  return (
    <EventHero
      slug="datathon"
      lead={page.lead}
      registerHref={page.registerHref}
      rulebookHref={page.rulebookHref}
      scene={<Field nameRef={nameRef} votesRef={votesRef} />}
      badge={
        <>
          <span className="relative z-[4] text-soft">7 nearest say</span>
          <span ref={nameRef} className="relative z-[4] text-orange">Orange</span>
          <span ref={votesRef} className="relative z-[4] text-[22px] font-semibold leading-none tabular-nums text-ink">7 of 7</span>
        </>
      }
    />
  );
}
