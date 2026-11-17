"use client";

import { useState } from "react";
import SectionHead from "@/components/ui/SectionHead";
import { faqs } from "@/lib/content";

/* Same accordion as the landing page's FAQ: one answer open at a time, rows slide open. */
export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <SectionHead n="08" eyebrow="Questions" title="Before you build" sub="Anything else — reach the organizers at [CONTACT EMAIL]." />
        <ul className="border-t border-line">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className={`text-[clamp(20px,2vw,26px)] font-semibold tracking-[-0.02em] transition-colors ${on ? "text-ink" : "text-soft group-hover:text-ink"}`}>{f.q}</span>
                  <span aria-hidden className={`relative grid h-9 w-9 shrink-0 place-items-center border transition-colors ${on ? "border-orange" : "border-line-2 group-hover:border-muted"}`}>
                    <span className="absolute h-px w-3.5 bg-current" />
                    <span className={`absolute h-3.5 w-px bg-current transition-transform duration-300 ${on ? "scale-y-0" : ""}`} />
                  </span>
                </button>
                <div id={`faq-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[720px] pb-7 text-lg leading-relaxed text-soft">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
