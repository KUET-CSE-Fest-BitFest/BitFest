"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Calls `fn` every `ms` while `ref`'s element is on screen and the tab is visible. Nothing runs
    under reduced motion, so the scene stays on its first (static) state. */
export function useLiveTick(ms: number, fn: () => void, ref: RefObject<Element | null>) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const el = ref.current;
    const io = el ? new IntersectionObserver(([e]) => (visible = e.isIntersecting)) : null;
    if (el && io) io.observe(el);
    const id = window.setInterval(() => { if (visible && !document.hidden) cb.current(); }, ms);
    return () => { window.clearInterval(id); io?.disconnect(); };
  }, [ms, ref]);
}

/** A small seeded random, so the server and the browser start from the same picture. */
export function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
