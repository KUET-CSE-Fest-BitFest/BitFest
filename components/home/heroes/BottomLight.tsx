"use client";

import { useEffect, useRef } from "react";

/** Warm light at the bottom of the screen: two corner lights and a faint band. It is fixed to the
    viewport, so it never shows the hero's lower edge, and fades (and sinks a little) over the first
    half-screen of scrolling. Each corner light swells, brightens and stretches toward the cursor as it
    comes near, pinned to its corner so its edges never show. Only opacity and transform change. */
/** `contained`: sit inside the parent box (e.g. the footer lid) instead of the viewport; the cursor
    is read relative to that box and there is no scroll fade (the parent controls opacity). */
export default function BottomLight({ contained = false }: { contained?: boolean } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current, L = left.current, R = right.current;
    if (!el || !L || !R) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, sraf = 0, last = performance.now();
    const ptr = { x: 0.5, y: 0.5, on: 0 };
    const cur = { l: 0, r: 0, lx: 0, ly: 0, rx: 0, ry: 0 }; // lx/ly, rx/ry: extra stretch toward the cursor

    const scroll = () => {
      sraf = 0;
      const k = Math.min(1, window.scrollY / (window.innerHeight * 0.5));
      el.style.opacity = String(1 - k);
      el.style.transform = `translateY(${k * 12}%)`;
      el.style.visibility = k >= 1 ? "hidden" : "visible";
    };
    const onScroll = () => { if (!sraf) sraf = requestAnimationFrame(scroll); };

    // How close the cursor is to a bottom corner (1 = on it, 0 = far away).
    const near = (cx: number) => Math.max(0, 1 - Math.hypot((ptr.x - cx) * 1.1, (ptr.y - 1) * 1.4) / 0.75) * ptr.on;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const e = 1 - Math.exp(-5 * dt);
      const tl = near(0), tr = near(1);
      cur.l += (tl - cur.l) * e;
      cur.r += (tr - cur.r) * e;
      // Each light stays pinned to its corner (transform-origin) and only stretches: wider as the
      // cursor moves in from the side, taller as it rises. Never translated, so no edge can show.
      cur.lx += (ptr.x * 0.6 * tl - cur.lx) * e;
      cur.ly += ((1 - ptr.y) * 0.5 * tl - cur.ly) * e;
      cur.rx += ((1 - ptr.x) * 0.6 * tr - cur.rx) * e;
      cur.ry += ((1 - ptr.y) * 0.5 * tr - cur.ry) * e;
      L.style.transform = `scale(${1 + 0.35 * cur.l + cur.lx}, ${1 + 0.35 * cur.l + cur.ly})`;
      L.style.opacity = String(0.72 + 0.28 * cur.l);
      R.style.transform = `scale(${1 + 0.35 * cur.r + cur.rx}, ${1 + 0.35 * cur.r + cur.ry})`;
      R.style.opacity = String(0.72 + 0.28 * cur.r);
      const settled = Math.abs(tl - cur.l) < 0.002 && Math.abs(tr - cur.r) < 0.002 && Math.abs(ptr.x * 0.6 * tl - cur.lx) < 0.002 && Math.abs((1 - ptr.y) * 0.5 * tl - cur.ly) < 0.002 && Math.abs((1 - ptr.x) * 0.6 * tr - cur.rx) < 0.002 && Math.abs((1 - ptr.y) * 0.5 * tr - cur.ry) < 0.002;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const move = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      if (contained) {
        const r = el.parentElement!.getBoundingClientRect();
        ptr.x = (ev.clientX - r.left) / r.width;
        ptr.y = (ev.clientY - r.top) / r.height;
      } else {
        ptr.x = ev.clientX / window.innerWidth;
        ptr.y = ev.clientY / window.innerHeight;
      }
      ptr.on = 1;
      kick();
    };
    const out = () => { ptr.on = 0; kick(); };

    L.style.opacity = R.style.opacity = "0.72";
    if (!contained) {
      scroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }
    if (!reduce) {
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", out);
    }
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sraf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", out);
    };
  }, [contained]);
  return (
    <div ref={ref} aria-hidden className={`bottom-light pointer-events-none inset-x-0 bottom-0 ${contained ? "is-contained absolute" : "fixed"}`}>
      <span className="bl-band" />
      <span ref={left} className="bl-corner bl-left" />
      <span ref={right} className="bl-corner bl-right" />
    </div>
  );
}

