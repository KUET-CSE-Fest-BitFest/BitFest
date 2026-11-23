"use client";

// TEMPORARY options (?nav=panel|spine&box=flip|ring): a left sidebar for wide screens, with the logo and
// a moving name box at its head. Phones keep the top bar.
import { useEffect, useState } from "react";
import { events, fest } from "@/lib/fest";
import ContestLink from "@/components/redesign/ui/ContestLink";
import BitfestLogo from "@/components/redesign/ui/BitfestLogo";
import { Button } from "@/components/redesign/ui/Button";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "schedule", label: "Key dates" },
  { id: "gallery", label: "Gallery" },
  { id: "partners", label: "Partners" },
  { id: "faq", label: "FAQ" },
];

/** The section in view (the last whose top has passed a third of the screen). */
function useActive() {
  const [on, setOn] = useState("hero");
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      let cur = "hero";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = s.id;
      }
      setOn(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return on;
}

/** The name box beside the logo. "flip": a small lit box that turns over every few seconds between
    the fest's name and its edition. "ring": the name stays put while a light runs round the box. */
export function NameBox({ kind }: { kind: string }) {
  if (kind === "ring") {
    return (
      <span className="nb-ring relative inline-flex rounded-[12px] p-[1.5px]">
        <span className="lidx relative flex flex-col rounded-[11px] px-3.5 py-2 leading-[1.1]">
          <span className="relative z-[4] text-[13px] font-semibold tracking-[-0.01em] text-ink">KUET CSE</span>
          <span className="relative z-[4] text-[13px] font-semibold tracking-[-0.01em] text-orange">Innovation Fest</span>
        </span>
      </span>
    );
  }
  const faces = [
    ["KUET CSE", "Innovation Fest"],
    [`${fest.name} ${fest.year}`, "4th national fest"],
    ["Ten contests", `${fest.prizePool} BDT pool`],
  ];
  return (
    <span className="nb-flip relative block h-[46px] w-[148px] [perspective:600px]">
      <span className="nb-cube absolute inset-0 [transform-style:preserve-3d]">
        {faces.map(([a, b], i) => (
          <span key={i} className="lidx absolute inset-0 flex flex-col justify-center rounded-[11px] px-3.5 leading-[1.1] [backface-visibility:hidden]" style={{ transform: `rotateX(${-i * 120}deg) translateZ(13.3px)` }}>
            <span className="relative z-[4] text-[13px] font-semibold tracking-[-0.01em] text-ink">{a}</span>
            <span className="relative z-[4] text-[13px] font-semibold tracking-[-0.01em] text-orange">{b}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

/** Panel: one lit panel down the left, 20px from the edges, like the hero lid. Sections are numbered;
    a green bar slides to the one in view. Events open in place. Register at the foot. */
function Panel({ box }: { box: string }) {
  const on = useActive();
  const [ev, setEv] = useState(false);
  return (
    <aside className="sb fixed inset-y-5 left-5 z-50 hidden w-[264px] lg:flex">
      <div className="lidx relative flex w-full flex-col overflow-hidden rounded-[24px]">
        <span aria-hidden className="lx lx-corner lx-bl lx-warm" style={{ width: "120%", opacity: 0.55 }} />
        <span aria-hidden className="lx lx-rim" />
        <div className="relative z-[4] flex items-center gap-3 border-b border-rim/12 p-5">
          <a href="#hero" aria-label="Home"><BitfestLogo className="h-[52px] w-auto" /></a>
          <NameBox kind={box} />
        </div>
        <nav aria-label="Sections" className="relative z-[4] flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          <button type="button" aria-expanded={ev} onClick={() => setEv((v) => !v)} className="group flex items-center justify-between rounded-[12px] px-3 py-3 text-left text-[15px] font-medium text-muted transition-colors hover:bg-orange/[0.07] hover:text-ink">
            <span className="flex items-center gap-3"><span className="w-5 text-[12px] tabular-nums text-orange">10</span>Events</span>
            <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className={`transition-transform duration-300 ${ev ? "rotate-180 text-orange" : ""}`}><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.75,.2,1)]" style={{ gridTemplateRows: ev ? "1fr" : "0fr" }}>
            <ul className="min-h-0 overflow-hidden pl-11">
              {events.map((e) => (
                <li key={e.slug}><ContestLink e={e} className="block py-1.5 text-[14px] text-soft transition-colors hover:text-orange">{e.name}</ContestLink></li>
              ))}
            </ul>
          </div>
          {SECTIONS.map((s, k) => (
            <a key={s.id} href={`#${s.id}`} className={`relative flex items-center gap-3 rounded-[12px] px-3 py-3 text-[15px] font-medium transition-colors ${on === s.id ? "bg-orange/[0.09] text-ink" : "text-muted hover:bg-orange/[0.05] hover:text-ink"}`}>
              <span className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-orange transition-all duration-500 ${on === s.id ? "opacity-100" : "scale-y-0 opacity-0"}`} />
              <span className="w-5 text-[12px] tabular-nums text-dim">{String(k).padStart(2, "0")}</span>{s.label}
            </a>
          ))}
        </nav>
        <div className="relative z-[4] flex flex-col gap-3 border-t border-rim/12 p-5">
          <p className="text-[13px] leading-snug text-cream/70">{fest.prizePool} BDT prize pool · ten contests</p>
          <Button href="#schedule">Register</Button>
        </div>
      </div>
    </aside>
  );
}

/** Spine: no panel. A circuit trace runs down the left with a pad for each section; a green signal
    travels along it to the section in view, and that pad lights. */
function Spine({ box }: { box: string }) {
  const on = useActive();
  const idx = Math.max(0, SECTIONS.findIndex((s) => s.id === on));
  const [ev, setEv] = useState(false);
  return (
    <aside className="sb fixed inset-y-0 left-0 z-50 hidden w-[264px] flex-col gap-8 px-7 py-7 lg:flex">
      <div className="flex flex-col items-start gap-4">
        <a href="#hero" aria-label="Home"><BitfestLogo className="h-[56px] w-auto" /></a>
        <NameBox kind={box} />
      </div>
      <nav aria-label="Sections" className="relative flex flex-col">
        {/* The trace and its signal. Each row is 52px tall; pads sit on the trace at x = 7px. */}
        <span aria-hidden className="absolute bottom-[26px] left-[7px] top-[26px] w-px bg-rim/20" />
        <span aria-hidden className="absolute left-[7px] top-[26px] w-px bg-orange transition-[height] duration-700 ease-[cubic-bezier(.2,.75,.2,1)]" style={{ height: `${idx * 52}px` }} />
        <span aria-hidden className="sp-signal absolute left-[3px] h-[9px] w-[9px] rounded-full bg-orange transition-[top] duration-700 ease-[cubic-bezier(.2,.75,.2,1)]" style={{ top: `${22 + idx * 52}px` }} />
        {SECTIONS.map((s, k) => (
          <a key={s.id} href={`#${s.id}`} className="group relative flex h-[52px] items-center gap-5 pl-[2px]">
            <span aria-hidden className={`relative z-[1] h-[11px] w-[11px] rotate-45 rounded-[2px] border transition-colors duration-500 ${k <= idx ? "border-orange bg-bg" : "border-rim/30 bg-bg group-hover:border-orange/70"}`} />
            <span className="flex flex-col leading-tight">
              <span className={`text-[16px] font-semibold tracking-[-0.01em] transition-colors ${on === s.id ? "text-ink" : "text-muted group-hover:text-ink"}`}>{s.label}</span>
            </span>
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-2">
        <button type="button" aria-expanded={ev} onClick={() => setEv((v) => !v)} className="flex items-center gap-2 text-[14px] font-medium text-muted transition-colors hover:text-ink">
          Ten contests
          <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" className={`transition-transform duration-300 ${ev ? "rotate-180 text-orange" : ""}`}><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: ev ? "1fr" : "0fr" }}>
          <ul className="grid min-h-0 grid-cols-1 overflow-hidden">
            {events.map((e) => (
              <li key={e.slug}><ContestLink e={e} className="block py-1 text-[14px] text-soft transition-colors hover:text-orange">{e.name}</ContestLink></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-auto"><Button href="#schedule">Register</Button></div>
    </aside>
  );
}

/** Reads the temporary switches, marks the page for the CSS, and draws the chosen sidebar. */
export default function OptionSwitch() {
  const [o, setO] = useState<{ nav: string; box: string } | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const nav = q.get("nav") ?? "", box = q.get("box") ?? "flip", frame = q.get("frame") ?? "";
    const d = document.documentElement.dataset;
    if (nav) d.nav = nav;
    if (frame) d.frame = frame;
    setO({ nav, box });
  }, []);
  if (!o?.nav) return null;
  return o.nav === "spine" ? <Spine box={o.box} /> : <Panel box={o.box} />;
}
