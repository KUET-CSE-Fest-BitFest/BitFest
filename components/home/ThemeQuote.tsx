"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fest } from "@/lib/fest";

gsap.registerPlugin(ScrollTrigger);

/* The theme, between the programme and the gallery, set large like a quote. Its letters start faint
   and come up to full strength as the reader scrolls through it: the scroll position drives one
   value (smoothed by GSAP's scrub on top of Lenis), and each letter fades over a soft edge about a
   dozen letters wide, so the light runs through the line instead of stepping. Scrolling back
   dims them again. Opacity only; under reduced motion the quote simply shows. */

const MOTTO = `${fest.motto}.`;
const REST = "Two days where students turn code, data and circuits into answers to the questions that matter.";
const LOW = 0.14;
const EDGE = 14;

function Words({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i}>
          <span className={`inline-block whitespace-nowrap ${className}`}>
            {[...w].map((c, k) => (
              <span key={k} className="tq-c">{c}</span>
            ))}
          </span>{" "}
        </span>
      ))}
    </>
  );
}

export default function ThemeQuote() {
  const ref = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".tq-c"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      chars.forEach((c) => (c.style.opacity = "1"));
      return;
    }
    const n = chars.length;
    const shown = new Float32Array(n).fill(LOW);
    const paint = (p: number) => {
      const head = p * (n + EDGE);
      for (let i = 0; i < n; i++) {
        const t = Math.min(1, Math.max(0, (head - i) / EDGE));
        const o = LOW + (1 - LOW) * t * t * (3 - 2 * t);
        // Only touch letters whose strength actually changed.
        if (Math.abs(o - shown[i]) > 0.003) {
          shown[i] = o;
          chars[i].style.opacity = o.toFixed(3);
        }
      }
    };
    const state = { p: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => paint(state.p),
        scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 62%", scrub: 0.8 },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section aria-label={`The theme of ${fest.name} ${fest.year}`} className="relative py-28 md:py-48">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <figure className="mx-auto flex max-w-[1120px] flex-col items-center gap-10 text-center md:gap-14">
          {/* A quiet opening mark: the only colour in the section. */}
          <span aria-hidden className="tq-mark block h-[0.42em] text-[clamp(72px,7vw,112px)] font-semibold leading-[0.9] text-orange">&ldquo;</span>
          <blockquote ref={ref} className="text-[clamp(30px,4.4vw,64px)] font-semibold leading-[1.1] tracking-[-0.035em]">
            <span className="sr-only">{MOTTO} {REST}</span>
            {/* The motto holds its own line; the sentence after it is balanced so no line ends on a
                stray word. */}
            <span aria-hidden className="block text-balance">
              <Words text={MOTTO} className="text-ink" />
            </span>
            <span aria-hidden className="mt-[0.18em] block text-balance">
              <Words text={REST} className="text-[#cfc7c2]" />
            </span>
          </blockquote>
          <figcaption className="flex items-center gap-3 whitespace-nowrap text-[15px] font-medium text-muted md:gap-4">
            <span aria-hidden className="h-px w-6 bg-line-2 md:w-10" />
            The theme of {fest.name} {fest.year}
            <span aria-hidden className="h-px w-6 bg-line-2 md:w-10" />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
