import { eventHref, events, fest, isExternal } from "@/lib/fest";
import { TextLink } from "@/components/ui/Button";

/* The other seven contests, as small dark lids in a slow marquee (pauses on hover). */
const others = events.filter((e) => e.slug !== "soccer-bot");

export default function OtherEvents() {
  const row = [...others, ...others];
  return (
    <section aria-labelledby="more-h" className="border-t border-line py-20">
      <div className="mx-auto mb-10 flex max-w-[1440px] items-end justify-between gap-6 px-6 md:px-14">
        <h2 id="more-h" className="flex items-center gap-3 text-[15px] font-medium text-muted"><span aria-hidden className="h-px w-8 bg-line-2" />More at {fest.name} {fest.year}</h2>
        <TextLink href="/#schedule" className="text-[15px]">All eight contests</TextLink>
      </div>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex w-max gap-4 motion-safe:animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
          {row.map((e, i) => (
            <li key={i} aria-hidden={i >= others.length}>
              <a
                href={eventHref(e)}
                {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})}
                tabIndex={i >= others.length ? -1 : undefined}
                className="lidx group/card relative flex w-[300px] flex-col gap-10 rounded-[14px] p-6"
              >
                <span className="lx lx-rim" />
                <span aria-hidden className="pointer-events-none absolute inset-0 z-[2] rounded-[14px] border border-orange/0 transition-colors duration-300 group-hover/card:border-orange/60" />
                <span className="relative z-[4] text-[13px] font-medium text-orange">{e.kind} · {e.day}</span>
                <span className="relative z-[4] flex items-end justify-between gap-4 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{e.name}<span aria-hidden className="text-lg text-muted transition-colors group-hover/card:text-orange">↗</span></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
