"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* The lit lid that sits right under an event hero's buttons (the leaderboard's shell, shared): a
   header line with a live marker, then the contest's own live view. It fills the rest of the first
   screen; if its content runs longer, it fades out over the last stretch instead of stopping in an
   edge. On very short screens it keeps a minimum height and the hero grows. */
export default function HeroPanel({
  title,
  meta,
  right,
  children,
  label,
  width = 920,
}: {
  title: string;
  meta?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  /** One line for screen readers: what the panel shows. */
  label: string;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const sec = el.closest("section")!;
    const measure = () => {
      const top = el.getBoundingClientRect().top - sec.getBoundingClientRect().top;
      const vh = Math.max(window.innerHeight, 640);
      const h = Math.max(window.innerWidth < 768 ? 300 : 230, Math.floor(vh - top - 12));
      setMaxH(h);
      setFade(el.scrollHeight > h + 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sec);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      data-fade={fade}
      className="hero-panel lidx pointer-events-auto relative mx-auto mb-3 mt-[clamp(24px,4.5vh,48px)] overflow-hidden rounded-[20px]"
      style={{ width: `min(${width}px, calc(100% - 24px))`, maxHeight: maxH }}
    >
      <span className="lx lx-corner lx-tr lx-warm" style={{ width: "70%", opacity: 0.4 }} />
      <span className="lx lx-rim" />
      <div className="relative z-[4] flex items-center justify-between gap-4 border-b border-[rgba(255,214,190,0.08)] px-4 pb-3 pt-4 md:px-6 md:pt-5">
        <p className="min-w-0 truncate text-[15px] font-medium text-ink">
          {title}
          {meta && <span className="hidden text-[#f2e6dc]/55 min-[380px]:inline"> · {meta}</span>}
        </p>
        {right && <div className="flex shrink-0 items-center gap-2 text-[14px] font-medium text-[#f2e6dc]/65">{right}</div>}
      </div>
      <div className="relative z-[4]">{children}</div>
    </div>
  );
}

/** The red live dot the panels share. */
export const LiveDot = () => <span className="h-2 w-2 animate-live rounded-full bg-[#ff6a5a]" />;
