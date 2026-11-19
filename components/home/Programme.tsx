"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { eventHref, events, isExternal } from "@/lib/fest";
import SectionHead from "./SectionHead";

gsap.registerPlugin(ScrollTrigger);

/* 02 · Programme. The festival in four chips on one bus (a trace with a signal running along it, like
   the hero's): the online rounds, Friday, Saturday, and the closing night. The chips carry no light;
   the one in focus lights its pins on the bus. The chips rise in when the section arrives. Times are the proposal's
   indicative timetable; final clock times and venues come with each rulebook. */

type Row = [slug: string, what: string, when: string];
const DAYS: { label: string; name: string; rows: Row[]; note?: string }[] = [
  {
    label: "13–22 January",
    name: "Online rounds",
    rows: [
      ["ai-hackathon", "Preliminary · top 60 go onsite", ""],
      ["datathon", "Preliminary · top 30 go onsite", ""],
      ["it-case", "Written round · top 20 go onsite", ""],
    ],
    note: "Onsite finalists are announced on 24 January.",
  },
  {
    label: "Day 1 · Friday 5 February",
    name: "Builds, bots and games",
    rows: [
      ["ai-hackathon", "Hackathon", "10 am – 7 pm"],
      ["project-showcase", "Exhibition and judging", "10 am – 5 pm"],
      ["lfr", "Runs and finals", "until 5 pm"],
      ["soccer-bot", "Matches and finals", "until 5 pm"],
      ["gaming", "Group stages and finals", "10 am – 5 pm"],
      ["iupc", "Mock contest", "3 pm"],
    ],
  },
  {
    label: "Day 2 · Saturday 6 February",
    name: "Contests and finals",
    rows: [
      ["iupc", "Main contest", "5 hours"],
      ["datathon", "Onsite final", "9 am – 3 pm"],
      ["3mt", "Presentations", ""],
      ["it-case", "Case round and final", ""],
      ["ctf", "Live scoreboard", ""],
    ],
  },
  {
    label: "Saturday evening",
    name: "Closing and CSE Night",
    rows: [
      ["", "Prize ceremony and closing", "6 Feb"],
      ["", "CSE Night, a cultural evening for participants, guests and sponsors", ""],
    ],
  },
];

export default function Programme() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const hold = useRef(false);

  // Step through the sites; pointing at one holds it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!hold.current) setActive((a) => (a + 1) % DAYS.length); }, 3200);
    return () => window.clearInterval(id);
  }, []);

  // The lids rise in, one after another, when the section arrives.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(root.querySelectorAll("[data-site]"), {
        y: 50, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="programme" aria-labelledby="programme-h" className="relative scroll-mt-20 overflow-hidden py-20 md:py-36">
      <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-14">
        <div id="programme-h">
          <SectionHead n="02" label="Programme" title="Two days on campus" sub="Online rounds in January, then the onsite finals on Friday 5 and Saturday 6 February 2027 at KUET, Khulna. Final clock times and venues come with each contest's rulebook." />
        </div>

        <div ref={rootRef} className="relative mt-16">
          {/* The bus: one trace behind all four chips, with a signal running along it. */}
          <span aria-hidden className="absolute inset-x-0 top-[96px] hidden h-px bg-white/12 lg:block" />
          <span aria-hidden className="trace-run venue-bus absolute inset-x-0 top-[96px] hidden h-[2px] -translate-y-1/2 overflow-hidden lg:block"><i /></span>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DAYS.map((v, i) => {
              const on = i === active;
              return (
                <article
                  key={v.label}
                  data-site
                  onPointerEnter={() => { hold.current = true; setActive(i); }}
                  onPointerLeave={() => { hold.current = false; }}
                  className="lidx relative flex flex-col gap-6 rounded-[16px] p-6 lg:min-h-[340px]"
                >
                  <span className="lx lx-rim" />
                  {/* Pins where the bus meets the chip. */}
                  <span aria-hidden className={`absolute -left-[4px] top-[96px] z-[5] hidden h-[7px] w-[7px] -translate-y-1/2 rounded-full transition-colors duration-500 lg:block ${on ? "bg-orange shadow-[0_0_10px_rgba(255,122,61,0.8)]" : "bg-white/25"}`} />
                  <span aria-hidden className={`absolute -right-[4px] top-[96px] z-[5] hidden h-[7px] w-[7px] -translate-y-1/2 rounded-full transition-colors duration-500 lg:block ${on ? "bg-orange shadow-[0_0_10px_rgba(255,122,61,0.8)]" : "bg-white/25"}`} />
                  <div className="relative z-[4] flex flex-col gap-2">
                    <span className="text-[13px] font-medium tabular-nums text-orange">{v.label}</span>
                    <h3 className="lx-ink-warm text-[24px] font-semibold leading-tight tracking-[-0.02em]">{v.name}</h3>
                  </div>
                  <ul className="relative z-[4] mt-auto flex flex-col gap-3">
                    {v.rows.map(([slug, what, when]) => {
                      const e = events.find((x) => x.slug === slug);
                      if (!e) {
                        return (
                          <li key={what} className="flex items-baseline justify-between gap-3 border-t border-[rgba(255,214,190,0.1)] pt-3">
                            <span className="text-[15px] text-[#f2e6dc]/80">{what}</span>
                            {when && <span className="shrink-0 text-[14px] tabular-nums text-[#f2e6dc]/80">{when}</span>}
                          </li>
                        );
                      }
                      return (
                        <li key={slug + what}>
                          <a href={eventHref(e)} {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})} className="group flex items-baseline justify-between gap-3 border-t border-[rgba(255,214,190,0.1)] pt-3">
                            <span className="flex flex-col">
                              <span className="font-semibold text-[#fbf1e9] transition-colors group-hover:text-orange">{e.name}</span>
                              <span className="text-[14px] text-[#f2e6dc]/60">{what}</span>
                            </span>
                            <span className="shrink-0 text-[14px] tabular-nums text-[#f2e6dc]/80">{when}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                  {v.note && <p className="relative z-[4] text-[13px] text-[#f2e6dc]/55">{v.note}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
