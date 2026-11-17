"use client";

import SectionHead from "@/components/ui/SectionHead";
import { prizes, facts } from "@/lib/content";
import { useCountUp, useInView } from "@/lib/hooks";

function Card({ p, i, active }: { p: (typeof prizes)[number]; i: number; active: boolean }) {
  const v = useCountUp(p.amount, active);
  const champ = p.tone === "orange";
  return (
    <li data-reveal className={`lidx relative flex flex-col justify-between gap-16 rounded-[16px] p-8 ${champ ? "lg:row-span-2" : ""}`}>
      {champ && <span className="lx lx-corner lx-tr lx-warm" style={{ width: "150%" }} />}
      <span className="lx lx-rim" />
      <div className="relative z-[4] flex items-center justify-between">
        <span className="text-[13px] font-medium tabular-nums text-muted">0{i + 1}</span>
        {champ && <span className="text-[13px] font-medium text-[#fbf1e9]">Top prize</span>}
      </div>
      <div className="relative z-[4] flex flex-col gap-2">
        <span className="text-xl font-semibold text-soft">{p.place}</span>
        <span className={`font-semibold leading-none tracking-[-0.04em] ${champ ? "lx-ink-warm text-[clamp(56px,7vw,104px)]" : "text-5xl"}`}>
          {v} <span className="text-lg font-medium tracking-normal text-muted">BDT</span>
        </span>
      </div>
    </li>
  );
}

export default function Prizes() {
  const [ref, inView] = useInView<HTMLOListElement>("-100px");
  const pool = facts.find((f) => f.label === "Prize pool")!;
  return (
    <section id="prizes" className="mx-auto max-w-[1440px] scroll-mt-20 px-6 py-28 md:px-14 lg:py-40">
      <SectionHead n="07" eyebrow="Prizes" title={`Play for ${pool.value}+ BDT`} sub="Plus certificates for every team that passes inspection." />
      <ol ref={ref} className="mt-14 grid gap-4 lg:grid-cols-2 lg:grid-rows-2">
        {prizes.map((p, i) => <Card key={p.place} p={p} i={i} active={inView} />)}
      </ol>
    </section>
  );
}
