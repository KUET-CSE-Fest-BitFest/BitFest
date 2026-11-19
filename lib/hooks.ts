"use client";

import { useEffect, useRef, useState } from "react";

/** True while the element is (nearly) on screen; used to pause canvases off-screen. */
export function useInView<T extends Element>(rootMargin = "100px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

/** Sets a canvas's backing store to its CSS size × devicePixelRatio, capped at 2 (1.5 on phones, where
    the extra pixels cost more than they show). Returns the scale. */
export function fitCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(window.innerWidth < 768 ? 1.5 : 2, window.devicePixelRatio || 1);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return dpr;
}

/** Counts up to a number when the element enters view. Non-numeric values are shown as-is. */
export function useCountUp(target: string, active: boolean, ms = 1400) {
  const num = parseFloat(target.replace(/[^0-9.]/g, ""));
  const isNum = /^[\d,.\sKk]+$/.test(target) && !Number.isNaN(num);
  const [val, setVal] = useState(isNum ? "0" : target);
  // One shot: once the number first comes into view it counts all the way up, even if it is
  // scrolled away mid-count. Only unmounting stops it (so a value never freezes part-way).
  const started = useRef(false);
  const raf = useRef(0);
  useEffect(() => () => { cancelAnimationFrame(raf.current); started.current = false; }, []);
  useEffect(() => {
    if (!isNum) { setVal(target); return; }
    if (!active || started.current) return;
    started.current = true;
    const fmt = (v: number) => (target.toLowerCase().includes("k") ? v + "K" : v.toLocaleString());
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(fmt(num)); return; }
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setVal(fmt(Math.round(num * (1 - Math.pow(1 - p, 3)))));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [active, isNum, num, ms, target]);
  return val;
}
