"use client";

import { useEffect, useRef, useState } from "react";
import { eventHref, events, fest, isExternal, pad2 } from "@/lib/fest";
import { HeroActions } from "./shared";
import ChipGlow, { type GlowId } from "./ChipGlow";
import WarmLight from "./rebrand/WarmLight";
import BottomLight from "./BottomLight";

/* Hero — Pinout. The fest is one chip: a substrate with a machined metal lid and ten contest pins
   (five a side) labelled like a datasheet. Built from plain HTML and CSS so it paints with the first response;
   the only motion is transform/opacity (glow, sheen, signals), and one timer steps the active pin. */

const SIDE = 20; // pins down each side
const TOP = 18; // pins across top and bottom
const PER = Math.ceil(events.length / 2); // contests down each side
const EV_IDX = Array.from({ length: PER }, (_, k) => 1.5 + (k * 16) / (PER - 1)); // where on the side each one sits
const yOf = (i: number) => `${7 + (86 * i) / (SIDE - 1)}%`;
const xOf = (i: number) => `${8 + (84 * i) / (TOP - 1)}%`;

// The little 2D code etched on the lid (fixed pattern).
const CODE = [1,0,1,1,0,1,0,1, 0,1,1,0,1,0,1,1, 1,1,0,1,0,0,1,0, 0,1,0,1,1,1,0,1, 1,0,1,0,1,0,1,1, 0,0,1,1,0,1,1,0, 1,1,0,0,1,0,1,1, 1,0,1,1,1,1,0,1];

export type SeatId = "float" | "socket" | "carved" | "dissolve" | "board";
export type LidId = "metal" | "corner" | "orbit" | "duo" | "horizon" | "live";

const RIM_CORNER = "radial-gradient(130% 130% at 0% 100%, #ffe7b0, rgba(255,140,80,0.85) 30%, rgba(184,50,90,0.45) 60%, rgba(255,214,190,0.2))";

/** The lit lids: a black face lit in orange, a little plum, and black (gradients painted once;
    transform/opacity move them). */
function LidLight({ kind }: { kind: Exclude<LidId, "metal" | "live"> }) {
  if (kind === "orbit") {
    return (
      <>
        <span className="lx lx-orbit"><span className="lx-corner lx-bl lx-warm" /></span>
        <span className="lx lx-rimlight">
          <i className="glow-spin" style={{ ["--spin" as string]: "20s", background: "conic-gradient(from 0deg, transparent 0deg 150deg, rgba(184,50,90,0.8) 195deg, #ffd27a 225deg, rgba(255,122,61,0.85) 250deg, transparent 300deg 360deg)" }} />
        </span>
        <span className="lx lx-rim" />
      </>
    );
  }
  if (kind === "duo") {
    return (
      <>
        <span className="lx lx-corner lx-bl lx-warm lx-trade-a" />
        <span className="lx lx-corner lx-tr lx-small lx-plum lx-trade-b" />
        <span className="lx lx-rimlight" style={{ background: "linear-gradient(45deg, #ffd27a, rgba(255,122,61,0.3) 40%, rgba(154,58,154,0.3) 60%, rgba(232,85,122,0.9))" }} />
        <span className="lx lx-rim" />
      </>
    );
  }
  if (kind === "horizon") {
    return (
      <>
        <span className="lx lx-horizon" />
        <span className="lx lx-rimlight" style={{ background: "linear-gradient(0deg, #ffd27a, rgba(255,122,61,0.6) 30%, rgba(154,58,154,0.3) 60%, rgba(255,214,190,0.18))" }} />
        <span className="lx lx-rim" />
      </>
    );
  }
  return (
    <>
      <span className="lx lx-corner lx-bl lx-breathe">
        <i className="lx inset-0 lx-warm" />
        <i className="lx inset-0 lx-fade lx-warm-2" />
      </span>
      <span className="lx lx-rimlight" style={{ background: RIM_CORNER }} />
      <span className="lx lx-rim" />
    </>
  );
}

