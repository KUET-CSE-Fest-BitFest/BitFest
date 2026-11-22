import { events, fest, money, prizes, schedule } from "@/lib/fest";
import ContestLink from "@/components/redesign/ui/ContestLink";
import SectionHead from "../SectionHead";
import { KIND_LABEL, detail, range } from "./data";

/* 01 · Key dates, as one card per contest: what it is, how its final runs, the team rules, then the
   final's date and the prize pool along the bottom. A card stays dark until pointed at; then its
   top-right light fades in. Cards become links to the contest pages once those are public
   (ContestLink). */
export default function ContestCards() {
  return (
    <section id="schedule" className="relative scroll-mt-20 overflow-hidden py-20 md:py-36">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-12 px-6 md:gap-16 md:px-14">
        <SectionHead n="01" label="Key dates" title="Every road ends on campus" sub={`Registration runs from 30 November to 12 January, and online rounds from 13 to 22 January. Every final is on the KUET campus on 5 and 6 February, with ${fest.prizePool} BDT in prizes.`} />

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {events.map((e) => {
            const steps = schedule[e.slug] ?? [];
            const final = steps.find((m) => m.kind === "final");
            const round = steps.find((m) => m.kind === "round");
            const prize = prizes[e.slug];
            return (
              <li key={e.slug} data-reveal className="flex">
                <ContestLink e={e} className="group lidx relative flex w-full flex-col rounded-[14px] p-6 xl:min-h-[400px]">
                  {/* The light: only while the card is pointed at. */}
                  <span aria-hidden className="lx lx-corner lx-tr lx-warm opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" style={{ width: "150%" }} />
                  <span aria-hidden className="lx lx-rim" />
                  <p className="relative z-[4] text-[13px] font-medium text-cream/75">
                    {e.kind}
                    {round && <span className="text-cream/55"> · Online round {range(round)}</span>}
                  </p>
                  {/* Name, how the final runs and the team rules sit together; the date and prize line
                      closes every card at the same height. */}
                  <div className="relative z-[4] mt-auto flex flex-col gap-1 pt-10">
                    <span className="lx-ink-warm text-[clamp(26px,2.1vw,32px)] font-semibold leading-[1.02] tracking-[-0.04em]">{e.name}</span>
                    <span className="text-[14px] text-cream/75">{final ? detail(final) || KIND_LABEL.final : e.venue}</span>
                    <span className="mt-2 text-[13px] tabular-nums text-cream/60">Team {e.team} · {e.fee} · {e.onsite} onsite · {e.club}</span>
                  </div>
                  <div className="relative z-[4] mt-5 grid grid-cols-2 gap-4 border-t border-rim/14 pt-4">
                    <span className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-cream/65">Final</span>
                      <span className="whitespace-nowrap text-[24px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-cream-hi">{final ? range(final) : "5–6 Feb"}</span>
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-cream/65">Prize pool</span>
                      <span className="whitespace-nowrap text-[24px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-peach">
                        {prize?.total ? money(`${prize.total}K`) : "TBA"}
                        <span className="ml-1 text-[12px] font-medium tracking-normal text-cream/55">BDT</span>
                      </span>
                    </span>
                  </div>
                </ContestLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
