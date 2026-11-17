"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "@/components/ui/SectionHead";
import { useReducedMotion } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";

const GROUPS = [
  { key: "ch", label: "Chassis", opts: [{ n: "Striker", c: "STR", s: [70, 55, 70, 50] }, { n: "Tank", c: "TNK", s: [45, 70, 55, 90] }, { n: "Dart", c: "DRT", s: [90, 45, 60, 35] }] },
  { key: "dr", label: "Drive", opts: [{ n: "2WD", c: "2WD", s: [70, 50, 60, 50] }, { n: "4WD", c: "4WD", s: [60, 75, 65, 65] }, { n: "Omni", c: "OMN", s: [80, 40, 95, 40] }] },
  { key: "kk", label: "Kicker", opts: [{ n: "Solenoid", c: "SOL", s: [50, 95, 55, 50] }, { n: "Wedge", c: "WDG", s: [65, 60, 50, 80] }, { n: "Roller", c: "ROL", s: [55, 55, 95, 45] }] },
] as const;
const COLORS = [
  { name: "Orange", hex: "#ff7a3d" },
  { name: "Amber", hex: "#ffc35e" },
  { name: "Raspberry", hex: "#e0457a" },
  { name: "Plum", hex: "#a35bd6" },
];
const STATS = ["Speed", "Power", "Control", "Armor"];
type Sel = { ch: number; dr: number; kk: number; col: number };

function BotSvg({ sel, rot }: { sel: Sel; rot: number }) {
  const col = COLORS[sel.col].hex;
  const w = { fill: "#1d191b", stroke: col, strokeWidth: 1.5 };
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" role="img" aria-label="Your custom robot">
      <g style={{ transform: `rotate(${rot}deg)`, transformOrigin: "200px 200px" }}>
        {sel.dr === 0 && (<><rect x="112" y="160" width="22" height="70" rx="5" {...w} /><rect x="266" y="160" width="22" height="70" rx="5" {...w} /><circle cx="200" cy="268" r="12" {...w} /></>)}
        {sel.dr === 1 && (<><rect x="110" y="128" width="22" height="58" rx="5" {...w} /><rect x="268" y="128" width="22" height="58" rx="5" {...w} /><rect x="110" y="214" width="22" height="58" rx="5" {...w} /><rect x="268" y="214" width="22" height="58" rx="5" {...w} /></>)}
        {sel.dr === 2 && (<><rect x="188" y="96" width="24" height="36" rx="6" transform="rotate(90 200 114)" {...w} /><rect x="112" y="232" width="24" height="36" rx="6" transform="rotate(30 124 250)" {...w} /><rect x="264" y="232" width="24" height="36" rx="6" transform="rotate(-30 276 250)" {...w} /></>)}
        {sel.ch === 0 && <rect x="135" y="125" width="130" height="155" rx="22" fill="#121012" stroke={col} strokeWidth="2.5" />}
        {sel.ch === 1 && (<><rect x="128" y="118" width="144" height="168" rx="6" fill="#121012" stroke={col} strokeWidth="2.5" /><path d="M140 130H260M140 274H260" stroke={col} strokeWidth="6" opacity=".5" /></>)}
        {sel.ch === 2 && <path d="M200 108L268 160L258 284H142L132 160Z" fill="#121012" stroke={col} strokeWidth="2.5" strokeLinejoin="round" />}
        <rect x="170" y="180" width="60" height="44" rx="4" fill="none" stroke={col} strokeWidth="1.2" opacity=".7" />
        <path d="M178 192H222M178 202H210M178 212H216" stroke={col} strokeWidth="1.2" opacity=".5" />
        <circle cx="236" cy="252" r="5" fill={col} />
        {sel.kk === 0 && (<><rect x="160" y="94" width="80" height="16" rx="3" fill={col} /><path d="M200 110V128" stroke={col} strokeWidth="5" /></>)}
        {sel.kk === 1 && <path d="M146 116L200 82L254 116Z" fill={col} opacity=".9" />}
        {sel.kk === 2 && (<><rect x="150" y="98" width="100" height="18" rx="9" fill="none" stroke={col} strokeWidth="2.5" /><path d="M162 98V116M176 98V116M190 98V116M204 98V116M218 98V116M232 98V116" stroke={col} strokeWidth="1.5" /></>)}
      </g>
    </svg>
  );
}

