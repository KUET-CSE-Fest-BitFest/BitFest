"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PitchSim } from "@/lib/game/pitch";
import { fitCanvas, useInView, useReducedMotion } from "@/lib/hooks";
import { eventPages } from "@/lib/eventPages";
import { copyRects } from "@/lib/copyRects";
import EventHero from "@/components/event/EventHero";

gsap.registerPlugin(ScrollTrigger);

/* Soccer Bot hero, on the landing hero's ground: the same dot field, grain and top light, and the same
   warm bottom-corner lights that follow the cursor. The title sits at the top; below it two bots
   (orange and plum) play a live match on their own, drawn on a transparent pitch so the ground shows
   through. Nothing to drive — it is a scene, not a control panel. */

const page = eventPages["soccer-bot"];

export default function Hero() {
  const [sectionRef, inView] = useInView<HTMLDivElement>("0px");
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<PitchSim | null>(null);
  const reduce = useReducedMotion();
  const [score, setScore] = useState({ orange: 0, cyan: 0 });

  // Simulation + render loop (paused off-screen).
  useEffect(() => {
    const canvas = canvasRef.current!;
    const sim = (simRef.current ??= new PitchSim({
      mode: "play",
      dim: 0.15,
      fit: "width",
      goalGlow: true,
      clear: true,
      onGoal: (_, s) => setScore(s),
    }));
    let w = 0, h = 0;
    // The hero copy (kicker, title, lead, buttons) is a keep-out area for the players.
    const keepOut = () => {
      const sec = canvas.closest("section");
      if (sec) sim.setKeepOut(copyRects(sec), w, h);
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      fitCanvas(canvas, w, h);
      keepOut();
      sim.draw(canvas.getContext("2d")!, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (!inView || reduce) return () => ro.disconnect();

    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      sim.step();
      sim.draw(ctx, w, h);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduce]);

  // Scroll exit: the pitch tilts back into 3D and recedes.
  useEffect(() => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.to(stageRef.current, {
        rotateX: 38, scale: 0.78, y: 80, opacity: 0.25, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [reduce, sectionRef]);

  return (
    <div ref={sectionRef}>
      <EventHero
        slug="soccer-bot"
        lead={page.lead}
        registerHref={page.registerHref}
        rulebookHref={page.rulebookHref}
        scene={
          <div
            ref={stageRef}
            className="absolute inset-0 origin-[50%_30%] will-change-transform [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_20%,rgba(0,0,0,0.14)_32%,rgba(0,0,0,0.45)_44%,rgba(0,0,0,0.82)_56%,#000_64%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_20%,rgba(0,0,0,0.14)_32%,rgba(0,0,0,0.45)_44%,rgba(0,0,0,0.82)_56%,#000_64%)]"
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="Two robots playing a live soccer match." />
          </div>
        }
        badge={
          <>
            <span className="relative z-[4] flex items-center gap-2 text-[#ff8a6a]"><span className="h-2 w-2 animate-live rounded-full bg-[#ff6a5a]" />Live</span>
            <span className="relative z-[4] text-orange">Orange</span>
            <span className="relative z-[4] text-[28px] font-semibold leading-none tabular-nums text-ink">{score.orange}<span className="text-line-2"> : </span>{score.cyan}</span>
            <span className="relative z-[4] text-plum">Plum</span>
          </>
        }
      />
    </div>
  );
}
