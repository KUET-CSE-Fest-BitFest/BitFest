"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHead from "@/components/ui/SectionHead";
import { rules } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const SLOT_W = 150, SLOT_H = 44;
const qf = [20, 100, 200, 280];
const sf = [60, 240];

function Slot({ x, y, label, final }: { x: number; y: number; label: string; final?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={final ? 140 : SLOT_W} height={SLOT_H} rx={8} fill={final ? "rgba(255,122,61,0.12)" : "#0e0c0e"} stroke={final ? "#ff7a3d" : "#322d2f"} />
      <text x={x + (final ? 70 : 14)} y={y + 27} style={{ fontFamily: "var(--font-display)" }} fontSize="14" fontWeight="500" fill={final ? "#ff7a3d" : "#bcb6b2"} textAnchor={final ? "middle" : "start"}>
        {label}
      </text>
    </g>
  );
}

function Bracket() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const paths = ref.current!.querySelectorAll<SVGPathElement>(".brk");
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(paths, {
        strokeDashoffset: 0, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  const side = (mirror: boolean) => {
    const X = (x: number, w = 0) => (mirror ? 1000 - x - w : x);
    const labels = mirror ? ["B1", "A2", "D1", "C2"] : ["A1", "B2", "C1", "D2"];
    const p: string[] = [];
    [0, 2].forEach((i, k) => {
      const y1 = qf[i] + 22, y2 = qf[i + 1] + 22, mid = sf[k] + 22;
      p.push(`M${X(150)} ${y1} H${X(205)} V${mid} H${X(230)}`);
      p.push(`M${X(150)} ${y2} H${X(205)} V${mid}`);
    });
    p.push(`M${X(370)} ${sf[0] + 22} H${X(410)} V172 H${X(430)}`);
    p.push(`M${X(370)} ${sf[1] + 22} H${X(410)} V172`);
    return (
      <g>
        {p.map((d, i) => <path key={i} className="brk" d={d} pathLength={1} fill="none" stroke={mirror ? "#c2458a" : "#ff7a3d"} strokeOpacity=".7" strokeWidth="1.5" />)}
        {qf.map((y, i) => <Slot key={y} x={X(0, SLOT_W)} y={y} label={`Group ${labels[i]}`} />)}
        {sf.map((y, i) => <Slot key={y} x={X(230, 140)} y={y} label={`Semi-final ${mirror ? i + 3 : i + 1}`} />)}
      </g>
    );
  };

  return (
    <svg ref={ref} viewBox="0 0 1000 350" className="h-auto w-full min-w-[760px]" role="img" aria-label="Knockout bracket: group winners and runners-up meet in semi-finals, then the final">
      {side(false)}
      {side(true)}
      <Slot x={430} y={150} label="Final" final />
      <text x="500" y="230" textAnchor="middle" style={{ fontFamily: "var(--font-display)" }} fontSize="13" fill="#716a66">Bracket size to be confirmed</text>
    </svg>
  );
}

export default function Format() {
  return (
    <section id="format" className="mx-auto max-w-[1440px] scroll-mt-20 px-6 py-28 md:px-14 lg:py-40">
      <SectionHead n="04" eyebrow="Match format" title={<>Groups, knockouts,<br />one champion.</>} />
      <div data-reveal className="lidx relative mt-14 rounded-[16px]">
        <span className="lx lx-rim" />
        <div className="relative z-[4] overflow-x-auto p-6 md:p-10">
          <Bracket />
        </div>
      </div>
      <ol className="mt-14 grid gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {rules.map((r) => (
          <li key={r.n} data-reveal className="group flex flex-col gap-3 bg-bg p-7 transition hover:bg-panel">
            <span className="text-[13px] font-medium tabular-nums text-orange">{r.n}</span>
            <span className="text-2xl font-semibold tracking-[-0.02em]">{r.t}</span>
            <span className="leading-relaxed text-soft">{r.d}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
