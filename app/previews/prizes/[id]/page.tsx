import { notFound } from "next/navigation";
import Prizes from "@/components/home/Prizes";
import PrizeLedger from "@/components/home/prizes/PrizeLedger";
import PrizeBar from "@/components/home/prizes/PrizeBar";
import PrizePodium from "@/components/home/prizes/PrizePodium";
import PrizeOdometer from "@/components/home/prizes/PrizeOdometer";
import PrizeBlocks from "@/components/home/prizes/PrizeBlocks";

// Prize section options. Remove this route once one is picked.
const VARIANTS = { p0: Prizes, p1: PrizeLedger, p2: PrizeBar, p3: PrizePodium, p4: PrizeOdometer, p5: PrizeBlocks } as const;
const NAMES: Record<string, string> = { p0: "Current", p1: "Ledger", p2: "One bar", p3: "Podium", p4: "Odometer", p5: "Blocks" };

export const metadata = { title: "Prize section options — BitFest 2027", robots: { index: false } };

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((id) => ({ id }));
}

export default async function PrizePreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ shot?: string }> }) {
  const { id } = await params;
  const shot = (await searchParams).shot !== undefined;
  const V = VARIANTS[id as keyof typeof VARIANTS];
  if (!V) notFound();
  return (
    <>
      <main className="min-h-[100svh]">
        <V />
      </main>
      {!shot && <nav aria-label="Prize options" className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 border border-line-2 bg-bg/95 p-1 text-sm">
        {Object.keys(VARIANTS).map((k) => (
          <a key={k} href={`/previews/prizes/${k}`} className={`px-3 py-2 font-semibold transition ${k === id ? "bg-orange text-[#120802]" : "text-muted hover:text-ink"}`}>
            {k.toUpperCase()} {NAMES[k]}
          </a>
        ))}
      </nav>}
    </>
  );
}
