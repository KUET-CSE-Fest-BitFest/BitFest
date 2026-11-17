"use client";

import { useRef, useState } from "react";
import { pastPhotos as P } from "@/lib/pastPhotos";
import { useLiveTick } from "@/components/event/useLiveTick";
import GalleryHead, { pad2 } from "./GalleryHead";

/* 05 · BitFest 2025 gallery, as a contact sheet. Every photograph small, numbered like frames on a darkroom
   contact sheet, beside a large lit "loupe" showing the one in focus. The focus walks the sheet on
   its own, marked with an orange grease-pencil frame; pointing at a frame looks at it. */
export default function GalleryContact() {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useLiveTick(3200, () => { if (!hold) setI((x) => (x + 1) % P.length); }, ref);
  return (
    <section id="gallery" aria-labelledby="gallery-h" className="relative scroll-mt-20 py-20 md:py-36">
      <div ref={ref} className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 md:px-14">
        <GalleryHead />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
          <div className="lidx relative aspect-[4/3] overflow-hidden rounded-[20px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={i} src={P[i].large} srcSet={`${P[i].src} ${P[i].w}w, ${P[i].large} 1440w`} sizes="(max-width: 1023px) 100vw, 56vw" alt={P[i].alt} className="gc-loupe absolute inset-0 h-full w-full object-cover" />
            <span className="lx lx-rim z-[2]" />
            {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "left-4 bottom-4 border-l border-b", "right-4 bottom-4 border-r border-b"].map((c) => (
              <span key={c} aria-hidden className={`absolute z-[3] h-5 w-5 border-[rgba(255,214,190,0.7)] ${c}`} />
            ))}
            <span className="absolute bottom-4 left-1/2 z-[3] -translate-x-1/2 rounded-full bg-[#0b0809]/80 px-3 py-1 text-[13px] font-medium tabular-nums text-[#fbf1e9]">Frame {pad2(i + 1)}</span>
          </div>
          <div className="grid grid-cols-4 content-start gap-2 rounded-[18px] bg-[#0b0809] p-3 shadow-[inset_0_0_0_1px_rgba(255,214,190,0.08)] md:gap-3 md:p-4" onPointerLeave={() => setHold(false)}>
            {P.map((p, k) => (
              <button key={p.src} type="button" aria-label={`Frame ${k + 1}`} onPointerEnter={(e) => { if (e.pointerType === "mouse") { setHold(true); setI(k); } }} onClick={() => setI(k)} onFocus={() => setI(k)} data-on={k === i} className="gc-frame relative flex flex-col gap-1 text-left">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[6px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.small} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
                <span className="text-[12px] tabular-nums text-[#f2e6dc]/50">{pad2(k + 1)} ▸</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
