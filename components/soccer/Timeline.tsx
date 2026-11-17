import SectionHead from "@/components/ui/SectionHead";
import { timeline } from "@/lib/content";

/* Road to the final: the stages sit on one trace, like the landing page's key dates. No pinning;
   the page scrolls normally. The last stage (the final) is the lit one. */
export default function Timeline() {
  const last = timeline.length - 1;
  return (
    <section id="timeline" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 md:px-14">
        <SectionHead n="05" eyebrow="Timeline" title="Road to the final" sub="Dates in brackets are still to be announced." />
        <ol className="relative grid gap-10 lg:grid-cols-6 lg:gap-6">
          <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-line-2 lg:left-0 lg:right-0 lg:top-[7px] lg:bottom-auto lg:h-px lg:w-auto" />
          <span aria-hidden className="absolute hidden h-px bg-gradient-to-r from-transparent via-orange/70 to-orange lg:block lg:top-[7px]" style={{ left: `${(100 * (last - 0.6)) / timeline.length}%`, right: 0 }} />
          {timeline.map((t, i) => {
            const fin = i === last;
            return (
              <li key={t.t} data-reveal className="relative flex flex-col gap-3 pl-9 lg:pl-0 lg:pt-9">
                <span aria-hidden className={`absolute left-0 top-0 h-[15px] w-[15px] rounded-full border-2 ${fin ? "border-orange bg-orange shadow-[0_0_14px_rgba(255,122,61,0.7)]" : "border-line-2 bg-bg"}`} />
                <span className={`text-[13px] font-medium tabular-nums ${fin ? "text-orange" : "text-dim"}`}>Stage {String(i + 1).padStart(2, "0")} · {t.when}</span>
                <span className="text-[24px] font-semibold leading-tight tracking-[-0.02em]">{t.t}</span>
                <span className="text-[15px] leading-relaxed text-soft">{t.d}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
