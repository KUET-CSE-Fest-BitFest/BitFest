import { fest } from "@/lib/fest";
import { FestFacts, HeroActions } from "../shared";

/** The hero copy every variant shares: kicker, name, line, facts, actions. Solid colours only. */
export function HeroCopy({ facts = true, className = "" }: { facts?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col gap-7 ${className}`}>
      <p className="text-[15px] font-medium text-soft">{fest.kicker}</p>
      <h1 className="text-[clamp(60px,min(7.6vw,14vh),124px)] font-semibold leading-[0.9] tracking-[-0.045em]">
        BitFest<br />
        <span className="text-orange">2027</span>
      </h1>
      <p className="max-w-[440px] text-[17px] leading-relaxed text-soft">{fest.blurb}</p>
      {facts && <FestFacts />}
      <HeroActions />
    </div>
  );
}
