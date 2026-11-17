import { notFound } from "next/navigation";
import HomeNav from "@/components/home/HomeNav";
import HeroCircuit from "@/components/home/heroes/HeroCircuit";
import HeroOcta from "@/components/home/heroes/HeroOcta";
import HeroRadar from "@/components/home/heroes/HeroRadar";
import HeroBoard from "@/components/home/heroes/HeroBoard";
import HeroPinout from "@/components/home/heroes/HeroPinout";
import HeroTraceType from "@/components/home/heroes/HeroTraceType";
import HeroAnalyzer from "@/components/home/heroes/HeroAnalyzer";
import HeroLayers from "@/components/home/heroes/HeroLayers";
import HeroDie from "@/components/home/heroes/variants/HeroDie";
import HeroDrawing from "@/components/home/heroes/variants/HeroDrawing";
import HeroEdge from "@/components/home/heroes/variants/HeroEdge";
import HeroDot from "@/components/home/heroes/variants/HeroDot";
import HeroKeynote from "@/components/home/heroes/rebrand/HeroKeynote";
import HeroThermal from "@/components/home/heroes/rebrand/HeroThermal";
import HeroCloseup from "@/components/home/heroes/rebrand/HeroCloseup";
import PreviewSwitcher from "./PreviewSwitcher";

// Glow options on the chosen chip hero.
const G0 = () => <HeroPinout glow="current" />;
const G1 = () => <HeroPinout glow="rim" />;
const G2 = () => <HeroPinout glow="siri" />;
const G3 = () => <HeroPinout glow="breath" />;
const G4 = () => <HeroPinout glow="orbit" />;
// How the chip sits in the page (all with the Orbit glow, no pins).
const S0 = () => <HeroPinout glow="orbit" seat="float" />;
const S1 = () => <HeroPinout glow="orbit" seat="socket" />;
const S2 = () => <HeroPinout glow="orbit" seat="carved" />;
const S3 = () => <HeroPinout glow="orbit" seat="dissolve" />;
const S4 = () => <HeroPinout glow="orbit" seat="board" />;

// Hero rebrand options (warm WebGL light that follows the pointer).
const R2 = () => <HeroPinout glow="orbit" seat="board" lid="live" />;

// Lit lids (all on the Board seat with the Orbit glow).
const L0 = () => <HeroPinout glow="orbit" seat="board" lid="metal" />;
const L1 = () => <HeroPinout glow="orbit" seat="board" lid="corner" />;
const L2 = () => <HeroPinout glow="orbit" seat="board" lid="orbit" />;
const L3 = () => <HeroPinout glow="orbit" seat="board" lid="horizon" />;
const L4 = () => <HeroPinout glow="orbit" seat="board" lid="duo" />;

// Hero options for the homepage. Remove this route once one is picked.
const HEROES = { r1: HeroKeynote, r2: R2, r3: HeroThermal, r4: HeroCloseup, l0: L0, l1: L1, l2: L2, l3: L3, l4: L4, s0: S0, s1: S1, s2: S2, s3: S3, s4: S4, g0: G0, g1: G1, g2: G2, g3: G3, g4: G4, a: HeroCircuit, a2: HeroPinout, a3: HeroTraceType, a4: HeroAnalyzer, a5: HeroLayers, v1: HeroDie, v2: HeroDrawing, v3: HeroEdge, v4: HeroDot, b: HeroOcta, c: HeroRadar, d: HeroBoard } as const;

export const metadata = { title: "Hero previews — BitFest 2027", robots: { index: false } };

export function generateStaticParams() {
  return Object.keys(HEROES).map((id) => ({ id }));
}

export default async function HeroPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const Hero = HEROES[id as keyof typeof HEROES];
  if (!Hero) notFound();
  return (
    <>
      <HomeNav />
      <main>
        <Hero />
        <div className="h-[60vh]" />
      </main>
      <PreviewSwitcher current={id} />
    </>
  );
}
