"use client";

import { useRef, useState } from "react";
import { eventHref, events, fest, isExternal } from "@/lib/fest";
import { useActiveEvent } from "../variants/useActiveEvent";
import { HeroActions } from "../shared";
import WarmLight from "./WarmLight";

/* R3 — Thermal. The chip seen through a thermal camera: eight cores, one per contest, each giving
   off heat. The contest in focus runs hottest, the pointer adds heat where it rests, and the scale
   underneath runs from the first registration to the finals. */

const CORES: [number, number][] = events.map((_, i) => [((i % 4) + 0.5) / 4, (Math.floor(i / 4) + 0.5) / 2]);

export default function HeroThermal() {
  const sec = useRef<HTMLElement>(null);
  const [active, pick] = useActiveEvent(2600);
  const [hot, setHot] = useState<number | null>(null);
  const hold = (i: number | null) => { setHot(i); pick(i ?? -1); };

  return (
    <section ref={sec} aria-label={`${fest.name} ${fest.year}`} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#050406] px-6 pb-10 pt-[88px] md:px-14 lg:h-[100svh] lg:min-h-[720px]">
      <div className="relative mx-auto grid w-full max-w-[1332px] flex-1 items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <p className="hero-in text-[15px] font-medium text-soft">{fest.kicker}</p>
          <h1 className="text-[clamp(72px,9.4vw,156px)] font-semibold leading-[0.86] tracking-[-0.05em]">
            {fest.name}
            <br />
            <span className="text-orange">{fest.year}</span>
          </h1>
          <p className="hero-in max-w-[440px] text-[17px] leading-relaxed text-soft" style={{ animationDelay: "0.3s" }}>
            {fest.blurb} {fest.dates}.
          </p>
          <HeroActions className="hero-in" style={{ animationDelay: "0.4s" }} />
        </div>

        <figure className="flex flex-col gap-4">
          <div className="lidx relative aspect-[1.25] w-full rounded-[16px]">
            <span className="lx inset-0" style={{ background: "radial-gradient(60% 70% at 30% 40%, #7e2270, #170818 70%, #040306)" }} />
            <WarmLight mode="thermal" track={sec} cores={CORES} active={active} hot={hot} scale={0.5} />
            <span className="lx lx-rim" />
            <ul className="absolute inset-0 z-[4] grid grid-cols-4 grid-rows-2">
              {events.map((e, i) => {
                const on = i === active;
                return (
                  <li key={e.slug} className="border-[rgba(0,0,0,0.38)] [&:not(:nth-child(4n))]:border-r [&:nth-child(-n+4)]:border-b">
                    <a
                      href={eventHref(e)}
                      {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                      onPointerEnter={() => hold(i)}
                      onPointerLeave={() => hold(null)}
                      onFocus={() => hold(i)}
                      onBlur={() => hold(null)}
                      className="flex h-full flex-col justify-between p-3 md:p-4"
                    >
                      <span className="text-[13px] font-semibold leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5),0_0_14px_rgba(0,0,0,0.45)] md:text-[15px]">{e.name}</span>
                      <span className={`text-[12px] tabular-nums text-white/85 transition-opacity duration-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] md:text-[13px] ${on ? "opacity-100" : "opacity-0"}`}>
                        {e.day} · {e.pool === "TBA" ? "Prizes TBA" : `${e.pool} BDT`}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <figcaption className="flex flex-col gap-2">
            <span aria-hidden className="h-1.5 w-full rounded-full" style={{ background: "linear-gradient(90deg, #170818, #3d1248 18%, #7e2270 34%, #c2335a 50%, #ee5530 64%, #ff8a3d 76%, #ffc35e 90%, #fff4de)" }} />
            <span className="flex justify-between text-[13px] tabular-nums text-muted">
              <span>8 Dec · registrations open</span>
              <span className="text-soft">3–4 Jan · finals on campus</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
