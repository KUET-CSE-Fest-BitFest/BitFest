"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { events, fest, pad2 } from "@/lib/fest";
import { FestFacts, HeroActions, useCanvasLoop } from "./shared";
import { type Box, type Route, INK, ORANGE, PulseLane, drawPulse, route, rng } from "./pcb";

/* A5 — Exploded board. The fest is a circuit board seen in 3D: base, copper, parts and print.
   It sways on its own; point at it and it tilts toward you while the layers pull apart. */

type Layout = { W: number; H: number; cpu: Box; chips: Box[]; routes: Route[] };

function makeLayout(W: number): Layout {
  const H = Math.round(W * 0.64);
  const c = W * 0.2;
  const cpu = { x: (W - c) / 2, y: (H - c) / 2, w: c, h: c };
  const cw = W * 0.21, ch = H * 0.13;
  const top = H * 0.1, step = (H * 0.8 - ch) / 3;
  const chips = events.map((_, i) => {
    const left = i < 4, k = i % 4;
    return { x: left ? W * 0.04 : W - W * 0.04 - cw, y: top + k * step, w: cw, h: ch };
  });
  const routes = chips.map((b, i) => {
    const left = i < 4, k = i % 4;
    const py = cpu.y + c * (0.2 + 0.2 * k);
    const px = left ? cpu.x : cpu.x + c;
    const ty = b.y + b.h / 2, tx = left ? b.x + b.w : b.x;
    const dy = ty - py;
    const xEnd = tx + (left ? 18 : -18);
    const xs = xEnd + (left ? 1 : -1) * Math.abs(dy);
    const xStart = left ? Math.min(px - 12, xs) : Math.max(px + 12, xs);
    return route([{ x: px, y: py }, { x: xStart, y: py }, { x: xEnd, y: ty }, { x: tx, y: ty }]);
  });
  return { W, H, cpu, chips, routes };
}