export default function HeroPinout({ glow = "current", seat = "float", lid = "metal" }: { glow?: GlowId; seat?: SeatId; lid?: LidId }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const hold = useRef(false);
  const sec = useRef<HTMLElement>(null);
  // A hovered contest swings the live lid's light out toward that pin.
  const focus: [number, number] | null =
    hovered === null ? null : [hovered < PER ? -0.25 : 1.25, (7 + (86 * EV_IDX[hovered % PER]) / (SIDE - 1) - 10.5) / 79];

  // Step through the pins; pause while a label is hovered or focused.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!hold.current) setActive((a) => (a + 1) % events.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const pick = (i: number) => {
    hold.current = i >= 0;
    setHovered(i >= 0 ? i : null);
    if (i >= 0) setActive(i);
  };

  return (
    <section ref={sec} aria-label={`${fest.name} ${fest.year}`} className="relative flex min-h-[100svh] flex-col overflow-hidden px-6 pb-8 pt-[88px] md:px-14 lg:h-[100svh] lg:min-h-[680px]">
      <div aria-hidden className="hero-stage-bg pointer-events-none absolute inset-0" />
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0" />
      <div aria-hidden className="hero-noise pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      {lid === "live" && <BottomLight />}

      <div className="relative mx-auto flex w-full max-w-[1332px] flex-1 flex-col">

        <div className="relative my-6 flex flex-1 items-center justify-center lg:my-4">
          <div className="chip relative">
            {/* What the chip sits in, and the light. */}
            {seat === "socket" && (
              <>
                <div aria-hidden className="seat-pocket absolute -inset-[18px] rounded-[24px]" />
                <div aria-hidden className="pointer-events-none absolute -inset-[18px] overflow-hidden rounded-[24px]">
                  <div className="absolute inset-[18px]"><ChipGlow kind={glow} /></div>
                </div>
              </>
            )}
            {seat === "board" && (
              <>
                <div aria-hidden className="seat-board absolute -inset-[16%] rounded-[40px]" />
                <div aria-hidden className="seat-board-fade pointer-events-none absolute -inset-[16%]">
                  <div className="absolute inset-[11.1%]"><ChipGlow kind={glow} /></div>
                </div>
                <div aria-hidden className="absolute -inset-[12px] rounded-[18px] border border-white/[0.12]" />
                <span aria-hidden className="absolute -left-[22px] -top-[22px] h-0 w-0 border-l-[8px] border-t-[8px] border-l-transparent border-t-white/30" />
              </>
            )}
            {seat === "dissolve" && (
              <div aria-hidden className="seat-dissolve-mask pointer-events-none absolute inset-0"><ChipGlow kind={glow} /></div>
            )}
            {seat === "float" && <ChipGlow kind={glow} />}

            {/* Leaders and their signals. Drawn first, so each line comes out from behind the chip and its pin. The
                signals start just outside the seat's frame line (12px out) and are clipped there, so a
                light never travels across that line; each one runs out over its pin's end dot. On phones the
                lines stay but the moving lights are left out. */}
            {events.map((e, ev) => {
              const left = ev < PER;
              const y = yOf(EV_IDX[ev % PER]);
              const on = ev === active;
              const from = left ? { right: "calc(100% - var(--inset-x))" } : { left: "calc(100% - var(--inset-x))" };
              return (
                <div key={e.slug} aria-hidden>
                  <span
                    className={`lead-in absolute z-[1] h-px -translate-y-1/2 transition-colors duration-300 ${left ? "origin-right" : "origin-left"} ${on ? "bg-orange" : "bg-white/15"}`}
                    style={{ top: y, width: "calc(var(--inset-x) + var(--pin) + var(--lead))", animationDelay: `${0.15 + (ev % PER) * 0.06}s`, ...from }}
                  >
                    <span className={`absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full transition-[background-color,box-shadow] duration-300 ${left ? "-left-[2px]" : "-right-[2px]"} ${on ? "bg-orange shadow-[0_0_10px_rgba(255,122,61,0.8)]" : "bg-white/30"}`} />
                  </span>
                  <span className={`sig hidden lg:block ${left ? "sig-l" : "sig-r"}`} data-on={on} style={{ top: y, width: "calc(var(--pin) + var(--lead) - 2px)", clipPath: "inset(-12px 0)", ...(left ? { right: "calc(100% + 14px)" } : { left: "calc(100% + 14px)" }) }}>
                    <i style={{ animationDelay: `${-(ev * 0.83) % 6.5}s` }} />
                  </span>
                </div>
              );
            })}

            {/* Substrate, via ring, capacitors. */}
            <div aria-hidden className={`absolute inset-0 z-[3] ${seat === "dissolve" ? "seat-dissolve-mask" : ""}`}>
            <div aria-hidden className={`absolute inset-0 rounded-[12px] ${seat === "carved" ? "seat-carved" : seat === "dissolve" ? "seat-dissolve" : seat === "board" ? "chip-substrate seat-board-chip" : "chip-substrate"}`} />
            {seat === "carved" && (
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px] opacity-[0.28]"><ChipGlow kind={glow} /></div>
            )}
            <div aria-hidden className="absolute rounded-[10px] border-[1.5px] border-dotted border-white/[0.09]" style={{ inset: "5.5% calc(var(--inset-x) - 4.5%)" }} />
            {[
              "left-[2.4%] top-[2.6%]",
              "right-[2.4%] top-[2.6%]",
              "left-[2.4%] bottom-[2.6%]",
              "right-[2.4%] bottom-[2.6%]",
            ].map((pos) => (
              <div key={pos} aria-hidden className={`absolute grid grid-cols-2 gap-x-[3px] gap-y-[3px] ${pos} ${seat === "carved" ? "hidden" : ""}`}>
                {Array.from({ length: 6 }, (_, i) => <span key={i} className="cap h-[3px] w-[6px] lg:h-[4px] lg:w-[9px]" />)}
              </div>
            ))}
            </div>

            {lid !== "metal" ? (
              <div className="lidx absolute z-[3] flex flex-col items-center justify-center rounded-[9px] text-center" style={{ inset: "10.5% var(--inset-x)" }}>
                {lid === "live" ? (
                  <>
                    <span className="lx lx-corner lx-bl lx-warm" />
                    <WarmLight track={sec} rest={[0, 1]} radius={0.86} lean={0.7} box={[-0.3, 1.0, 1.3, 1.3]} focus={focus} />
                    <span className="lx lx-rim" />
                  </>
                ) : (
                  <LidLight kind={lid} />
                )}
                <h1 className="relative z-[4] text-[clamp(40px,14vw,60px)] font-semibold leading-[0.9] tracking-[-0.045em] lg:text-[clamp(56px,min(8.4vw,calc((100svh_-_300px)*0.18)),104px)]">
                  <span className="lx-ink-warm">{fest.name}</span>
                  <br />
                  <span className="lx-ink-warm">{fest.year}</span>
                </h1>
                {/* The date sits at the foot of the lid, centred under the title. */}
                <p className="absolute inset-x-0 bottom-[7%] z-[4] text-[13px] font-medium tracking-[-0.005em] text-[#f2e6dc]/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.35)] lg:text-[clamp(14px,1.15vw,18px)]">{fest.dates}</p>
              </div>
            ) : (
              <>
            {/* The metal lid, its marking and lit rim. */}
              <div className={`chip-lid absolute z-[3] flex flex-col items-center justify-center rounded-[9px] text-center ${seat !== "float" ? "is-set" : ""} ${seat === "carved" ? "is-carved" : ""}`} style={{ inset: "10.5% var(--inset-x)" }}>
                <span aria-hidden className="absolute left-[5%] top-[6%] h-2.5 w-2.5 rounded-full bg-[#0b0c11] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.08)] lg:h-3 lg:w-3" />
                <span aria-hidden className="absolute right-[5%] top-[6%] grid w-[7%] grid-cols-8 gap-px opacity-50">
                  {CODE.map((on, i) => <span key={i} className={`aspect-square ${on ? "bg-[#c9cdd8]" : ""}`} />)}
                </span>
                <h1 className="text-[clamp(40px,14vw,60px)] font-semibold leading-[0.9] tracking-[-0.045em] lg:text-[clamp(56px,min(8.4vw,calc((100svh_-_300px)*0.18)),104px)]">
                  <span className={seat === "carved" ? "carved-ink" : "chip-ink"}>BitFest</span>
                  <br />
                  <span className={seat === "carved" ? "carved-ink-orange" : "chip-ink-orange"}>2027</span>
                </h1>
                <p className="mt-3 text-[12px] font-medium text-[#8b90a3] md:text-[13px]">BF-27 · KUET CSE · Khulna</p>
                <p aria-hidden className="absolute bottom-[6%] left-[5%] text-[11px] tabular-nums text-[#5c6172]">Lot 2701</p>
              </div>
              <div aria-hidden className="chip-rim pointer-events-none absolute z-[3] rounded-[9px]" style={{ inset: "10.5% var(--inset-x)" }} />
  
              </>
            )}

            {/* Pin labels (desktop). */}
            <ul className="hidden lg:block">
              {events.map((e, i) => {
                const left = i < PER;
                const on = active === i;
                return (
                  <li
                    key={e.slug}
                    className="hero-in absolute -translate-y-1/2"
                    style={{ animationDelay: `${0.4 + (i % PER) * 0.06}s`, top: yOf(EV_IDX[i % PER]), ...(left ? { right: "calc(100% + var(--pin) + var(--lead) + 14px)" } : { left: "calc(100% + var(--pin) + var(--lead) + 14px)" }) }}
                  >
                    <a
                      href={eventHref(e)}
                      {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                      onPointerEnter={() => pick(i)}
                      onPointerLeave={() => pick(-1)}
                      onFocus={() => pick(i)}
                      onBlur={() => pick(-1)}
                      className={`flex w-max flex-col ${left ? "items-end text-right" : "items-start"}`}
                    >
                      <span className="text-[12px] tabular-nums">
                        <span className={on ? "text-orange" : "text-dim"}>Pin {pad2(i + 1)}</span>
                        <span className="text-dim"> · {on ? `${e.day} · ${e.pool === "TBA" ? "Prizes TBA" : `${e.pool} BDT`}` : e.kind}</span>
                      </span>
                      <span className={`text-[17px] font-semibold transition-colors ${on ? "text-ink" : "text-muted"}`}>{e.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Centred under the chip. */}
        <div className="chip-span mx-auto flex justify-center">
          <HeroActions className="hero-in justify-center" style={{ animationDelay: "0.55s" }} />
        </div>
      </div>
    </section>
  );
}
