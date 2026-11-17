import { notFound } from "next/navigation";
import HomeNav from "@/components/home/HomeNav";
import HeroLeaderboard from "@/components/datathon/Hero";
import HeroNeighbours from "@/components/datathon/options/HeroNeighbours";
import HeroBoundary from "@/components/datathon/options/HeroBoundary";
import HeroModelChip from "@/components/datathon/options/HeroModelChip";

// Datathon hero options. A (Leaderboard) was picked and is the live hero; remove this route at cleanup.
const VARIANTS = { a: HeroLeaderboard, b: HeroNeighbours, c: HeroBoundary, d: HeroModelChip } as const;
const NAMES: Record<string, string> = { a: "Leaderboard", b: "Nearest neighbours", c: "Decision boundary", d: "Model chip" };

export const metadata = { title: "Datathon hero options — BitFest 2027", robots: { index: false } };

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((id) => ({ id }));
}

export default async function DatathonPreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ shot?: string }> }) {
  const { id } = await params;
  const shot = (await searchParams).shot !== undefined;
  const V = VARIANTS[id as keyof typeof VARIANTS];
  if (!V) notFound();
  return (
    <>
      <HomeNav sub="Datathon" />
      <main className="relative z-10 bg-bg">
        <V />
        <div className="h-[40vh]" />
      </main>
      {!shot && (
        <nav aria-label="Datathon hero options" className="fixed right-4 top-20 z-[70] hidden flex-col gap-1 rounded-[12px] border border-line-2 bg-bg/95 p-1 text-sm md:flex">
          {Object.keys(VARIANTS).map((k) => (
            <a key={k} href={`/previews/datathon/${k}`} className={`rounded-[8px] px-3 py-2 font-medium transition ${k === id ? "bg-orange text-[#120802]" : "text-muted hover:text-ink"}`}>
              {k.toUpperCase()} · {NAMES[k]}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