export default function BotBuilder() {
  const [sel, setSel] = useState<Sel>({ ch: 0, dr: 0, kk: 0, col: 0 });
  const [rot, setRot] = useState(0);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const auto = useRef(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); if (auto.current) setRot((r) => r + 0.35); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const picks = [GROUPS[0].opts[sel.ch], GROUPS[1].opts[sel.dr], GROUPS[2].opts[sel.kk]];
  const stats = STATS.map((_, i) => Math.round((picks[0].s[i] + picks[1].s[i] + picks[2].s[i]) / 3));
  const ovr = Math.round(stats.reduce((a, b) => a + b, 0) / 4);
  const code = "SB-" + picks.map((p) => p.c).join("-");
  const col = COLORS[sel.col].hex;
  const random = () => { const r = (n: number) => Math.floor(Math.random() * n); setSel({ ch: r(3), dr: r(3), kk: r(3), col: r(4) }); };

  return (
    <section aria-labelledby="builder-h" className="dot-grid relative overflow-hidden border-y border-line">
      <div className="mx-auto max-w-[1440px] px-6 py-28 md:px-14 lg:py-36">
        <div id="builder-h"><SectionHead n="03" eyebrow="Design your bot" title="Dream it first." sub="Mix a chassis, drive and kicker to see how a build trades speed for power. Take the build ID to registration." /></div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:items-center">
          <div className="flex flex-col gap-6">
            {GROUPS.map((g) => (
              <div key={g.key} role="group" aria-label={g.label} className="flex flex-col gap-2.5">
                <span className="text-[13px] font-medium text-dim">{g.label}</span>
                <div className="grid grid-cols-3 gap-2">
                  {g.opts.map((o, i) => {
                    const on = sel[g.key as keyof Sel] === i;
                    return (
                      <button key={o.n} type="button" aria-pressed={on} onClick={() => setSel((s) => ({ ...s, [g.key]: i }))}
                        className={`min-h-12 rounded-[10px] border text-[15px] font-semibold transition-colors ${on ? "bg-white/5 text-ink" : "border-line-2 text-muted hover:border-[#5a5052] hover:text-ink"}`}
                        style={{ borderColor: on ? col : undefined }}>
                        {o.n}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div role="group" aria-label="Livery" className="flex flex-col gap-2.5">
              <span className="text-[13px] font-medium text-dim">Livery</span>
              <div className="flex gap-2.5">
                {COLORS.map((c, i) => (
                  <button key={c.name} type="button" aria-label={c.name} aria-pressed={sel.col === i} onClick={() => setSel((s) => ({ ...s, col: i }))}
                    className="h-12 w-12 rounded-full border-2 shadow-[inset_0_0_0_4px_#070607]" style={{ background: c.hex, borderColor: sel.col === i ? "#fff" : "transparent" }} />
                ))}
              </div>
            </div>
          </div>

          <div
            className="relative mx-auto aspect-square w-full max-w-[560px] cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={(e) => { drag.current = { x: e.clientX, r: rot }; auto.current = false; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (drag.current) setRot(drag.current.r + (e.clientX - drag.current.x) * 0.6); }}
            onPointerUp={() => { drag.current = null; window.setTimeout(() => (auto.current = true), 2500); }}
          >
            <div aria-hidden className="absolute inset-[8%] rounded-full border border-dashed border-white/15 motion-safe:animate-[spin_40s_linear_infinite]" />
            <div aria-hidden className="absolute inset-[20%] rounded-full border transition-colors" style={{ borderColor: col + "55", boxShadow: `0 0 80px ${col}22, inset 0 0 60px ${col}22` }} />
            <BotSvg sel={sel} rot={rot} />
            <p className="absolute inset-x-0 bottom-0 text-center text-[13px] font-medium tabular-nums text-dim">Drag to rotate · {String(((Math.round(rot) % 360) + 360) % 360).padStart(3, "0")}°</p>
          </div>

          <div className="flex flex-col gap-5">
            {STATS.map((s, i) => (
              <div key={s} className="flex flex-col gap-2">
                <div className="flex justify-between text-[13px] font-medium text-dim"><span>{s}</span><span className="tabular-nums text-ink">{stats[i]}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#1c181a]"><div className="h-2 rounded-full transition-[width] duration-500" style={{ width: `${stats[i]}%`, background: col, boxShadow: `0 0 14px ${col}` }} /></div>
              </div>
            ))}
            <div className="lidx relative mt-2 flex items-end justify-between rounded-[14px] p-5">
              <span className="lx lx-rim" />
              <div className="relative z-[4] flex flex-col gap-1">
                <span className="text-[13px] font-medium text-dim">Build ID</span>
                <span className="text-xl font-semibold tabular-nums">{code}</span>
              </div>
              <span className="relative z-[4] text-6xl font-semibold leading-none tracking-[-0.04em] tabular-nums" style={{ color: col }}>{ovr}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={random} className="h-14 flex-1 rounded-[10px] border border-[rgba(255,214,190,0.2)] font-semibold transition-colors hover:border-orange">Randomize</button>
              <Button href="#register" className="flex-1 justify-between">Use this build</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
