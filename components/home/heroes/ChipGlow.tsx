/* The light behind the chip: one soft light circles the chip and lights the rim as it passes, over a
   faint deep-rust glow at the centre. Transform/opacity only, on layers rasterised once (blur
   included), so the glow never repaints while it moves. */

export type GlowId = "orbit";

const ORANGE = "#ff7a3d";
const PEACH = "#ffc49e";
const RUST = "#a33a14";

/** A thin gradient ring just outside the substrate (the substrate covers the middle). */
function Rim({ gradient, spin }: { gradient: string; spin?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-[1.5px] overflow-hidden rounded-[13.5px]">
      <div className={`absolute -inset-[30%] ${spin ? "glow-spin" : ""}`} style={{ background: gradient, ["--spin" as string]: spin }} />
    </div>
  );
}

export default function ChipGlow({ kind = "orbit" }: { kind?: GlowId }) {
  void kind;
  return (
    <>
      <div aria-hidden className="glow-spin pointer-events-none absolute inset-0" style={{ ["--spin" as string]: "9s" }}>
        <div className="absolute left-1/2 top-[-14%] h-[38%] w-[38%] -translate-x-1/2 rounded-full" style={{ background: ORANGE, opacity: 0.55, filter: "blur(44px)" }} />
      </div>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25" style={{ background: RUST, filter: "blur(70px)" }} />
      <Rim spin="9s" gradient={`conic-gradient(from 0deg, transparent 0deg 290deg, ${PEACH} 340deg, ${ORANGE} 356deg, transparent 360deg)`} />
    </>
  );
}
