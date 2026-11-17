"use client";

import { useEffect, useRef, useState } from "react";
import EventHero from "@/components/event/EventHero";
import { LiveDot } from "@/components/event/HeroPanel";
import { useLiveTick, seeded } from "@/components/event/useLiveTick";
import { copyRects, inBoxes, type CopyBox } from "@/lib/copyRects";
import { fitCanvas } from "@/lib/hooks";
import { eventPages } from "@/lib/eventPages";

/* AI Hackathon hero: a neural network spread across the hero, layer by layer from left to right,
   kept clear of the title and buttons (nodes and links route around them). Signals fire in from the
   input layer and travel link to link; every node they reach glows for a moment, and the outputs
   light at the far side. Point near a node and it fires. One canvas, drawn only while on screen. */

const page = eventPages["ai-hackathon"];

type N = { x: number; y: number; l: number; glow: number; out: number[]; fired: number };
type E = { a: number; b: number; len: number };
type P = { e: number; t: number };

function halo() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,190,120,0.9)");
  r.addColorStop(0.35, "rgba(255,122,61,0.35)");
  r.addColorStop(1, "rgba(194,51,90,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return c;
}

function Net() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glow = halo();
    let W = 0, H = 0, nodes: N[] = [], edges: E[] = [], pulses: P[] = [], boxes: CopyBox[] = [], layers = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      fitCanvas(canvas, W, H);
      const sec = canvas.closest("section") as HTMLElement | null;
      boxes = sec ? copyRects(sec, 34) : [];
      const rnd = seeded(77);
      layers = W < 768 ? 4 : 6;
      const per = W < 768 ? 7 : 8;
      nodes = [];
      for (let l = 0; l < layers; l++) {
        const x0 = W * (0.06 + (0.88 * l) / (layers - 1));
        for (let i = 0; i < per; i++) {
          const y = H * (0.18 + (0.78 * (i + 0.5)) / per) + (rnd() - 0.5) * H * 0.05;
          const x = x0 + (rnd() - 0.5) * W * 0.04;
          if (!inBoxes(boxes, x, y, 16) && y < H - 18) nodes.push({ x, y, l, glow: 0, out: [], fired: 0 });
        }
      }
      // Each node links to its nearest few in the next layer, unless the link would cross the copy.
      const clear = (a: N, b: N) => {
        for (let k = 1; k < 16; k++) { const t = k / 16; if (inBoxes(boxes, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 6)) return false; }
        return true;
      };
      edges = [];
      nodes.forEach((n, i) => {
        const next = nodes.map((m, j) => ({ m, j })).filter(({ m }) => m.l === n.l + 1).sort((p, q) => Math.abs(p.m.y - n.y) - Math.abs(q.m.y - n.y));
        let c = 0;
        for (const { m, j } of next) {
          if (c >= 3) break;
          if (clear(n, m)) { n.out.push(edges.length); edges.push({ a: i, b: j, len: Math.hypot(m.x - n.x, m.y - n.y) }); c++; }
        }
      });
      pulses = [];
    };

    const fire = (i: number, all = false) => {
      const n = nodes[i];
      n.glow = 1;
      if (!n.out.length) return;
      if (all) n.out.forEach((e) => pulses.push({ e, t: 0 }));
      else pulses.push({ e: n.out[Math.floor(Math.random() * n.out.length)], t: 0 });
    };

    let spawn = 0;
    const step = (dt: number) => {
      spawn += dt;
      if (spawn > 0.16 && pulses.length < 46) {
        spawn = 0;
        const inputs = nodes.map((n, i) => (n.l === 0 && n.out.length ? i : -1)).filter((i) => i >= 0);
        if (inputs.length) fire(inputs[Math.floor(Math.random() * inputs.length)]);
      }
      const speed = W < 768 ? 170 : 260;
      pulses = pulses.filter((p) => {
        const e = edges[p.e];
        p.t += (speed * dt) / e.len;
        if (p.t < 1) return true;
        const b = nodes[e.b];
        b.glow = 1;
        if (b.out.length && Math.random() < 0.8) fire(e.b);
        if (b.out.length && Math.random() < 0.18) fire(e.b);
        return false;
      });
      for (const n of nodes) n.glow = Math.max(0, n.glow - dt * 1.5);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,214,190,0.08)";
      ctx.beginPath();
      for (const e of edges) { const a = nodes[e.a], b = nodes[e.b]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
      ctx.stroke();
      for (const p of pulses) {
        const e = edges[p.e], a = nodes[e.a], b = nodes[e.b];
        const ux = (b.x - a.x) / e.len, uy = (b.y - a.y) / e.len;
        const hx = a.x + (b.x - a.x) * p.t, hy = a.y + (b.y - a.y) * p.t;
        const tail = Math.min(34, p.t * e.len);
        ctx.strokeStyle = "rgba(255,150,90,0.6)";
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(hx - ux * tail, hy - uy * tail); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.globalAlpha = 0.5; ctx.drawImage(glow, hx - 9, hy - 9, 18, 18); ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff0e4";
        ctx.beginPath(); ctx.arc(hx, hy, 1.7, 0, Math.PI * 2); ctx.fill();
      }
      for (const n of nodes) {
        if (n.glow > 0.02) { ctx.globalAlpha = n.glow; ctx.drawImage(glow, n.x - 22, n.y - 22, 44, 44); ctx.globalAlpha = 1; }
        const out = n.l === layers - 1;
        ctx.fillStyle = n.glow > 0.3 ? "#ffd2a8" : out ? "rgba(255,170,110,0.55)" : "rgba(242,230,220,0.32)";
        ctx.beginPath(); ctx.arc(n.x, n.y, out ? 3.4 : 2.6, 0, Math.PI * 2); ctx.fill();
      }
    };

    let raf = 0, visible = true, last = performance.now(), frame = 0;
    // Phones draw at 30 fps; the signals keep their speed because each step uses real elapsed time.
    const every = window.innerWidth < 768 ? 2 : 1;
    const loop = (now: number) => {
      raf = visible ? requestAnimationFrame(loop) : 0;
      if (++frame % every) return;
      step(Math.min(0.08, (now - last) / 1000));
      last = now;
      draw();
    };
    const kick = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    const host = canvas.closest("section") ?? canvas.parentElement!;
    const move = (ev: Event) => {
      const e = ev as PointerEvent;
      if (e.pointerType === "touch" && e.type === "pointermove") return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
      let best = -1, bd = 110;
      nodes.forEach((n, i) => { const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0 && now - nodes[best].fired > 350) { nodes[best].fired = now; fire(best, true); if (reduce) draw(); }
    };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerdown", move, { passive: true });

    build();
    if (reduce) { nodes.forEach((n, i) => { if (i % 5 === 0) n.glow = 0.8; }); draw(); }
    const ro = new ResizeObserver(() => { build(); if (reduce || !raf) draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    kick();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", move);
    };
  }, []);

  return (
    <div className="absolute inset-0 touch-pan-y [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_14%,rgba(0,0,0,0.3)_30%,rgba(0,0,0,0.75)_48%,#000_62%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_14%,rgba(0,0,0,0.3)_30%,rgba(0,0,0,0.75)_48%,#000_62%)]">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" role="img" aria-label="A neural network with signals travelling from layer to layer. Point near a node to fire it." />
    </div>
  );
}

const START = 6 * 3600 + 12 * 60 + 40;
const hms = (s: number) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, "0")).join(":");

export default function AiHackathonHero() {
  const [left, setLeft] = useState(START);
  const ref = useRef<HTMLSpanElement>(null);
  useLiveTick(1000, () => setLeft((s) => (s <= 0 ? START : s - 1)), ref);
  return (
    <EventHero
      slug="ai-hackathon"
      lead={page.lead}
      registerHref={page.registerHref}
      rulebookHref={page.rulebookHref}
      scene={<Net />}
      badge={
        <>
          <span ref={ref} className="relative z-[4] flex items-center gap-2 text-[#ff8a6a]"><LiveDot />Building</span>
          <span className="relative z-[4] text-soft">Time left</span>
          <span className="relative z-[4] text-[24px] font-semibold leading-none tabular-nums text-ink">{hms(left)}</span>
        </>
      }
    />
  );
}
