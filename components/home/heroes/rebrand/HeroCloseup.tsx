"use client";

import { useRef } from "react";
import { fest } from "@/lib/fest";
import { HeroActions } from "../shared";
import WarmLight from "./WarmLight";

/* R4 — Up close. The camera sits right on the lid: the hero is the chip's face, edge to edge, with
   its thin warm rim and the light coming in from the top right. The page's words are the lid's
   markings. The light leans toward the pointer anywhere on the face. */

export default function HeroCloseup() {
  const sec = useRef<HTMLElement>(null);

  return (
    <section ref={sec} aria-label={`${fest.name} ${fest.year}`} className="relative flex min-h-[100svh] flex-col bg-bg px-3 pb-3 pt-[76px] md:px-4 md:pb-4 lg:h-[100svh] lg:min-h-[700px]">
      <div className="lidx relative flex flex-1 flex-col rounded-[24px] md:rounded-[32px]">
        <span className="lx lx-corner lx-tr lx-warm" style={{ width: "110%" }} />
        <WarmLight track={sec} rest={[1, 0]} radius={0.48} lean={0.2} box={[0.75, -0.2, 1.2, 0.3]} scale={0.45} />
        <span className="lx lx-rim" />

        <div className="relative z-[4] mx-auto flex w-full max-w-[1408px] flex-1 flex-col justify-between gap-10 px-6 py-6 md:px-10 md:py-10 lg:py-12">
          <div className="hero-in flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[15px] font-medium">
            <p className="flex items-center gap-3 text-soft [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#000] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.1)]" />
              {fest.kicker}
            </p>
            <p className="text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.45)]">{fest.dates} · {fest.venue}</p>
          </div>

          <div className="flex flex-col gap-10">
            <h1 className="text-[clamp(60px,15.5vw,248px)] font-semibold leading-[0.82] tracking-[-0.055em]">
              <span className="lx-ink-warm">{fest.name}</span>
              <br />
              <span className="lx-ink-warm">{fest.year}</span>
            </h1>
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <p className="hero-in max-w-[440px] text-[17px] leading-relaxed text-soft" style={{ animationDelay: "0.35s" }}>{fest.blurb}</p>
              <HeroActions className="hero-in" style={{ animationDelay: "0.45s" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
