"use client";

import { useEffect, useRef, useState } from "react";
import { events } from "@/lib/fest";

/** Steps through the contests every `ms`; `pick(i)` holds one, `pick(-1)` lets it run again. */
export function useActiveEvent(ms = 2800) {
  const [active, setActive] = useState(0);
  const hold = useRef(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!hold.current) setActive((a) => (a + 1) % events.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [ms]);
  const pick = (i: number) => {
    hold.current = i >= 0;
    if (i >= 0) setActive(i);
  };
  return [active, pick] as const;
}
