"use client";

import { eventHref, events, fest, isExternal, pad2 } from "@/lib/fest";
import { HeroActions } from "../shared";
import { useActiveEvent } from "./useActiveEvent";

/* V4 — Dot. The name, set very large. The dot on the "i" is a tiny orange chip: a bit, the smallest
   unit, sitting where the dot should be. Below, the eight contests as a quiet index. */

function ChipDot() {
  return (
    <span aria-hidden className="absolute bottom-[0.66em] left-1/2 block h-[0.17em] w-[0.17em] -translate-x-1/2">
      {/* pins */}
      <span className="absolute inset-x-[16%] -top-[11%] h-[11%] bg-[repeating-linear-gradient(90deg,#ff7a3d_0_9%,transparent_9%_22%)]" />
      <span className="absolute inset-x-[16%] -bottom-[11%] h-[11%] bg-[repeating-linear-gradient(90deg,#ff7a3d_0_9%,transparent_9%_22%)]" />
      <span className="absolute inset-y-[16%] -left-[11%] w-[11%] bg-[repeating-linear-gradient(180deg,#ff7a3d_0_9%,transparent_9%_22%)]" />
      <span className="absolute inset-y-[16%] -right-[11%] w-[11%] bg-[repeating-linear-gradient(180deg,#ff7a3d_0_9%,transparent_9%_22%)]" />
      {/* body and lid */}
      <span className="absolute inset-0 rounded-[8%] bg-orange" />
      <span className="absolute inset-[18%] rounded-[6%] bg-[#e8662b]" />
      <span className="absolute left-[26%] top-[26%] h-[9%] w-[9%] rounded-full bg-[#b84a1a]" />
    </span>
  );
}

export default function HeroDot() {
  const [active, pick] = useActiveEvent();

  return (
    <section aria-label="BitFest 2027" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#07080a] px-6 pb-8 pt-[96px] md:px-14 lg:h-[100svh] lg:min-h-[700px]">
      <div className="mx-auto flex w-full max-w-[1332px] flex-1 flex-col justify-between gap-10">
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-[15px] font-medium text-soft">
          <p>{fest.kicker}</p>
          <p className="text-muted">{fest.dates} · {fest.venue}</p>
        </div>

        <div className="flex flex-col gap-8">
          <h1 className="text-[clamp(96px,min(25vw,41vh),400px)] font-semibold leading-[0.8] tracking-[-0.065em] text-[#ececef]">
            <span className="sr-only">BitFest 2027</span>
            <span aria-hidden>
              B<span className="relative inline-block">ı<ChipDot /></span>tFest
            </span>
          </h1>
          <div className="grid items-end gap-6 border-t border-line pt-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-12">
            <span className="text-[clamp(44px,5vw,72px)] font-semibold leading-none tracking-[-0.04em] text-orange">2027</span>
            <p className="max-w-[460px] text-[17px] leading-relaxed text-soft">{fest.blurb}</p>
            <HeroActions />
          </div>
        </div>

        <ol className="grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-4 lg:grid-cols-8">
          {events.map((e, i) => {
            const on = active === i;
            return (
              <li key={e.slug} className="bg-[#07080a]">
                <a
                  href={eventHref(e)}
                  {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                  onPointerEnter={() => pick(i)}
                  onPointerLeave={() => pick(-1)}
                  onFocus={() => pick(i)}
                  onBlur={() => pick(-1)}
                  className="flex h-full flex-col gap-1 px-3 py-4"
                >
                  <span className="flex items-center gap-2 text-[12px] tabular-nums text-dim">
                    <span className={`h-1.5 w-1.5 transition-colors ${on ? "bg-orange" : "bg-line-2"}`} />
                    {pad2(i + 1)} · {e.day}
                  </span>
                  <span className={`text-[14px] font-semibold leading-snug transition-colors ${on ? "text-ink" : "text-muted"}`}>{e.name}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
