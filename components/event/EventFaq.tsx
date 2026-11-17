"use client";

import SectionHead from "@/components/ui/SectionHead";
import FaqList from "@/components/ui/FaqList";
import { fest } from "@/lib/fest";

/* 03 · Questions: the landing page's accordion (one answer open at a time); rows fade up as they
   scroll in. */
export default function EventFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section id="faq" className="relative scroll-mt-20 py-20 md:py-36">
      <div className="mx-auto max-w-[1440px] px-3 md:px-14">
        {/* The questions sit in a lid: dark face, grain, thin warm rim, lit from the bottom-left. */}
        <div className="lidx relative rounded-[24px] md:rounded-[32px]">
          <span className="lx lx-corner lx-bl lx-warm" style={{ width: "88%", opacity: 0.8 }} />
          <span className="lx lx-rim" />
          <div className="relative z-[4] grid gap-12 px-6 py-12 md:p-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <SectionHead n="03" eyebrow="Questions" title="Asked before you register" sub={`Anything else? Write to ${fest.email}.`} />
        <FaqList items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}