export default function HeroLayers() {
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const copperRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLCanvasElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [L, setL] = useState<Layout>(() => makeLayout(600));
  const [active, setActive] = useState(0);
  const st = useRef({
    L: makeLayout(600) as Layout | null,
    lanes: events.map(() => new PulseLane()),
    active: 0,
    hover: -1,
    over: false,
    tilt: { x: 0, y: 0 },
    lastSwitch: 0,
    font: "sans-serif",
  });

  // Board size follows the stage.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const W = Math.round(Math.min(el.clientWidth * 0.98, 720, (el.clientHeight / 0.62) * 0.98));
      const lay = makeLayout(W);
      st.current.L = lay;
      setL(lay);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Silkscreen: static, redrawn on size change.
  const drawPrint = useCallback((ctx: CanvasRenderingContext2D) => {
    const lay = st.current.L;
    if (!lay) return;
    const font = getComputedStyle(printRef.current!).fontFamily;
    ctx.strokeStyle = `rgba(${INK},0.55)`;
    ctx.fillStyle = `rgba(${INK},0.6)`;
    ctx.lineWidth = 1;
    ctx.font = `600 11px ${font}`;
    const all = [lay.cpu, ...lay.chips];
    all.forEach((b, i) => {
      ctx.strokeRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12);
      ctx.beginPath();
      ctx.arc(b.x - 1, b.y - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`U${i + 1}`, b.x - 6, b.y - 12);
    });
    ctx.font = `600 13px ${font}`;
    ctx.fillText("BitFest · Rev 2027 · KUET CSE", 22, lay.H - 20);
    for (const [x, y] of [[16, 16], [lay.W - 16, 16], [16, lay.H - 46], [lay.W - 16, lay.H - 46]]) {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, []);

  const frame = useCallback((ctx: CanvasRenderingContext2D, _w: number, _h: number, t: number, dt: number) => {
    const s = st.current;
    const lay = s.L;
    if (!lay) return;
    if (!s.lastSwitch) s.lastSwitch = t;
    if (s.hover < 0 && t - s.lastSwitch > 2.4) {
      s.active = (s.active + 1) % 8;
      s.lastSwitch = t;
      setActive(s.active);
    }
    const act = s.hover >= 0 ? s.hover : s.active;

    // Board pose: a slow sway, or toward the pointer.
    const b = boardRef.current;
    if (b) {
      const tx = s.over ? s.tilt.x : Math.sin(t * 0.35) * 0.35;
      const ty = s.over ? s.tilt.y : Math.cos(t * 0.27) * 0.25;
      b.style.transform = `translate(-50%,-50%) rotateX(${54 - ty * 10}deg) rotateZ(${-32 + tx * 12}deg)`;
    }

    // Copper: vias, edge fingers, traces, pads, signals.
    const r = rng(11);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(${ORANGE},0.22)`;
    for (let i = 0; i < 26; i++) {
      const x = 30 + r() * (lay.W - 60), y = 30 + r() * (lay.H - 90);
      if ([lay.cpu, ...lay.chips].some((c) => x > c.x - 14 && x < c.x + c.w + 14 && y > c.y - 14 && y < c.y + c.h + 14)) continue;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${ORANGE},0.35)`;
    const fw = 8, n = Math.floor((lay.W * 0.5) / (fw + 5));
    for (let i = 0; i < n; i++) ctx.fillRect(lay.W * 0.42 + i * (fw + 5), lay.H - 26, fw, 26);

    lay.routes.forEach((rt, i) => {
      const on = i === act;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = on ? `rgba(${ORANGE},0.95)` : `rgba(${ORANGE},0.32)`;
      ctx.beginPath();
      ctx.moveTo(rt.pts[0].x, rt.pts[0].y);
      for (let j = 1; j < rt.pts.length; j++) ctx.lineTo(rt.pts[j].x, rt.pts[j].y);
      ctx.stroke();
      const lane = s.lanes[i];
      lane.step(t, dt, rt.len, on ? { gap: [0.22, 0.3], speed: 2.2 } : { gap: [1.6, 4.5], speed: 1 });
      for (const pu of lane.list) drawPulse(ctx, rt, pu.s, 24, 3);
    });

    // Callout follows the active part on screen.
    const el = chipRefs.current[act], co = calloutRef.current, stage = stageRef.current;
    if (el && co && stage) {
      const a = el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const left = act < 4;
      co.style.left = `${(left ? a.left : a.right) - sr.left}px`;
      co.style.top = `${a.top - sr.top - 12}px`;
      co.style.transform = `translate(${left ? "-20%" : "-80%"}, -100%)`;
    }
  }, []);

  useCanvasLoop(copperRef, frame);
  useCanvasLoop(printRef, drawPrint);

  const setHover = (i: number) => {
    st.current.hover = i;
    if (i >= 0) {
      st.current.active = i;
      setActive(i);
    }
    st.current.lastSwitch = performance.now() / 1000;
  };

  const ev = events[active];
  const layer = (n: number, extra = ""): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    transform: `translateZ(calc(var(--gap) * ${n})) ${extra}`,
    transition: "transform 0.6s cubic-bezier(.2,.7,.2,1)",
    transformStyle: "preserve-3d",
  });

  return (
    <section aria-label="BitFest 2027" className="relative flex min-h-[100svh] items-center overflow-hidden lg:h-[100svh] lg:min-h-[680px]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 pb-12 pt-28 md:px-14 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:py-0">
        <div className="relative z-10 flex flex-col gap-7">
          <p className="text-[15px] font-medium text-soft">{fest.kicker}</p>
          <h1 className="text-[clamp(64px,min(8vw,15vh),128px)] font-semibold leading-[0.9] tracking-[-0.045em]">
            BitFest<br /><span className="text-orange">2027</span>
          </h1>
          <p className="max-w-[460px] text-lg leading-relaxed text-soft">{fest.blurb}</p>
          <FestFacts />
          <HeroActions />
        </div>

        <div
          ref={stageRef}
          className="relative h-[min(72vh,620px)] min-h-[420px] [perspective:1800px]"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const s = st.current;
            s.over = true;
            s.tilt = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
            boardRef.current?.style.setProperty("--gap", "30px");
          }}
          onPointerLeave={() => {
            st.current.over = false;
            boardRef.current?.style.setProperty("--gap", "14px");
          }}
        >
          {(
            <div
              ref={boardRef}
              className="absolute left-1/2 top-1/2"
              style={{
                width: L.W,
                height: L.H,
                transformStyle: "preserve-3d",
                transition: "transform 0.5s ease-out",
                ["--gap" as string]: "14px",
              }}
            >
              {/* Base */}
              <div style={layer(0)} className="rounded-[14px] border border-line-2 bg-[#0c1019] shadow-[0_40px_80px_rgba(0,0,0,0.5)]" />
              {/* Copper */}
              <canvas ref={copperRef} aria-hidden style={{ ...layer(1), width: L.W, height: L.H }} />
              {/* Print */}
              <canvas ref={printRef} aria-hidden className="pointer-events-none" style={{ ...layer(2), width: L.W, height: L.H }} />
              {/* Parts (top, so names stay readable) */}
              <div style={layer(3)}>
                <div
                  className="absolute flex flex-col items-center justify-center border border-line-2 bg-[#141826] text-center"
                  style={{ left: L.cpu.x, top: L.cpu.y, width: L.cpu.w, height: L.cpu.h, transform: "translateZ(10px)" }}
                >
                  <span className="text-[clamp(18px,2vw,28px)] font-semibold tracking-[-0.03em]">BF<span className="text-orange">·25</span></span>
                  <span className="text-[11px] text-dim">KUET CSE</span>
                </div>
                {L.chips.map((b, i) => {
                  const e = events[i];
                  const on = active === i;
                  return (
                    <a
                      key={e.slug}
                      ref={(el) => { chipRefs.current[i] = el; }}
                      href={e.href}
                      onPointerEnter={() => setHover(i)}
                      onPointerLeave={() => setHover(-1)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(-1)}
                      className={`absolute flex flex-col justify-center border px-3 transition-[transform,border-color,background-color] duration-300 ${on ? "border-orange bg-[#1a1610]" : "border-line-2 bg-[#121520]"}`}
                      style={{ left: b.x, top: b.y, width: b.w, height: b.h, transform: `translateZ(${on ? 22 : 0}px)` }}
                    >
                      <span className={`text-[11px] tabular-nums ${on ? "text-orange" : "text-dim"}`}>{pad2(i + 1)}</span>
                      <span className="truncate text-[13px] font-semibold">{e.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={calloutRef} className="pointer-events-none absolute z-20 w-[240px] border-l-2 border-orange bg-bg/90 py-2 pl-4 pr-3 backdrop-blur" aria-live="polite">
            <p className="text-[12px] tabular-nums text-dim">{pad2(active + 1)} / 08 · {ev.kind}</p>
            <p className="text-lg font-semibold">{ev.name}</p>
            <p className="text-[13px] text-muted">{ev.day} · {ev.venue}</p>
            <p className="text-[13px] text-soft">{ev.pool === "TBA" ? "Prizes TBA" : `${ev.pool} BDT prize pool`}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
