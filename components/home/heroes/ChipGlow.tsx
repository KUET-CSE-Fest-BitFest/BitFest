/* The light behind the chip. Every option animates transform/opacity only, on layers that are
   rasterised once (blur included), so the glow never repaints while it moves. */

export type GlowId = "current" | "rim" | "siri" | "breath" | "orbit";

const ORANGE = "#ff7a3d";
const AMBER = "#ffb26b";
const CYAN = "#4cc9ff";
const VIOLET = "#8f7bff";
const PLUM = "#8a3a9e";

/** A thin gradient ring just outside the substrate (the substrate covers the middle). */
function Rim({ gradient, spin }: { gradient: string; spin?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-[1.5px] overflow-hidden rounded-[13.5px]">
      <div className={`absolute -inset-[30%] ${spin ? "glow-spin" : ""}`} style={{ background: gradient, ["--spin" as string]: spin }} />
    </div>
  );
}

/** A soft coloured light that drifts round the chip's edge. */
function Drift({ color, dur, delay, size = "46%", opacity = 0.45, reverse = false, blur = 46 }: { color: string; dur: string; delay: string; size?: string; opacity?: number; reverse?: boolean; blur?: number }) {
  return (
    <div
      aria-hidden
      className={`glow-drift pointer-events-none absolute left-0 top-0 rounded-full ${reverse ? "[animation-direction:reverse]" : ""}`}
      style={{ width: size, height: size, background: color, opacity, filter: `blur(${blur}px)`, ["--d" as string]: dur, animationDelay: delay }}
    />
  );
}

export default function ChipGlow({ kind = "current" }: { kind?: GlowId }) {
  if (kind === "current") {
    return (
      <>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[128%] -translate-x-1/2 -translate-y-1/2">
          <div className="chip-glow-turn h-full w-full rounded-full opacity-40" />
        </div>
        <div aria-hidden className="chip-glow-edge pointer-events-none absolute -inset-[1.5%] rounded-[24px] opacity-35" />
      </>
    );
  }

  if (kind === "rim") {
    // Codex-style: a line of colour flows round the edge; a faint warm/cool halo drifts with it.
    return (
      <>
        <Drift color={ORANGE} dur="16s" delay="0s" opacity={0.26} blur={56} />
        <Drift color={CYAN} dur="16s" delay="-8s" opacity={0.2} blur={56} />
        <Rim spin="10s" gradient={`conic-gradient(from 0deg, transparent 0deg, ${ORANGE} 50deg, ${AMBER} 95deg, transparent 150deg, transparent 190deg, ${CYAN} 240deg, transparent 300deg, transparent 360deg)`} />
      </>
    );
  }

  if (kind === "siri") {
    // Siri-style: several soft colours wander the edges at their own pace and spill out from behind.
    return (
      <>
        <Drift color={ORANGE} dur="13s" delay="0s" opacity={0.5} />
        <Drift color={AMBER} dur="17s" delay="-6s" opacity={0.38} reverse />
        <Drift color={CYAN} dur="15s" delay="-3s" opacity={0.42} />
        <Drift color={VIOLET} dur="19s" delay="-11s" opacity={0.32} reverse />
        <Rim spin="14s" gradient={`conic-gradient(from 0deg, ${ORANGE}, ${AMBER}, ${VIOLET}, ${CYAN}, ${ORANGE})`} />
      </>
    );
  }

  if (kind === "breath") {
    // The calmest: one warm halo slowly brightens and dims; the rim stays still.
    return (
      <>
        <div aria-hidden className="glow-breathe pointer-events-none absolute -inset-[3%] rounded-[32px]" style={{ background: `linear-gradient(135deg, ${AMBER}, ${ORANGE} 50%, ${CYAN})`, filter: "blur(30px)" }} />
        <Rim gradient={`linear-gradient(135deg, ${AMBER}, rgba(255,122,61,0.2) 40%, rgba(76,201,255,0.2) 60%, ${CYAN})`} />
      </>
    );
  }

  // Orbit: one soft light circles the chip and lights the rim as it passes.
  return (
    <>
      <div aria-hidden className="glow-spin pointer-events-none absolute inset-0" style={{ ["--spin" as string]: "9s" }}>
        <div className="absolute left-1/2 top-[-14%] h-[38%] w-[38%] -translate-x-1/2 rounded-full" style={{ background: ORANGE, opacity: 0.55, filter: "blur(44px)" }} />
      </div>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25" style={{ background: PLUM, filter: "blur(70px)" }} />
      <Rim spin="9s" gradient={`conic-gradient(from 0deg, transparent 0deg 290deg, ${AMBER} 340deg, ${ORANGE} 356deg, transparent 360deg)`} />
    </>
  );
}
