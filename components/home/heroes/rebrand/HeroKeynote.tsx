"use client";

import { useRef, useState } from "react";
import { eventHref, events, fest, isExternal } from "@/lib/fest";
import { HeroActions } from "../shared";
import WarmLight from "./WarmLight";

/* R1 — Keynote. One lit chip on black, like a silicon announcement. The light rests in the lower
   left corner and leans toward the pointer; pointing at a contest below swings it toward that name. */

export default function HeroKeynote() {
  const sec = useRef<HTMLElement>(null);
  const [hov, setHov] = useState<number | null>(null);

  return (
    <section ref={sec} aria-label={`${fest.name} ${fest.year}`} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#030304] px-6 pb-8 pt-[88px] md:px-14 lg:h-[100svh] lg:min-h-[700px]">
      <div className="relative mx-auto flex w-full max-w-[1332px] flex-1 flex-col">
        <div className="hero-in flex flex-wrap justify-between gap-x-6 gap-y-1 text-[15px] font-medium text-soft">
          <p>{fest.kicker}</p>
          <p className="text-muted">{fest.dates} · {fest.venue}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 lg:gap-9 lg:py-4">
          <div className="keynote-chip lidx relative rounded-[20px] [container-type:inline-size]">
            <span className="lx lx-corner lx-bl lx-warm" />
            <WarmLight track={sec} rest={[0, 1]} radius={0.92} lean={0.7} box={[-0.25, 0.9, 1.25, 1.3]} focus={hov !== null ? [(hov + 0.5) / 8, 1.25] : null} />
            <span className="lx lx-rim" />
            <h1 className="relative z-[4] flex h-full flex-col items-center justify-center text-center text-[19cqw] font-semibold leading-[0.9] tracking-[-0.045em]">
              <span className="lx-ink-warm">{fest.name}</span>
              <span className="lx-ink-warm">{fest.year}</span>
            </h1>
          </div>
          <ul className="hero-in flex max-w-[860px] flex-wrap justify-center gap-x-6 gap-y-2 text-[15px] font-medium" style={{ animationDelay: "0.35s" }}>
            {events.map((e, i) => (
              <li key={e.slug}>
                <a
                  href={eventHref(e)}
                  {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                  onPointerEnter={() => setHov(i)}
                  onPointerLeave={() => setHov(null)}
                  onFocus={() => setHov(i)}
                  onBlur={() => setHov(null)}
                  className={`transition-colors duration-300 ${hov === i ? "text-orange" : "text-muted hover:text-ink"}`}
                >
                  {e.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <p className="hero-in max-w-[440px] text-[17px] leading-relaxed text-soft" style={{ animationDelay: "0.5s" }}>{fest.blurb}</p>
          <HeroActions className="hero-in" style={{ animationDelay: "0.6s" }} />
        </div>
      </div>
    </section>
  );
}
