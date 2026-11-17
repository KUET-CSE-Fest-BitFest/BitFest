"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* The questions, drawn in the site's chip language: a trace runs down the list with a pad per
   question (like the timeline); opening a question lights its pad and fills the trace down to it in
   orange. Toggles are small rounded lids that light up with the button's warm gradient when open.
   One answer open at a time; rows slide open. */

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const [fill, setFill] = useState(0);
  const [end, setEnd] = useState(0);

  // Fill the trace down to the open question's pad (re-measured as answers open and on resize).
  useIso(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const li = open >= 0 ? (list.children[open + 2] as HTMLElement | undefined) : undefined;
      setFill(li ? li.offsetTop + 34 : 0);
      // The track stops at the last question's pad, never past it.
      const last = list.children[list.children.length - 1] as HTMLElement;
      setEnd(last.offsetTop + 34);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [open]);

  return (
    <ol ref={listRef} className="relative">
      <span aria-hidden className="absolute left-[7px] top-[34px] w-px bg-[rgba(255,214,190,0.14)]" style={{ height: Math.max(0, end - 34) }} />
      <span aria-hidden className="absolute left-[7px] top-[34px] w-px bg-orange shadow-[0_0_10px_rgba(255,122,61,0.7)] transition-[height] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]" style={{ height: Math.max(0, fill - 34) }} />
      {items.map((f, i) => {
        const on = open === i;
        return (
          <li key={f.q} data-reveal className="relative pl-11">
            <span aria-hidden className={`absolute left-0 top-[27px] h-[15px] w-[15px] rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 ${on ? "border-orange bg-orange shadow-[0_0_14px_rgba(255,122,61,0.7)]" : "border-[rgba(255,214,190,0.22)] bg-[#0b0809]"}`} />
            <button
              type="button"
              aria-expanded={on}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(on ? -1 : i)}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="flex flex-col gap-1">
                <span className={`text-[13px] font-medium tabular-nums transition-colors duration-300 ${on ? "text-orange" : "text-dim"}`}>Q{String(i + 1).padStart(2, "0")}</span>
                <span className={`text-[clamp(19px,1.8vw,24px)] font-semibold tracking-[-0.02em] transition-colors ${on ? "text-ink" : "text-soft group-hover:text-ink"}`}>{f.q}</span>
              </span>
              <span aria-hidden className="faq-toggle relative grid h-10 w-10 shrink-0 place-items-center rounded-[10px]" data-on={on}>
                <span className="absolute h-[1.5px] w-3.5 rounded-full bg-current" />
                <span className={`absolute h-3.5 w-[1.5px] rounded-full bg-current transition-transform duration-300 ${on ? "scale-y-0" : ""}`} />
              </span>
            </button>
            <div id={`faq-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="max-w-[680px] pb-6 text-[17px] leading-relaxed text-soft">{f.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
