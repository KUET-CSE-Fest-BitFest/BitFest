"use client";

import { facts } from "@/lib/content";
import { useCountUp, useInView } from "@/lib/hooks";

function Fact({ f, active }: { f: (typeof facts)[number]; active: boolean }) {
  const v = useCountUp(f.value, active);
  return (
    <div className="flex flex-col gap-2 bg-bg px-6 py-7">
      <dt className="text-[13px] font-medium text-dim">{f.label}</dt>
      <dd className={`text-2xl font-semibold tracking-[-0.02em] md:text-[28px] ${f.accent ? "text-orange" : "text-ink"}`}>
        {v}
        {f.suffix && <span className="text-base text-muted">{f.suffix}</span>}
      </dd>
    </div>
  );
}

export default function Facts() {
  const [ref, inView] = useInView<HTMLDListElement>("-80px");
  return (
    <section aria-label="Key facts" className="relative z-10 -mt-px border-y border-line bg-bg">
      <dl ref={ref} className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-line md:grid-cols-5">
        {facts.map((f) => (
          <Fact key={f.label} f={f} active={inView} />
        ))}
      </dl>
    </section>
  );
}
